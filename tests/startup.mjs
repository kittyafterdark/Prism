import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source=await fs.readFile(new URL('../src/frontend.ts',import.meta.url),'utf8');
const ast=ts.createSourceFile('frontend.ts',source,ts.ScriptTarget.Latest,true),nodes=new Map();
function visit(node){
  if(ts.isFunctionDeclaration(node)&&node.name)nodes.set(node.name.text,node.getText(ast));
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer)nodes.set(node.name.text,`const ${node.getText(ast)};`);
  ts.forEachChild(node,visit);
}
visit(ast);
function fixture(){
  let now=0,id=0,listener,sendError=null;
  const timers=new Map(),sent=[];
  const context=vm.createContext({Map,Promise,Error,Object,performance:{now:()=>now},uid:()=>String(++id),
    setTimeout(fn,delay){const key=++id;timers.set(key,{fn,at:now+delay});return key},clearTimeout:key=>timers.delete(key),
    ctx:{sendToBackend(payload){if(sendError)throw sendError;sent.push(payload)},onBackendMessage(fn){listener=fn}},
  });
  vm.runInContext(`let disposed=false,stateLoadGeneration=0,stateLoadPromise=null,lastBackendError='',lastRoundtripMs=0;
    const pending=new Map(),retryWaits=new Map();
    ${['cancelled','request','cancelStateLoad','loadState','unsubBackend'].map(name=>nodes.get(name)).join('\n')}
    globalThis.api={loadState,request,cancelStateLoad,dispose(){disposed=true;cancelStateLoad();for(const task of pending.values()){clearTimeout(task.timer);task.reject(cancelled())}pending.clear()},pending,retryWaits};`,context);
  const flush=async()=>{for(let n=0;n<12;n++)await Promise.resolve()};
  return {api:context.api,sent,timers,flush,setSendError(error){sendError=error},reply(payload){listener(payload)},async advance(ms){now+=ms;for(const [key,timer]of [...timers])if(timer.at<=now){timers.delete(key);timer.fn()}await flush()}};
}
// A lost startup read recovers without a restart; concurrent opens share one load.
{
  const f=fixture(),p=f.api.loadState();assert.equal(f.api.loadState(),p);assert.equal(f.sent.length,1);
  await f.advance(15000);assert.equal(f.api.pending.size,0);await f.advance(500);assert.equal(f.sent.length,2);
  f.reply({requestId:f.sent[0].requestId,type:'ldc_state',state:{ok:true,chat:{id:'stale'}}});
  f.reply({requestId:f.sent[1].requestId,type:'ldc_state',state:{ok:true,chat:{id:'current'}}});
  assert.equal((await p).state.chat.id,'current');assert.equal(f.timers.size,0);
}
// Failed reads stop after three attempts rather than hammering a dead worker.
{
  const f=fixture(),failure=assert.rejects(f.api.loadState(),/backend did not answer/);
  await f.advance(15000);await f.advance(500);await f.advance(15000);await f.advance(1500);await f.advance(15000);
  await failure;assert.equal(f.sent.length,3);assert.equal(f.timers.size,0);
}
// Backend errors, mutations and explicit Cortex syncs are never replayed.
for(const mode of ['backend-error','mutation','sync']){
  const f=fixture(),p=mode==='mutation'?f.api.request('ldc_save_binding',{}):f.api.loadState(mode==='sync');
  const failure=assert.rejects(p);
  if(mode==='backend-error')f.reply({requestId:f.sent[0].requestId,type:'ldc_error',error:'Permission denied'});
  else await f.advance(mode==='sync'?60000:15000);
  await failure;await f.advance(100000);assert.equal(f.sent.length,1);assert.equal(f.timers.size,0);
}
// Throwing host sends leave no pending timer or request behind.
{
  const f=fixture();f.setSendError(new Error('Frontend inactive'));
  await assert.rejects(f.api.loadState(),/Frontend inactive/);assert.equal(f.api.pending.size,0);assert.equal(f.timers.size,0);
}
// Chat switching cancels a pending read and a retry wait, without clearing a new load.
for(const duringBackoff of [false,true]){
  const f=fixture(),old=assert.rejects(f.api.loadState(),{name:'AbortError'});
  if(duringBackoff)await f.advance(15000);
  f.api.cancelStateLoad();const next=f.api.loadState();await old;
  assert.equal(f.api.loadState(),next);
  f.reply({requestId:f.sent[0].requestId,type:'ldc_state',state:{ok:true,chat:{id:'old'}}});
  f.reply({requestId:f.sent.at(-1).requestId,type:'ldc_state',state:{ok:true,chat:{id:'new'}}});
  assert.equal((await next).state.chat.id,'new');assert.equal(f.timers.size,0);
}
// Unload cancels reads/backoff and blocks all subsequent sends, including saves.
for(const duringBackoff of [false,true]){
  const f=fixture(),old=assert.rejects(f.api.loadState(),{name:'AbortError'});
  if(duringBackoff)await f.advance(15000);
  f.api.dispose();await old;await f.advance(100000);
  await assert.rejects(f.api.loadState(),{name:'AbortError'});
  await assert.rejects(f.api.request('ldc_save_binding',{}),{name:'AbortError'});
  assert.equal(f.sent.length,1);assert.equal(f.timers.size,0);assert.equal(f.api.pending.size,0);
}
console.log('Passed startup retry bounds, lost/late replies, send failures, chat changes, and unload cancellation.');
