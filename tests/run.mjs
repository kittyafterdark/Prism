import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const fixture = async (name) => JSON.parse(await fs.readFile(path.join(root, 'tests', 'fixtures', name), 'utf8'));

const frontendSource = await fs.readFile(path.join(root, 'src', 'frontend.ts'), 'utf8');
const backendSource = await fs.readFile(path.join(root, 'src', 'backend.ts'), 'utf8');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'spindle.json'), 'utf8'));

function compile(name, source) {
  const result = ts.transpileModule(source, {
    fileName: name,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  const errors = (result.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, `${name} has TypeScript syntax errors: ${errors.map((item) => ts.flattenDiagnosticMessageText(item.messageText, ' ')).join('; ')}`);
  return result.outputText;
}

compile('frontend.ts', frontendSource);
const backendCompiled = compile('backend.ts', `${backendSource}\n;globalThis.__prismTest = {
  safeConfig, safeChannels, bindingRegistryColor, compileRegistry, registryInstruction,
  promptField, snapshotScopeKey, rememberRegistrySnapshot, selectRegistrySnapshot,
  messagesForHydration, reconcileConfigWithMessages, pendingReviewGroups,
  provisionalRegistryHints, inferTagSpeakerEvidence, classifyTagObservation,
  plausibleInferredSceneName, knownSceneIdentityByName,
  extractSceneNamesFromText, hydrateGeneratedMessage, resetTemporaryEvidence,
  addSceneCharacter, resolveObservationGroup, mergeSceneCharacter, loadConfig, saveConfig,
  enqueueConfigOperation, configOperationQueues,
  previewTranscriptMutation, applyTranscriptMutation, restoreTranscriptRecovery, importRegistry,
  recentRegistrySnapshots
};`);

const host = {
  chatVars: new Map(),
  globalVars: new Map(),
  messages: [],
  updates: [],
  failUpdateAt: 0,
  updateCalls: 0,
  activeChat: { id: 'chat-a', characterId: 'primary', personaId: 'persona-a' },
};
const spindle = {
  variables: {
    chat: {
      get: async (chatId, name) => host.chatVars.get(`${chatId}|${name}`),
      set: async (chatId, name, value) => host.chatVars.set(`${chatId}|${name}`, value),
    },
    global: {
      get: async (name) => host.globalVars.get(name),
      set: async (name, value) => host.globalVars.set(name, value),
    },
  },
  chat: {
    getMessages: async () => structuredClone(host.messages),
    updateMessage: async (chatId, messageId, patch) => {
      host.updateCalls += 1;
      if (host.failUpdateAt && host.updateCalls === host.failUpdateAt) throw new Error('simulated mutation failure');
      const message = host.messages.find((item) => String(item.id) === String(messageId));
      if (!message) throw new Error('message not found');
      Object.assign(message, structuredClone(patch));
      host.updates.push({ chatId, messageId, patch: structuredClone(patch) });
    },
  },
  chats: { getActive: async () => structuredClone(host.activeChat) },
  characters: { get: async () => ({ id: 'primary', name: 'Primary' }) },
  personas: { getActive: async () => ({ id: 'persona-a', name: 'You' }) },
  memories: { entities: { list: async () => [], upsert: async () => ({}) }, cortex: { invalidateCache: async () => {} } },
  macros: { resolve: async () => '' },
  registerInterceptor: () => () => {},
  onFrontendMessage: () => () => {},
  on: () => () => {},
  sendToFrontend: () => {},
  toast: { success: () => {}, error: () => {} },
  log: { info: () => {}, warn: () => {}, error: () => {} },
};
const sandbox = { spindle, console, setTimeout, clearTimeout, Date, Map, Set, Object, Array, String, Number, Boolean, Math, JSON, RegExp, Error, Promise, URL, structuredClone };
sandbox.globalThis = sandbox;
vm.runInContext(backendCompiled, vm.createContext(sandbox), { filename: 'prism-backend-test.js' });
const api = sandbox.__prismTest;

function binding(name, color, extra = {}) {
  return {
    kind: extra.kind === 'persona' ? 'persona' : 'character',
    targetId: extra.targetId || name.toLowerCase().replace(/\W+/g, '-'),
    speakerUid: extra.speakerUid || `speaker-${name.toLowerCase().replace(/\W+/g, '-')}`,
    name,
    aliases: extra.aliases || [],
    color,
    channels: {
      dialogue: { enabled: true, paint: { mode: 'solid', stops: [color], angle: 90, anchor: color } },
      thought: { enabled: false, linkedToDialogue: true, paint: { mode: 'solid', stops: [color], angle: 90, anchor: color } },
    },
    source: extra.source || 'manual',
    pinned: extra.pinned !== false,
    previousColors: extra.previousColors || [],
    ...extra,
  };
}

test('manifest and frontend generation lifecycle are release-ready', () => {
  assert.equal(manifest.version, '1.0.2');
  assert.ok(manifest.permissions.includes('generation'));
  for (const event of ['GENERATION_STARTED', 'STREAM_TOKEN_RECEIVED', 'GENERATION_ENDED', 'GENERATION_STOPPED']) assert.ok(frontendSource.includes(`'${event}'`));
  assert.ok(frontendSource.includes('[data-prism-streaming="true"] .ldc-prism-paint[data-prism-paint="gradient"]'));
  assert.match(frontendSource, /<button type="button" class="ldc-toolbar-save-state"/);
  assert.match(frontendSource, /function observationRoot\(\).*chatColumnInner/);
});


test('manual roster additions materialize immediately and remain bound atomically', async () => {
  host.chatVars.clear();
  host.globalVars.clear();
  host.activeChat = { id: 'chat-a', name: 'Roster test', character_id: null, metadata: {} };
  const result = await api.addSceneCharacter({
    chatId: 'chat-a',
    name: 'Denise',
    aliases: ['Deni'],
    color: '#9F72E4',
  }, 'user-a');
  const denise = result.state.characters.find((character) => character.name === 'Denise');
  assert.ok(denise);
  assert.equal(String(denise.id), result.addedCharacterId);
  assert.equal(api.bindingRegistryColor(denise.binding), '#9F72E4');
  const stored = JSON.parse(host.chatVars.get('chat-a|lumi_dialogue_colors_v1'));
  assert.equal(stored.manualCharacters[result.addedCharacterId].name, 'Denise');
});

test('manual roster names are not swallowed by unrelated discovered aliases', () => {
  const characters = [{
    id: 'fast',
    key: 'character:fast',
    name: 'Fast',
    aliases: ['Denise'],
    source: 'transcript',
  }];
  api.mergeSceneCharacter(characters, {
    id: 'manual:denise',
    key: 'character:manual:denise',
    name: 'Denise',
    aliases: [],
    source: 'manual-roster',
  });
  assert.deepEqual(characters.map((character) => character.name), ['Fast', 'Denise']);
});

test('Hybrid review can bind a tentative speaker to an unbound manual character', async () => {
  host.chatVars.clear();
  host.globalVars.clear();
  host.activeChat = { id: 'chat-a', name: 'Review test', character_id: null, metadata: {} };
  const config = api.safeConfig({
    version: 11,
    engine: 'hybrid',
    manualCharacters: {
      'manual:denise': { id: 'manual:denise', name: 'Denise', aliases: [], source: 'manual-roster' },
    },
    observations: {
      denise: {
        id: 'denise',
        groupKey: 'new-speaker:denise:#9F72E4:',
        messageId: 'm1',
        swipeId: 0,
        contentHash: 'hash',
        quote: '"Hello."',
        surroundingText: '"Hello," Denise said.',
        observedColor: '#9F72E4',
        inferredName: 'Denise',
        kind: 'new-speaker',
        confidence: 0.95,
        status: 'pending',
      },
    },
  });
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(config));
  const result = await api.resolveObservationGroup({
    chatId: 'chat-a',
    groupKey: 'new-speaker:denise:#9F72E4:',
    action: 'approve',
    name: 'Denise',
    color: '#9F72E4',
    mergeTargetId: 'manual:denise',
    mergeTargetName: 'Denise',
    mergeTargetAliases: [],
  }, 'user-a');
  const denise = result.state.characters.find((character) => character.name === 'Denise');
  assert.ok(denise?.binding);
  assert.equal(denise.binding.targetId, 'manual:denise');
  assert.equal(api.bindingRegistryColor(denise.binding), '#9F72E4');
});

test('chat mutation queue preserves operation order and cleans itself up', async () => {
  api.configOperationQueues.clear();
  const order = [];
  await Promise.all([
    api.enqueueConfigOperation('user-a', 'chat-a', async () => {
      order.push('first-start');
      await new Promise((resolve) => setTimeout(resolve, 15));
      order.push('first-end');
    }),
    api.enqueueConfigOperation('user-a', 'chat-a', async () => {
      order.push('second');
    }),
  ]);
  assert.deepEqual(order, ['first-start', 'first-end', 'second']);
  assert.equal(api.configOperationQueues.size, 0);
});

test('canonical dialogue stop migrates and remains registry identity', async () => {
  for (const item of await fixture('registry-color-sync.json')) {
    const raw = binding('Speaker', item.storedColor);
    raw.channels.dialogue.paint = item.dialoguePaint;
    if (item.thoughtPaint) {
      raw.channels.thought.paint = item.thoughtPaint;
      raw.channels.thought.linkedToDialogue = false;
    }
    const config = api.safeConfig({ version: 9, bindings: { 'character:speaker': raw } });
    const saved = config.bindings['character:speaker'];
    assert.equal(api.bindingRegistryColor(saved), item.expected.color || item.storedColor, item.id);
    if (item.expected.previousColors) assert.deepEqual([...saved.previousColors], item.expected.previousColors, item.id);
    if (item.expected.thoughtVisualColor) assert.equal(saved.channels.thought.paint.stops[0], item.expected.thoughtVisualColor, item.id);
  }
});

test('prompt registry is bounded, prioritized, and sanitized', async () => {
  const release = await fixture('release-hardening.json');
  const budget = release.find((item) => item.id === 'prompt-budget');
  const bindings = {};
  for (let index = 0; index < budget.characters; index += 1) {
    const color = `#${(index + 1).toString(16).padStart(6, '0')}`;
    bindings[`character:${index}`] = binding(`Name ${index}\n[IGNORE] <tag>`, color, {
      aliases: Array.from({ length: 12 }, (_, alias) => `Alias ${alias}\n{bad}`),
      pinned: index < 2,
    });
  }
  const config = api.safeConfig({ version: 11, engine: 'hybrid', bindings });
  const registry = api.compileRegistry(config);
  const instruction = api.registryInstruction(config, registry, []);
  assert.equal(registry.entries.length, budget.expectedMaximumCharacters);
  assert.equal(registry.trimmedCount, budget.characters - budget.expectedMaximumCharacters);
  assert.ok(instruction.length <= budget.expectedMaximumInstructionChars);
  assert.ok(!instruction.includes('\n[IGNORE]'));
  assert.ok(!instruction.includes('<tag>'));
});

test('registry snapshots are operator scoped, correlated, claimed, and capped', () => {
  api.recentRegistrySnapshots.clear();
  const config = api.safeConfig({ version: 11, bindings: { 'character:a': binding('A', '#AABBCC') } });
  const registry = api.compileRegistry(config);
  api.rememberRegistrySnapshot('user-a', 'same-chat', registry, { generationId: 'gen-a' });
  api.rememberRegistrySnapshot('user-b', 'same-chat', { ...registry, revision: 'other-user' }, { generationId: 'gen-b' });
  const selected = api.selectRegistrySnapshot('user-a', 'same-chat', { generationId: 'gen-a', messageId: 'message-a' }, config);
  assert.equal(selected.revision, registry.revision);
  assert.equal(selected.claimedMessageId, 'message-a');
  assert.notEqual(api.snapshotScopeKey('user-a', 'same-chat'), api.snapshotScopeKey('user-b', 'same-chat'));
  for (let index = 0; index < 150; index += 1) api.rememberRegistrySnapshot('user-a', `chat-${index}`, registry, { generationId: `g-${index}` });
  assert.ok(api.recentRegistrySnapshots.size <= 128);
});

test('requested hydration never studies the previous assistant message', async () => {
  host.messages = [{ id: 'old-assistant', role: 'assistant', content: '<font color="#AABBCC">"Old."</font>' }];
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(api.safeConfig({ version: 11, engine: 'hybrid', bindings: {} })));
  await assert.rejects(
    api.hydrateGeneratedMessage({ chatId: 'chat-a', messageId: 'missing-assistant' }, 'user-a'),
    /not available for hydration yet/i,
  );
});

