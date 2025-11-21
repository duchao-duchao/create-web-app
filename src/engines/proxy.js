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

export async function handleProxyMode(engine, projectName, opts = {}) {
  const executor = mappings[engine];
  if (!executor) {
    throw new Error(`暂不支持的引擎：${engine}`);
  }
  console.log(pc.dim(`正在调用 ${engine} 引擎...`));
  let cliArgs = projectName ? [...executor.args, projectName] : [...executor.args];
  // 透传常用模板参数（当前仅对 Vite 支持）
  if (engine === 'vite' && opts.framework) {
    // 通过 -- 传递给下游脚手架，避免 pnpm 自身解析
    cliArgs = [...cliArgs, '--', '--template', opts.framework];
  }
  await execa(executor.cmd, cliArgs, { stdio: 'inherit' });
}
