import assert from 'node:assert/strict';
import vm from 'node:vm';
import { colorBankFixture } from './color-bank.mjs';

const context = vm.createContext({ console, setTimeout, clearTimeout, structuredClone });
vm.runInContext(colorBankFixture, context);
const fixture = context.bankFixture;
const run = code => vm.runInContext(code, context);
run('var fixtureSceneDiscovery=getSceneCharacters');
let state = await fixture.reset();
const uid = state.characters[0].binding.speakerUid;
await run(`(async()=>{
  const config=await loadConfig('chat-a','user-a');
  config.overrides.example={messageId:'fixture-message',contentHash:'hash',quote:'Hello',kind:'dialogue',speakerKey:'character:'+config.bindings['character:entity-a'].speakerUid};
  await saveConfig('chat-a',config);
})()`);
state = await fixture.state();
const overrides = JSON.stringify(state.config.overrides);
assert.equal(Object.keys(state.config.overrides).length, 1);
const bankBefore = JSON.stringify([...fixture.host.global]);
const channels = fixture.functions.safeChannels({
  dialogue: { enabled: true, paint: { mode: 'gradient', type: 'radial', stops: ['#FF0000', '#FF5500'], angle: 100 } },
  thought: { enabled: true, linkedToDialogue: false, paint: { mode: 'gradient', stops: ['#445566', '#778899'], angle: 40 } },
}, '#FF0000');
const command = { type: 'ldc_save_binding', chatId: 'chat-a', kind: 'character', characterId: 'entity-a', targetId: 'entity-a', name: 'Ada Lovelace', aliases: ['Countess', 'A.L.'], channels };
let response = await fixture.send(command);
assert.equal(response.type, 'ldc_state');
state = response.state;
assert.equal(state.characters.length, 1);
assert.equal(state.characters[0].name, 'Ada Lovelace');
assert.equal(state.characters[0].binding.targetId, 'entity-a');
assert.equal(state.characters[0].binding.speakerUid, uid, 'Saving a whole profile preserves attribution identity');
assert.deepEqual(Array.from(state.characters[0].binding.aliases), ['Countess', 'A.L.', 'Ada']);
assert.equal(JSON.stringify(state.characters[0].binding.channels), JSON.stringify(channels));
assert.equal(JSON.stringify(state.config.overrides), overrides, 'Manual corrections stay attached');
assert.equal(JSON.stringify([...fixture.host.global]), bankBefore, 'Chat-profile saves do not modify the shared bank');
state = await fixture.state();
assert.equal(state.characters[0].name, 'Ada Lovelace', 'Reopening retains the combined edit');
assert.equal(state.characters[0].binding.color, '#FF0000');

response = await fixture.send({ ...command, name: 'Ada Lovelace', aliases: ['Lady Ada'] });
assert.equal(response.type, 'ldc_state');
assert.deepEqual(Array.from(response.state.characters[0].binding.aliases), ['Lady Ada'], 'Alias-only saves replace the edited list');
assert.equal(response.state.characters[0].binding.color, '#FF0000');
assert.equal(response.state.characters[0].binding.speakerUid, uid);

await run(`(async()=>{
  const config=await loadConfig('chat-a','user-a');
  config.manualCharacters.other={id:'other',name:'Other',aliases:['Taken'],source:'manual-roster'};
  await saveConfig('chat-a',config);
})()`);
await fixture.state();
for (const name of ['', '<b>Name</b>', 'Other', 'Taken']) {
  const before = JSON.stringify([...fixture.host.chats]);
  response = await fixture.send({ ...command, name, channels: fixture.functions.safeChannels(null, '#ABCDEF'), aliases: ['InvalidAlias'] });
  assert.equal(response.type, 'ldc_error');
  assert.equal(JSON.stringify([...fixture.host.chats]), before, 'Invalid/conflicting names cannot partially save paint or aliases');
}
const beforeWrongChat = JSON.stringify([...fixture.host.chats]);
assert.equal((await fixture.send({ ...command, chatId: 'wrong-chat' })).type, 'ldc_error');
assert.equal(JSON.stringify([...fixture.host.chats]), beforeWrongChat);

