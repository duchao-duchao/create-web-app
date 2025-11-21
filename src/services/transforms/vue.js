import traverseModule from '@babel/traverse';

import { parseJs, printAst, ensureNamedImport, t } from './helpers.js';

const traverse = traverseModule.default ?? traverseModule;

// 将 Vue Router 注入入口：把 createApp(App).mount(...) 改为 createApp(App).use(router).mount(...)
export function injectVueRouterIntoMain(code) {
  const ast = parseJs(code);

  const routerLocal = ensureNamedImport(ast, './router', 'router');

  let updated = false;

  traverse(ast, {
    CallExpression(path) {
      if (updated) return;
      if (!isMountCall(path.node)) return;

      const mountObject = path.node.callee.object;
      if (isRouterApplied(mountObject, routerLocal)) {
        updated = true;
        return;
      }

      path.node.callee.object = t.callExpression(
        t.memberExpression(mountObject, t.identifier('use')),
        [t.identifier(routerLocal)]
      );
      updated = true;
    },
  });

  if (!updated) {
    throw new Error('未找到 createApp(App).mount 用于注入 Vue Router');
  }

  return printAst(ast);
}

// 将 Pinia 注入入口：在 mount 前追加 .use(createPinia())
export function injectPiniaIntoMain(code) {
  const ast = parseJs(code);

  ensureNamedImport(ast, 'pinia', 'createPinia');

  let updated = false;

  traverse(ast, {
    CallExpression(path) {
      if (updated) return;
      if (!isMountCall(path.node)) return;

      const mountObject = path.node.callee.object;
      if (isPiniaApplied(mountObject)) {
        updated = true;
        return;
      }

      path.node.callee.object = t.callExpression(
        t.memberExpression(mountObject, t.identifier('use')),
        [t.callExpression(t.identifier('createPinia'), [])]
      );
      updated = true;
    },
  });

  if (!updated) {
    throw new Error('未找到 createApp(App).mount 用于注入 Pinia');
  }

  return printAst(ast);
}

// 将 Vuex 注入入口：在 mount 前追加 .use(store)
export function injectVuexIntoMain(code) {
  const ast = parseJs(code);

  ensureNamedImport(ast, './store', 'store');

  let updated = false;

  traverse(ast, {
    CallExpression(path) {
      if (updated) return;
      if (!isMountCall(path.node)) return;

      const mountObject = path.node.callee.object;
      if (isVuexApplied(mountObject)) {
        updated = true;
        return;
      }

      path.node.callee.object = t.callExpression(
        t.memberExpression(mountObject, t.identifier('use')),
        [t.identifier('store')]
      );
      updated = true;
    },
  });

  if (!updated) {
    throw new Error('未找到 createApp(App).mount 用于注入 Vuex');
  }

  return printAst(ast);
}

// 判断是否为源自 createApp(...) 的 .mount(...) 调用（支持链式 .use(...)）
function isMountCall(node) {
  if (!(t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property, { name: 'mount' }))) {
    return false;
  }
  const obj = node.callee.object;
  return isCreateAppChain(obj);
}

// 递归判断调用链是否来源于 createApp(...)，允许出现若干 .use(...)
function isCreateAppChain(expr) {
  if (t.isCallExpression(expr)) {
    const callee = expr.callee;
    if (t.isIdentifier(callee, { name: 'createApp' })) return true;
    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property, { name: 'use' })) {
      return isCreateAppChain(callee.object);
    }
  }
  return false;
}

// 判断当前调用链是否已经 .use(router)
function isRouterApplied(node, routerLocal) {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: 'use' }) &&
    node.arguments?.length === 1 &&
    t.isIdentifier(node.arguments[0], { name: routerLocal })
  );
}

// 判断当前调用链是否已经 .use(createPinia())
function isPiniaApplied(node) {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: 'use' }) &&
    t.isCallExpression(node.arguments?.[0]) &&
    t.isIdentifier(node.arguments[0].callee, { name: 'createPinia' })
  );
}

// 判断当前调用链是否已经 .use(store)
function isVuexApplied(node) {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: 'use' }) &&
    t.isIdentifier(node.arguments?.[0], { name: 'store' })
  );
}
