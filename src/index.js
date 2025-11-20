#!/usr/bin/env node

import { intro, outro, select, text, confirm, isCancel } from '@clack/prompts';
import { execa } from 'execa';
import pc from 'picocolors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import fse from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_ROOT = path.resolve(__dirname, 'templates');

async function main() {
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
      options: [
        { value: 'native', label: '🚀 Native (本脚手架自研标准)' },
        { value: 'vite', label: '⚡ Vite (create-vite)' },
        { value: 'umi', label: '🍙 Umi (create-umi)' },
        { value: 'cra', label: '⚛️ CRA (create-react-app，较慢)' },
      ],
    });

    if (isCancel(engine)) {
      outro(pc.yellow('已取消创建。'));
      process.exit(0);
    }

    if (engine !== 'native') {
      await handleProxyMode(engine, projectName);
    } else {
      await handleNativeMode(projectName, targetDir);
    }

    outro(pc.green('🎉 项目创建成功，祝编码愉快！'));
  } catch (error) {
    outro(pc.red(`创建失败：${error.message}`));
    process.exit(1);
  }
}

async function handleProxyMode(engine, projectName) {
  const mappings = {
    vite: { cmd: 'pnpm', args: ['create', 'vite@latest', projectName] },
    umi: { cmd: 'pnpm', args: ['dlx', 'create-umi@latest', projectName] },
    cra: { cmd: 'pnpm', args: ['dlx', 'create-react-app@latest', projectName] },
  };

  const executor = mappings[engine];
  if (!executor) {
    throw new Error(`暂不支持的引擎：${engine}`);
  }

  console.log(pc.dim(`正在调用 ${engine} 引擎...`));
  await execa(executor.cmd, executor.args, { stdio: 'inherit' });
}

async function handleNativeMode(projectName, targetDir) {
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

  const useRouter = await confirm({ message: '是否安装路由（Router）？' });
  if (!isCancel(useRouter) && useRouter) plugins.push('router');

  const useLint = await confirm({ message: '是否配置 ESLint + Prettier？' });
  if (!isCancel(useLint) && useLint) plugins.push('lint');

  let stateManager = null;
  if (framework === 'react') {
    stateManager = await select({
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

    if (stateManager && stateManager !== 'none') {
      plugins.push(stateManager);
    }
  }

  await generateTemplate({ framework, plugins, projectName, targetDir });
}

async function generateTemplate({ framework, plugins, projectName, targetDir }) {
  const templateDir = path.join(TEMPLATE_ROOT, framework);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`缺少 ${framework} 模版，请检查 templates 目录`);
  }

  await fse.copy(templateDir, targetDir);
  await patchPackageJson(targetDir, framework, projectName, plugins);
  await applyPlugins(framework, plugins, targetDir);

  console.log(pc.green(`\n✅ 已生成 ${framework} 模版，位置：${projectName}`));
  if (plugins.length) {
    console.log(pc.cyan(`已启用插件：${plugins.join(', ')}`));
  }
  console.log(pc.dim('\n下一步：'));
  console.log(pc.dim(`  cd ${projectName}`));
  console.log(pc.dim('  pnpm install'));
  console.log(pc.dim('  pnpm dev')); 
}

async function patchPackageJson(targetDir, framework, projectName, plugins) {
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
  pkg.name = projectName;

  const pluginDeps = plugins.reduce(
    (acc, plugin) => {
      const def = pluginRegistry[framework]?.[plugin] || pluginRegistry.common[plugin];
      if (def?.pkg) {
        mergeDependencies(acc, def.pkg);
      }
      return acc;
    },
    { dependencies: {}, devDependencies: {} }
  );

  mergeDependencies(pkg, pluginDeps);
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}

async function applyPlugins(framework, plugins, targetDir) {
  for (const plugin of plugins) {
    const def = pluginRegistry[framework]?.[plugin] || pluginRegistry.common[plugin];
    if (!def) continue;

    if (def.files) {
      for (const [relative, content] of Object.entries(def.files)) {
        const dest = path.join(targetDir, relative);
        await fse.ensureDir(path.dirname(dest));
        await fs.promises.writeFile(dest, content);
      }
    }

    if (def.transforms) {
      for (const transform of def.transforms) {
        const filePath = path.join(targetDir, transform.file);
        const raw = await fs.promises.readFile(filePath, 'utf8');
        const next = await transform.run(raw);
        await fs.promises.writeFile(filePath, next);
      }
    }
  }
}

function mergeDependencies(target, source = {}) {
  if (!source) return target;
  for (const field of ['dependencies', 'devDependencies']) {
    if (!source[field]) continue;
    target[field] = {
      ...(target[field] || {}),
      ...source[field],
    };
  }
  return target;
}

const pluginRegistry = {
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
              .replace("import App from './App.vue';", "import App from './App.vue';\nimport { router } from './router';")
              .replace("createApp(App).mount('#app');", "createApp(App).use(router).mount('#app');");
          },
        },
      ],
    },
  },
};

await main();
