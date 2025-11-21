import commonLint from './plugins/common/lint.js';
import reactRouter from './plugins/react/router.js';
import reactZustand from './plugins/react/zustand.js';
import reactRedux from './plugins/react/redux.js';
import vueRouter from './plugins/vue/router.js';
import vuePinia from './plugins/vue/pinia.js';
import vueVuex from './plugins/vue/vuex.js';

export const frameworkRegistry = {
  react: {
    label: 'React + Vite',
    description: 'Vite 5 + React 18 SPA 模版，支持 Router / 状态管理插件。',
    stability: 'stable',
    templates: ['react'],
  },
  vue: {
    label: 'Vue + Vite',
    description: 'Vite 5 + Vue 3 SPA 模版，内置 Vue Router 支持。',
    stability: 'stable',
    templates: ['vue'],
  },
};

export const templateRegistry = [
  {
    name: 'react',
    label: 'React SPA (Vite)',
    stack: 'React 18 + Vite 5',
    description: '默认包含 React Router 插槽、CSS 模块化结构。',
  },
  {
    name: 'vue',
    label: 'Vue SPA (Vite)',
    stack: 'Vue 3 + Vite 5',
    description: '默认包含基础视图与样式，可按需挂载插件。',
  },
];

export const pluginRegistry = {
  common: {
    lint: commonLint,
  },
  react: {
    router: reactRouter,
    zustand: reactZustand,
    redux: reactRedux,
  },
  vue: {
    router: vueRouter,
    pinia: vuePinia,
    vuex: vueVuex,
  },
};