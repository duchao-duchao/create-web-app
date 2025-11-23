import commonLint from './plugins/common/lint.js';
import bundlerVite from './plugins/common/bundler-vite.js';
import bundlerWebpack from './plugins/common/bundler-webpack.js';
import reactRouter from './plugins/react/router.js';
import reactZustand from './plugins/react/zustand.js';
import reactRedux from './plugins/react/redux.js';
import vueRouter from './plugins/vue/router.js';
import vuePinia from './plugins/vue/pinia.js';
import vueVuex from './plugins/vue/vuex.js';

export const frameworkRegistry = {
  react: {
    label: 'React',
    description: 'React 18 SPA 模版，支持 Vite 或 Webpack 打包，插件可选。',
    stability: 'stable',
    templates: ['react'],
  },
  vue: {
    label: 'Vue',
    description: 'Vue 3 SPA 模版，支持 Vite 或 Webpack 打包，插件可选。',
    stability: 'stable',
    templates: ['vue'],
  },
};

export const templateRegistry = [
  {
    name: 'react',
    label: 'React SPA',
    stack: 'React 18',
    description: '默认包含基础结构，支持路由/状态管理与打包器选择。',
  },
  {
    name: 'vue',
    label: 'Vue SPA',
    stack: 'Vue 3',
    description: '默认包含基础视图与样式，支持插件与打包器选择。',
  },
];

export const pluginRegistry = {
  common: {
    lint: commonLint,
    vite: bundlerVite,
    webpack: bundlerWebpack,
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