import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
let source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const anchor = '  reload();';
assert.equal(source.split(anchor).length - 1, 1);
source = source.replace(anchor, '  window.prismTest={acceptState,processMounted,setSaveStatus};\n' + anchor);
const frontend = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace('export function setup', 'function setup');
const browserName = process.env.PRISM_BROWSER || 'chromium';
const browser = await playwright[browserName].launch({ headless: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--app-interactive-safe-top:${viewport.width < 600 ? 59 : 0}px;--lumiverse-primary:#b58cff;--lumiverse-text:#eee}body{padding-top:var(--app-interactive-safe-top);background:#111;color:#eee}</style>
      <article id="user" data-part="user"><div data-component="MessageContent"><p><font color="#112233">Narration. <em>I should <strong>leave</strong>.</em> 'Not yet.' "Hello."</font></p></div></article>
      <article id="assistant" data-part="character"><div data-component="MessageContent"><p>Ada said, <font color="#112233">"Wait."</font></p><p>Ada thought, <i><font color="#112233">Perhaps tomorrow.</font></i></p></div></article>`);
    await page.addScriptTag({ content: `
      const channels={dialogue:{enabled:true,paint:{mode:'gradient',stops:['#112233','#445566'],angle:90,anchor:'#112233'}},thought:{enabled:true,linkedToDialogue:false,paint:{mode:'solid',stops:['#CC33AA'],anchor:'#112233'}}};
      const binding={kind:'persona',name:'Ada',targetId:'p',speakerUid:'speaker-p',color:'#112233',channels};
      let fixtureState={ok:true,chat:{id:'chat',name:'Fixture'},characters:[],persona:{id:'p',name:'Ada',binding},config:{engine:'hybrid',personaEnabled:true,personaInCast:true,autoUserMode:'whole',bindings:{'persona:p':binding},overrides:{}},preferences:{prismEnabled:true,thoughtDetection:'italics-and-single-quotes',existingStylePolicy:'overlay',mobileDoubleTap:true},reviewGroups:[],registry:{entries:[],conflicts:[]}};
      let listener,closedMenus=0;const events=new Map();
      const ctx={dom:{addStyle(css){const style=document.createElement('style');style.textContent=css;document.head.append(style);return()=>style.remove()},listMessageElements:()=>['user','assistant'].map(messageId=>({messageId,element:document.getElementById(messageId)})),cleanup(){}},
        events:{on(name,fn){events.set(name,fn);return()=>events.delete(name)}},
        onBackendMessage(fn){listener=fn;return()=>listener=null},sendToBackend(payload){setTimeout(()=>listener?.({requestId:payload.requestId,type:'ldc_state',state:structuredClone(fixtureState)}),0)},
        ui:{registerInputBarAction(){return{onClick(){return()=>{}},destroy(){}}},showContextMenu:async()=>{closedMenus++;return{}},showConfirm:async()=>({confirmed:false})}};
      ${frontend}
      window.fixture={get state(){return fixtureState},events,load(){this.unload=setup(ctx)},get menus(){return closedMenus}};window.fixture.load();
    ` });
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismKind === 'thought');
    assert.equal(await page.locator('#user em').evaluate(el => getComputedStyle(el).color), 'rgb(204, 51, 170)', await page.locator('#user').innerHTML());
    assert.equal(await page.locator('#user em').evaluate(el => getComputedStyle(el).webkitTextFillColor), 'rgb(204, 51, 170)');
    assert.equal(await page.locator('#user em strong').evaluate(el => getComputedStyle(el).webkitTextFillColor), 'rgb(204, 51, 170)');
    assert.equal(await page.locator('#user .ldc-dom-thought').evaluate(el => getComputedStyle(el).color), 'rgb(204, 51, 170)');
    assert.equal(await page.locator('#user [data-prism-kind="dialogue"]').evaluateAll(nodes => nodes.every(el => el.dataset.prismSpeaker === 'Ada')), true);
    assert.equal(await page.locator('#assistant [data-prism-kind="dialogue"]').getAttribute('data-prism-speaker'), 'Ada');
    assert.equal(await page.locator('#assistant [data-prism-kind="thought"]').evaluate(el => getComputedStyle(el).color), 'rgb(204, 51, 170)');
    // Existing keyboard teaching and stable ownership remain available.
    await page.locator('#user em').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => fixture.menus), 1);
    // Independent gradients also survive whole-message dialogue gradients.
    await page.evaluate(() => { fixture.state.persona.binding.channels.thought.paint={mode:'gradient',stops:['#CC33AA','#33CCAA'],angle:135,anchor:'#112233'}; prismTest.acceptState(structuredClone(fixture.state)); });
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismPaint === 'gradient');
    assert.match(await page.locator('#user em strong').evaluate(el => getComputedStyle(el).backgroundImage), /204, 51, 170/);
    await page.evaluate(() => { fixture.state.persona.binding.channels.thought.paint={mode:'solid',stops:['#CC33AA'],anchor:'#112233'}; prismTest.acceptState(structuredClone(fixture.state)); });
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismPaint === 'solid');
    // Repainting is idempotent and keeps separate thought paint in LLM mode.
    await page.evaluate(() => { fixture.state.config.engine='llm'; prismTest.acceptState(structuredClone(fixture.state)); });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#user em').getAttribute('data-prism-speaker'), 'Ada');
    assert.equal(await page.locator('#user em').evaluate(el => getComputedStyle(el).color), 'rgb(204, 51, 170)');
    await page.evaluate(() => { prismTest.setSaveStatus('pending'); fixture.state.persona={id:'b',name:'Bea',binding:{...fixture.state.persona.binding,targetId:'b',speakerUid:'speaker-b',name:'Bea'}}; fixture.events.get('SETTINGS_UPDATED')({key:'activePersonaId'}); });
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#user em').getAttribute('data-prism-speaker'), 'Ada');
    await page.evaluate(() => prismTest.setSaveStatus('saved'));
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismSpeaker === 'Bea');
    await page.evaluate(() => { fixture.state.persona.name='Bea Renamed'; fixture.events.get('PERSONA_CHANGED')({id:'b'}); });
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismSpeaker === 'Bea Renamed');
    // Unload restores the original portable markup, removes teaching handlers,
    // and unsubscribes persona updates; remount paints it again.
    await page.evaluate(() => fixture.unload());
    assert.equal(await page.locator('[data-prism-persona-wrapper],[data-prism-speaker],.ldc-prism-paint').count(), 0);
    assert.equal(await page.locator('#user font').getAttribute('color'), '#112233');
    assert.equal(await page.locator('#user em').getAttribute('tabindex'), null);
    assert.equal(await page.evaluate(() => fixture.events.size), 0);
    await page.evaluate(() => fixture.load());
    await page.waitForFunction(() => document.querySelector('#user em')?.dataset.prismSpeaker === 'Bea Renamed');
    assert.deepEqual(errors, []);
    console.log(`Passed ${browserName} persona whole-message gradient/thought separation, cast tags, keyboard teaching, persona switching, unload/remount at ${viewport.width}x${viewport.height}.`);
    await page.close();
  }
} finally { await browser.close(); }
