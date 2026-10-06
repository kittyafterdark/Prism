import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source=await fs.readFile(new URL('../src/frontend.ts',import.meta.url),'utf8');
const ast=ts.createSourceFile('frontend.ts',source,ts.ScriptTarget.Latest,true),functions=new Map();let viewportHandler;
function visit(node){if(ts.isFunctionDeclaration(node)&&node.name)functions.set(node.name.text,node.getText(ast));if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='onViewportChange')viewportHandler=node.initializer.getText(ast);ts.forEachChild(node,visit)}visit(ast);
const context=vm.createContext({Math,Set,Object});
vm.runInContext(`
let prefs={modalSize:'auto',modalExpanded:false,modalLayout:'accessibility'},patches=[],reopens=0;
const window={innerWidth:1280,innerHeight:800,visualViewport:{width:390,height:180,offsetTop:250,offsetLeft:24}};
const document={documentElement:{clientWidth:1280,clientHeight:800}};
function uiPreferences(){return prefs}
function resolvedModalLayout(){return prefs.modalLayout==='accessibility'?'tabs':prefs.modalLayout==='auto'?'tabs':prefs.modalLayout}
async function saveUiPreferences(patch){patches.push(patch);Object.assign(prefs,patch)}
async function reopenPalette(){reopens++}
function root(cls){const values={};return {values,classList:{contains:name=>name===cls},style:{setProperty:(name,value)=>values[name]=value}}}
let fullscreenOverlay=root('ldc-fullscreen-root'),modal={root:fullscreenOverlay,backdrop:root('ldc-main-portal-backdrop')};
${['visibleViewportHeight','visibleViewportWidth','syncFullscreenViewport','modalDimensions','togglePrismWindow'].map(name=>functions.get(name)).join('\n')}
`,context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('visibleViewportHeight()'),180);
assert.equal(run('visibleViewportWidth()'),390);
run('syncFullscreenViewport()');
for(const name of ['fullscreenOverlay','modal.backdrop']){
  assert.equal(run(`${name}.values['--prism-viewport-height']`),'180px');
  assert.equal(run(`${name}.values['--prism-viewport-width']`),'390px');
  assert.equal(run(`${name}.values['--prism-viewport-top']`),'250px');
  assert.equal(run(`${name}.values['--prism-viewport-left']`),'24px');
}
for(const height of [160,260,600,900]){
  for(const width of [240,390,1280]){
    context.testHeight=height;context.testWidth=width;
    run('window.visualViewport.height=testHeight;window.visualViewport.width=testWidth');
    for(const layout of ['horizontal','split']){
      context.testLayout=layout;
      run('prefs.modalLayout=testLayout');
      const dimensions=run('modalDimensions()');
      assert.ok(dimensions.width<=width);
      assert.ok(dimensions.contentHeight<=height-20);
      assert.ok(dimensions.maxHeight<=height-16);
    }
  }
}
for(const layout of ['accessibility','auto']){
  context.testLayout=layout;
  run('prefs.modalLayout=testLayout;prefs.modalExpanded=false');
  await run('togglePrismWindow()');
  assert.equal(run('prefs.modalLayout'),'horizontal');
  assert.equal(run('prefs.modalExpanded'),false);
}
run('prefs.modalLayout="split";prefs.modalExpanded=false');
await run('togglePrismWindow()');
assert.equal(run('prefs.modalExpanded'),true);
await run('togglePrismWindow()');
assert.equal(run('prefs.modalExpanded'),false);
assert.equal(run('prefs.modalLayout'),'split');
assert.equal(run('reopens'),4);
// Layout changes must rebuild the host, rather than restyling the previous host.
const layoutHook=functions.get('wire').match(/modal\.root\.querySelector\('\[data-role=modal-layout\]'\)[^\n]+/)[0];
vm.runInContext(`let layoutChange;modal.root={querySelector:()=>({addEventListener:(_,callback)=>layoutChange=callback})};function perform(task){return task()};${layoutHook}`,context);
await run('layoutChange({target:{value:"accessibility"}})');
assert.equal(run('prefs.modalLayout'),'accessibility');
assert.equal(run('reopens'),5);
// Zoom/resize crossing the automatic fullscreen threshold also needs a new host.
vm.runInContext(`const viewportChange=${viewportHandler};`,context);
run('prefs.modalLayout="accessibility";fullscreenOverlay=null;modal={root:{}};viewportChange()');
assert.equal(run('reopens'),6);
run('prefs.modalLayout="horizontal";fullscreenOverlay=modal.root;viewportChange()');
assert.equal(run('reopens'),7);
console.log('Passed fullscreen restore, layout host recreation, tiny viewports, and viewport offset updates.');
