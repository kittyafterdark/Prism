import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('frontend.ts', source, ts.ScriptTarget.Latest, true);
const functions = new Map();
const constants = new Map();
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node);
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
const hooks = functions.get('wire').body.statements.filter(node => {
  const text = node.getText(ast);
  return /querySelector\('\[data-role=(persona-enabled|persona-in-cast|auto-mode)\]'\)/.test(text)
    || text.startsWith("modal.root.querySelectorAll('[data-action=save-now]')");
}).map(node => node.getText(ast)).join('\n');
assert.equal(hooks.split("addEventListener('change'").length - 1, 3);

// The real renderer, input reader, save pipeline and event hooks, with only the
// host request boundary replaced by controlled persistence. No personal state.
export const fixtureSource = `
const SAVE_ICON=${constants.get('SAVE_ICON')},TRASH_ICON=${constants.get('TRASH_ICON')},REVERSE_ICON=${constants.get('REVERSE_ICON')};
let state={chat:{id:'fixture'},config:{engine:'hybrid',autoUserMode:'quoted',personaEnabled:true,personaInCast:false},persona:{id:'persona',name:'Fixture persona',binding:{color:'#112233'}}};
let activeTab='persona',activeChannel='dialogue',activeEditorPage='paint',saveStatus='pending',saveGeneration=0,saveTimer,saveQueue=Promise.resolve(),busy=false;
let layout='split',showIndicator=true,requests=[],failRequest='',lastError='',markup='';
const controls={'hex':{value:'#445566'},'paint-mode':{value:'solid'},'channel-enabled':{checked:true},'persona-enabled':{checked:false},'persona-in-cast':{checked:true},'auto-mode':{value:'whole'}};
let modal={root:{querySelector:selector=>controls[selector.slice('[data-role='.length,-1)]}};
function uiPreferences(){return {showSaveIndicator:showIndicator}}
function resolvedModalLayout(){return layout}
function saveStatusLabel(){return saveStatus}
function setSaveStatus(status){saveStatus=status}
function current(){return {id:'character',name:'Fixture character',binding:{color:'#112233'}}}
function acceptState(next){state=next}
async function request(type,payload){requests.push({type,payload:structuredClone(payload)});await new Promise(resolve=>setTimeout(resolve,5));if(failRequest===type)throw new Error('Fixture save failed');const next=structuredClone(state);if(type==='ldc_save_binding'){const target=payload.kind==='persona'?next.persona:(next.character??={});target.binding={...payload};}else if(type==='ldc_update_options')Object.assign(next.config,payload);return {state:next}}
async function perform(task){if(busy)return;busy=true;try{await task()}catch(error){lastError=error.message;if(saveStatus==='saving')setSaveStatus('error')}finally{busy=false}}
function render(){markup=editorPanel(state.persona,true);if(typeof document!=='undefined'){document.getElementById('root').innerHTML=markup;modal={root:document.getElementById('root')};mountManualSaveActions(modal.root);${hooks}}}
${['normalizeHex','safePaint','paintSignature','bindingRegistryColor','safeChannels','paintAttrs','harmonicColor','esc','initials','sourceLabel','editorPanel','readEditorChannels','saveBinding','saveEditor','saveEditorNow','mountManualSaveActions'].map(name=>functions.get(name).getText(ast)).join('\n')}
`;
export const fixtureCss = vm.runInNewContext(constants.get('CSS'));
const context = vm.createContext({ structuredClone, setTimeout, clearTimeout });
vm.runInContext(fixtureSource, context);
const run = code => vm.runInContext(code, context);
for (const layout of ['split', 'tabs']) {
  for (const indicator of [false, true]) {
    context.testLayout = layout;
    context.testIndicator = indicator;
    run('layout=testLayout;showIndicator=testIndicator;render()');
    assert.equal(run('markup.split(\'data-action="save-now"\').length-1'), 1);
    assert.equal(run('markup.includes(\'data-action="remove-character"\')'), false);
  }
}
await run('saveEditorNow()');
assert.equal(run('requests[0].type'), 'ldc_save_binding');
assert.equal(run('requests[0].payload.kind'), 'persona');
assert.equal(run('state.persona.binding.color'), '#445566');
assert.equal(run('requests[1].type'), 'ldc_update_options');
assert.equal(run('state.config.autoUserMode'), 'whole');
assert.equal(run('state.config.personaEnabled'), false);
assert.equal(run('state.config.personaInCast'), true);
assert.equal(run('saveStatus'), 'saved');
// An older in-flight save must finish before the latest visible values are saved.
run(`requests=[];controls.hex.value='#778899';controls['auto-mode'].value='off';saveQueue=new Promise(resolve=>setTimeout(()=>{state.config.autoUserMode='quoted';resolve()},10));`);
await run('saveEditorNow()');
assert.equal(run('state.persona.binding.color'), '#778899');
assert.equal(run('state.config.autoUserMode'), 'off');
run(`requests=[];failRequest='ldc_save_binding'`);
await run('perform(saveEditorNow)');
assert.equal(run('saveStatus'), 'error');
assert.equal(run('requests.length'), 1);
run(`requests=[];failRequest='';activeTab='character'`);
await run('saveEditorNow()');
assert.equal(run('requests.length'), 1);
assert.equal(run('requests[0].payload.kind'), 'character');
console.log('Passed persona save visibility, ordered paint/options persistence, queued saves, errors, and character compatibility.');