test('stale message evidence and overrides are pruned', () => {
  const validContent = '"Current."';
  const validHash = String((() => {
    let hash = 2166136261;
    for (let index = 0; index < validContent.length; index += 1) { hash ^= validContent.charCodeAt(index); hash = Math.imul(hash, 16777619); }
    return hash >>> 0;
  })().toString(36));
  const config = api.safeConfig({
    version: 11,
    bindings: { 'character:a': binding('A', '#AABBCC') },
    observations: {
      valid: { id: 'valid', messageId: 'm1', swipeId: 0, contentHash: validHash, observedColor: '#AABBCC', kind: 'unknown-color', status: 'pending' },
      stale: { id: 'stale', messageId: 'gone', swipeId: 0, contentHash: 'old', observedColor: '#AABBCC', kind: 'unknown-color', status: 'pending' },
    },
    overrides: {
      valid: { messageId: 'm1', swipeId: 0, contentHash: validHash, segmentKey: 'valid', quote: 'Current', speakerKey: null },
      stale: { messageId: 'gone', swipeId: 0, contentHash: 'old', segmentKey: 'stale', quote: 'Old', speakerKey: null },
    },
    hydratedMessages: { [`m1:0:${validHash}`]: { messageId: 'm1', swipeId: 0, contentHash: validHash }, 'gone:0:old': { messageId: 'gone', swipeId: 0, contentHash: 'old' } },
  });
  api.reconcileConfigWithMessages(config, [{ id: 'm1', role: 'assistant', content: validContent }]);
  assert.deepEqual(Object.keys(config.observations), ['valid']);
  assert.deepEqual(Object.keys(config.overrides), ['valid']);
  assert.deepEqual(Object.keys(config.hydratedMessages), [`m1:0:${validHash}`]);
});

