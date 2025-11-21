import pc from 'picocolors';

import {
  pluginRegistry,
  frameworkRegistry,
  templateRegistry,
} from '../config/plugin-registry.js';

export function printHelp() {
  console.log(pc.bold('create-web-app - 帮助信息'));
  console.log('\n用法:');
  console.log('  create-web-app [project-name] [options]\n');
  console.log('常用选项:');
  console.log('  --help, -h            查看帮助信息并退出');
  console.log('  --version, -v         查看版本');
  console.log('  --engine <engine>     指定创建引擎 (native|vite|umi|next|...)');
  console.log('  --framework <fw>      指定框架 (react|vue)');
  console.log('  --plugins <list>      启用插件列表，逗号分隔 (如: router,lint,zustand)');
  console.log('  --language <lang>     指定语言 (js|ts)');

  console.log('\n支持框架:');
  Object.entries(frameworkRegistry).forEach(([key, meta]) => {
    console.log(`  - ${pc.cyan(meta.label)} (${key})`);
    console.log(`      ${meta.description} [${meta.stability}]`);
  });

  console.log('\n内置模版:');
  templateRegistry.forEach((template) => {
    console.log(`  - ${pc.green(template.label)} (${template.name})`);
    console.log(`      技术栈：${template.stack}`);
    console.log(`      说明：${template.description}`);
  });

  console.log('\n可用插件:');
  Object.entries(pluginRegistry).forEach(([scope, plugins]) => {
    const scopeLabel = scope === 'common' ? '通用' : frameworkRegistry[scope]?.label || scope;
    console.log(`\n  [${scopeLabel}]`);
    Object.entries(plugins).forEach(([key, config]) => {
      const deps = [
        ...Object.keys(config.pkg?.dependencies ?? {}),
        ...Object.keys(config.pkg?.devDependencies ?? {}),
      ];
      const depText = deps.length ? deps.join(', ') : '无';
      const stability = config.meta?.stability ?? 'stable';
      console.log(`    • ${pc.yellow(config.meta?.label ?? key)} (${key})`);
      console.log(`        作用：${config.meta?.description ?? ' - '}`);
      console.log(`        依赖：${depText}`);
      console.log(`        稳定性：${stability}`);
    });
  });

  console.log('\n直达示例:');
  console.log('  # 原生引擎：跳过交互，直接生成 React + 插件 + TS');
  console.log('  create-web-app my-app --engine native --framework react --plugins router,lint,zustand --language ts');
  console.log('\n  # 外部引擎：直接调用 create-vite，并透传模板');
  console.log('  create-web-app my-app --engine vite --framework react');
  console.log('\n提示: 使用包管理器脚本运行时需加 "--" 传参，如 pnpm dev -- --engine native ...');
}
