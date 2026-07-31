import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateMap } from "./map.js";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;
const TEXT_CONTENT_TYPE = /^(?:text\/|application\/(?:json|ld\+json|xml|xhtml\+xml))/i;

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function decodeEntities(value) {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["nbsp", " "],
    ["quot", '"'],
  ]);
  return value.replace(/&(?:#(\d+)|#x([a-f0-9]+)|([a-z]+));/gi, (match, decimal, hex, name) => {
    if (decimal) return String.fromCodePoint(Number(decimal));
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    return named.get(name.toLowerCase()) ?? match;
  });
}

function visibleText(value, contentType) {
  if (!/html/i.test(contentType || "")) return value;
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function normalized(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function locatorLineRange(locator) {
  const match = String(locator).match(/(?:\bL|\blines?\s+)(\d+)(?:\s*[-–]\s*(?:L)?(\d+))?/i);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  if (start < 1 || end < start) return null;
  return { end, start };
}

function isPrivateIp(address) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 10
      || a === 127
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 198 && (b === 18 || b === 19))
      || a === 0
      || a >= 224;
  }
  if (isIP(address) === 6) {
    const value = address.toLowerCase();
    return value === "::1"
      || value === "::"
      || value.startsWith("fc")
      || value.startsWith("fd")
      || value.startsWith("fe8")
      || value.startsWith("fe9")
      || value.startsWith("fea")
      || value.startsWith("feb")
      || value.startsWith("ff")
      || value.startsWith("::ffff:127.")
      || value.startsWith("::ffff:10.")
      || value.startsWith("::ffff:192.168.")
      || /^::ffff:172\.(?:1[6-9]|2\d|3[01])\./.test(value);
  }
  return false;
}

async function assertPublicHttpUrl(value, allowPrivate) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http(s) URLs can be fetched.");
  }
  if (url.username || url.password) throw new Error("Source URLs cannot contain credentials.");
  if (allowPrivate) return url;
  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new Error("Private and localhost URLs require --allow-private.");
  }
  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("Private and localhost URLs require --allow-private.");
  }
  return url;
}

async function readResponseBytes(response, maxBytes) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error(`Source exceeds the ${maxBytes}-byte verification limit.`);
  }
  if (!response.body?.getReader) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error(`Source exceeds the ${maxBytes}-byte verification limit.`);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Source exceeds the ${maxBytes}-byte verification limit.`);
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, total);
}

async function fetchSource(source, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    let currentUrl = new URL(source.url);
    for (let redirects = 0; redirects <= options.maxRedirects; redirects += 1) {
      currentUrl = await assertPublicHttpUrl(currentUrl, options.allowPrivate);
      const response = await options.fetchImpl(currentUrl, {
        headers: { "user-agent": "doubt-ai-source-verifier" },
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error(`HTTP ${response.status} redirect has no Location header.`);
        if (redirects === options.maxRedirects) {
          throw new Error(`Source exceeded the ${options.maxRedirects}-redirect limit.`);
        }
        currentUrl = new URL(location, currentUrl);
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
      const finalUrl = await assertPublicHttpUrl(response.url || currentUrl, options.allowPrivate);
      const contentType = response.headers.get("content-type") || "text/plain";
      if (!TEXT_CONTENT_TYPE.test(contentType)) {
        throw new Error(`Unsupported content type: ${contentType}.`);
      }
      const bytes = await readResponseBytes(response, options.maxBytes);
      return { bytes, contentType, finalUrl: finalUrl.toString(), text: bytes.toString("utf8") };
    }
    throw new Error("Source redirect handling failed.");
  } finally {
    clearTimeout(timer);
  }
}

async function readLocalSource(source, mapFile, maxBytes) {
  let file;
  if (source.url.startsWith("file://")) file = fileURLToPath(source.url);
  else if (isAbsolute(source.url)) file = source.url;
  else file = resolve(dirname(mapFile), source.url);
  const bytes = await readFile(file);
  if (bytes.length > maxBytes) throw new Error(`Source exceeds the ${maxBytes}-byte verification limit.`);
  return { bytes, contentType: "text/plain", finalUrl: file, text: bytes.toString("utf8") };
}

async function loadSource(source, options) {
  if (/^https?:\/\//i.test(source.url)) return fetchSource(source, options);
  return readLocalSource(source, options.mapFile, options.maxBytes);
}

export async function verifyMapSources(map, options = {}) {
  validateMap(map);
  const checkedAt = (options.now?.() ?? new Date()).toISOString();
  const checkedDate = checkedAt.slice(0, 10);
  const settings = {
    allowPrivate: options.allowPrivate === true,
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    mapFile: resolve(options.mapFile || "evidence.doubt.json"),
    maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES,
    maxRedirects: options.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
  if (typeof settings.fetchImpl !== "function") {
    throw new Error("This Node.js runtime does not provide fetch(). Use Node.js 18 or later.");
  }

  const results = [];
  for (const source of map.sources) {
    try {
      const loaded = options.loadSource
        ? await options.loadSource(source, settings)
        : await loadSource(source, settings);
      const range = locatorLineRange(source.locator);
      const scopedText = range
        ? loaded.text.split(/\r?\n/).slice(range.start - 1, range.end).join("\n")
        : loaded.text;
      const haystack = normalized(visibleText(scopedText, loaded.contentType));
      const needle = normalized(source.excerpt);
      const match = needle.length > 0 && haystack.includes(needle);
      results.push({
        contentSha256: digest(loaded.bytes),
        contentType: loaded.contentType,
        excerptSha256: digest(source.excerpt),
        finalUrl: loaded.finalUrl,
        locatorStatus: range ? (match ? "matched" : "mismatch") : "not-machine-checked",
        message: match
          ? (range ? `Excerpt matched lines ${range.start}-${range.end}.` : "Excerpt matched the retrieved source.")
          : (range ? `Excerpt was not found in lines ${range.start}-${range.end}.` : "Excerpt was not found in the retrieved source."),
        sourceId: source.id,
        status: match ? "verified" : "mismatch",
      });
    } catch (error) {
      results.push({
        message: error.name === "AbortError" ? `Timed out after ${settings.timeoutMs}ms.` : error.message,
        sourceId: source.id,
        status: "unreachable",
      });
    }
  }

  if (results.some((result) => result.status !== "verified")) {
    return { checkedAt, map: null, ok: false, receipt: null, results };
  }

  const verifiedMap = structuredClone(map);
  verifiedMap.updatedAt = checkedDate;
  for (const source of verifiedMap.sources) {
    const result = results.find((item) => item.sourceId === source.id);
    source.retrievedAt = checkedDate;
    source.verification = {
      checkedAt,
      contentSha256: result.contentSha256,
      excerptSha256: result.excerptSha256,
      finalUrl: result.finalUrl,
      locatorStatus: result.locatorStatus,
      method: "normalized-excerpt-match",
      status: "verified",
    };
  }
  const validation = validateMap(verifiedMap);
  return { checkedAt, map: verifiedMap, ok: true, receipt: validation.receipt, results };
}
