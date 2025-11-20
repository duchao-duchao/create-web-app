#!/usr/bin/env node
import { run } from './run.js';
import { printHelp } from './cli/help.js';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

run();
