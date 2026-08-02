import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const targets = [
  ['src/backend.ts', 'dist/backend.js'],
  ['src/frontend.ts', 'dist/frontend.js'],
];

await fs.mkdir(path.join(root, 'dist'), { recursive: true });
let failed = false;

for (const [sourceName, outputName] of targets) {
  const sourcePath = path.join(root, sourceName);
  const source = await fs.readFile(sourcePath, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: sourceName,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    },
  });
  const errors = (result.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    for (const error of errors) {
      const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
      console.error(`${sourceName}: TS${error.code}: ${message}`);
    }
    failed = true;
    continue;
  }
  await fs.writeFile(path.join(root, outputName), result.outputText, 'utf8');
  console.log(`Built ${outputName}`);
}

if (failed) throw new Error('Prism build failed.');
