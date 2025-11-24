import pc from 'picocolors';

import {
  pluginRegistry,
  frameworkRegistry,
  templateRegistry,
} from '../config/plugin-registry.js';

export function printHelp() {
  const pad = (s, w) => (s.length >= w ? s : s + ' '.repeat(Math.max(0, w - s.length)));

  console.log(pc.bold(pc.bgBlue(pc.white(' create-web-app '))) + ' ' + pc.bold('帮助信息') + ' ' + pc.dim('· 快速创建现代前端项目'));
  console.log(pc.dim('─'.repeat(72)));

  console.log(pc.bold('\n用法'));
  console.log(`  ${pc.cyan('create-web-app')} ${pc.dim('[project-name]')} ${pc.dim('[options]')}`);

  console.log(pc.bold('\n常用选项'));
  const options = [
    ['--help, -h', '查看帮助信息并退出'],
    ['--version, -v', '查看版本'],
    ['--engine <engine>', '指定创建引擎 (native|vite|umi|next|...)'],
    ['--framework <fw>', '指定框架 (react|vue)'],
    ['--plugins <list>', '启用插件列表，逗号分隔 (router,lint,zustand)'],
    ['--language <lang>', '指定语言 (js|ts)'],
    ['--bundler <bundler>', '指定打包器 (vite|webpack)'],
  ];
  options.forEach(([flag, desc]) => {
    console.log(`  ${pc.yellow(pad(flag, 22))}${pc.white(desc)}`);
  });

  console.log(pc.bold('\n支持框架'));
  Object.entries(frameworkRegistry).forEach(([key, meta]) => {
    console.log(`  - ${pc.cyan(meta.label)} ${pc.dim('(' + key + ')')}`);
    console.log(`      ${pc.white(meta.description)} ${pc.dim('[' + meta.stability + ']')}`);
  });

  console.log(pc.bold('\n内置模版'));
  templateRegistry.forEach((template) => {
    console.log(`  - ${pc.green(template.label)} ${pc.dim('(' + template.name + ')')}`);
    console.log(`      技术栈：${pc.magenta(template.stack)}`);
    console.log(`      说明：${pc.white(template.description)}`);
  });

  console.log(pc.bold('\n可用插件'));
  Object.entries(pluginRegistry).forEach(([scope, plugins]) => {
    const scopeLabel = scope === 'common' ? '通用' : frameworkRegistry[scope]?.label || scope;
    console.log(`\n  ${pc.bgBlue(pc.white(' ' + scopeLabel + ' '))}`);
    Object.entries(plugins).forEach(([key, config]) => {
      const deps = [
        ...Object.keys(config.pkg?.dependencies ?? {}),
        ...Object.keys(config.pkg?.devDependencies ?? {}),
      ];
      const depText = deps.length ? deps.join(', ') : '无';
      const stability = config.meta?.stability ?? 'stable';
      console.log(`    • ${pc.yellow(config.meta?.label ?? key)} ${pc.dim('(' + key + ')')}`);
      console.log(`        作用：${pc.white(config.meta?.description ?? ' - ')}`);
      console.log(`        依赖：${pc.dim(depText)}`);
      console.log(`        稳定性：${pc.dim(stability)}`);
    });
  });

  console.log(pc.bold('\n直达示例'));
  console.log(`  ${pc.dim('# 原生引擎：React + TS + Webpack + 插件')}`);
  console.log(`  ${pc.green('create-web-app my-app --engine native --framework react --language ts --bundler webpack --plugins router,lint,zustand')}`);
  console.log(`\n  ${pc.dim('# 外部引擎：直接调用 create-vite，并透传模板')}`);
  console.log(`  ${pc.green('create-web-app my-app --engine vite --framework react')}`);
  console.log(`\n${pc.dim('提示: 使用包管理器脚本运行时需加 \"--\" 传参，如 pnpm dev -- --engine native ...')}`);
}
