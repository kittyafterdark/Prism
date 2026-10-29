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
  safeConfig, safePreferences, safeChannels, bindingRegistryColor, compileRegistry, registryInstruction, registryHexText,
  promptField, snapshotScopeKey, rememberRegistrySnapshot, selectRegistrySnapshot,
  messagesForHydration, reconcileConfigWithMessages, pendingReviewGroups,
  provisionalRegistryHints, inferTagSpeakerEvidence, classifyTagObservation,
  plausibleInferredSceneName, knownSceneIdentityByName,
  extractSceneNamesFromText, hydrateGeneratedMessage, resetTemporaryEvidence,
  addSceneCharacter, resolveObservationGroup, mergeSceneCharacter, loadConfig, saveConfig,
  enqueueConfigOperation, configOperationQueues, enqueueGlobalPreferenceOperation, globalPreferenceQueues, updateOptions, updateUiPreferences,
  previewTranscriptMutation, applyTranscriptMutation, restoreTranscriptRecovery, importRegistry,
  recentRegistrySnapshots, applyPersonaColor, applyPersonaColorToLlmContent, personaColorContext, persistPersonaColorForMessage,
  locateVisibleQuote, bakeQuoteMarkup, bakeManualCorrection, saveQuoteOverride
};`);

const host = {
  chatVars: new Map(),
  globalVars: new Map(),
  messages: [],
  updates: [],
  failUpdateAt: 0,
  updateCalls: 0,
  interceptor: null,
  registeredMacros: new Map(),
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
    getMessages: async (chatId, options) => {
      assert.equal(chatId, host.activeChat.id);
      if (options != null && (typeof options !== 'object' || Array.isArray(options))) {
        throw new Error('options must be an object');
      }
      return structuredClone(host.messages);
    },
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
  registerMacro: (definition) => host.registeredMacros.set(definition.name, definition),
  registerInterceptor: (handler) => { host.interceptor = handler; return () => {}; },
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

test('generation hydration reads messages with the current Spindle options contract', async () => {
  host.messages = [{ id: 'generated-reply', role: 'assistant', content: 'A newly generated reply.' }];
  const messages = await api.messagesForHydration('chat-a', 'user-hydration', 'generated-reply');
  assert.deepEqual(messages, host.messages);
  // A user ID in the options position must fail, just as it does in Lumiverse.
  await assert.rejects(spindle.chat.getMessages('chat-a', 'user-hydration'), /options must be an object/);
});

test('manual bake mutates only the active swipe and creates a recovery backup', async () => {
  host.chatVars.clear();
  host.messages = [{ id: 'm-bake', role: 'assistant', content: 'unused', swipes: ['One: "Hi."', 'Two: "Hi."'], swipe_id: 1, metadata: { keep: true } }];
  host.updates = [];
  host.updateCalls = 0;
  const config = api.safeConfig({ engine: 'hybrid', bindings: { 'character:test': binding('Test', '#55AAEE', { speakerUid: 'speaker-test' }) } });
  const result = await api.bakeManualCorrection({
    messageId: 'm-bake', swipeId: 1, speakerKey: 'character:speaker-test', kind: 'dialogue', quote: '"Hi."', occurrenceIndex: 0, contextBefore: 'Two: ', contextAfter: '',
  }, config, { id: 'chat-a' }, 'user-bake');
  assert.equal(result.status, 'baked');
  assert.equal(host.messages[0].swipes[0], 'One: "Hi."');
  assert.equal(host.messages[0].swipes[1], 'Two: <font color="#55AAEE">"Hi."</font>');
  const recovery = JSON.parse(host.chatVars.get('chat-a|prism_transcript_recovery_v1'));
  assert.equal(recovery.mode, 'manual-bake');
  assert.deepEqual(recovery.messages[0].swipes, ['One: "Hi."', 'Two: "Hi."']);
});


test('saveQuoteOverride automatically bakes when the preference is enabled in Hybrid', async () => {
  host.chatVars.clear();
  host.globalVars.clear();
  host.messages = [{ id: 'm-auto-bake', role: 'assistant', content: 'Hugo said, "Persist me."', metadata: {}, swipe_id: 0 }];
  host.updates = [];
  host.updateCalls = 0;
  host.activeChat = { id: 'chat-a', name: 'Bake integration', character_id: 'primary', metadata: {} };
  const config = api.safeConfig({ engine: 'hybrid', bindings: { 'character:hugo': binding('Hugo', '#D572E4', { targetId: 'hugo', speakerUid: 'speaker-hugo' }) } });
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(config));
  host.globalVars.set('prism_preferences_v1', JSON.stringify({ version: 7, preferences: { preferredEngine: 'hybrid', bakeManualCorrections: true }, library: {} }));
  const result = await api.saveQuoteOverride({
    chatId: 'chat-a', messageId: 'm-auto-bake', swipeId: 0, contentHash: 'visible-hash', segmentKey: 'seg-1',
    quote: '"Persist me."', speakerKey: 'character:speaker-hugo', kind: 'dialogue', existingColor: null,
    occurrenceIndex: 0, contextBefore: 'Hugo said, ', contextAfter: '',
  }, 'user-bake');
  assert.equal(result.bake.status, 'baked');
  assert.equal(host.messages[0].content, 'Hugo said, <font color="#D572E4">"Persist me."</font>');
  const stored = JSON.parse(host.chatVars.get('chat-a|lumi_dialogue_colors_v1'));
  assert.equal(stored.overrides['m-auto-bake:0:seg-1'].speakerKey, 'character:speaker-hugo');
});


test('manual bake recolors Lumi-normalized span markup in place', () => {
  const source = 'A <span class="legacy-color" style="font-weight: 600; color: #ff0000">“Wrong color.”</span> B';
  const baked = api.bakeQuoteMarkup(source, {
    quote: '"Wrong color."', occurrenceIndex: 0, contextBefore: 'A ', contextAfter: ' B',
  }, '#12ABEF');
  assert.equal(baked.status, 'baked');
  assert.equal(baked.action, 'recolored-span');
  assert.match(baked.content, /style="font-weight: 600; color: #12ABEF"/);
  assert.equal((baked.content.match(/<font\b/gi) || []).length, 0);
});

test('manual bake canonicalizes HTML entities and punctuation variants while locating', () => {
  const source = 'Hugo&nbsp;said&mdash;&nbsp;&ldquo;Don&rsquo;t panic.&rdquo;';
  const baked = api.bakeQuoteMarkup(source, {
    quote: '“Don’t panic.”', occurrenceIndex: 0, contextBefore: 'Hugo said— ', contextAfter: '',
  }, '#D572E4');
  assert.equal(baked.status, 'baked');
  assert.match(baked.content, /<font color="#D572E4">&ldquo;Don&rsquo;t panic\.&rdquo;<\/font>/);
});

test('manual bake falls back to the active stored swipe when the frontend swipe hint is stale', async () => {
  host.chatVars.clear();
  host.messages = [{ id: 'm-stale-swipe', role: 'assistant', content: 'unused', swipes: ['Old swipe: "Nope."', 'Current swipe: "Bake me."'], swipe_id: 1, metadata: {} }];
  host.updates = [];
  host.updateCalls = 0;
  const config = api.safeConfig({ engine: 'hybrid', bindings: { 'character:test': binding('Test', '#55AAEE', { speakerUid: 'speaker-test' }) } });
  const result = await api.bakeManualCorrection({
    messageId: 'm-stale-swipe', swipeId: 0, speakerKey: 'character:speaker-test', kind: 'dialogue', quote: '"Bake me."',
    occurrenceIndex: 0, contextBefore: 'Current swipe: ', contextAfter: '',
  }, config, { id: 'chat-a' }, 'user-bake');
  assert.equal(result.status, 'baked');
  assert.equal(result.resolvedSwipeId, 1);
  assert.equal(host.messages[0].swipes[0], 'Old swipe: "Nope."');
  assert.equal(host.messages[0].swipes[1], 'Current swipe: <font color="#55AAEE">"Bake me."</font>');
});


test('saveQuoteOverride rekeys a stale swipe hint after a successful active-swipe bake', async () => {
  host.chatVars.clear();
  host.globalVars.clear();
  host.messages = [{
    id: 'm-rekey-bake', role: 'assistant', content: 'unused',
    swipes: ['Old swipe: "Not this."', 'Current: <span style="color: #ff0000">“Bake this.”</span>'], swipe_id: 1, metadata: {},
  }];
  host.updates = [];
  host.updateCalls = 0;
  host.activeChat = { id: 'chat-a', name: 'Bake rekey', character_id: 'primary', metadata: {} };
  const config = api.safeConfig({ engine: 'hybrid', bindings: { 'character:hugo': binding('Hugo', '#D572E4', { targetId: 'hugo', speakerUid: 'speaker-hugo' }) } });
  host.chatVars.set('chat-a|lumi_dialogue_colors_v1', JSON.stringify(config));
  host.globalVars.set('prism_preferences_v1', JSON.stringify({ version: 7, preferences: { preferredEngine: 'hybrid', bakeManualCorrections: true }, library: {} }));
  const result = await api.saveQuoteOverride({
    chatId: 'chat-a', messageId: 'm-rekey-bake', swipeId: 0, contentHash: 'visible-hash', segmentKey: 'seg-rekey',
    quote: '"Bake this."', speakerKey: 'character:speaker-hugo', kind: 'dialogue', existingColor: '#FF0000',
    occurrenceIndex: 0, contextBefore: 'Current: ', contextAfter: '',
  }, 'user-bake');
  assert.equal(result.bake.status, 'baked');
  assert.equal(result.bake.resolvedSwipeId, 1);
  assert.match(host.messages[0].swipes[1], /<span style="color: #D572E4">“Bake this\.”<\/span>/);
  const stored = JSON.parse(host.chatVars.get('chat-a|lumi_dialogue_colors_v1'));
  assert.equal(stored.overrides['m-rekey-bake:0:seg-rekey'], undefined);
  assert.equal(stored.overrides['m-rekey-bake:1:seg-rekey'].speakerKey, 'character:speaker-hugo');
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
