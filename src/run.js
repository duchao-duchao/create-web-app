import { intro, outro, select, text, isCancel, confirm } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';

import { handleProxyMode } from './engines/proxy.js';
import { collectNativeOptions, createNativeProject } from './engines/native.js';
import { pluginRegistry, frameworkRegistry } from './config/plugin-registry.js';

const ENGINE_CHOICES = [
  { value: 'native', label: '当前脚手架 (create-web-app)' },
  { value: 'vite', label: 'Vite (create-vite)' },
  { value: 'umi', label: 'Umi (create-umi)' },
  { value: 'cra', label: 'CRA (create-react-app)' },
  { value: 'next', label: 'Next.js (create-next-app)' },
  { value: 'nuxt', label: 'Nuxt (nuxi init)' },
  { value: 'astro', label: 'Astro (create-astro)' },
  { value: 'svelte', label: 'SvelteKit (create-svelte)' },
  { value: 'angular', label: 'Angular (ng new)' },
  { value: 'remix', label: 'Remix (create-remix)' },
  { value: 'solid', label: 'Solid (create-solid)' },
  { value: 'qwik', label: 'Qwik (create-qwik)' },
];

const ENGINE_LABEL_MAP = ENGINE_CHOICES.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export async function run(cliOverrides = {}) {
  try {
    intro(pc.bgBlue(pc.black(' create-web-app - 前端脚手架 ')));

    // 第一步：选择创建引擎（支持 CLI 直达）
    const engine = cliOverrides.engine ?? await select({
      message: '请选择项目创建引擎',
      options: ENGINE_CHOICES,
    });

    if (isCancel(engine)) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }


    // 外部引擎：直接代理到对应 CLI（支持传递项目名与模板）
    if (engine !== 'native') {
      await handleProxyMode(engine, cliOverrides.projectName, { framework: cliOverrides.framework });
      outro(pc.green('🎉 项目创建成功，祝编码愉快！'));
      return;
    }

    // Native 引擎：继续收集项目名与插件选项，并进行确认
    const projectNameInput = cliOverrides.projectName ?? await text({
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

    // 收集/合并选项：支持 CLI 覆盖
    let framework = cliOverrides.framework;
    let language = cliOverrides.language;
    let plugins = Array.isArray(cliOverrides.plugins) ? [...new Set(cliOverrides.plugins)] : undefined;

    if (!framework || !language || !plugins) {
      // 框架
      framework = framework ?? await select({
        message: '选择技术栈',
        options: [
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ],
      });
      if (isCancel(framework)) throw new Error('未选择技术栈，流程中止');

      // 语言
      language = language ?? await select({
        message: '选择语言',
        options: [
          { value: 'js', label: 'JavaScript' },
          { value: 'ts', label: 'TypeScript' },
        ],
        initialValue: 'js',
      });
      if (isCancel(language)) throw new Error('未选择语言，流程中止');

      // 插件（若未通过 CLI 指定）
      if (!plugins) {
        plugins = [];
        const useRouter = await confirm({ message: '是否安装路由（Router）？' });
        if (!isCancel(useRouter) && useRouter) plugins.push('router');

        const useLint = await confirm({ message: '是否配置 ESLint + Prettier？' });
        if (!isCancel(useLint) && useLint) plugins.push('lint');

        if (framework === 'react') {
          const stateManager = await select({
            message: '选择状态管理方案',
            options: [
              { value: 'none', label: '不需要' },
              { value: 'zustand', label: 'Zustand (推荐)' },
              { value: 'redux', label: 'Redux Toolkit' },
            ],
          });
          if (isCancel(stateManager)) throw new Error('未选择状态管理，流程中止');
          if (stateManager !== 'none') plugins.push(stateManager);
        }

        if (framework === 'vue') {
          const vueStateManager = await select({
            message: '选择状态管理方案',
            options: [
              { value: 'none', label: '不需要' },
              { value: 'pinia', label: 'Pinia (推荐)' },
              { value: 'vuex', label: 'Vuex 4' },
            ],
          });
          if (isCancel(vueStateManager)) throw new Error('未选择状态管理，流程中止');
          if (vueStateManager !== 'none') plugins.push(vueStateManager);
        }
      }
    }

    const nativeOptions = { framework, plugins: plugins ?? [], language: language ?? 'js' };

    let proceed = true;
    if (!cliOverrides.skipConfirm) {
      const confirmed = await confirm({
        message: buildSummary({
          projectName,
          targetDir,
          engine,
          framework: nativeOptions?.framework,
          plugins: nativeOptions?.plugins ?? [],
          language: nativeOptions?.language,
        }),
      });
      proceed = !(isCancel(confirmed) || confirmed === false);
    }
    if (!proceed) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }

    await createNativeProject({
      projectName,
      targetDir,
      framework: nativeOptions.framework,
      plugins: nativeOptions.plugins,
      language: nativeOptions.language,
    });

    outro(pc.green('🎉 项目创建成功，祝编码愉快！'));
  } catch (error) {
    outro(pc.red(`创建失败：${error.message}`));
    process.exit(1);
  }
}

function buildSummary({ projectName, targetDir, engine, framework, plugins, language }) {
  const lines = [
    `项目名称：${projectName}`,
    `目标路径：${targetDir}`,
    `创建引擎：${ENGINE_LABEL_MAP[engine] ?? engine}`,
  ];

  if (engine === 'native') {
    const frameworkLabel = frameworkRegistry[framework]?.label ?? framework;
    lines.push(`使用模版：${frameworkLabel}`);
    if (language) lines.push(`语言：${language === 'ts' ? 'TypeScript' : 'JavaScript'}`);
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
