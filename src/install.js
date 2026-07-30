import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platforms, resolvePlatformNames } from "./platforms.js";

const sourceSkill = resolve(dirname(fileURLToPath(import.meta.url)), "..", "skill", "doubt");

async function filesUnder(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(current, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(root, path));
    else if (entry.isFile()) files.push(path.slice(root.length + 1));
  }
  return files;
}

export async function fingerprint(root) {
  const hash = createHash("sha256");
  for (const relative of await filesUnder(root)) {
    hash.update(relative);
    hash.update("\0");
    hash.update(await readFile(join(root, relative)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function targetFor(name, { cwd = process.cwd(), global = false } = {}) {
  const platform = platforms[name];
  const base = global ? homedir() : resolve(cwd);
  return join(base, ...(global ? platform.global : platform.local), "doubt");
}

export async function installSkill({
  agents = "universal",
  cwd = process.cwd(),
  global = false,
  force = false,
} = {}) {
  const results = [];
  for (const name of resolvePlatformNames(agents)) {
    const target = targetFor(name, { cwd, global });
    let exists = false;
    try {
      exists = (await stat(target)).isDirectory();
    } catch {
      // Missing is the expected first-install state.
    }
    if (exists && !force) {
      results.push({ name, target, status: "exists" });
      continue;
    }
    if (exists) await rm(target, { recursive: true, force: true });
    await mkdir(dirname(target), { recursive: true });
    await cp(sourceSkill, target, { recursive: true });
    results.push({
      name,
      target,
      status: exists ? "updated" : "installed",
      fingerprint: await fingerprint(target),
    });
  }
  return results;
}

export async function doctor({
  agents = "universal",
  cwd = process.cwd(),
  global = false,
} = {}) {
  const expected = await fingerprint(sourceSkill);
  const results = [];
  for (const name of resolvePlatformNames(agents)) {
    const target = targetFor(name, { cwd, global });
    try {
      const actual = await fingerprint(target);
      results.push({
        name,
        target,
        status: actual === expected ? "healthy" : "modified",
        expected,
        actual,
      });
    } catch {
      results.push({ name, target, status: "missing", expected });
    }
  }
  return results;
}

export { sourceSkill };
