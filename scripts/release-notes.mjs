import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function releaseNotesFor(changelog, version) {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = changelog.match(new RegExp(`^## ${escapedVersion}(?:\\s|$)`, "m"));
  if (!match) throw new Error(`CHANGELOG.md has no ${version} section.`);

  const start = match.index;
  const bodyStart = changelog.indexOf("\n", start);
  const nextSection = changelog.indexOf("\n## ", bodyStart + 1);
  const header = changelog.slice(start, bodyStart);
  const body = changelog.slice(bodyStart + 1, nextSection === -1 ? undefined : nextSection).trim();
  if (!body) throw new Error(`CHANGELOG.md ${version} section is empty.`);

  return `${header}\n\n${body}\n`;
}

async function main() {
  const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  const changelog = await readFile(resolve(root, "CHANGELOG.md"), "utf8");
  process.stdout.write(releaseNotesFor(changelog, packageJson.version));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
