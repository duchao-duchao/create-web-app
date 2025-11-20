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
          run(content) {
            return content
              .replace(
                "import App from './App';",
                "import App from './App';\nimport { RouterProvider } from 'react-router-dom';\nimport { router } from './router';"
              )
              .replace('<App />', '<RouterProvider router={router} />');
          },
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
      },
      transforms: [
        {
          file: 'src/App.jsx',
          run(content) {
            return content
              .replace(
                "export default function App() {",
                "export default function App() {\n  const { count, inc } = useCounter();"
              )
              .replace(
                "import './App.css';",
                "import './App.css';\nimport { useCounter } from './store/useCounter';"
              )
              .replace(
                '{/* PLUGIN_SLOT */}',
                `<p>当前计数：{count}</p>\n        <button onClick={inc}>＋1</button>`
              );
          },
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
      },
      transforms: [
        {
          file: 'src/main.jsx',
          run(content) {
            let next = content.replace(
              "import App from './App';",
              "import App from './App';\nimport { Provider } from 'react-redux';\nimport { store } from './store/store';"
            );
            const routerMarker = '<RouterProvider router={router} />';
            if (next.includes(routerMarker)) {
              next = next.replace(
                routerMarker,
                `<Provider store={store}>${routerMarker}</Provider>`
              );
            } else {
              next = next.replace('<App />', '<Provider store={store}><App /></Provider>');
            }
            return next;
          },
        },
        {
          file: 'src/App.jsx',
          run(content) {
            return content
              .replace(
                "import './App.css';",
                "import './App.css';\nimport { useDispatch, useSelector } from 'react-redux';\nimport { increment } from './store/store';"
              )
              .replace(
                "export default function App() {",
                "export default function App() {\n  const dispatch = useDispatch();\n  const value = useSelector((state) => state.counter.value);"
              )
              .replace(
                '{/* PLUGIN_SLOT */}',
                `<p>当前计数：{value}</p>\n        <button onClick={() => dispatch(increment())}>＋1</button>`
              );
          },
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
          run(content) {
            return content
              .replace(
                "import App from './App.vue';",
                "import App from './App.vue';\nimport { router } from './router';"
              )
              .replace("createApp(App).mount('#app');", "createApp(App).use(router).mount('#app');");
          },
        },
      ],
    },
  },
};
