import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const cache = new Map();

// Use the repository's installed TypeScript and React with Node's built-in test runner.
// Only local TS/TSX modules need compilation; CSS has no server-rendering behavior.
export const loadComponent = (url) => {
  const key = url.href;
  if (cache.has(key)) return cache.get(key);
  const compiled = ts.transpileModule(readFileSync(url, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: url.pathname,
  }).outputText;
  const module = { exports: {} };
  cache.set(key, module.exports);
  const require = createRequire(url);
  new Function('require', 'module', 'exports', compiled)(
    (specifier) => {
      if (specifier.endsWith('.css')) return {};
      if (specifier.startsWith('.')) {
        for (const suffix of ['.ts', '.tsx']) {
          const resolved = new URL(specifier + suffix, url);
          if (existsSync(resolved)) return loadComponent(resolved);
        }
      }
      return require(specifier);
    },
    module,
    module.exports
  );
  return module.exports;
};
