import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
for (const name of ['backend', 'frontend']) {
  const source = await fs.readFile(path.join(root, 'src', `${name}.ts`), 'utf8');
  const built = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    },
  }).outputText;
  const dist = await fs.readFile(path.join(root, 'dist', `${name}.js`), 'utf8');
  assert.equal(dist, built, `dist/${name}.js is stale; run npm run build`);
}
console.log('Distribution files match source.');
