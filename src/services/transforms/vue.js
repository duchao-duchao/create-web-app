import traverseModule from '@babel/traverse';

import { parseJs, printAst, ensureNamedImport, t } from './helpers.js';

const traverse = traverseModule.default ?? traverseModule;

export function injectVueRouterIntoMain(code) {
  const ast = parseJs(code);

  ensureNamedImport(ast, './router', 'router');

  let updated = false;

  traverse(ast, {
    CallExpression(path) {
      if (updated) return;
      if (!isMountCall(path.node)) return;

      const mountObject = path.node.callee.object;
      if (isRouterApplied(mountObject)) {
        updated = true;
        return;
      }

      path.node.callee.object = t.callExpression(
        t.memberExpression(mountObject, t.identifier('use')),
        [t.identifier('router')]
      );
      updated = true;
    },
  });

  if (!updated) {
    throw new Error('未找到 createApp(App).mount 用于注入 Vue Router');
  }

  return printAst(ast);
}

function isMountCall(node) {
  return (
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: 'mount' }) &&
    t.isCallExpression(node.callee.object) &&
    t.isIdentifier(node.callee.object.callee, { name: 'createApp' })
  );
}

function isRouterApplied(node) {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.property, { name: 'use' })
  );
}