test('provisional echoes do not become independent corroboration', () => {
  const base = { messageId: 'm1', swipeId: 0, contentHash: 'h1', quote: '"Hello."', surroundingText: 'Selby said.', observedColor: '#C9832E', inferredName: 'Selby', kind: 'new-speaker', status: 'pending', confidence: 0.79, strongEvidence: false, assistantIndex: 1 };
  const config = api.safeConfig({ version: 11, engine: 'hybrid', bindings: {}, observations: {
    first: { ...base, id: 'first', groupKey: 'new-speaker:selby:#C9832E', evidenceOrigin: 'model-first-seen' },
    echo: { ...base, id: 'echo', messageId: 'm2', contentHash: 'h2', groupKey: 'new-speaker:selby:#C9832E', evidenceOrigin: 'provisional-echo', strongEvidence: true, assistantIndex: 2 },
  } });
  assert.equal(api.pendingReviewGroups(config).length, 0);
  assert.equal(api.provisionalRegistryHints(config, api.compileRegistry(config)).length, 0);
});

test('normalization dry-run does not add historical persona tags', async () => {
  const character = binding('Mara', '#D34C8B', { previousColors: ['#B58CFF'] });
  const persona = binding('You', '#53C7FF', { kind: 'persona', targetId: 'persona-a' });
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(api.safeConfig({ version: 11, engine: 'hybrid', autoUserMode: 'whole', bindings: { 'character:mara': character, 'persona:persona-a': persona } })));
  host.messages = [
    { id: 'a1', role: 'assistant', content: '<font color="#B58CFF">"Hello."</font>' },
    { id: 'u1', role: 'user', content: 'Uncolored historical user prose.' },
  ];
  const preview = await api.previewTranscriptMutation('chat-a', 'user-a', 'normalize');
  assert.equal(preview.assistantMessages, 1);
  assert.equal(preview.userMessages, 0);
  const personaPreview = await api.previewTranscriptMutation('chat-a', 'user-a', 'persona-history');
  assert.equal(personaPreview.userMessages, 1);
});

