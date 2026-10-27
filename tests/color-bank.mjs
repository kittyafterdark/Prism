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
  async seedMany(count=151,chatCount=1){const globalState=await loadGlobalState('user-a');for(let i=0;i<count-1;i++){const name='Guest '+String(i).padStart(3,'0');globalState.library['character-card:guest-'+i]={name,color:'#667788',channels:safeChannels(null,'#667788'),aliases:[],source:'manual',pinned:true,updatedAt:1}}await saveGlobalState(globalState,'user-a');if(chatCount>1){const config=await loadConfig(bankHost.chatId,'user-a');for(let i=1;i<chatCount;i++)config.bindings['character:extra-'+i]={kind:'character',targetId:'extra-'+i,name:'Chat guest '+i,color:'#667788',channels:safeChannels(null,'#667788'),source:'manual',pinned:true,colorBankLocal:true};await saveConfig(bankHost.chatId,config)}return buildState({importCortex:false},'user-a')},
  async seedDuplicates(){
    const globalState=await loadGlobalState('user-a');
    const channels={dialogue:{enabled:false,paint:{mode:'gradient',stops:['#445566','#778899','#AABBCC'],angle:135}},thought:{enabled:true,linkedToDialogue:false,paint:{mode:'solid',stops:['#DDEEFF'],angle:90}}};
    globalState.library['character-card:ada-other']={name:'Ada',color:'#445566',channels,aliases:['A'],source:'manual',pinned:true,updatedAt:2};
    globalState.library['character-card:ada-third']={name:'ADA',color:'#445566',channels:safeChannels(null,'#445566'),aliases:['Ada third'],source:'generated',pinned:false,updatedAt:3};
    globalState.library['persona:ada']={name:'Ada',color:'#778899',channels:safeChannels(null,'#778899'),aliases:[],source:'manual',pinned:true,updatedAt:2};
    globalState.library['persona:ada-alt']={name:'Ada',color:'#AABBCC',channels:safeChannels(null,'#AABBCC'),aliases:[],source:'manual',pinned:true,updatedAt:3};
    globalState.library['character-card:different']={name:'Different person',color:'#112233',channels:safeChannels(null,'#112233'),aliases:[],source:'manual',pinned:true,updatedAt:1};
    await saveGlobalState(globalState,'user-a');return buildState({importCortex:false},'user-a');
  },
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
state = await fixture.reset();
state = await fixture.seedMany(4);
const batch = state.colorBank.filter(row => row.scope === 'library' && row.name.startsWith('Guest')).slice(0,2);
const batchRequests = batch.map(entry=>({scope:entry.scope,key:entry.key,expected:JSON.stringify(entry)}));
const beforeBatch = JSON.stringify([...fixture.host.global]);
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',action:'delete',entries:[batchRequests[0],{...batchRequests[1],expected:'stale'}]});
assert.equal(response.type,'ldc_error');
assert.equal(JSON.stringify([...fixture.host.global]),beforeBatch,'A stale row prevents the entire batch before writes');
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',action:'delete',entries:[batchRequests[0],batchRequests[0]]});
assert.equal(response.type,'ldc_error','Duplicate batch entries are refused');
const chatEntry = state.colorBank.find(row=>row.scope==='chat');
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',action:'delete',entries:[batchRequests[0],{scope:'chat',key:chatEntry.key,expected:JSON.stringify(chatEntry)}]});
assert.equal(response.type,'ldc_error','Mixed scopes are refused');
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',action:'delete',entries:batchRequests});
assert.equal(response.type,'ldc_state');
assert.equal(response.state.colorBank.filter(row=>row.scope==='library').length,2);
assert.equal(response.state.colorBank.filter(row=>row.scope==='chat').length,1,'Bulk library deletion preserves current chat');
assert.equal((await fixture.state()).colorBank.filter(row=>row.scope==='library').length,2,'Bulk deletion persists');
await fixture.reset();
state = await fixture.seedMany(4,3);
const chatBatch = state.colorBank.filter(row=>row.scope==='chat').slice(0,2).map(entry=>({scope:entry.scope,key:entry.key,expected:JSON.stringify(entry)}));
response = await fixture.send({type:'ldc_color_bank_mutate',chatId:'chat-a',action:'delete',entries:chatBatch});
assert.equal(response.type,'ldc_state');
assert.equal(response.state.colorBank.filter(row=>row.scope==='chat').length,1);
assert.equal(response.state.colorBank.filter(row=>row.scope==='library').length,4,'Bulk chat deletion preserves the library');
assert.equal((await fixture.state()).colorBank.filter(row=>row.scope==='chat').length,1,'Deleted chat colors cannot reseed after batch deletion');
await fixture.reset();
state = await fixture.seedDuplicates();
assert.equal(state.colorBankDuplicates.length,2,'Name matches are separated by character/persona type');
const characterDuplicates=state.colorBankDuplicates.find(group=>group.kind==='character');
const personaDuplicates=state.colorBankDuplicates.find(group=>group.kind==='persona');
assert.equal(characterDuplicates.entries.length,3,'Case-normalized names with different paints/settings are reviewable');
assert.ok(characterDuplicates.entries.every(entry=>entry.name.toLowerCase()==='ada'),'A shared color alone is never considered a duplicate');
const keeper=characterDuplicates.entries.find(entry=>entry.key==='character-card:ada-other');
const choice={id:characterDuplicates.id,keepKey:keeper.key,expected:JSON.stringify(characterDuplicates)};
const duplicateBefore=JSON.stringify([...fixture.host.global]);
response=await fixture.send({type:'ldc_color_bank_dedupe',chatId:'chat-a',groups:[choice,{id:personaDuplicates.id,keepKey:personaDuplicates.entries[0].key,expected:'stale'}]});
assert.equal(response.type,'ldc_error');
assert.equal(JSON.stringify([...fixture.host.global]),duplicateBefore,'All groups, including preserved versions, validate before any writes');
response=await fixture.send({type:'ldc_color_bank_dedupe',chatId:'chat-a',groups:[{...choice,keepKey:personaDuplicates.entries[0].key}]});
assert.equal(response.type,'ldc_error','Cannot preserve a version outside its group');
response=await fixture.send({type:'ldc_color_bank_dedupe',chatId:'chat-a',groups:[choice]},'other-user');
assert.equal(response.type,'ldc_error','Cannot merge another operator’s saved library');
response=await fixture.send({type:'ldc_color_bank_dedupe',chatId:'chat-a',groups:[choice]});
assert.equal(response.type,'ldc_state');
const preserved=response.state.colorBank.find(entry=>entry.scope==='library'&&entry.kind==='character'&&entry.name==='Ada');
assert.equal(preserved.keys.length,5,'All identity keys now use the chosen version');
assert.deepEqual(JSON.parse(JSON.stringify(preserved.channels)),JSON.parse(JSON.stringify(keeper.channels)),'Full gradient, enabled and thought-link settings are preserved');
assert.equal(preserved.color,'#445566');
assert.ok(preserved.aliases.includes('A')&&preserved.aliases.includes('Ada third'));
assert.equal(response.state.colorBankDuplicates.length,1);
assert.equal(JSON.stringify(response.state.colorBankDuplicates[0]),JSON.stringify(personaDuplicates),'Unchosen groups remain byte-for-byte unchanged');
assert.equal(response.state.colorBank.find(entry=>entry.scope==='chat').color,'#112233','Existing chat assignment stays separate');
assert.equal((await fixture.state()).colorBankDuplicates.length,1,'Old chat syncing cannot undo consolidation');
fixture.host.chatId='chat-dedupe-new';
assert.equal((await fixture.state()).colorBank.find(entry=>entry.scope==='chat').color,'#445566','Fresh chats seed the selected version through preserved identity keys');
await fixture.reset();
state=await fixture.seedDuplicates();
const savedCharacter=state.colorBank.find(entry=>entry.key==='character-card:ada-other');
const libraryBeforeAdd=JSON.stringify([...fixture.host.global]);
response=await fixture.send({type:'ldc_add_character',chatId:'chat-a',name:savedCharacter.name,aliases:savedCharacter.aliases,savedLibraryKey:savedCharacter.key,savedLibraryExpected:JSON.stringify(savedCharacter),color:'#000000'});
assert.equal(response.type,'ldc_state');
assert.equal(response.state.characters.filter(character=>character.name.toLowerCase()==='ada').length,1,'Choosing a character already in the scene does not duplicate the roster');
const addedSaved=response.state.characters.find(character=>character.name==='Ada').binding;
assert.deepEqual(JSON.parse(JSON.stringify(addedSaved.channels)),JSON.parse(JSON.stringify(savedCharacter.channels)),'Saved gradients, thought linking and enabled flags autofill intact');
assert.equal(addedSaved.color,'#445566','The saved selection wins over an optional detected color');
assert.equal(JSON.stringify([...fixture.host.global]),libraryBeforeAdd,'Adding a saved version does not overwrite another library version');
const staleConfig=JSON.stringify([...fixture.host.chats]);
response=await fixture.send({type:'ldc_add_character',chatId:'chat-a',name:'Ada',savedLibraryKey:savedCharacter.key,savedLibraryExpected:'stale'});
assert.equal(response.type,'ldc_error');
assert.equal(JSON.stringify([...fixture.host.chats]),staleConfig,'Stale saved entries fail before modifying the roster');
response=await fixture.send({type:'ldc_add_character',chatId:'chat-a',name:'New name',savedLibraryKey:savedCharacter.key,savedLibraryExpected:JSON.stringify(savedCharacter)});
assert.equal(response.type,'ldc_error','Changing the name cannot silently retain a saved-character reference');
const savedPersona=state.colorBank.find(entry=>entry.scope==='library'&&entry.kind==='persona');
response=await fixture.send({type:'ldc_add_character',chatId:'chat-a',name:'Ada',savedLibraryKey:savedPersona.key,savedLibraryExpected:JSON.stringify(savedPersona)});
assert.equal(response.type,'ldc_error','Persona library entries are not character suggestions');
response=await fixture.send({type:'ldc_add_character',chatId:'chat-a',name:'New manual character',aliases:['Narrator'],color:'#ABCDEF'});
assert.equal(response.type,'ldc_state');
assert.equal(response.state.characters.find(character=>character.name==='New manual character').binding.color,'#ABCDEF','Manual detected-color additions remain supported');
console.log('Passed Color Bank scopes, linked keys, gradient persistence, stale/invalid edits, deletion sync, roster recovery, operator isolation, and unchanged transcript.');
