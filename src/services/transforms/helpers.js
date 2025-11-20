import { parse } from '@babel/parser';
import { generate } from '@babel/generator';
import * as t from '@babel/types';

const JSX_PLUGINS = ['jsx'];
const JS_PLUGINS = [];

export function parseJsx(code) {
  return parse(code, {
    sourceType: 'module',
    plugins: JSX_PLUGINS,
  });
}

export function parseJs(code) {
  return parse(code, {
    sourceType: 'module',
    plugins: JS_PLUGINS,
  });
}

export function printAst(ast) {
  return generate(ast, { retainLines: true }).code;
}

function insertImport(ast, declaration) {
  const body = ast.program.body;
  let lastImportIndex = -1;
  for (let i = 0; i < body.length; i += 1) {
    if (t.isImportDeclaration(body[i])) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    body.splice(lastImportIndex + 1, 0, declaration);
  } else {
    body.unshift(declaration);
  }
}

function getImportDeclaration(ast, source) {
  return ast.program.body.find(
    (node) => t.isImportDeclaration(node) && node.source.value === source
  );
}

function getOrCreateImport(ast, source) {
  const existing = getImportDeclaration(ast, source);
  if (existing) return existing;
  const declaration = t.importDeclaration([], t.stringLiteral(source));
  insertImport(ast, declaration);
  return declaration;
}

export function ensureDefaultImport(ast, source, localName) {
  const declaration = getOrCreateImport(ast, source);
  const existing = declaration.specifiers.find((spec) => t.isImportDefaultSpecifier(spec));

  if (existing) {
    // 若已有默认导入但与目标不同，复用已有导入
    return existing.local.name;
  }

  const specifier = t.importDefaultSpecifier(t.identifier(localName));
  declaration.specifiers.unshift(specifier);
  return localName;
}

export function ensureNamedImport(ast, source, importedName, localName = importedName) {
  const declaration = getOrCreateImport(ast, source);
  const exists = declaration.specifiers.find(
    (spec) => t.isImportSpecifier(spec) && spec.imported.name === importedName
  );

  if (exists) {
    return exists.local.name;
  }

  declaration.specifiers.push(
    t.importSpecifier(t.identifier(localName), t.identifier(importedName))
  );
  return localName;
}

export { t };
