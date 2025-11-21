---
title: 打包器选择（Vite / Webpack）
---

在交互流程中可选择打包器：`Vite` 或 `Webpack`。

实现方式：

- 在交互层将选择结果加入插件列表。
- `plugin-registry.js` 中提供通用插件：
  - `common.vite`：注入 Vite 依赖与 `vite.config.js`（可根据框架动态生成）。
  - `common.webpack`：注入 Webpack 生态依赖与 `webpack.config.js`、`babel.config.json`。
- 模板服务在生成阶段合并 scripts：
  - Vite：`dev`、`build`、`preview`。
  - Webpack：`webpack serve` 与 `webpack`。

这样即可在创建时选择打包器，并自动获得对应的配置与脚本。