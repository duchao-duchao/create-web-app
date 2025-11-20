# create-web-app

一个可插拔的多引擎前端脚手架，核心能力：

- 一次交互即可决定是使用自研模版还是 Vite / Umi / CRA 引擎
- 自研模式下支持 React 与 Vue 模版，并可按需安装常用插件
- 通过配置式插件系统注入依赖 / 文件 / 代码片段，方便扩展

## 快速开始

```bash
pnpm install
pnpm dev
```

按照提示输入项目名、选择引擎或模版及插件即可。

若想全局使用，可在发布后执行：

```bash
pnpm install -g create-web-app
create-web-app my-app
```

## 自研模版能力

| 框架 | 可选插件 |
| ---- | -------- |
| React | Router、ESLint+Prettier、Zustand、Redux Toolkit |
| Vue   | Router、ESLint+Prettier |

插件均由 `src/index.js` 内的 `pluginRegistry` 描述，可自行追加更多依赖或文件注入逻辑。

## 外部引擎代理

- `create-vite@latest`
- `create-umi@latest`
- `create-react-app@latest`

选择后会直接透传 CLI 交互，并可在任务完成后追加企业规范注入逻辑。

## TODO

- 更多 Vue 插件（Pinia、Router 模板拆分等）
- 预设公司规范注入（如 Git hooks、CI 模版）
- 更丰富的模版资产（SSR、微前端等）
