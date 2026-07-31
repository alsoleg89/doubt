#!/usr/bin/env node

import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const canonicalSkill = join(repoRoot, "skill", "doubt");
export const githubSkill = join(repoRoot, ".github", "skills", "doubt");

async function filesUnder(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = join(current, entry.name);
    const info = await lstat(absolute);
    if (info.isSymbolicLink()) {
      throw new Error(`Skill directories may not contain symlinks: ${absolute}`);
    }
    if (entry.isDirectory()) {
      files.push(...await filesUnder(root, absolute));
    } else if (entry.isFile()) {
      files.push(relative(root, absolute).split(sep).join("/"));
    }
  }

  return files;
}

export async function compareSkillMirror({
  source = canonicalSkill,
  target = githubSkill,
} = {}) {
  const canonicalFiles = await filesUnder(source);
  let mirrorFiles = [];
  try {
    mirrorFiles = await filesUnder(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const expected = new Set(canonicalFiles);
  const actual = new Set(mirrorFiles);
  const missing = canonicalFiles.filter((file) => !actual.has(file));
  const unexpected = mirrorFiles.filter((file) => !expected.has(file));
  const changed = [];

  for (const file of canonicalFiles.filter((candidate) => actual.has(candidate))) {
    const [canonical, mirror] = await Promise.all([
      readFile(join(source, file)),
      readFile(join(target, file)),
    ]);
    if (!canonical.equals(mirror)) changed.push(file);
  }

  return {
    ok: missing.length === 0 && unexpected.length === 0 && changed.length === 0,
    files: canonicalFiles.length,
    missing,
    unexpected,
    changed,
  };
}

export async function syncSkillMirror({
  source = canonicalSkill,
  target = githubSkill,
} = {}) {
  await rm(target, { recursive: true, force: true });
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  return compareSkillMirror({ source, target });
}

function formatProblems(result) {
  return [
    ...result.missing.map((file) => `missing: ${file}`),
    ...result.unexpected.map((file) => `unexpected: ${file}`),
    ...result.changed.map((file) => `changed: ${file}`),
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  const result = write ? await syncSkillMirror() : await compareSkillMirror();

  if (!result.ok) {
    console.error("GitHub skill mirror differs from skill/doubt:");
    console.error(formatProblems(result));
    console.error("Run `npm run skill:sync` to rebuild the mirror.");
    process.exitCode = 1;
  } else {
    console.log(
      `${write ? "Synced" : "Verified"} ${result.files} files in .github/skills/doubt`,
    );
  }
}
