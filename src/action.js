import { readdir, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { inspectMap } from "./map.js";
import { readFile } from "node:fs/promises";

const SKIP_DIRECTORIES = new Set([".git", "node_modules"]);

export function escapeWorkflowCommand(value) {
  return String(value)
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A")
    .replaceAll(":", "%3A")
    .replaceAll(",", "%2C");
}

export async function findEvidenceMaps(target) {
  const absolute = resolve(target);
  const targetStat = await stat(absolute);
  if (targetStat.isFile()) {
    return absolute.endsWith(".doubt.json") ? [absolute] : [];
  }

  const found = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".doubt.json")) found.push(path);
    }
  }
  await visit(absolute);
  return found.sort();
}

export async function checkEvidenceMaps(files, cwd = process.cwd()) {
  const valid = [];
  const failures = [];

  for (const file of files) {
    const displayFile = relative(cwd, file) || file;
    let map;
    try {
      map = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      failures.push({
        file: displayFile,
        findings: [{ path: "$", rule: "invalid-json", message: error.message }],
      });
      continue;
    }

    const result = inspectMap(map);
    if (result.valid) {
      valid.push({ file: displayFile, ...result });
    } else {
      failures.push({ file: displayFile, findings: result.findings });
    }
  }

  return { failures, total: files.length, valid };
}

export function formatActionSummary(result) {
  const status = result.failures.length === 0 ? "PASS" : "FAIL";
  const lines = [
    `## Doubt evidence contract: ${status}`,
    "",
    `Validated ${result.total} map${result.total === 1 ? "" : "s"}: ${result.valid.length} valid, ${result.failures.length} invalid.`,
    "",
  ];

  if (result.valid.length > 0) {
    lines.push("| Map | Receipt | Claims | Evidence | Unknowns |", "| --- | --- | ---: | ---: | ---: |");
    for (const item of result.valid) {
      lines.push(
        `| \`${item.file}\` | \`${item.receipt.slice(0, 12)}\` | ${item.metrics.claims} | ${item.metrics.evidence} | ${item.metrics.unknowns} |`,
      );
    }
    lines.push("");
  }

  for (const failure of result.failures) {
    lines.push(`### \`${failure.file}\``, "");
    for (const finding of failure.findings) {
      lines.push(`- **${finding.rule}** at \`${finding.path}\`: ${finding.message}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}
