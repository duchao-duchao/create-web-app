---
title: 快速开始
---

## 安装与运行

- 在本仓库中开发：
  - 运行 `pnpm dev` 启动交互式 CLI。
  - 按提示选择引擎（自研或外部）、框架、语言（JS/TS）、插件与打包器（Vite/Webpack）。

## 命令行参数直达

无需交互即可一键生成项目，支持位置参数和选项：

- 位置参数：`[project-name]`
- 选项：
  - `--engine <engine>` 指定创建引擎（`native|vite|umi|next|...`）
  - `--framework <react|vue>` 指定框架（对 `vite` 透传为 `--template`）
  - `--plugins <list>` 逗号分隔启用插件（如 `router,lint,zustand`），仅原生引擎生效
  - `--language <js|ts>` 指定语言

示例：

```bash
# 原生引擎：跳过交互，直接生成 React + 插件 + TS
create-web-app my-app --engine native --framework react --plugins router,lint,zustand --language ts

# 外部引擎：调用 create-vite，并透传模板为 React
create-web-app my-app --engine vite --framework react

# 在仓库内通过脚本运行需使用 "--" 传参
pnpm dev -- --engine native --framework vue --plugins router,pinia --language ts
```

## 创建项目流程（自研模式）

1. 选择框架：React / Vue。
2. 选择语言：JavaScript / TypeScript（自动生成 tsconfig 与类型依赖）。
3. 选择打包器：Vite 或 Webpack（自动注入配置与 scripts）。
4. 选择插件：Router、状态管理（React: Redux/Zustand；Vue: Pinia/Vuex）、Lint/Prettier 等。
5. 确认摘要后生成项目结构，进入项目 `pnpm install`、`pnpm dev`。

## 创建项目流程（外部模式）

当选择外部引擎（如 Vite、Umi、Next 等）时，本脚手架将代理至官方 CLI，后续交互由对应工具完成。
当前已对 `create-vite` 透传 `--template <react|vue>`，其他外部引擎保持默认行为。

## 常见命令

- `pnpm dev`：运行脚手架，开始交互式创建。
- `pnpm build`：构建 CLI 产物。
- 生成的项目内：
  - `pnpm dev`：启动开发服务器。
  - `pnpm build`：生产构建。