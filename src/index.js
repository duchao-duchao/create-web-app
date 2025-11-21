#!/usr/bin/env node
import { run } from './run.js';
import { printHelp } from './cli/help.js';
import { Command } from 'commander';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { handleProxyMode } from './engines/proxy.js';

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
  .option('-h, --help', '查看帮助信息并退出')
  .argument('[project-name]')
  .option('--engine <engine>', '指定创建引擎 (native|vite|umi|...)')
  .option('--framework <framework>', '指定框架 (react|vue)')
  .option('--plugins <list>', '启用插件列表，逗号分隔 (如: router,lint,zustand)')
  .option('--language <lang>', '指定语言 (js|ts)');

program.parse(process.argv);

const opts = program.opts();
const [projectNameArg] = program.args;
if (opts.help) {
  printHelp();
  process.exit(0);
}

// 外部引擎直达：如 --engine vite
if (opts.engine && opts.engine !== 'native') {
  await handleProxyMode(opts.engine, projectNameArg, { framework: opts.framework });
  process.exit(0);
}

// 解析插件列表
const parsedPlugins = typeof opts.plugins === 'string'
  ? opts.plugins.split(',').map(s => s.trim()).filter(Boolean)
  : undefined;

// 原生引擎直达：提供任意参数则跳过交互确认
if (projectNameArg || opts.engine === 'native' || opts.framework || parsedPlugins || opts.language) {
  await run({
    projectName: projectNameArg,
    engine: 'native',
    framework: opts.framework,
    plugins: parsedPlugins,
    language: opts.language,
    skipConfirm: true,
  });
  process.exit(0);
}

run();
