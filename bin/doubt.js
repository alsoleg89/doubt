#!/usr/bin/env node

import { run } from "../src/cli.js";

run(process.argv.slice(2)).catch((error) => {
  console.error(`\u001b[31merror\u001b[0m ${error.message}`);
  process.exitCode = 1;
});
