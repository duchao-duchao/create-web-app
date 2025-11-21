import pc from 'picocolors';
import { execa } from 'execa';

const mappings = {
  vite: { cmd: 'pnpm', args: ['create', 'vite@latest'] },
  umi: { cmd: 'pnpm', args: ['dlx', 'create-umi@latest'] },
  cra: { cmd: 'pnpm', args: ['dlx', 'create-react-app@latest'] },
  next: { cmd: 'pnpm', args: ['create', 'next-app@latest'] },
  nuxt: { cmd: 'pnpm', args: ['dlx', 'nuxi@latest', 'init'] },
  astro: { cmd: 'pnpm', args: ['create', 'astro@latest'] },
  svelte: { cmd: 'pnpm', args: ['create', 'svelte@latest'] },
  angular: { cmd: 'pnpm', args: ['dlx', '@angular/cli@latest', 'new'] },
  remix: { cmd: 'pnpm', args: ['dlx', 'create-remix@latest'] },
  solid: { cmd: 'pnpm', args: ['create', 'solid@latest'] },
  qwik: { cmd: 'pnpm', args: ['create', 'qwik@latest'] },
};

export async function handleProxyMode(engine, projectName) {
  const executor = mappings[engine];
  if (!executor) {
    throw new Error(`暂不支持的引擎：${engine}`);
  }

  console.log(pc.dim(`正在调用 ${engine} 引擎...`));
  await execa(executor.cmd, [...executor.args, projectName], { stdio: 'inherit' });
}