// A same-name older version can appear first in the library. The explicit
// result identifies the version just saved, rather than that unrelated copy.
await run(`(async()=>{
  const global=await loadGlobalState('user-a');
  global.library={'character-card:older':{name:'Ada Lovelace',aliases:[],color:'#FF5500',channels:safeChannels(null,'#FF5500'),source:'manual',pinned:true},...global.library};
  await saveGlobalState(global,'user-a');
})()`);
state = await fixture.state();
response = await fixture.send({ type: 'ldc_editor_color_bank', chatId: 'chat-a', action: 'save', bindingKey: 'character:entity-a', expectedBinding: JSON.stringify(state.config.bindings['character:entity-a']) });
assert.equal(response.type, 'ldc_state');
const result = response.state.editorBankResult;
assert.equal(result.action, 'save');
assert.equal(result.speakerUid, uid);
assert.equal(response.state.colorBank.find(entry => entry.scope === 'library' && entry.keys.includes(result.key)).color, '#FF0000');
assert.equal(response.state.colorBank.find(entry => entry.key === 'character-card:older').color, '#FF5500', 'Other saved versions remain separate');
assert.ok(response.state.characters[0].colorBankKeys.includes(result.key));

fixture.host.chatId = 'another-chat';
state = await fixture.state();
assert.equal(state.characters[0].name, 'Ada', 'A chat-profile rename stays in its chat');

// Existing host names need not satisfy the stricter new-name validator.
await fixture.reset();
await run(`(async()=>{
  const config=await loadConfig('chat-a','user-a');
  getSceneCharacters=async()=>({characters:[{id:'entity-a',entityId:'entity-a',characterId:'card-a',name:'Agent_47',aliases:[],source:'cortex'}],cortexAvailable:true});
  config.bindings['character:entity-a'].name='Agent_47';
  await saveConfig('chat-a',config);
})()`);
response = await fixture.send({ ...command, name: 'Agent_47' });
assert.equal(response.type, 'ldc_state', 'An unchanged host name does not block paint/alias saving');
await run('getSceneCharacters=fixtureSceneDiscovery');

// Exercise real Cortex/card discovery: a contaminated primary must not swallow
// other entities, and stale host aliases must not undo a saved empty list.
await fixture.reset();
fixture.host.entities = [
  {id:'entity-a',type:'character',name:'Ada',aliases:['Charles','Babbage','Charles Babbage','Grace','Hopper','Grace Hopper','Rear Admiral']},
  {id:'entity-b',type:'character',name:'Charles Babbage',aliases:['Charles']},
  {id:'entity-c',type:'character',name:'Grace Hopper',aliases:['Grace']},
];
state = await fixture.state();
assert.equal(state.characters.length, 3, 'Distinct Cortex entities cannot merge through incidental aliases');
response = await fixture.send({...command,name:'Ada',aliases:[]});
assert.equal(response.type, 'ldc_state');
for (const reload of [response.state, await fixture.state(), (await fixture.send({type:'ldc_load_state',chatId:'chat-a',importCortex:true,scanTranscript:true})).state]) {
  const primary = reload.characters.find(character=>character.id==='entity-a');
  assert.deepEqual(Array.from(primary.aliases), [], 'Discovery honors an explicitly cleared chat profile');
  assert.deepEqual(Array.from(primary.binding.aliases), [], 'The saved binding remains empty');
  assert.equal(primary.binding.speakerUid, uid);
  assert.equal(reload.characters.length, 3);
  assert.ok(!reload.registry.entries.find(entry=>entry.name==='Ada').aliases.length, 'Removed aliases stay out of attribution');
}
assert.equal(fixture.host.entities[0].aliases.length, 7, 'Saving does not mutate host entities');
// Without a separate entity, card-cast discovery must also see the cleared
// profile before alias reconciliation, so an RP speaker remains independent.
fixture.host.entities = [fixture.host.entities[0]];
await run(`spindle.characters.get=async()=>({id:'card-a',name:'Ada',extensions:{cast_names:['Charles Babbage']}});`);
state = await fixture.state();
assert.ok(state.characters.some(character=>character.name==='Charles Babbage'), 'Cleared aliases cannot swallow newly discovered card speakers');
response = await fixture.send({...command,name:'Ada',aliases:['Countess']});
assert.equal(response.type, 'ldc_state');
assert.deepEqual(Array.from((await fixture.state()).characters.find(character=>character.id==='entity-a').aliases), ['Countess'], 'Nonempty replacements also override stale host aliases');
console.log('Passed chat-profile persistence, alias clearing against stale discovery, separate speakers, stable IDs, validation, bank feedback and chat isolation.');
