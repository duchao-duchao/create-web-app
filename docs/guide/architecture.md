---
title: 架构总览
---

`create-web-app` 围绕“引擎选择 → 模板生成 → 插件化增强”三层架构构建：

- 入口：`src/index.js` 解析参数并调用 `run()`。
- 主流程：`src/run.js` 负责交互与摘要确认。
- 引擎：
  - 自研：`src/engines/native.js` 收集选项并调用模板生成。
  - 代理：`src/engines/proxy.js` 透传到外部官方 CLI。
- 模板服务：`src/services/template.js` 复制模板、合并 `package.json`、应用插件、语言适配。
- 插件注册：`src/config/plugin-registry.js` 声明插件的依赖、文件与代码变换。
- 代码变换：`src/services/transforms/react.js` / `vue.js` 使用 Babel AST 安全注入（如路由、状态管理）。
- 模板资产：`src/templates/react` / `src/templates/vue` 提供最小可用结构与样式。

### 数据流

1. 选择引擎与选项（框架、语言、插件、打包器）。
2. 复制模板 → 合并依赖与脚本 → 写入插件文件 → 执行 AST 变换。
3. 执行语言适配（TS 重命名与 tsconfig 生成），输出使用提示。