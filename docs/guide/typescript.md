---
title: 类型支持（TS）
---

当选择 TypeScript 时，模板服务会执行以下自动化动作：

1. 追加依赖：`typescript`，React 项目追加 `@types/react` / `@types/react-dom`。
2. 生成 `tsconfig.json`：按框架准备合理的编译选项。
3. 文件重命名：`main.jsx` → `main.tsx`、`App.jsx` → `App.tsx` 等；Vue 项目生成 `vite-env.d.ts`。
4. 修正 `index.html` 入口路径（`.jsx` → `.tsx` 或 `.js` → `.ts`）。

效果：创建即具备类型支持与编辑器智能提示，无需手动配置。