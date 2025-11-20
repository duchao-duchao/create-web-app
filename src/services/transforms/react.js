import traverseModule from '@babel/traverse';

import {
  parseJsx,
  printAst,
  ensureDefaultImport,
  ensureNamedImport,
  t,
} from './helpers.js';

const traverse = traverseModule.default ?? traverseModule;

export function injectReactRouterIntoMain(code) {
  const ast = parseJsx(code);

  ensureNamedImport(ast, 'react-router-dom', 'RouterProvider');
  ensureNamedImport(ast, './router', 'router');

  let replaced = false;

  traverse(ast, {
    JSXElement(path) {
      if (replaced) return;
      if (isJsxIdentifier(path.node.openingElement.name, 'App')) {
        path.replaceWith(createRouterProviderElement());
        replaced = true;
        path.stop();
      }
    },
  });

  if (!replaced) {
    throw new Error('未在 main.jsx 中找到 <App /> 以挂载路由');
  }

  return printAst(ast);
}

export function wrapAppWithReduxProvider(code) {
  const ast = parseJsx(code);

  ensureNamedImport(ast, 'react-redux', 'Provider');
  ensureNamedImport(ast, './store/store', 'store');

  let wrapped = false;

  traverse(ast, {
    JSXElement(path) {
      if (wrapped) return;
      if (isJsxIdentifier(path.node.openingElement.name, 'RouterProvider')) {
        path.replaceWith(createProviderWrapper(path.node));
        wrapped = true;
        path.stop();
        return;
      }
      if (isJsxIdentifier(path.node.openingElement.name, 'App')) {
        path.replaceWith(createProviderWrapper());
        wrapped = true;
        path.stop();
      }
    },
  });

  if (!wrapped) {
    throw new Error('未找到 <App /> 以注入 Redux Provider');
  }

  return printAst(ast);
}

export function attachComponentToApp({ componentName, importPath }) {
  return function attachComponent(code) {
    const ast = parseJsx(code);
    ensureDefaultImport(ast, importPath, componentName);

    let inserted = false;

    traverse(ast, {
      ExportDefaultDeclaration(path) {
        const fn = resolveAppFunction(path.node.declaration, path);
        if (!fn || inserted) return;

        const insertedHere = injectComponentIntoFunction(fn, componentName);
        if (insertedHere) {
          inserted = true;
          path.stop();
        }
      },
    });

    if (!inserted) {
      throw new Error(`未能在 App 组件中插入 ${componentName}`);
    }

    return printAst(ast);
  };
}

function injectComponentIntoFunction(fnNode, componentName) {
  const bodyStatements = fnNode.body.body;
  for (const statement of bodyStatements) {
    if (t.isReturnStatement(statement) && statement.argument) {
      const jsxRoot = statement.argument;
      if (!t.isJSXElement(jsxRoot) && !t.isJSXFragment(jsxRoot)) continue;

      if (jsxContainsComponent(jsxRoot, componentName)) {
        return true;
      }

      appendComponentChild(jsxRoot, componentName);
      return true;
    }
  }
  return false;
}

function resolveAppFunction(declaration, path) {
  if (t.isFunctionDeclaration(declaration) && declaration.id?.name === 'App') {
    return declaration;
  }

  if (t.isIdentifier(declaration)) {
    const binding = path.scope.getBinding(declaration.name);
    if (!binding) return null;
    const bindingNode = binding.path.node;

    if (
      t.isVariableDeclarator(bindingNode) &&
      t.isIdentifier(bindingNode.id, { name: 'App' })
    ) {
      if (t.isFunctionExpression(bindingNode.init) || t.isArrowFunctionExpression(bindingNode.init)) {
        return normalizeFunction(bindingNode.init);
      }
    }
  }

  return null;
}

function normalizeFunction(node) {
  if (t.isFunctionExpression(node)) return node;
  if (t.isArrowFunctionExpression(node)) {
    if (t.isBlockStatement(node.body)) {
      return t.functionExpression(null, node.params, node.body, node.generator, node.async);
    }
    const body = t.blockStatement([t.returnStatement(node.body)]);
    return t.functionExpression(null, node.params, body, node.generator, node.async);
  }
  return null;
}

function appendComponentChild(root, componentName) {
  if (!root.children) {
    root.children = [];
  }

  const newElement = t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(componentName), [], true),
    null,
    [],
    true
  );

  const indent = t.jsxText('\n      ');
  const closingIndent = t.jsxText('\n    ');

  root.children.push(indent, newElement, closingIndent);
}

function jsxContainsComponent(node, componentName) {
  if (t.isJSXElement(node) && isJsxIdentifier(node.openingElement.name, componentName)) {
    return true;
  }

  const children = node.children ?? [];
  return children.some((child) => {
    if (t.isJSXElement(child) || t.isJSXFragment(child)) {
      return jsxContainsComponent(child, componentName);
    }
    if (t.isJSXExpressionContainer(child)) {
      const expression = child.expression;
      if (t.isJSXElement(expression) || t.isJSXFragment(expression)) {
        return jsxContainsComponent(expression, componentName);
      }
    }
    return false;
  });
}

function createRouterProviderElement() {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('RouterProvider'),
      [
        t.jsxAttribute(
          t.jsxIdentifier('router'),
          t.jsxExpressionContainer(t.identifier('router'))
        ),
      ],
      true
    ),
    null,
    [],
    true
  );
}

function createProviderWrapper(child = createAppElement()) {
  return t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier('Provider'),
      [
        t.jsxAttribute(
          t.jsxIdentifier('store'),
          t.jsxExpressionContainer(t.identifier('store'))
        ),
      ]
    ),
    t.jsxClosingElement(t.jsxIdentifier('Provider')),
    [child]
  );
}

function createAppElement() {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('App'), [], true),
    null,
    [],
    true
  );
}

function isJsxIdentifier(node, name) {
  return t.isJSXIdentifier(node, { name });
}
