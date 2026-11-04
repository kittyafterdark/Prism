import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import ts from 'typescript';
import { colorBankFixture } from './color-bank.mjs';

const context = vm.createContext({ console, setTimeout, clearTimeout, structuredClone });
vm.runInContext(colorBankFixture, context);
const run = code => vm.runInContext(code, context);
const fixture = context.bankFixture;
await fixture.reset();
fixture.host.entities = [
  { id: 'entity-a', type: 'character', name: 'Ada', aliases: [] },
  { id: 'entity-b', type: 'character', name: 'Charles Babbage', aliases: [] },
];
await run(`(async()=>{
  const config = await loadConfig('chat-a', 'user-a');
  const original = config.bindings['character:entity-a'];
  config.bindings['character:entity-b'] = {...original, targetId:'entity-b', name:'Charles Babbage', aliases:[], color:'#445566', channels:safeChannels(null, '#445566'), legacyRefs:['entity-b']};
  config.overrides.original = {messageId:'fixture-message',contentHash:'hash',segmentKey:'original',quote:'Hello',kind:'dialogue',speakerKey:'character:'+original.speakerUid};
  config.overrides.legacy = {...config.overrides.original,segmentKey:'legacy',speakerKey:'character:entity-b'};
  await spindle.variables.chat.set('chat-a', CONFIG_VAR, JSON.stringify(config));
})()`);
let state = await fixture.state();
let [ada, charles] = state.characters;
assert.notEqual(ada.binding.speakerUid, charles.binding.speakerUid, 'Distinct saved speakers cannot retain one shared attribution ID');
assert.equal(state.registry.entries.length, 2);
assert.equal(Object.keys(state.registry.bySpeakerUid).length, 2);
assert.equal(state.config.overrides.original.speakerKey, 'character:'+ada.binding.speakerUid, 'Existing stable corrections retain their owner');
assert.equal(state.config.overrides.legacy.speakerKey, 'character:'+charles.binding.speakerUid, 'Unambiguous legacy target references migrate to the repaired ID');
const identities = state.characters.map(c=>c.binding.speakerUid);
for (const reload of [await fixture.state(), await fixture.state()]) {
  assert.deepEqual(Array.from(reload.characters, c=>c.binding.speakerUid), Array.from(identities), 'Identity repair persists and is idempotent');
  assert.equal(reload.characters[0].binding.color, '#112233');
  assert.equal(reload.characters[1].binding.color, '#445566');
}
const response = await fixture.send({type:'ldc_save_binding',chatId:'chat-a',kind:'character',targetId:charles.id,characterId:charles.id,name:charles.name,aliases:[],channels:fixture.functions.safeChannels(null,'#778899')});
assert.equal(response.type, 'ldc_state');
assert.equal(response.state.characters.find(c=>c.id===ada.id).binding.color, '#112233');
assert.equal(response.state.characters.find(c=>c.id===charles.id).binding.color, '#778899');

// An old alias cannot beat a canonical name after a host identity changes.
run(`var lookupConfig=cloneDefaultConfig();
lookupConfig.bindings['character:old-a']={kind:'character',targetId:'old-a',name:'Ada',aliases:['Charles Babbage']};
lookupConfig.bindings['character:old-b']={kind:'character',targetId:'old-b',name:'Charles Babbage',aliases:[]};`);
assert.equal(run(`findBinding(lookupConfig,'character','new-b','Charles Babbage',[]).targetId`), 'old-b');
run(`lookupConfig.bindings['character:old-c']={kind:'character',targetId:'old-c',name:'Grace',aliases:['Countess']};lookupConfig.bindings['character:old-a'].aliases.push('Countess');`);
assert.equal(run(`findBinding(lookupConfig,'character','unknown','Countess',[])`), null, 'Ambiguous alias matches must stay unresolved');
// A repaired UID must not move an already selected editor to its former owner.
const frontend = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('frontend.ts', frontend, ts.ScriptTarget.Latest, true);
const functions = new Map();
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
const editor = vm.createContext({
  disposed:false, state:{ok:true,characters:[{id:'entity-a',name:'Ada',binding:{speakerUid:'shared'}},{id:'entity-b',name:'Charles Babbage',binding:{speakerUid:'shared'}}]},
  selectedId:'entity-b', uiPreferenceCache:null, pendingReviewCount:0, hydrationStatus:'idle', revision:0, signatures:new Map(),
  schedule(){},rebuildToolbar(){},refreshPrismStatus(){}
});
for (const name of ['characterStateKey', 'acceptState', 'current']) vm.runInContext(functions.get(name), editor);
vm.runInContext(`acceptState({ok:true,characters:[{id:'entity-a',name:'Ada',binding:{speakerUid:'shared'}},{id:'entity-b',name:'Charles Babbage',binding:{speakerUid:'repaired'}}]})`, editor);
assert.equal(vm.runInContext('current().id', editor), 'entity-b');
// Host discovery may replace an entity ID; the stable speaker fallback still works.
vm.runInContext(`acceptState({ok:true,characters:[{id:'entity-a',name:'Ada',binding:{speakerUid:'shared'}},{id:'new-b',name:'Charles Babbage',binding:{speakerUid:'repaired'}}]})`, editor);
assert.equal(vm.runInContext('current().id', editor), 'new-b');
console.log('Passed duplicate speaker identity recovery, persistent IDs, correction migration, independent paint, canonical precedence and selection across identity repair.');
