import { select, confirm, isCancel } from '@clack/prompts';

import { generateTemplate } from '../services/template.js';

export async function collectNativeOptions() {
  const framework = await select({
    message: '选择技术栈',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ],
  });

  if (isCancel(framework)) {
    throw new Error('未选择技术栈，流程中止');
  }

  const plugins = [];

  // 语言选择：JS 或 TS
  const language = await select({
    message: '选择语言',
    options: [
      { value: 'js', label: 'JavaScript' },
      { value: 'ts', label: 'TypeScript' },
    ],
    initialValue: 'js',
  });

  if (isCancel(language)) {
    throw new Error('未选择语言，流程中止');
  }

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

    if (isCancel(stateManager)) {
      throw new Error('未选择状态管理，流程中止');
    }

    if (stateManager !== 'none') {
      plugins.push(stateManager);
    }
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

    if (isCancel(vueStateManager)) {
      throw new Error('未选择状态管理，流程中止');
    }

    if (vueStateManager !== 'none') {
      plugins.push(vueStateManager);
    }
  }

  return { framework, plugins, language };
}

export async function createNativeProject({ projectName, targetDir, framework, plugins, language }) {
  await generateTemplate({ framework, plugins, projectName, targetDir, language });
}
