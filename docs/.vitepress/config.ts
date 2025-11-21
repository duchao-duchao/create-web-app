import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'create-web-app',
  description: '多引擎可插拔的前端脚手架',
  // GitHub Pages 项目页需要设置 base 为仓库名前缀
  // 若使用自定义域或用户主页（username.github.io），可改为 '/' 或移除
  base: '/create-web-app/',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '架构', link: '/guide/architecture' }
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '架构总览', link: '/guide/architecture' },
        { text: '插件系统', link: '/guide/plugins' },
        { text: '类型支持 (TS)', link: '/guide/typescript' },
        { text: '打包器选择', link: '/guide/bundler' }
      ]
    }
  }
});