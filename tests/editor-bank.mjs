import assert from 'node:assert/strict';
import vm from 'node:vm';
import { colorBankFixture } from './color-bank.mjs';

const context = vm.createContext({ console, setTimeout, clearTimeout, structuredClone });
vm.runInContext(colorBankFixture, context);
const fixture = context.bankFixture;
const run = code => vm.runInContext(code, context);
let state = await fixture.reset();
const key = 'character:entity-a';
const command = (state, action, saved) => ({
  type: 'ldc_editor_color_bank', chatId: fixture.host.chatId, action,
  bindingKey: key, expectedBinding: JSON.stringify(state.config.bindings[key]),
  ...(saved ? { savedKey: saved.key, expectedSaved: JSON.stringify(saved) } : {}),
});
const radial = fixture.functions.safeChannels({
  dialogue: { enabled: true, paint: { mode: 'gradient', type: 'radial', stops: ['#445566', '#778899'], angle: 135 } },
  thought: { enabled: true, linkedToDialogue: false, paint: { mode: 'gradient', stops: ['#AABBCC', '#DDEEFF'], angle: 40 } },
}, '#445566');
await fixture.functions.saveBinding({ chatId: 'chat-a', kind: 'character', targetId: 'entity-a', name: 'Ada', channels: radial }, 'user-a');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'library').color, '#112233', 'Normal editor saves preserve the existing base');
assert.equal(state.characters[0].binding.channels.dialogue.paint.type, 'radial');
const stale = command(state, 'save');
stale.expectedBinding = 'stale';
const before = JSON.stringify([...fixture.host.global]);
assert.equal((await fixture.send(stale)).type, 'ldc_error');
assert.equal(JSON.stringify([...fixture.host.global]), before, 'Stale editor state fails before bank writes');
let response = await fixture.send(command(state, 'save'));
assert.equal(response.type, 'ldc_state');
state = response.state;
const saved = state.colorBank.find(row => row.scope === 'library');
assert.equal(saved.color, '#445566');
assert.equal(saved.channels.dialogue.paint.type, 'radial', 'Explicit bank save keeps geometry');
fixture.host.chatId = 'new-chat';
state = await run(`buildState({importCortex:true}, 'user-a')`);
assert.equal(state.characters[0].binding.color, '#445566', 'Bank seeds before Cortex macro imports');
assert.equal(state.characters[0].binding.channels.dialogue.paint.type, 'radial');
await fixture.functions.saveBinding({ chatId: 'new-chat', kind: 'character', targetId: 'entity-a', name: 'Ada', color: '#ABCDEF' }, 'user-a');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'library').color, '#445566');
response = await fixture.send(command(state, 'use', state.colorBank.find(row => row.scope === 'library')));
assert.equal(response.type, 'ldc_state');
assert.equal(response.state.characters[0].binding.color, '#445566');
assert.equal(response.state.characters[0].binding.channels.dialogue.paint.type, 'radial');
assert.equal(response.state.characters[0].binding.channels.thought.paint.angle, 40);
assert.ok(response.state.characters[0].binding.previousColors.includes('#ABCDEF'));
assert.equal(response.state.colorBank.find(row => row.scope === 'library').color, '#445566');

// Choosing a banked identity replaces a generated scene name while preserving
// stable attribution IDs, prior names and manual corrections.
await run(`(async()=>{
  const global = await loadGlobalState('user-a');
  global.library['character-name:ada-lovelace'] = {name:'Ada Lovelace',aliases:['Countess'],color:'#123456',channels:safeChannels(null,'#123456'),source:'manual',pinned:true};
  await saveGlobalState(global,'user-a');
})()`);
state = await fixture.state();
const version = state.colorBank.find(row => row.name === 'Ada Lovelace');
const uid = state.characters[0].binding.speakerUid;
response = await fixture.send(command(state, 'use', version));
assert.equal(response.type, 'ldc_state');
assert.equal(response.state.characters.length, 1);
assert.equal(response.state.characters[0].name, 'Ada Lovelace');
assert.equal(response.state.characters[0].binding.speakerUid, uid);
assert.ok(response.state.characters[0].binding.aliases.includes('Ada'));
assert.ok(response.state.characters[0].binding.aliases.includes('Countess'));
assert.equal((await fixture.state()).characters[0].name, 'Ada Lovelace', 'Identity choice survives reopening');
assert.equal(fixture.host.messages[0].content, '<font color="#112233">Unchanged</font>');
fixture.host.chatId = 'elsewhere';
assert.equal((await fixture.send(command(response.state, 'save'))).type, 'ldc_error', 'Switched-chat assignments cannot be used');

await fixture.reset();
fixture.host.persona = { id: 'persona-one', name: 'Persona One' };
await fixture.functions.saveBinding({ kind: 'persona', targetId: 'persona-one', name: 'Persona One', color: '#112233' }, 'user-a');
await fixture.functions.saveBinding({ kind: 'persona', targetId: 'persona-one', name: 'Persona One', channels: radial }, 'user-a');
state = await fixture.state();
assert.equal(state.colorBank.find(row => row.scope === 'library' && row.kind === 'persona').color, '#112233');
response = await fixture.send({ type: 'ldc_editor_color_bank', chatId: fixture.host.chatId, action: 'save', bindingKey: 'persona:persona-one', expectedBinding: JSON.stringify(state.config.bindings['persona:persona-one']) });
assert.equal(response.type, 'ldc_state');
fixture.host.chatId = 'persona-next-chat';
state = await fixture.state();
assert.equal(state.persona.binding.color, '#445566', 'Persona bank save is shared across chats');
assert.equal(state.persona.binding.channels.dialogue.paint.type, 'radial');
const wrongKind = state.colorBank.find(row => row.scope === 'library' && row.kind === 'character');
response = await fixture.send({ type: 'ldc_editor_color_bank', chatId: fixture.host.chatId, action: 'use', bindingKey: 'persona:persona-one', expectedBinding: JSON.stringify(state.config.bindings['persona:persona-one']), savedKey: wrongKind.key, expectedSaved: JSON.stringify(wrongKind) });
assert.equal(response.type, 'ldc_error', 'Character versions cannot replace a persona assignment');
console.log('Passed editor bank save/use, stable bases, chat overrides, Cortex precedence, radial persistence, identity replacement, stale state and chat isolation.');
