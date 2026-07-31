#!/usr/bin/env node

import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skill", "doubt");
const outputRoot = resolve(process.argv[2] ?? join(repoRoot, "_site"));

function writeOctal(buffer, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, "0");
  buffer.write(encoded.slice(-(length - 1)), offset, length - 1, "ascii");
  buffer[offset + length - 1] = 0;
}

function tarHeader(path, size) {
  const pathBytes = Buffer.byteLength(path);
  if (pathBytes > 100) {
    throw new Error(`Archive path exceeds ustar limit: ${path}`);
  }

  const header = Buffer.alloc(512);
  header.write(path, 0, 100, "utf8");
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  header.write("root", 265, 32, "ascii");
  header.write("root", 297, 32, "ascii");

  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  const encodedChecksum = checksum.toString(8).padStart(6, "0");
  header.write(encodedChecksum, 148, 6, "ascii");
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

async function collectFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = join(current, entry.name);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      throw new Error(`Skill archives may not contain symlinks: ${absolute}`);
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, absolute));
    } else if (entry.isFile()) {
      const archiveName = relative(root, absolute).split(sep).join("/");
      if (
        archiveName.startsWith("/")
        || archiveName.split("/").includes("..")
      ) {
        throw new Error(`Unsafe archive path: ${archiveName}`);
      }
      files.push({ absolute, archiveName });
    }
  }
  return files;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error("SKILL.md is missing YAML frontmatter");
  }
  const fields = Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([a-z-]+):\s*(.+)$/))
      .filter(Boolean)
      .map((line) => [line[1], line[2]]),
  );
  if (!fields.name || !fields.description) {
    throw new Error("SKILL.md requires name and description");
  }
  return fields;
}

async function buildArchive(files) {
  const chunks = [];
  for (const file of files) {
    const contents = await readFile(file.absolute);
    chunks.push(tarHeader(file.archiveName, contents.length), contents);
    const remainder = contents.length % 512;
    if (remainder !== 0) {
      chunks.push(Buffer.alloc(512 - remainder));
    }
  }
  chunks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(chunks), { level: 9, mtime: 0 });
}

export async function buildSkillArchive() {
  const files = await collectFiles(skillRoot);
  if (!files.some((file) => file.archiveName === "SKILL.md")) {
    throw new Error("Archive must contain SKILL.md at its root");
  }
  const manifest = parseFrontmatter(
    await readFile(join(skillRoot, "SKILL.md"), "utf8"),
  );
  const archive = await buildArchive(files);
  const digest = createHash("sha256").update(archive).digest("hex");
  return { archive, digest, files, manifest };
}

export async function buildSkillDiscovery(destination = outputRoot) {
  const discoveryRoot = join(destination, ".well-known", "agent-skills");
  const archivePath = join(discoveryRoot, "doubt.tar.gz");
  const indexPath = join(discoveryRoot, "index.json");
  const { archive, digest, files, manifest } = await buildSkillArchive();
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: manifest.name,
        type: "archive",
        description: manifest.description,
        url: "/doubt/.well-known/agent-skills/doubt.tar.gz",
        digest: `sha256:${digest}`,
      },
    ],
  };

  await mkdir(discoveryRoot, { recursive: true });
  await writeFile(archivePath, archive);
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  return { archivePath, indexPath, digest, files: files.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildSkillDiscovery();
  console.log(
    `Built ${result.files}-file skill archive sha256:${result.digest}`,
  );
  console.log(result.indexPath);
}
