import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFile = path.resolve(__dirname, '../dist/index.js');

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
