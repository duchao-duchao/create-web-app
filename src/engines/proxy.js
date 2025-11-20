import pc from 'picocolors';
import { execa } from 'execa';

const mappings = {
  vite: { cmd: 'pnpm', args: ['create', 'vite@latest'] },
  umi: { cmd: 'pnpm', args: ['dlx', 'create-umi@latest'] },
  cra: { cmd: 'pnpm', args: ['dlx', 'create-react-app@latest'] },
};

export async function handleProxyMode(engine, projectName) {
  const executor = mappings[engine];
  if (!executor) {
    throw new Error(`暂不支持的引擎：${engine}`);
  }

  console.log(pc.dim(`正在调用 ${engine} 引擎...`));
  await execa(executor.cmd, [...executor.args, projectName], { stdio: 'inherit' });
}
