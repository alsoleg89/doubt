#!/usr/bin/env node

import { run } from "../src/cli.js";

run(process.argv.slice(2)).catch((error) => {
  console.error(`\u001b[31merror\u001b[0m ${error.message}`);
  if (Array.isArray(error.findings)) {
    for (const finding of error.findings) {
      console.error(`  \u001b[33m▲\u001b[0m ${finding.path} ${finding.message}`);
    }
  }
  process.exitCode = 1;
});
