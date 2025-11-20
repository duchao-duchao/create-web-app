import {
  injectReactRouterIntoMain,
  wrapAppWithReduxProvider,
  attachComponentToApp,
} from '../services/transforms/react.js';
import { injectVueRouterIntoMain } from '../services/transforms/vue.js';

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
        },
      },
      files: {
        '.eslintrc.json': JSON.stringify(
          {
            root: true,
            env: { browser: true, es2021: true },
            extends: ['eslint:recommended'],
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
            rules: {},
          },
          null,
          2
        ),
        '.prettierrc': JSON.stringify(
          {
            singleQuote: true,
            trailingComma: 'es5',
          },
          null,
          2
        ),
      },
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
      files: {
        'src/router.jsx': `import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
  },
]);
`,
      },
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
      files: {
        'src/store/useCounter.js': `import { create } from 'zustand';

export const useCounter = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
`,
        'src/components/ZustandCounter.jsx': `import { useCounter } from '../store/useCounter';

export default function ZustandCounter() {
  const { count, inc } = useCounter();

  return (
    <section className="card">
      <h2>Zustand Demo</h2>
      <p>当前计数：{count}</p>
      <button onClick={inc}>＋1</button>
    </section>
  );
}
`,
      },
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
      files: {
        'src/store/store.js': `import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { increment } = counterSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});
`,
        'src/components/ReduxCounter.jsx': `import { useDispatch, useSelector } from 'react-redux';
import { increment } from '../store/store';

export default function ReduxCounter() {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.counter.value);

  return (
    <section className="card">
      <h2>Redux Demo</h2>
      <p>当前计数：{value}</p>
      <button onClick={() => dispatch(increment())}>＋1</button>
    </section>
  );
}
`,
      },
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
      files: {
        'src/router.js': `import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
  ],
});
`,
        'src/views/Home.vue': `<template>
  <main class="container">
    <h1>Vue App</h1>
    <p>这是通过 vue-router 渲染的 Home 页。</p>
  </main>
</template>
`,
      },
      transforms: [
        {
          file: 'src/main.js',
          run: injectVueRouterIntoMain,
        },
      ],
    },
  },
};
