import path from 'node:path';
import fs from 'node:fs';
import fse from 'fs-extra';
import pc from 'picocolors';

import { TEMPLATE_ROOT } from '../utils/paths.js';
import { pluginRegistry } from '../config/plugin-registry.js';

export async function generateTemplate({ framework, plugins, projectName, targetDir }) {
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
