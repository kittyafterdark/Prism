import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/backend.ts', import.meta.url), 'utf8');
const backend = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

// Real storage normalization, state construction, request routing and sync;
// only the public host boundary and scene discovery use controlled fixtures.
export const colorBankFixture = `
const bankHost={chatId:'chat-a',global:new Map(),chats:new Map(),responses:[],messages:[{content:'<font color="#112233">Unchanged</font>'}]};
let backendHandler,frontendReceiver;
const spindle={
  variables:{global:{get:async(key,user)=>bankHost.global.get(user+'|'+key),set:async(key,value,user)=>bankHost.global.set(user+'|'+key,value)},chat:{get:async(id,key)=>bankHost.chats.get(id+'|'+key),set:async(id,key,value)=>bankHost.chats.set(id+'|'+key,value)}},
  chats:{getActive:async()=>({id:bankHost.chatId,name:'Fixture chat',character_id:'card-a'})},
  chat:{getMessages:async()=>bankHost.messages},
  characters:{get:async()=>({id:'card-a',name:'Ada'})},personas:{getActive:async()=>null},
  memories:{entities:{list:async()=>[],upsert:async()=>({id:'entity-a'})},cortex:{invalidateCache:async()=>{}}},
  macros:{resolve:async()=>({text:'Ada: #112233'})},
  registerMacro(){},registerInterceptor(){},on(){},onFrontendMessage(fn){backendHandler=fn},
  sendToFrontend(response){bankHost.responses.push(response);frontendReceiver?.(response)},
  log:{info(){},warn(){},error(){}},toast:{error(){},success(){}}
};
${backend}
getSceneCharacters=async()=>({characters:[{id:'entity-a',entityId:'entity-a',characterId:'card-a',name:'Ada',aliases:[],source:'cortex'}],cortexAvailable:true});
const bankFixture={
  host:bankHost,
  connect(fn){frontendReceiver=fn},
  async send(payload,user='user-a'){await backendHandler(payload,user);return bankHost.responses.at(-1)},
  state:(user='user-a')=>buildState({importCortex:false},user),
  async reset(){bankHost.global.clear();bankHost.chats.clear();bankHost.responses=[];bankHost.chatId='chat-a';const config=cloneDefaultConfig();config.bindings['character:entity-a']={kind:'character',targetId:'entity-a',name:'Ada',aliases:[],color:'#112233',channels:safeChannels(null,'#112233'),source:'manual',pinned:true};await saveConfig('chat-a',config);return buildState({importCortex:false},'user-a')},
  async request(entry,action,channels){return this.send({type:'ldc_color_bank_mutate',chatId:bankHost.chatId,scope:entry.scope,key:entry.key,expected:JSON.stringify(entry),action,channels})},
  functions:{safeChannels,loadGlobalState,loadConfig,safeGlobalState,safeConfig,colorBankEntries,seedBindingsFromLibrary,syncBindingsToLibrary,importCortexRegistry,importTranscriptRegistry,saveBinding}
};
globalThis.bankFixture=bankFixture;
`;

const context = vm.createContext({ console, setTimeout, clearTimeout, structuredClone });
vm.runInContext(colorBankFixture, context);
const fixture = context.bankFixture;
let state = await fixture.reset();
const library = state.colorBank.find(row => row.scope === 'library');
assert.equal(library.keys.length, 3, 'Card, Cortex and name keys are grouped');
assert.equal(state.colorBank.length, 2);
const paints = fixture.functions.safeChannels({
  dialogue: { enabled: true, paint: { mode: 'gradient', stops: ['#445566', '#778899', '#AABBCC'], angle: 135 } },
  thought: { enabled: true, linkedToDialogue: false, paint: { mode: 'solid', stops: ['#DDEEFF'], angle: 90 } },
}, '#445566');
let response = await fixture.request(library, 'edit', paints);
assert.equal(response.type, 'ldc_state');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'library').color, '#445566');
assert.equal(state.colorBank.find(row => row.scope === 'chat').color, '#112233');
assert.equal(state.colorBank.find(row => row.scope === 'library').channels.dialogue.paint.stops.length, 3);
response = await fixture.request(library, 'delete');
assert.equal(response.type, 'ldc_error', 'Stale entry refuses mutation');
const stored = JSON.stringify([...fixture.host.global]);
response = await fixture.request(state.colorBank.find(row => row.scope === 'library'), 'edit', {dialogue:{paint:{stops:['invalid'],angle:0}}});
assert.equal(response.type, 'ldc_error');
assert.equal(JSON.stringify([...fixture.host.global]), stored, 'Invalid colors never reach storage');

