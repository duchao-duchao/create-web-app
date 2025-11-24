import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'create-web-app',
  description: '多引擎可插拔的前端脚手架',
  // GitHub Pages 项目页需要设置 base 为仓库名前缀
  // 若使用自定义域或用户主页（username.github.io），可改为 '/' 或移除
  base: '/create-web-app/',
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#3f5efb' }],
    ['meta', { name: 'og:title', content: 'create-web-app' }],
    ['meta', { name: 'og:description', content: '多引擎可插拔的前端脚手架' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    siteTitle: 'create-web-app',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '架构', link: '/guide/architecture' },
      { text: '插件', link: '/guide/plugins' },
      { text: '打包器', link: '/guide/bundler' },
      { text: 'GitHub', link: 'https://github.com/duchao-duchao/create-web-app' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        },
        {
          text: '核心',
          collapsed: false,
          items: [
            { text: '架构总览', link: '/guide/architecture' },
            { text: '插件系统', link: '/guide/plugins' },
            { text: '类型支持 (TS)', link: '/guide/typescript' },
            { text: '打包器选择', link: '/guide/bundler' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/duchao-duchao/create-web-app' }
    ],
    editLink: {
      pattern: 'https://github.com/duchao-duchao/create-web-app/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    lastUpdatedText: '最后更新',
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2023-2025 Create Web App'
    }
  }
});