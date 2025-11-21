import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFile = path.resolve(__dirname, '../dist/index.js');

// 1) 为 dist/index.js 添加 shebang
try {
  let content = await fs.readFile(distFile, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    content = `#!/usr/bin/env node\n${content}`;
    await fs.writeFile(distFile, content, 'utf8');
  }
  console.log('写入成功');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('未找到 dist/index.js，请先运行 tsup 构建');
  } else {
    throw error;
  }
}

// 2) 复制模板到 dist/templates，确保运行时可找到模板
try {
  const srcTemplates = path.resolve(__dirname, '../src/templates');
  const distTemplates = path.resolve(__dirname, '../dist/templates');
  await fse.copy(srcTemplates, distTemplates, { overwrite: true });
  console.log('模板已复制到 dist/templates');
} catch (error) {
  console.warn('复制模板失败：', error?.message || error);
}