fixture.host.chatId = 'chat-b';
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'chat').color, '#445566', 'New chats seed edited library paint');
fixture.host.chatId = 'chat-a';
state = await fixture.state();
response = await fixture.request(state.colorBank.find(row => row.scope === 'chat'), 'edit', paints);
assert.equal(response.state.colorBank.find(row => row.scope === 'chat').color, '#445566');

// Current-chat edits must not change even an ordinary, unmanaged library row.
state = await fixture.reset();
response = await fixture.request(state.colorBank.find(row => row.scope === 'chat'), 'edit', paints);
assert.equal(response.state.colorBank.find(row => row.scope === 'library').color, '#112233');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'chat').color, '#445566');
assert.equal(state.colorBank.find(row => row.scope === 'library').color, '#112233');
response = await fixture.request(state.colorBank.find(row => row.scope === 'chat'), 'delete');
assert.ok(!response.state.colorBank.some(row => row.scope === 'chat'));
assert.equal(response.state.characters.length, 1, 'Deleting color preserves roster');
state = await fixture.state();
assert.ok(!state.colorBank.some(row => row.scope === 'chat'), 'Opening palette does not reseed deleted chat color');
const imported = await fixture.functions.importCortexRegistry({id:'chat-a',character_id:'card-a'}, {id:'card-a'}, state.characters, state.config, 'user-a');
assert.equal(imported.imported, 0, 'Cortex respects a deleted chat color');
assert.equal(Object.keys(imported.config.bindings).length, 0);
const transcript = await fixture.functions.importTranscriptRegistry({id:'chat-a'},state.characters,state.config,'user-a');
assert.equal(transcript.detected,1);
assert.equal(transcript.imported,0,'Transcript scanning respects a deleted chat color');
await fixture.functions.saveBinding({chatId:'chat-a',kind:'character',targetId:'entity-a',name:'Ada',aliases:[],color:'#ABCDEF'},'user-a');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'chat').color, '#ABCDEF', 'Explicit roster save restores a chat color');
assert.equal(state.config.colorBankExcludedNames.length, 0);

response = await fixture.request(state.colorBank.find(row => row.scope === 'library'), 'delete');
assert.equal(response.type, 'ldc_state');
state = await fixture.state();
assert.ok(!state.colorBank.some(row => row.scope === 'library'), 'Deleted linked library keys stay deleted');
assert.equal(state.colorBank.find(row => row.scope === 'chat').color, '#ABCDEF');
const savedGlobal = await fixture.functions.loadGlobalState('user-a');
const migratedConfig = fixture.functions.safeConfig(state.config);
const migratedBinding = Object.values(migratedConfig.bindings)[0];
migratedBinding.targetId='new-entity';
assert.equal(fixture.functions.syncBindingsToLibrary(migratedConfig,[{id:'new-entity',entityId:'new-entity',characterId:'card-a',name:'Ada'}],null,savedGlobal),false,'New Cortex keys cannot recreate a deleted library identity');
assert.equal(Object.keys(savedGlobal.library).length,0);
fixture.host.chatId = 'chat-c';
state = await fixture.state();
assert.equal(state.colorBank.length, 0, 'A fresh chat cannot seed deleted library keys');
assert.equal((await fixture.state('other-user')).colorBank.length, 0, 'Library is operator scoped');
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',scope:'library',key:library.key,action:'delete'});
assert.equal(response.type, 'ldc_error', 'Chat switch rejects stale requests');
assert.equal(fixture.host.messages[0].content, '<font color="#112233">Unchanged</font>');
console.log('Passed Color Bank scopes, linked keys, gradient persistence, stale/invalid edits, deletion sync, roster recovery, operator isolation, and unchanged transcript.');
