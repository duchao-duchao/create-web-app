export const pluginRegistry = {
  common: {
    lint: {
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
