---
title: 快速开始
---

## 安装与运行

- 在本仓库中开发：
  - 运行 `pnpm dev` 启动交互式 CLI。
  - 按提示选择引擎（自研或外部）、框架、语言（JS/TS）、插件与打包器（Vite/Webpack）。

## 创建项目流程（自研模式）

1. 选择框架：React / Vue。
2. 选择语言：JavaScript / TypeScript（自动生成 tsconfig 与类型依赖）。
3. 选择打包器：Vite 或 Webpack（自动注入配置与 scripts）。
4. 选择插件：Router、状态管理（React: Redux/Zustand；Vue: Pinia/Vuex）、Lint/Prettier 等。
5. 确认摘要后生成项目结构，进入项目 `pnpm install`、`pnpm dev`。

## 创建项目流程（外部模式）

当选择外部引擎（如 Vite、Umi、Next 等）时，本脚手架将代理至官方 CLI，后续交互由对应工具完成。

## 常见命令

- `pnpm dev`：运行脚手架，开始交互式创建。
- `pnpm build`：构建 CLI 产物。
- 生成的项目内：
  - `pnpm dev`：启动开发服务器。
  - `pnpm build`：生产构建。