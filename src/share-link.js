const PREFIX = "map.";
const MAX_FRAGMENT_LENGTH = 24_000;

function bytesToBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8_192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8_192));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function encodeShareMap(map) {
  const bytes = new TextEncoder().encode(JSON.stringify(map));
  const payload = bytesToBase64(bytes)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
  const fragment = `${PREFIX}${payload}`;
  if (fragment.length > MAX_FRAGMENT_LENGTH) {
    throw new Error(
      `This map needs ${fragment.length.toLocaleString()} URL characters; keep share links under ${MAX_FRAGMENT_LENGTH.toLocaleString()}. Download the HTML instead.`,
    );
  }
  return fragment;
}

export function decodeShareMap(fragment) {
  const value = String(fragment || "").replace(/^#/u, "");
  if (!value.startsWith(PREFIX)) return null;
  const payload = value.slice(PREFIX.length).replaceAll("-", "+").replaceAll("_", "/");
  const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
  const json = new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(padded));
  return JSON.parse(json);
}

export function buildShareUrl(baseUrl, map) {
  const url = new URL(baseUrl);
  url.hash = encodeShareMap(map);
  return url.toString();
}

export { MAX_FRAGMENT_LENGTH };