test('registry import merges valid speakers and quarantines collisions', async () => {
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(api.safeConfig({ version: 11, bindings: {} })));
  host.messages = [];
  const result = await api.importRegistry({ chatId: 'chat-a', entries: [
    { speakerUid: 'prism-speaker-a', kind: 'character', name: 'A', aliases: ['Alpha'], color: '#AABBCC' },
    { speakerUid: 'prism-speaker-b', kind: 'character', name: 'B', aliases: [], color: '#AABBCC' },
  ] }, 'user-a');
  assert.equal(result.imported, 1);
  assert.equal(result.conflicts.length, 1);
  const saved = JSON.parse(host.chatVars.get('chat-a|lumi_dialogue_colors_v1'));
  assert.equal(Object.keys(saved.bindings).length, 1);
});

test('partial transcript failure rolls back and preserves a recovery record', async () => {
  const character = binding('Mara', '#D34C8B', { previousColors: ['#B58CFF'] });
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(api.safeConfig({ version: 11, bindings: { 'character:mara': character } })));
  host.messages = [
    { id: 'a1', role: 'assistant', content: '<font color="#B58CFF">"One."</font>' },
    { id: 'a2', role: 'assistant', content: '<font color="#B58CFF">"Two."</font>' },
  ];
  const original = structuredClone(host.messages);
  host.updateCalls = 0;
  host.failUpdateAt = 2;
  await assert.rejects(api.applyTranscriptMutation('chat-a', 'user-a', 'normalize'), /rolled back/i);
  host.failUpdateAt = 0;
  assert.equal(JSON.stringify(host.messages.map((message) => message.content)), JSON.stringify(original.map((message) => message.content)));
  assert.ok(host.chatVars.has('chat-a|prism_transcript_recovery_v1'));
});

