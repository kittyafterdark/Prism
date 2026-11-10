import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('frontend.ts', source, ts.ScriptTarget.Latest, true);
const functions = new Map();
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node.getText(ast));
  ts.forEachChild(node, visit);
}
visit(ast);
const context = vm.createContext({});
for (const name of ['normalizeHex', 'bindingRegistryColor', 'existingColorOwners', 'candidateForExistingColor', 'decorate']) {
  if (functions.has(name)) vm.runInContext(functions.get(name), context);
}
vm.runInContext(`
  let state={preferences:{}};
  function rememberClass(){}
  function mobileDoubleTapEnabled(){return true}
  function bindSegmentGestures(){}
  function evidenceLabel(source){return source}
  function candidate(name,color,previousColors=[],tentative=false){return {
    key:'character:'+name,name,color,paintable:true,tentative,
    binding:{color,previousColors,channels:{dialogue:{paint:{stops:[color],anchor:color}},thought:{paint:{anchor:color}}}}
  }}
  const ada=candidate('Ada','#112233'),charles=candidate('Charles','#445566',['#112233']);
  const list=[ada,charles];
  function inspect(color,candidates=list){
    const speaker=candidateForExistingColor(color,candidates);
    const element={dataset:{},classList:{contains:()=>false,add(){}},getAttribute:()=>null};
    decorate(element,{attribution:{speaker,source:speaker?'existing-color':'unresolved',confidence:speaker?1:0},existingColor:color,messageId:'fixture',segmentKey:'segment',kind:'dialogue'},candidates);
    return {speaker:speaker?.name||null,title:element.title,reason:element.dataset.prismUnresolvedReason||null};
  }
`, context);
const run = code => vm.runInContext(code, context);
assert.equal(run(`inspect('#112233').speaker`), 'Ada', 'A current owner must outrank another speaker’s historical color');
assert.doesNotMatch(run(`inspect('#112233').title`), /claimed by multiple/);
assert.equal(run(`inspect('#112233').reason`), null);
assert.equal(run(`inspect('#445566').speaker`), 'Charles');
assert.equal(run(`inspect('#112233',[charles]).speaker`), 'Charles', 'Unclaimed historical colors still resolve');
run(`const grace=candidate('Grace','#778899',['#112233']);`);
assert.equal(run(`inspect('#112233',[charles,grace]).speaker`), null);
assert.equal(run(`inspect('#112233',[charles,grace]).reason`), 'ambiguous-color');
assert.match(run(`inspect('#112233',[charles,grace]).title`), /claimed by multiple/);
run(`const shared=candidate('Shared','#112233');`);
assert.equal(run(`inspect('#112233',[ada,shared,charles]).speaker`), null, 'Two current owners remain ambiguous');
assert.equal(run(`inspect('#112233',[ada,shared,charles]).reason`), 'ambiguous-color');
// A pending observation cannot invalidate a confirmed assignment or its history.
run(`const tentative=candidate('Tentative','#112233',[],true);`);
assert.equal(run(`inspect('#112233',[ada,tentative]).speaker`), 'Ada');
assert.equal(run(`inspect('#112233',[charles,tentative]).speaker`), 'Charles');
assert.equal(run(`inspect('#112233',[tentative]).speaker`), 'Tentative');
assert.equal(run(`inspect('#bad-input').speaker`), null);
assert.equal(run(`inspect('#abcdef').reason`), 'speaker-not-found');
// Migration remnants such as old anchors are fallback evidence as well.
run(`charles.binding.channels.thought.paint.anchor='#112233';charles.binding.color='#112233';`);
assert.equal(run(`inspect('#112233').speaker`), 'Ada');
assert.equal(run(`inspect('#112233',list.toReversed()).speaker`), 'Ada', 'Roster order cannot decide ownership');
console.log('Passed current-versus-historical color ownership, true collisions, tentative evidence and warning consistency.');
