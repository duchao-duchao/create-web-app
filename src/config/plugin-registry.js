import {
  injectReactRouterIntoMain,
  wrapAppWithReduxProvider,
  attachComponentToApp,
} from '../services/transforms/react.js';
import {
  injectVueRouterIntoMain,
  injectPiniaIntoMain,
  injectVuexIntoMain,
} from '../services/transforms/vue.js';

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
    lint: {
      meta: {
        label: 'ESLint + Prettier',
        description: '启用基础 ESLint 规则与 Prettier 格式化。',
        stability: 'stable',
      },
      pkg: {
        devDependencies: {
          eslint: '^9.11.0',
          'eslint-config-prettier': '^9.1.0',
          prettier: '^3.3.3',
          'lint-staged': '^15.2.0',
          husky: '^9.0.11'
        },
        scripts: {
          prepare: 'husky install'
        },
        'lint-staged': {
          '*.{js,jsx,ts,tsx,vue}': [
            'eslint --fix --max-warnings=0',
            'prettier --write'
          ],
          '*.{css,scss,md,json}': [
            'prettier --write'
          ]
        }
      },
      files: [
        {
          from: 'snippets/common/eslintrc.json',
          to: '.eslintrc.json',
          whenExists: 'skip',
        },
        {
          from: 'snippets/common/prettierrc.json',
          to: '.prettierrc',
          whenExists: 'skip',
        },
        {
          from: 'snippets/common/husky-pre-commit.sh',
          to: '.husky/pre-commit',
          whenExists: 'skip',
        },
      ],
    },
  },
  react: {
    router: {
      meta: {
        label: 'React Router',
        description: '集成 react-router-dom 6，支持浏览器路由。',
        stability: 'stable',
      },
      pkg: {
        dependencies: { 'react-router-dom': '^6.25.1' },
      },
      files: [
        {
          from: 'snippets/react/router.jsx',
          to: 'src/router.jsx',
          whenExists: 'skip',
        },
      ],
      transforms: [
        {
          file: 'src/main.jsx',
          run: injectReactRouterIntoMain,
        },
      ],
    },
    zustand: {
      meta: {
        label: 'Zustand',
        description: '轻量状态管理，提供计数器示例。',
        stability: 'beta',
      },
      pkg: { dependencies: { zustand: '^4.5.5' } },
      files: [
        {
          from: 'snippets/react/zustand-store.js',
          to: 'src/store/useCounter.js',
          whenExists: 'skip',
        },
        {
          from: 'snippets/react/zustand-component.jsx',
          to: 'src/components/ZustandCounter.jsx',
          whenExists: 'skip',
        },
      ],
      transforms: [
        {
          file: 'src/App.jsx',
          run: attachComponentToApp({
            componentName: 'ZustandCounter',
            importPath: './components/ZustandCounter',
          }),
        },
      ],
    },
    redux: {
      meta: {
        label: 'Redux Toolkit',
        description: '注入 Redux Toolkit + react-redux，适合复杂状态场景。',
        stability: 'stable',
      },
      pkg: {
        dependencies: {
          '@reduxjs/toolkit': '^2.2.7',
          'react-redux': '^9.1.2',
        },
      },
      files: [
        {
          from: 'snippets/react/redux-store.js',
          to: 'src/store/store.js',
          whenExists: 'skip',
        },
        {
          from: 'snippets/react/redux-component.jsx',
          to: 'src/components/ReduxCounter.jsx',
          whenExists: 'skip',
        },
      ],
      transforms: [
        {
          file: 'src/main.jsx',
          run: wrapAppWithReduxProvider,
        },
        {
          file: 'src/App.jsx',
          run: attachComponentToApp({
            componentName: 'ReduxCounter',
            importPath: './components/ReduxCounter',
          }),
        },
      ],
    },
  },
  vue: {
    router: {
      meta: {
        label: 'Vue Router',
        description: '集成 vue-router 4，创建基础路由配置。',
        stability: 'stable',
      },
      pkg: {
        dependencies: { 'vue-router': '^4.4.3' },
      },
      files: [
        {
          from: 'snippets/vue/router.js',
          to: 'src/router.js',
          whenExists: 'skip',
        },
        {
          from: 'snippets/vue/home.vue',
          to: 'src/views/Home.vue',
          whenExists: 'skip',
        },
      ],
      transforms: [
        {
          file: 'src/main.js',
          run: injectVueRouterIntoMain,
        },
      ],
    },
    pinia: {
      meta: {
        label: 'Pinia',
        description: '集成 Pinia 状态管理，在入口中挂载。',
        stability: 'stable',
      },
      pkg: {
        dependencies: { pinia: '^2.2.4' },
      },
      transforms: [
        {
          file: 'src/main.js',
          run: injectPiniaIntoMain,
        },
      ],
    },
    vuex: {
      meta: {
        label: 'Vuex 4',
        description: '集成 Vuex 状态管理，生成基础 store 并挂载。',
        stability: 'stable',
      },
      pkg: {
        dependencies: { vuex: '^4.1.0' },
      },
      files: [
        {
          from: 'snippets/vue/vuex-store.js',
          to: 'src/store/index.js',
          whenExists: 'skip',
        },
      ],
      transforms: [
        {
          file: 'src/main.js',
          run: injectVuexIntoMain,
        },
      ],
    },
  },
};