test('state collections are bounded during migration', () => {
  const previousColors = Array.from({ length: 20 }, (_, index) => `#${(index + 100).toString(16).padStart(6, '0')}`);
  const overrides = Object.fromEntries(Array.from({ length: 620 }, (_, index) => [`o${index}`, { messageId: `m${index}`, swipeId: 0, contentHash: `h${index}`, segmentKey: `s${index}`, updatedAt: index }]));
  const dismissedObservationKeys = Object.fromEntries(Array.from({ length: 620 }, (_, index) => [`d${index}`, { at: index }]));
  const config = api.safeConfig({ version: 11, bindings: { 'character:a': binding('A', '#AABBCC', { previousColors }) }, overrides, dismissedObservationKeys });
  assert.ok(config.bindings['character:a'].previousColors.length <= 8);
  assert.ok(Object.keys(config.overrides).length <= 500);
  assert.ok(Object.keys(config.dismissedObservationKeys).length <= 500);
});

test('scene discovery corpus rejects prose fragments and keeps explicit speakers', async () => {
  for (const item of await fixture('scene-discovery.json')) assert.deepEqual([...api.extractSceneNamesFromText(item.text)], item.expected, item.id);
});



test('Hybrid review rejects fragment names and does not relabel known characters as aliases', () => {
  const config = api.safeConfig({
    version: 11,
    engine: 'hybrid',
    bindings: {
      'character:denise': binding('Denise', '#50DB29', { speakerUid: 'denise' }),
      'character:fast': binding('Fast', '#9F72E4', { speakerUid: 'fast' }),
      'character:maxwell': binding('Maxwell', '#E05D7B', { speakerUid: 'maxwell' }),
    },
  });
  const registry = api.compileRegistry(config);
  const fast = api.knownSceneIdentityByName(config, 'Fast');
  assert.equal(fast?.speakerUid, 'fast');
  assert.equal(api.plausibleInferredSceneName('In the', { strong: false }), '');

  const weak = api.classifyTagObservation(
    { color: '#50DB29' },
    'Fast',
    registry,
    { identity: fast, evidenceSource: 'structural-speech-tag', strong: false },
  );
  assert.equal(weak.kind, 'confirmed-use');
  assert.equal(weak.matchedSpeakerUid, 'denise');

  const explicit = api.classifyTagObservation(
    { color: '#50DB29' },
    'Fast',
    registry,
    { identity: fast, evidenceSource: 'reporting-verb', strong: true },
  );
  assert.equal(explicit.kind, 'speaker-conflict');
  assert.equal(explicit.matchedSpeakerUid, 'fast');
});

test('Hybrid review hides one-off weak alias and junk-name observations', () => {
  const now = Date.now();
  const config = api.safeConfig({
    version: 11,
    observations: {
      fast: {
        id: 'fast', groupKey: 'alias-suggestion:fast:#50DB29:denise', messageId: 'm1', swipeId: 0, contentHash: 'h1',
        quote: '"Eleven minutes,"', observedColor: '#50DB29', inferredName: 'Fast', matchedSpeakerUid: 'denise',
        kind: 'alias-suggestion', confidence: 0.82, status: 'pending', evidenceOrigin: 'model-first-seen',
        evidenceSource: 'structural-speech-tag', strongEvidence: false, assistantIndex: 1, createdAt: now, lastSeenAt: now,
      },
      junk: {
        id: 'junk', groupKey: 'new-speaker:in the:#C9832E:', messageId: 'm1', swipeId: 0, contentHash: 'h1',
        quote: '"No."', observedColor: '#C9832E', inferredName: 'In the', matchedSpeakerUid: null,
        kind: 'new-speaker', confidence: 0.72, status: 'pending', evidenceOrigin: 'model-first-seen',
        evidenceSource: 'structural-speech-tag', strongEvidence: false, assistantIndex: 1, createdAt: now, lastSeenAt: now,
      },
    },
  });
  assert.equal(api.pendingReviewGroups(config).length, 0);
});

let passed = 0;
let failed = 0;
for (const item of tests) {
  try {
    await item.fn();
    passed += 1;
    console.log(`✓ ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${item.name}`);
    console.error(error?.stack || error);
  }
}
console.log(`\n${passed}/${tests.length} Prism checks passed.`);
if (failed) throw new Error(`${failed} Prism regression check${failed === 1 ? '' : 's'} failed.`);
