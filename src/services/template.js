import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import pc from 'picocolors';

import { TEMPLATE_ROOT } from '../utils/paths.js';
import { pluginRegistry } from '../config/plugin-registry.js';

export async function generateTemplate({ framework, plugins, projectName, targetDir, language = 'js' }) {
  const templateDir = path.join(TEMPLATE_ROOT, framework);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`缺少 ${framework} 模版，请检查 templates 目录`);
  }

  await fse.copy(templateDir, targetDir);
  await patchPackageJson(targetDir, framework, projectName, plugins);
  await applyPlugins(framework, plugins, targetDir);
  await applyLanguageAdjustments({ framework, targetDir, language });

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
  // 合并依赖、脚本与 lint-staged 配置
  for (const plugin of plugins) {
    const def = pluginRegistry[framework]?.[plugin] || pluginRegistry.common[plugin];
    if (!def?.pkg) continue;
    mergePackageFields(pkg, def.pkg, ['dependencies', 'devDependencies']);
    mergePackageFields(pkg, def.pkg, ['scripts']);
    mergePackageFields(pkg, def.pkg, ['lint-staged']);
  }
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}

async function applyPlugins(framework, plugins, targetDir) {
  for (const plugin of plugins) {
    const def = pluginRegistry[framework]?.[plugin] || pluginRegistry.common[plugin];
    if (!def) continue;

    if (def.files) {
      // 支持两种形式：
      // 1) 旧版对象映射：{ 'path/to': 'content' }
      // 2) 新版动作数组：[{ to, from?, content?, whenExists? }]
      if (Array.isArray(def.files)) {
        for (const action of def.files) {
          const { to, from, content, whenExists = 'skip' } = action;
          if (!to) continue;
          const dest = path.join(targetDir, to);
          const exists = fs.existsSync(dest);
          if (exists && whenExists === 'skip') continue;

          let data = content ?? '';
          if (from) {
            const srcPath = path.join(TEMPLATE_ROOT, from);
            data = await fs.promises.readFile(srcPath, 'utf8');
          }

          await fse.ensureDir(path.dirname(dest));
          await fs.promises.writeFile(dest, data);
        }
      } else if (typeof def.files === 'object') {
        for (const [relative, content] of Object.entries(def.files)) {
          const dest = path.join(targetDir, relative);
          await fse.ensureDir(path.dirname(dest));
          await fs.promises.writeFile(dest, content);
        }
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

function mergePackageFields(target, source = {}, fields = []) {
  if (!source) return target;
  for (const field of fields) {
    if (source[field] === undefined) continue;
    const srcVal = source[field];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      target[field] = {
        ...(target[field] || {}),
        ...srcVal,
      };
    } else {
      target[field] = srcVal;
    }
  }
  return target;
}

async function applyLanguageAdjustments({ framework, targetDir, language }) {
  if (language !== 'ts') return;

  // 1) 追加 TypeScript 相关依赖
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf8'));
  pkg.devDependencies = {
    ...(pkg.devDependencies || {}),
    typescript: pkg.devDependencies?.typescript ?? '^5.6.3',
  };
  if (framework === 'react') {
    pkg.devDependencies['@types/react'] = pkg.devDependencies['@types/react'] ?? '^18.3.11';
    pkg.devDependencies['@types/react-dom'] = pkg.devDependencies['@types/react-dom'] ?? '^18.3.0';
  }
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  // 2) tsconfig.json
  const tsconfig = framework === 'react'
    ? {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx'
        },
        include: ['src']
      }
    : {
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true
        },
        include: ['src']
      };
  await fs.promises.writeFile(path.join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // 3) 文件扩展名与入口修改
  const rename = async (fromRel, toRel) => {
    const from = path.join(targetDir, fromRel);
    const to = path.join(targetDir, toRel);
    if (fs.existsSync(from)) {
      await fse.ensureDir(path.dirname(to));
      await fs.promises.rename(from, to);
    }
  };

  if (framework === 'react') {
    await rename('src/main.jsx', 'src/main.tsx');
    await rename('src/App.jsx', 'src/App.tsx');
    await rename('src/components/ZustandCounter.jsx', 'src/components/ZustandCounter.tsx');
    await rename('src/components/ReduxCounter.jsx', 'src/components/ReduxCounter.tsx');
    await rename('src/store/useCounter.js', 'src/store/useCounter.ts');
    await rename('src/store/store.js', 'src/store/store.ts');

    // index.html 入口修正
    const indexHtmlPath = path.join(targetDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const html = await fs.promises.readFile(indexHtmlPath, 'utf8');
      const nextHtml = html.replace('/src/main.jsx', '/src/main.tsx');
      await fs.promises.writeFile(indexHtmlPath, nextHtml);
    }
  }

  if (framework === 'vue') {
    await rename('src/main.js', 'src/main.ts');
    await rename('src/router.js', 'src/router.ts');
    await rename('src/store/index.js', 'src/store/index.ts');

    // index.html 入口修正
    const indexHtmlPath = path.join(targetDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const html = await fs.promises.readFile(indexHtmlPath, 'utf8');
      const nextHtml = html.replace('/src/main.js', '/src/main.ts');
      await fs.promises.writeFile(indexHtmlPath, nextHtml);
    }

    // 声明 .vue 模块，避免编辑器类型报错
    const dtsPath = path.join(targetDir, 'src', 'vite-env.d.ts');
    const dts = `/// <reference types="vite/client" />
declare module '*.vue' { const component: any; export default component; }`;
    await fse.ensureDir(path.dirname(dtsPath));
    await fs.promises.writeFile(dtsPath, dts);
  }
}
