export default {
  meta: {
    label: 'Vite',
    description: '使用 Vite 5 打包，极速开发与构建。',
    stability: 'stable',
  },
  // 覆盖 scripts，确保切换回 Vite 时生效
  pkg: ({ framework }) => ({
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    devDependencies: {
      vite: '^5.4.0',
      ...(framework === 'react' ? { '@vitejs/plugin-react': '^4.3.1' } : {}),
      ...(framework === 'vue' ? { '@vitejs/plugin-vue': '^5.1.2' } : {}),
    },
  }),
};