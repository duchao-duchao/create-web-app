---
title: 插件系统
---

插件以声明式对象注册在 `src/config/plugin-registry.js` 中，分为 `common`（通用）与按框架分类：

```js
{
  meta: { label, description, stability },
  pkg: { dependencies, devDependencies, scripts, 'lint-staged' },
  files: [ { to, from?, content?, whenExists? } ],
  transforms: [ { file, run } ]
}
```

关键点：

- 依赖合并：统一由模板服务合并到 `package.json`。
- 文件注入：支持从 snippets 复制或用 `content` 直接写入（支持函数形式动态生成）。
- AST 变换：对入口文件进行安全修改（React 包裹 Provider，Vue `.use(router)` 等）。

示例：React Router 插件会注入 `react-router-dom` 依赖、生成 `src/router.jsx`，并用 AST 将入口从 `<App />` 切换为 `<RouterProvider />`。