import { execFileSync } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

async function read(rootDirectory, path) {
  return readFile(resolve(rootDirectory, path), "utf8");
}

async function requirePath(rootDirectory, path) {
  try {
    await access(resolve(rootDirectory, path));
  } catch {
    throw new Error(`Required release path is missing: ${path}`);
  }
}

function git(rootDirectory, args) {
  return execFileSync("git", args, { cwd: rootDirectory, encoding: "utf8" }).trim();
}

async function npmPackInventory(rootDirectory) {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "doubt-release-preflight-"));
  try {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const output = execFileSync(
      npm,
      ["pack", "--dry-run", "--json", "--ignore-scripts"],
      {
        cwd: rootDirectory,
        encoding: "utf8",
        env: {
          ...process.env,
          npm_config_cache: resolve(temporaryDirectory, "npm-cache"),
        },
      },
    );
    const [pack] = JSON.parse(output);
    requireCondition(pack, "npm pack did not return package metadata.");
    return pack;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

export async function inspectRelease(rootDirectory = root) {
  const packageJson = JSON.parse(await read(rootDirectory, "package.json"));
  const packageLock = JSON.parse(await read(rootDirectory, "package-lock.json"));
  const version = packageJson.version;
  const tag = `v${version}`;

  requireCondition(/^\d+\.\d+\.\d+$/.test(version), `Release version is not stable semver: ${version}`);
  requireCondition(packageLock.version === version, "package-lock.json version differs from package.json.");
  requireCondition(packageLock.packages?.[""]?.version === version, "Root lockfile package version differs from package.json.");

  for (const path of packageJson.files) await requirePath(rootDirectory, path);

  const textChecks = [
    ["CHANGELOG.md", `## ${version}`],
    ["README.md", `uses: alsoleg89/doubt@${tag}`],
    ["docs/launch/README.md", `uses: alsoleg89/doubt@${tag}`],
    ["site/index.html", `\"softwareVersion\": \"${version}\"`],
    ["site/index.html", `/releases/tag/${tag}`],
    ["site/llms.txt", `/releases/tag/${tag}`],
    ["site/llms.txt", `uses: alsoleg89/doubt@${tag}`],
    [".github/workflows/release.yml", "npm run release:check"],
    [".github/workflows/release.yml", "--notes-file RELEASE_NOTES.md"],
  ];
  for (const [path, expected] of textChecks) {
    const contents = await read(rootDirectory, path);
    requireCondition(contents.includes(expected), `${path} is not aligned with ${tag}: missing ${expected}`);
  }

  const pagesWorkflow = await read(rootDirectory, ".github/workflows/pages.yml");
  for (const match of pagesWorkflow.matchAll(/^\s+cp\s+(\S+)\s+/gm)) {
    await requirePath(rootDirectory, match[1]);
  }

  const ciTag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : null;
  if (ciTag) {
    requireCondition(ciTag === tag, `Workflow tag ${ciTag} differs from package tag ${tag}.`);
  } else {
    const tagCommit = git(rootDirectory, ["rev-list", "-n", "1", tag]);
    const headCommit = git(rootDirectory, ["rev-parse", "HEAD"]);
    requireCondition(tagCommit === headCommit, `${tag} does not point at HEAD.`);
  }
  requireCondition(git(rootDirectory, ["status", "--porcelain"]) === "", "Release worktree is not clean.");

  const pack = await npmPackInventory(rootDirectory);
  requireCondition(pack.version === version, `npm pack produced ${pack.version}, expected ${version}.`);
  const paths = new Set(pack.files.map((file) => file.path));
  for (const required of [
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "bin/doubt.js",
    "action.yml",
    "action/index.js",
    "src/contract.js",
    "src/render-map.js",
    "src/verify.js",
    "skill/doubt/SKILL.md",
    "skills/doubt/SKILL.md",
    ".github/skills/doubt/SKILL.md",
    "examples/agent-skills-portability.doubt.json",
    "examples/agent-skills-vs-mcp.doubt.json",
  ]) {
    requireCondition(paths.has(required), `npm tarball is missing ${required}.`);
  }
  requireCondition(
    [...paths].every((path) => !path.startsWith("docs/launch/") && !path.startsWith("site/")),
    "npm tarball contains repository-only launch or site files.",
  );

  return {
    entryCount: pack.entryCount,
    filename: pack.filename,
    integrity: pack.integrity,
    size: pack.size,
    tag,
    version,
  };
}

async function main() {
  const result = await inspectRelease();
  console.log(`PASS ${result.tag} · ${result.entryCount} files · ${result.size} bytes`);
  console.log(`     ${result.filename}`);
  console.log(`     ${result.integrity}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`RELEASE BLOCKED: ${error.message}`);
    process.exitCode = 1;
  });
}
