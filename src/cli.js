import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { doctor, installSkill } from "./install.js";
import { loadMap } from "./map.js";
import { renderMap } from "./render-map.js";

const c = {
  cyan: "\u001b[36m",
  dim: "\u001b[2m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  reset: "\u001b[0m",
  yellow: "\u001b[33m",
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const demoMap = resolve(root, "examples", "what-should-doubt-become.doubt.json");

const help = `doubt — turn contested questions into source-grounded evidence maps

Usage
  doubt init [--agent <name|all>] [--global] [--force] [--json]
  doubt doctor [--agent <name|all>] [--global] [--json]
  doubt map <file.json> [--out <file.html>] [--json]
  doubt validate <file.json> [--json]
  doubt demo [--out <file.html>] [--json]

Agents
  universal (default), claude, codex, copilot, cursor, gemini, all

Examples
  npx doubt-ai init --agent all
  npx doubt-ai map research.doubt.json --out evidence-map.html
  npx doubt-ai validate research.doubt.json
  npx doubt-ai demo --out doubt-demo.html
`;

function options(args) {
  const result = { _: [] };
  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (!value.startsWith("--")) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    if (["global", "force", "json"].includes(key)) result[key] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing value for --${key}`);
      result[key] = args[i + 1];
      i += 1;
    }
  }
  return result;
}

function printMapValidation(validation) {
  const { metrics, receipt } = validation;
  console.log(`${c.green}VALID${c.reset} ${c.dim}${receipt.slice(0, 12)}${c.reset}`);
  console.log(
    `  ${c.green}✓${c.reset} ${metrics.claims} claims · ${metrics.evidence} evidence · ${metrics.sources} sources`,
  );
  console.log(
    `  ${c.cyan}↯${c.reset} ${metrics.contradictions} contradictions · ${metrics.unknowns} explicit unknowns`,
  );
}

export async function run(argv) {
  const [command = "help", ...rest] = argv;
  if (command === "--version" || command === "-v") {
    console.log("0.2.0");
    return;
  }
  if (command === "help" || command === "--help" || command === "-h") {
    console.log(help);
    return;
  }

  const flags = options(rest);
  if (command === "init" || command === "install") {
    const results = await installSkill({
      agents: flags.agent,
      global: flags.global,
      force: flags.force,
    });
    if (flags.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }
    console.log(`${c.cyan}doubt${c.reset} ${c.dim}install${c.reset}`);
    for (const result of results) {
      const icon = result.status === "exists" ? `${c.yellow}○` : `${c.green}✓`;
      console.log(`${icon}${c.reset} ${result.status.padEnd(9)} ${result.target}`);
    }
    if (results.some((result) => result.status === "exists")) {
      console.log(`${c.dim}Use --force to replace an existing copy.${c.reset}`);
    }
    return;
  }

  if (command === "doctor") {
    const results = await doctor({ agents: flags.agent, global: flags.global });
    if (flags.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(`${c.cyan}doubt${c.reset} ${c.dim}doctor${c.reset}`);
      for (const result of results) {
        const icon = result.status === "healthy" ? `${c.green}✓` : `${c.red}×`;
        console.log(`${icon}${c.reset} ${result.status.padEnd(8)} ${result.target}`);
      }
    }
    if (results.some((result) => result.status !== "healthy")) process.exitCode = 1;
    return;
  }

  if (command === "map" || command === "render") {
    const file = flags._[0];
    if (!file) throw new Error("Pass a .json evidence map.");
    const inputFile = resolve(file);
    const { map, validation } = await loadMap(inputFile);
    const outputFile = resolve(
      flags.out || inputFile.replace(/(?:\.doubt)?\.json$/i, ".html"),
    );
    await writeFile(outputFile, renderMap(map, validation));
    if (flags.json) {
      console.log(JSON.stringify({ input: inputFile, output: outputFile, ...validation }, null, 2));
    } else {
      printMapValidation(validation);
      console.log(`  ${c.cyan}map${c.reset} ${outputFile}`);
    }
    return;
  }

  if (command === "validate" || command === "check") {
    const file = flags._[0];
    if (!file) throw new Error("Pass a .json evidence map.");
    const { validation } = await loadMap(resolve(file));
    if (flags.json) console.log(JSON.stringify(validation, null, 2));
    else printMapValidation(validation);
    return;
  }

  if (command === "demo") {
    const { map, validation } = await loadMap(demoMap);
    const outputFile = resolve(flags.out || "doubt-demo.html");
    await writeFile(outputFile, renderMap(map, validation));
    const result = { input: demoMap, output: outputFile, ...validation };
    if (flags.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    printMapValidation(validation);
    console.log(`  ${c.cyan}demo${c.reset} ${outputFile}`);
    return;
  }

  throw new Error(`Unknown command: ${command}. Run doubt --help.`);
}
