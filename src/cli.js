import { readFile } from "node:fs/promises";
import { stdin as input } from "node:process";
import { analyze } from "./analyze.js";
import { after, before } from "./demo.js";
import { doctor, installSkill } from "./install.js";

const c = {
  cyan: "\u001b[36m",
  dim: "\u001b[2m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  reset: "\u001b[0m",
  yellow: "\u001b[33m",
};

const help = `doubt — give your AI healthy doubt

Usage
  doubt init [--agent <name|all>] [--global] [--force] [--json]
  doubt doctor [--agent <name|all>] [--global] [--json]
  doubt score <file|-> [--json]
  doubt demo [--json]

Agents
  universal (default), claude, codex, copilot, cursor, gemini, all

Examples
  npx doubt-ai init --agent all
  doubt score answer.md
  cat answer.md | doubt score -
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

async function readStdin() {
  let content = "";
  input.setEncoding("utf8");
  for await (const chunk of input) content += chunk;
  return content;
}

function printAnalysis(result) {
  const color = result.score >= 80 ? c.green : result.score >= 55 ? c.yellow : c.red;
  console.log(`${color}${result.grade} ${result.score}/100${c.reset}  ${result.summary}`);
  for (const finding of result.findings) {
    console.log(`  ${c.yellow}▲${c.reset} line ${finding.line}  ${finding.message}`);
  }
  for (const strength of result.strengths) {
    console.log(`  ${c.green}✓${c.reset} ${strength}`);
  }
}

export async function run(argv) {
  const [command = "help", ...rest] = argv;
  if (command === "--version" || command === "-v") {
    console.log("0.1.0");
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

  if (command === "score") {
    const file = flags._[0];
    if (!file) throw new Error("Pass a file path, or - to read stdin.");
    const text = file === "-" ? await readStdin() : await readFile(file, "utf8");
    if (!text.trim()) throw new Error("Input is empty.");
    const result = analyze(text);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else printAnalysis(result);
    return;
  }

  if (command === "demo") {
    const result = { before: analyze(before), after: analyze(after) };
    if (flags.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(`${c.red}without doubt${c.reset}\n${before}\n`);
    printAnalysis(result.before);
    console.log(`\n${c.green}with doubt${c.reset}\n${after}\n`);
    printAnalysis(result.after);
    return;
  }

  throw new Error(`Unknown command: ${command}. Run doubt --help.`);
}
