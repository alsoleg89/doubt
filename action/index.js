import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  checkEvidenceMaps,
  escapeWorkflowCommand,
  findEvidenceMaps,
  formatActionSummary,
} from "../src/action.js";

const inputPath = process.env.INPUT_PATH || ".";
const requireMaps = (process.env["INPUT_REQUIRE-MAPS"] || "true").toLowerCase() !== "false";
const root = resolve(process.cwd(), inputPath);

try {
  const files = await findEvidenceMaps(root);
  if (requireMaps && files.length === 0) {
    throw new Error(`No *.doubt.json maps found under ${inputPath}.`);
  }

  const result = await checkEvidenceMaps(files, process.cwd());
  for (const failure of result.failures) {
    for (const finding of failure.findings) {
      const file = escapeWorkflowCommand(failure.file);
      const message = escapeWorkflowCommand(
        `${finding.rule} at ${finding.path}: ${finding.message}`,
      );
      console.error(`::error file=${file}::${message}`);
    }
  }

  const summary = formatActionSummary(result);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  }

  const receipts = Object.fromEntries(result.valid.map((item) => [item.file, item.receipt]));
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `count=${files.length}\nreceipts=${JSON.stringify(receipts)}\n`,
    );
  }
  console.log(summary);

  if (result.failures.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(`::error::${escapeWorkflowCommand(error.message)}`);
  process.exitCode = 1;
}
