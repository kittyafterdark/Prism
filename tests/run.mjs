import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import './persona-save.mjs';
import './segment-gestures.mjs';
import './window-restore.mjs';

const backend = await fs.readFile(new URL('../src/backend.ts', import.meta.url), 'utf8');
const frontend = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const context = vm.createContext({ console, setTimeout, clearTimeout });
vm.runInContext(ts.transpileModule(backend.slice(0, backend.indexOf('spindle.registerMacro(')), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText, context);
vm.runInContext(`
  let testConfig = cloneDefaultConfig();
  let discovered = [];
  let writes = 0;
  const realBuildState = buildState;
  const spindle = {
    chats: { getActive: async () => ({ id: 'chat' }) },
    personas: { getActive: async () => null },
  };
  getSceneCharacters = async () => ({ characters: structuredClone(discovered), cortexAvailable: false });
  seedBindingsFromLibrary = () => 0;
  loadConfig = async () => structuredClone(testConfig);
  saveConfig = async (_, config) => { testConfig = safeConfig(config); writes++; };
  loadGlobalState = async () => safeGlobalState(null);
  syncBindingsToLibrary = () => false;
  buildState = async () => {
    const characters = structuredClone(discovered);
    for (const manual of Object.values(testConfig.manualCharacters)) {
      mergeSceneCharacter(characters, { ...manual, source: 'manual-roster' });
    }
    return { ok: true, characters: characters.filter(c => !testConfig.hiddenCharacters[normalizeName(c.name)]), config: testConfig, registry: compileRegistry(testConfig) };
  };
`, context);
context.structuredClone = structuredClone;
const run = (code) => vm.runInContext(code, context);
const plain = (value) => JSON.parse(JSON.stringify(value));
const channels = {
  dialogue: { enabled: false, paint: { mode: 'gradient', stops: ['#112233', '#445566', '#778899'], angle: 135, anchor: '#112233' } },
  thought: { enabled: true, linkedToDialogue: false, paint: { mode: 'gradient', stops: ['#AABBCC', '#DDEEFF'], angle: 0, anchor: '#112233' } },
};
context.testChannels = channels;
await run(`importRegistry({ chatId: 'chat', entries: [{ name: 'Lycaonn', color: '#112233', speakerUid: 'prism-speaker-original', channels: testChannels }] }, 'user')`);
assert.deepEqual(plain(run('Object.values(testConfig.bindings)[0].channels')), channels);
run(`discovered = [{ id: 'cortex-id', entityId: 'cortex-id', name: 'Lycaonn', aliases: [], source: 'cortex' }];
  const oldId = Object.keys(testConfig.manualCharacters)[0];
  delete testConfig.manualCharacters[oldId];
  const binding = Object.values(testConfig.bindings)[0];
  delete testConfig.bindings['character:' + oldId];
  binding.targetId = 'cortex-id';
  testConfig.bindings['character:cortex-id'] = binding;
  testConfig.overrides = { example: { messageId: 'message', contentHash: 'hash', quote: 'Hello', kind: 'dialogue', speakerKey: 'character:' + binding.speakerUid } };
`);
const renamed = await run(`renameSceneCharacter({ chatId: 'chat', characterId: 'cortex-id', name: 'Lycaon' }, 'user')`);
assert.equal(renamed.characters.length, 1);
assert.equal(renamed.characters[0].name, 'Lycaon');
assert.equal(renamed.characters[0].id, 'cortex-id');
assert.ok(renamed.characters[0].aliases.includes('Lycaonn'));
assert.equal(run('testConfig.bindings["character:cortex-id"].speakerUid'), 'prism-speaker-original');
assert.deepEqual(plain(run('testConfig.bindings["character:cortex-id"].channels')), channels);
// Compare override preservation across another rename (using a valid saved config).
const overrides = plain(run('testConfig.overrides'));
assert.equal(overrides.example.speakerKey, 'character:prism-speaker-original');
await run(`renameSceneCharacter({ chatId: 'chat', characterId: 'cortex-id', name: 'LYCAON' }, 'user')`);
assert.deepEqual(plain(run('testConfig.overrides')), overrides);
const reloaded = await run('realBuildState({ importCortex: false }, "user")');
assert.equal(reloaded.characters.length, 1);
assert.equal(reloaded.characters[0].name, 'LYCAON');
assert.equal(reloaded.characters[0].binding.speakerUid, 'prism-speaker-original');
run(`discovered.push({ id: 'other', name: 'Other', aliases: ['Taken'] })`);
for (const name of ['', '<b>Name</b>', 'Taken', 'Other']) {
  context.invalidName = name;
  const before = run('writes');
  await assert.rejects(run(`renameSceneCharacter({ chatId: 'chat', characterId: 'cortex-id', name: invalidName }, 'user')`));
  assert.equal(run('writes'), before);
}
await assert.rejects(run(`renameSceneCharacter({ chatId: 'different', characterId: 'cortex-id', name: 'New' }, 'user')`), /active chat changed/);
// Export the actual frontend function, then import into a fresh config.
const ast = ts.createSourceFile('frontend.ts', frontend, ts.ScriptTarget.Latest, true);
const functions = new Map();
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
const exportContext = vm.createContext({ state: plain(await run('buildState()')) });
for (const name of ['normalizeHex', 'safePaint', 'paintSignature', 'bindingRegistryColor', 'safeChannels', 'registryExportText']) {
  vm.runInContext(functions.get(name), exportContext);
}
const exported = JSON.parse(vm.runInContext('registryExportText()', exportContext));
assert.deepEqual(exported.entries[0].channels, channels);
context.exportedEntries = exported.entries;
run('testConfig = cloneDefaultConfig()');
await run(`importRegistry({ entries: exportedEntries }, 'user')`);
assert.deepEqual(plain(run('Object.values(testConfig.bindings)[0].channels')), channels);
// Old exports preserve existing paint; fresh old exports get solid defaults.
await run(`importRegistry({ entries: [{ name: 'LYCAON', color: '#112233' }] }, 'user')`);
assert.deepEqual(plain(run('Object.values(testConfig.bindings)[0].channels')), channels);
run('testConfig = cloneDefaultConfig()');
await run(`importRegistry({ entries: [{ name: 'Legacy', color: '#123456' }] }, 'user')`);
assert.equal(run('Object.values(testConfig.bindings)[0].channels.dialogue.paint.mode'), 'solid');
context.linkedChannels = { ...channels, thought: { enabled: true, linkedToDialogue: true, paint: channels.thought.paint } };
run('testConfig = cloneDefaultConfig()');
await run(`importRegistry({ entries: [{ name: 'Linked', color: '#112233', channels: linkedChannels }] }, 'user')`);
assert.deepEqual(plain(run('Object.values(testConfig.bindings)[0].channels.thought.paint')), channels.dialogue.paint);
run(`testConfig = cloneDefaultConfig(); discovered = [];
  testConfig.manualCharacters['manual-stable'] = { id: 'manual-stable', name: 'Typoo', aliases: [] };`);
await run(`renameSceneCharacter({ characterId: 'manual-stable', name: 'Typo' }, 'user')`);
assert.equal(run('Object.keys(testConfig.bindings).length'), 0);
const manualReloaded = await run('realBuildState({ importCortex: false }, "user")');
assert.equal(manualReloaded.characters[0].id, 'manual-stable');
assert.equal(manualReloaded.characters[0].name, 'Typo');
console.log('Passed roster rename, validation, stable identity, gradient export/import, and legacy compatibility checks.');
