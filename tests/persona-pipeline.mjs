import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/backend.ts', import.meta.url), 'utf8');
function fixture() {
  const host = { chatVars: new Map(), globalVars: new Map(), persona: { id: 'persona-a', name: 'Ada' }, entities: [], upserts: [], macros: new Map(), writes: 0 };
  const spindle = {
    variables: {
      chat: { get: async (_, key) => host.chatVars.get(key), set: async (_, key, value) => { host.writes++; host.chatVars.set(key, value); } },
      global: { get: async key => host.globalVars.get(key), set: async (key, value) => host.globalVars.set(key, value) },
    },
    chats: { getActive: async () => ({ id: 'chat' }) },
    characters: { get: async () => null },
    personas: { getActive: async () => structuredClone(host.persona) },
    memories: { entities: { list: async () => structuredClone(host.entities), upsert: async (_, entity) => { host.upserts.push(entity); return { id: 'entity' }; } }, cortex: { invalidateCache: async () => {} } },
    macros: { resolve: async () => '' },
    chat: { getMessages: async () => [] },
    registerMacro: definition => host.macros.set(definition.name, definition.handler),
    registerInterceptor: handler => { host.interceptor = handler; },
    on: () => {}, onFrontendMessage: () => {}, log: { info() {}, warn() {}, error() {} },
  };
  const context = vm.createContext({ spindle, setTimeout, clearTimeout, structuredClone });
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  const run = code => vm.runInContext(code, context);
  const config = () => JSON.parse(host.chatVars.get('lumi_dialogue_colors_v1'));
  const save = value => host.chatVars.set('lumi_dialogue_colors_v1', JSON.stringify(value));
  run(`var config = cloneDefaultConfig('hybrid'); config.personaInCast = true;`);
  save(run('safeConfig(config)'));
  return { host, context, run, config, save };
}

// A first generation must register the persona before composing the prompt,
// without depending on opening the palette or on user-message coloring.
{
  const f = fixture();
  const config = f.config(); config.personaEnabled = false; config.autoUserMode = 'off'; f.save(config);
  const result = await f.host.interceptor([{ role: 'user', content: 'Continue.' }], { chatId: 'chat', userId: 'owner', generationId: 'first' });
  assert.match(result.messages.find(m => m.role === 'system').content, /"name":"Ada","kind":"character"/);
  const binding = f.config().bindings['persona:persona-a'];
  assert.ok(binding.speakerUid);
  assert.match(result.messages.find(m => m.role === 'system').content, new RegExp(binding.color));
  assert.equal(result.messages.find(m => m.role === 'user').content, 'Continue.');
  const state = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(state.persona.binding.speakerUid, binding.speakerUid);
  assert.equal(state.registry.byColor[binding.color].speakerUid, binding.speakerUid);
  const tagged = `<font color="${binding.color}">"Ada's line."</font>`;
  f.context.tagged = tagged; f.context.registry = state.registry;
  const observation = f.run("classifyTagObservation(extractPortableColorTags(tagged)[0], 'Ada', registry)");
  assert.equal(observation.kind, 'confirmed-use');
  assert.equal(observation.matchedSpeakerUid, binding.speakerUid);
  const fallback = f.run("selectRegistrySnapshot('owner','unseen-chat',{},config,{id:'persona-a',name:'Ada'})");
  // The fixture's initial config predates auto-registration; use the persisted
  // assignment for a rescan without a generation snapshot.
  f.context.savedConfig = f.config();
  const rescan = f.run("selectRegistrySnapshot('owner','unseen-chat',{},savedConfig,{id:'persona-a',name:'Ada'})");
  assert.equal(fallback.entries.length, 0);
  assert.equal(rescan.byColor[binding.color].speakerUid, binding.speakerUid);
}

