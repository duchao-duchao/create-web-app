import { intro, outro, select, text, isCancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';

import { handleProxyMode } from './engines/proxy.js';
import { handleNativeMode } from './engines/native.js';

export async function run() {
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
