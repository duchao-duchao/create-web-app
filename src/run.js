import { intro, outro, select, text, isCancel, confirm } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';

import { handleProxyMode } from './engines/proxy.js';
import { collectNativeOptions, createNativeProject } from './engines/native.js';
import { pluginRegistry, frameworkRegistry } from './config/plugin-registry.js';

const ENGINE_CHOICES = [
  { value: 'native', label: '🚀 Native (本脚手架自研标准)' },
  { value: 'vite', label: '⚡ Vite (create-vite)' },
  { value: 'umi', label: '🍙 Umi (create-umi)' },
  { value: 'cra', label: '⚛️ CRA (create-react-app，较慢)' },
];

const ENGINE_LABEL_MAP = ENGINE_CHOICES.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export async function run() {
  try {
    intro(pc.bgBlue(pc.black(' MY-CLI - 全能前端脚手架 ')));

    const projectNameInput = await text({
      message: '请输入项目名称',
      placeholder: 'my-app',
      validate(value) {
        if (!value?.trim()) return '项目名不能为空';
        if (/[^a-z0-9-]/i.test(value)) return '项目名仅支持字母/数字/短横线';
      },
    });

    if (isCancel(projectNameInput)) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }

    const projectName = String(projectNameInput).trim();
    const targetDir = path.resolve(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
      outro(pc.red(`目录 ${projectName} 已存在，请更换名称。`));
      process.exit(1);
    }

    const engine = await select({
      message: '请选择项目创建引擎',
      options: ENGINE_CHOICES,
    });

    if (isCancel(engine)) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }

    let nativeOptions = null;
    if (engine === 'native') {
      nativeOptions = await collectNativeOptions();
    }

    const confirmed = await confirm({
      message: buildSummary({
        projectName,
        targetDir,
        engine,
        framework: nativeOptions?.framework,
        plugins: nativeOptions?.plugins ?? [],
      }),
    });

    if (isCancel(confirmed) || confirmed === false) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }

    if (engine !== 'native') {
      await handleProxyMode(engine, projectName);
    } else {
      await createNativeProject({
        projectName,
        targetDir,
        framework: nativeOptions.framework,
        plugins: nativeOptions.plugins,
      });
    }

    outro(pc.green('🎉 项目创建成功，祝编码愉快！'));
  } catch (error) {
    outro(pc.red(`创建失败：${error.message}`));
    process.exit(1);
  }
}

function buildSummary({ projectName, targetDir, engine, framework, plugins }) {
  const lines = [
    `项目名称：${projectName}`,
    `目标路径：${targetDir}`,
    `创建引擎：${ENGINE_LABEL_MAP[engine] ?? engine}`,
  ];

  if (engine === 'native') {
    const frameworkLabel = frameworkRegistry[framework]?.label ?? framework;
    lines.push(`使用模版：${frameworkLabel}`);
    lines.push(`启用插件：${formatPluginList(framework, plugins)}`);
  } else {
    lines.push('使用模版：由外部引擎决定');
    lines.push('启用插件：由外部引擎决定');
  }

  return `请确认以下配置：\n\n${lines.join('\n')}\n\n继续创建项目吗？`;
}

function formatPluginList(framework, plugins) {
  if (!plugins?.length) return '无';
  return plugins
    .map((plugin) => {
      const def = pluginRegistry[framework]?.[plugin] || pluginRegistry.common[plugin];
      return def?.meta?.label ?? plugin;
    })
    .join('、');
}
