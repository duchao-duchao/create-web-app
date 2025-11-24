# create-web-app

一个可插拔的多引擎前端脚手架：支持交互式与直达模式，原生引擎内置 React/Vue 模版与常用插件，并可在创建时选择打包器（Vite 或 Webpack）。也可代理 `create-vite`、`create-umi` 等外部引擎。

## 特性

- 一次交互即可选择 引擎/框架/语言/插件/打包器
- 原生模版：React / Vue，支持 Router、ESLint+Prettier、状态管理等常用插件
- 打包器可选：Vite 或 Webpack，自动生成对应的脚本与依赖
- 插件系统：配置式注入依赖、脚本、文件与代码片段，易扩展、好维护
- 外部引擎代理：create-vite / umi / next 等引擎直连透传
- 文档与帮助：内置 CLI 帮助与 VitePress 文档

## 快速开始

```bash
pnpm install        # 安装依赖并自动构建 dist
pnpm dev            # 直接运行源码版本（支持交互式创建）
pnpm build          # 生产构建 dist/index.js
pnpm release        # 构建 + npm publish（需提前登录）
```

全局安装后可以直接使用：

```bash
pnpm install -g create-web-app
create-web-app my-app
```

## 直达示例（无需交互）

```bash
# 原生引擎：React + TS + Webpack + 常用插件
create-web-app my-app \
  --engine native \
  --framework react \
  --language ts \
  --bundler webpack \
  --plugins router,lint,zustand

# 外部引擎：直接调用 create-vite，并透传模板
create-web-app my-app --engine vite --framework react

# 提示：用包管理器脚本转发参数需加 "--"
pnpm dev -- --engine native --framework vue --bundler vite --plugins router
```

## CLI 选项

- `-h, --help`            查看帮助信息并退出
- `-v, --version`         查看版本
- `--engine <engine>`     指定创建引擎（`native|vite|umi|next|...`）
- `--framework <fw>`      指定框架（`react|vue`）
- `--language <lang>`     指定语言（`js|ts`）
- `--plugins <list>`      启用插件列表，逗号分隔（如：`router,lint,zustand`）
- `--bundler <bundler>`   指定打包器（`vite|webpack`）

## 原生模版与插件

| 框架 | 可选插件 |
| ---- | -------- |
| React | Router、ESLint+Prettier、Zustand、Redux Toolkit |
| Vue   | Router、ESLint+Prettier、Pinia、Vuex |

- 插件注册表：`src/config/plugin-registry.js`
- 打包器插件：`vite`、`webpack`（`src/config/plugins/common`）

## 打包器支持

- 选择 `bundler=vite`：生成基于 Vite 的脚本（`dev/build/preview`）与依赖；React/Vue 使用官方插件。
- 选择 `bundler=webpack`：生成 Webpack 配置、脚本与依赖；并清理 Vite 相关文件（如 `vite.config.*`）与入口差异，保持项目结构一致。
- TypeScript 与 HTML 在生成阶段会根据打包器进行必要调整（如 `tsconfig` 的 `moduleResolution`、HTML 入口脚本）。

## 外部引擎代理

- `create-vite@latest`
- `create-umi@latest`
- `create-react-app@latest`
- `create-next-app@latest`
- `nuxi@latest init`
- `create-astro@latest`
- `create-svelte@latest`
- `@angular/cli@latest new`
- `create-remix@latest`
- `create-solid@latest`
- `create-qwik@latest`

选择后会直接透传 CLI 交互，并可在任务完成后追加企业规范注入逻辑。

## 文档与参考

- 入门指南：`docs/guide/getting-started.md`
- 打包器说明：`docs/guide/bundler.md`
- 插件系统：`docs/guide/plugins.md`
- TypeScript 支持：`docs/guide/typescript.md`
- 架构概览：`docs/guide/architecture.md`

## 开发与贡献

```bash
pnpm dev            # 运行源码与交互式创建
pnpm build          # 生成 dist/index.js
```

- 主要代码位于 `src/` 目录。
- 欢迎通过 Issue/PR 反馈问题与提交优化建议。