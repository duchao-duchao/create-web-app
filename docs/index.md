---
layout: home
title: Create Web App
hero:
  name: Create Web App
  text: 多引擎可插拔的前端脚手架
  tagline: 统一入口、自由组合、AST 安全注入
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 架构总览
      link: /guide/architecture
features:
  - title: 双引擎模式
    details: 自研与外部 CLI 代理兼容，统一入口，不再记命令。
  - title: 声明式插件
    details: 依赖 / 文件 / 代码变换三位一体，搭乐高式组合。
  - title: AST 注入
    details: 基于 Babel AST 的安全修改，避免脆弱的字符串替换。
  - title: TypeScript 支持
    details: 一键 TS 化，自动生成 tsconfig 与类型依赖。
  - title: 可选打包器
    details: 支持 Vite / Webpack 选择，脚本与配置自动注入。
---

## 项目简介

`create-web-app` 是一个面向前端工程化的脚手架，聚合主流创建器（Vite、Umi、Next 等），同时提供自研模式（React/Vue）。通过声明式插件系统与 AST 代码变换，实现“依赖 + 文件 + 代码”一次性注入，创建即用。

核心能力：

- 多引擎统一入口：在一个工具内选择外部或自研创建路径。
- 插件化增强：路由、状态管理、规范工具等可选即用。
- 类型与打包器：支持 JS/TS 切换与 Vite/Webpack 二选一。

想了解更多，请从“指南”开始。