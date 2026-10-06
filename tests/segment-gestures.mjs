import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source=await fs.readFile(new URL('../src/frontend.ts',import.meta.url),'utf8');
const ast=ts.createSourceFile('frontend.ts',source,ts.ScriptTarget.Latest,true),functions=new Map();
function visit(node){if(ts.isFunctionDeclaration(node)&&node.name)functions.set(node.name.text,node.getText(ast));ts.forEachChild(node,visit)}
visit(ast);
export const gestureSource=['clearTouchSegment','clearTouchSegmentOutside','bindSegmentGestures'].map(name=>functions.get(name)).join('\n');
const context=vm.createContext({Math});
vm.runInContext(`
let touchSelectedSegment=null,longTimer,clock=0,opened=[],timer=null;
const Date={now:()=>clock},window={matchMedia:()=>({matches:false})};
function setTimeout(callback){timer=callback;return 1}
function clearTimeout(){timer=null}
function teach(event,detail,list){opened.push({detail,list});event.preventDefault();event.stopPropagation()}
function span(){const classes=new Set();return {classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)},contains:target=>target===this,closest:()=>null,classes}}
function event(target,type='touch',x=10,y=10){return {target,pointerType:type,pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,preventDefault(){this.prevented=true},stopPropagation(){}}}
${gestureSource}
const first=span(),second=span();first.contains=target=>target===first;second.contains=target=>target===second;
const info=()=>({messageId:'fixture',segmentKey:'quote',quote:'Hello'}),speakers=[{name:'Fixture speaker'}];
bindSegmentGestures(first,info,speakers);bindSegmentGestures(second,info,speakers);
function tap(span){const e=event(span);span.onpointerdown(e);span.onpointerup(e)}
`,context);
const run=code=>vm.runInContext(code,context);
run('tap(first)');
assert.equal(run('first.classes.has("ldc-prism-tap-selected")'),true);
assert.equal(run('opened.length'),0);
run('tap(first)');
assert.equal(run('opened.length'),1);
assert.equal(run('opened[0].detail.segmentKey'),'quote');
assert.equal(run('first.classes.size'),0);
run('tap(first);clearTouchSegmentOutside(event(second));tap(second)');
assert.equal(run('first.classes.size'),0);
assert.equal(run('second.classes.size'),1);
run('clearTouchSegment()'); // Scroll/extension unload use this same reset.
assert.equal(run('second.classes.size'),0);
run('first.onpointerdown(event(first));first.onpointermove(event(first,"touch",40));first.onpointerup(event(first,"touch",40))');
assert.equal(run('first.classes.size'),0);
assert.equal(run('opened.length'),1);
run('first.onpointerdown(event(first));first.onpointercancel();first.onpointerup(event(first))');
assert.equal(run('first.classes.size'),0);
run('first.onpointerdown(event(first));clock+=600;first.onpointerup(event(first))');
assert.equal(run('opened.length'),1);
assert.equal(run('first.classes.size'),0);
run('const native=event(first);first.oncontextmenu(native)');
assert.equal(run('native.prevented'),true);
assert.equal(run('opened.length'),1);
run('first.oncontextmenu(event(first,"mouse"))');
assert.equal(run('opened.length'),2);
run('const key=event(first,"keyboard");key.key="Enter";first.onkeydown(key)');
assert.equal(run('opened.length'),3);
run('first.onpointerdown(event(first,"mouse"));timer()');
assert.equal(run('opened.length'),4);
run('const linked=event({closest:()=>({})});first.onpointerdown(linked);first.onpointerup(linked)');
assert.equal(run('opened.length'),4);
// Detaching/repainting a selected segment clears highlight and all gesture hooks.
context.rememberClass=()=>{};
vm.runInContext(functions.get('cleanupPaint'),context);
run(`first.dataset={};first.getAttribute=()=>null;first.removeAttribute=()=>{};first.setAttribute=()=>{};tap(first);first.classList.add('ldc-prism-segment');cleanupPaint(first)`);
assert.equal(run('touchSelectedSegment'),null);
assert.equal(run('first.onpointermove'),null);
assert.equal(run('first.onpointerup'),null);
console.log('Passed two-tap recoloring, highlight resets, drag/cancel/hold rejection, native callout suppression, desktop/keyboard access, and repaint cleanup.');