// Library thought paints survive registration, and both prompt delivery paths
// select the active persona even when older persona bindings remain saved.
{
  const f = fixture();
  f.run(`var globalState=safeGlobalState(null);globalState.library[libraryKeyForPersona({id:'persona-a',name:'Ada'})]={name:'Ada',color:'#112233',channels:safeChannels({thought:{enabled:true,linkedToDialogue:false,paint:{mode:'solid',stops:['#AA33CC']}}},'#112233'),aliases:[],source:'manual',pinned:true};`);
  f.host.globalVars.set('prism_preferences_v1', JSON.stringify(f.run('globalState')));
  const first = await f.host.macros.get('prismPrompt')({ env: { chat: { id: 'chat' } } });
  assert.match(first, /#112233/);
  assert.equal(f.config().bindings['persona:persona-a'].channels.thought.paint.stops[0], '#AA33CC');
  const speakerUid = f.config().bindings['persona:persona-a'].speakerUid;
  f.host.persona.name = 'Ada Renamed';
  const renamed = await f.host.macros.get('prismPrompt')({ env: { chat: { id: 'chat' } } });
  assert.match(renamed, /"name":"Ada Renamed"/);
  assert.equal(f.config().bindings['persona:persona-a'].speakerUid, speakerUid);
  assert.ok(f.config().bindings['persona:persona-a'].aliases.includes('Ada'));
  f.host.persona = { id: 'persona-b', name: 'Bea' };
  const second = await f.host.macros.get('prismPrompt')({ env: { chat: { id: 'chat' } } });
  assert.match(second, /"name":"Bea","kind":"character"/);
  assert.doesNotMatch(second, /"name":"Ada Renamed"/);
  assert.ok(f.config().bindings['persona:persona-a']);
  f.host.persona = null;
  const absent = await f.host.macros.get('prismPrompt')({ env: { chat: { id: 'chat' } } });
  assert.doesNotMatch(absent, /"kind":"persona"/);
}

// Non-committing macro previews may derive a deterministic registry but must
// not try a mutation through the host's preview guard.
{
  const f = fixture();
  const preview = await f.host.macros.get('prismPrompt')({ commit: false, env: { chat: { id: 'chat' } } });
  assert.match(preview, /"name":"Ada"/);
  assert.equal(f.host.writes, 0);
}

// Real shared-color conflicts remain explicit; repairing duplicate persona
// rows must not silently recolor an unrelated, deliberately assigned character.
{
  const f = fixture();
  const config = f.config();
  config.bindings = {
    'persona:persona-a': { kind: 'persona', targetId: 'persona-a', name: 'Ada', color: '#112233', pinned: true },
    'character:other': { kind: 'character', targetId: 'other', name: 'Other', color: '#112233', pinned: true },
  };
  f.save(config);
  const state = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(state.registry.conflicts.length, 1);
  assert.equal(state.registry.entries.length, 0);
  assert.equal(f.config().bindings['character:other'].color, '#112233');
}

// Legacy Cortex duplicates stay stored, but cannot create duplicate color
// owners or silently reintroduce the persona when cast is disabled.
{
  const f = fixture();
  f.host.entities = [{ id: 'legacy', type: 'character', name: 'Ada' }];
  await f.run(`saveBinding({kind:'persona',targetId:'persona-a',name:'Ada',color:'#112233'}, 'owner')`);
  assert.equal(f.host.upserts.length, 0);
  const config = f.config();
  config.bindings['character:legacy'] = { kind: 'character', targetId: 'legacy', name: 'Ada', color: '#112233' };
  f.save(config);
  const state = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(state.characters.length, 0);
  assert.equal(state.registry.entries.length, 1);
  assert.equal(state.registry.conflicts.length, 0);
  config.personaInCast = false; f.save(config);
  const off = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(off.registry.entries.length, 0);
  assert.equal(f.host.entities.length, 1);
}

// Global mode defaults and explicit scene assignment preserve the user's mode.
{
  const f = fixture();
  f.host.chatVars.clear();
  f.host.globalVars.set('prism_preferences_v1', JSON.stringify({ preferences: { personaMode: 'whole' } }));
  const config = await f.run(`loadConfig('chat','owner')`);
  assert.equal(config.autoUserMode, 'whole');
  config.autoUserMode = 'off'; f.save(config);
  await f.run(`assignSceneColors({}, 'owner')`);
  assert.equal(f.config().autoUserMode, 'off');
}
// A cast persona owns its unique short-name character row, including differently
// colored historical duplicates. Ambiguous first names remain separate speakers.
{
  const f = fixture();
  f.host.persona = { id: 'persona-a', name: 'Katsuki Bakugo' };
  f.host.entities = [{ id: 'katsuki', type: 'character', name: 'Katsuki' }];
  const config = f.config();
  config.bindings = {
    'persona:persona-a': { kind: 'persona', targetId: 'persona-a', name: 'Katsuki Bakugo', color: '#FF6A00' },
    'character:katsuki': { kind: 'character', targetId: 'katsuki', name: 'Katsuki', color: '#E0663B' },
    'character:kiri': { kind: 'character', targetId: 'kiri', name: 'Kirishima', aliases: ['Eijiro', 'Kiri'], color: '#D3363E' },
    'character:shoto': { kind: 'character', targetId: 'shoto', name: 'Shoto Todoroki', color: '#72E4D1' },
  };
  f.save(config);
  const state = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(state.registry.entries.length, 3);
  assert.equal(state.characters.length, 0, 'Short-name Cortex duplicate is absent from the roster');
  assert.ok(state.registry.entries.find(entry => entry.kind === 'persona').aliases.includes('Katsuki'));
  assert.match(state.prompt.active, /"name":"Katsuki Bakugo","kind":"character","aliases":\["Katsuki"\]/);
  assert.doesNotMatch(state.prompt.active, /"kind":"persona"|"name":"Katsuki",/);
  assert.equal(f.config().bindings['character:katsuki'].color, '#E0663B', 'Deduping preserves saved historical data');
  f.context.spindle.macros.resolve = async () => ({text:'Katsuki: #E0663B'});
  const imported = await f.run(`buildState({importCortex:true}, 'owner')`);
  assert.equal(imported.characters.length, 0, 'Cortex cannot reintroduce a suppressed persona duplicate');
  config.bindings['character:other-katsuki'] = { kind: 'character', targetId: 'other-katsuki', name: 'Katsuki Other', color: '#ABCDEF' };
  f.save(config);
  const ambiguous = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.ok(ambiguous.registry.entries.some(entry => entry.name === 'Katsuki'), 'Shared short names do not auto-merge');
  config.personaInCast = false; delete config.bindings['character:other-katsuki']; f.save(config);
  const off = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.ok(!off.registry.entries.some(entry => /Katsuki/.test(entry.name)), 'Turning off cast does not expose its legacy duplicate');
}

// Inactive bindings must never overwrite the active persona's bank identity.
{
  const f = fixture();
  await f.run(`saveBinding({kind:'persona',targetId:'persona-a',name:'Ada',color:'#112233'}, 'owner')`);
  f.host.persona = { id: 'persona-b', name: 'Bea' };
  await f.run(`saveBinding({kind:'persona',targetId:'persona-b',name:'Bea',color:'#445566'}, 'owner')`);
  const global = await f.run(`loadGlobalState('owner')`);
  assert.equal(global.library['persona:persona-a'].color, '#112233');
  assert.equal(global.library['persona:persona-b'].color, '#445566');
  assert.ok(!global.library['persona-name:ada'], 'Stable IDs stay the bank keys for inactive personas');
  f.host.chatVars.clear();
  const next = await f.run(`buildState({importCortex:false}, 'owner')`);
  assert.equal(next.persona.binding.color, '#445566', 'New chat reuses the active persona base');
  await f.run(`saveBinding({kind:'persona',targetId:'persona-b',name:'Bea',color:'#778899'}, 'owner')`);
  assert.equal((await f.run(`loadGlobalState('owner')`)).library['persona:persona-b'].color, '#445566', 'Chat override preserves shared base');
}

console.log('Passed persona registration before injection, ownership, macro delivery, switching, previews, legacy cast duplicates, and mode persistence.');
