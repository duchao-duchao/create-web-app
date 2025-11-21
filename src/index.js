#!/usr/bin/env node
import { run } from './run.js';
import { printHelp } from './cli/help.js';
import { Command } from 'commander';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const program = new Command();

// 读取包版本用于 -v/--version
const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

program
  .name('create-web-app')
  .description('多引擎可插拔的前端脚手架')
  .version(pkg.version, '-v, --version', '查看版本')
  // 禁用内置的 -h/--help，改用自定义帮助输出
  .helpOption(false)
  .option('-h, --help', '查看帮助信息并退出');

program.parse(process.argv);

const opts = program.opts();
if (opts.help) {
  printHelp();
  process.exit(0);
}

run();
