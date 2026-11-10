import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Use the existing diagnostics Playwright installation via PLAYWRIGHT_MODULE.
const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
let source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const anchor = '  reload();';
assert.equal(source.split(anchor).length - 1, 1);
source = source.replace(anchor, '  window.prismTest={acceptState,processMounted};\n' + anchor);
const frontend = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText.replace('export function setup', 'function setup');
// The supplied display regex's replacement, with generic sample text only.
const footnote = (await fs.readFile(new URL('./fixtures/native-popover.html', import.meta.url), 'utf8')).trim();
const browserName = process.env.PRISM_BROWSER || 'chromium';
const browser = await playwright[browserName].launch({ headless: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>
      :root{--app-interactive-safe-top:${viewport.width < 600 ? 59 : 0}px;--lumiverse-primary:#b58cff;--lumiverse-text:#eee}
      body{margin:12px;padding-top:var(--app-interactive-safe-top);background:#111;color:#eee}
      </style><article id="assistant" data-part="character"><div data-component="MessageContent"><p>Ada said, "Below ${footnote} degrees."</p></div></article>
      <article id="user" data-part="user"><div data-component="MessageContent"><font color="#112233">A whole persona message.
      <button type="button" popovertarget="secondary">Open details</button><span id="secondary" popover style="background:linear-gradient(#222,#444);color:#eeeeee;padding:20px">
      <em>Italic note</em> 'Single-quoted note' "Quoted note" <font color="#112233">Canonical note</font>
      <span style="color:#112233">Inline note</span> &lt;font color="#112233"&gt;Escaped note&lt;/font&gt;
      <button type="button" popovertarget="secondary" popovertargetaction="hide">Close details</button></span></font></div></article>`);
    // Capture actual browser styles, including every decorative layer and SVG.
    await page.evaluate(() => {
      window.popoverSnapshot = () => [...document.querySelectorAll('[popover],[popover] *')].map(el => {
        const s = getComputedStyle(el);
        return [el.outerHTML, ...['color','webkitTextFillColor','backgroundImage','backgroundClip','fontFamily','fontSize','fontStyle','borderColor','display'].map(key => s[key])];
      });
      window.beforePopover = popoverSnapshot();
    });
    await page.addScriptTag({ content: `
      const channels={dialogue:{enabled:true,paint:{mode:'gradient',stops:['#112233','#ff9900'],angle:90,anchor:'#112233'}},thought:{enabled:true,linkedToDialogue:false,paint:{mode:'solid',stops:['#cc33aa'],anchor:'#112233'}}};
      const binding={kind:'persona',name:'Ada',targetId:'p',speakerUid:'speaker-p',color:'#112233',channels};
      let fixtureState={ok:true,chat:{id:'chat'},characters:[{id:'a',name:'Ada',binding:{...binding,kind:'character'}}],persona:{id:'p',name:'Ada',binding},config:{engine:'hybrid',personaEnabled:true,autoUserMode:'whole',overrides:{}},preferences:{prismEnabled:true,thoughtDetection:'italics-and-single-quotes',existingStylePolicy:'overlay'},reviewGroups:[]};
      let listener,menus=0;const events=new Map();
      const ctx={dom:{addStyle(css){const el=document.createElement('style');el.textContent=css;document.head.append(el);return()=>el.remove()},listMessageElements:()=>['user','assistant'].map(messageId=>({messageId,element:document.getElementById(messageId)})),cleanup(){}},
        messages:{getLatestMessageId:()=> 'assistant'},events:{on(name,fn){events.set(name,fn);return()=>events.delete(name)}},onBackendMessage(fn){listener=fn;return()=>listener=null},sendToBackend(payload){setTimeout(()=>listener?.({requestId:payload.requestId,type:'ldc_state',state:structuredClone(fixtureState)}),0)},
        ui:{registerInputBarAction(){return{onClick(){return()=>{}},destroy(){}}},showContextMenu:async()=>{menus++;return{}},showConfirm:async()=>({confirmed:false})}};
      ${frontend}
      window.fixture={state:fixtureState,events,get menus(){return menus},load(){this.unload=setup(ctx)}};fixture.load();
    ` });
    await page.waitForFunction(() => document.querySelector('#user [data-component=MessageContent]')?.dataset.prismPaint === 'gradient');
    assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover), 'Prism must preserve popover DOM, colors, typography and decorative backgrounds');
    assert.ok(await page.locator('#assistant .ldc-dom-dialogue').count(), await page.locator('#assistant').innerHTML());
    assert.equal(await page.locator('[popover] .ldc-prism-segment,[popover].ldc-prism-segment').count(), 0);

    const trigger = page.getByRole('button', { name: 'forty-two', exact: true });
    const note = page.getByRole('note', { name: 'Note footnote' });
    await trigger.click();
    await assert.doesNotReject(() => note.waitFor({ state: 'visible' }));
    const noteAppearance = await note.locator('[aria-label="Footnote text"]').evaluate(el => ({ color:getComputedStyle(el).color, fill:getComputedStyle(el).webkitTextFillColor }));
    assert.deepEqual(noteAppearance, { color:'rgb(228, 224, 233)', fill:'rgb(228, 224, 233)' });
    if (viewport.width < 600) {
      assert.equal(await note.evaluate(el => {
        const close=el.querySelector('[aria-label="Close footnote"]').getBoundingClientRect();
        const safeTop=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-interactive-safe-top'));
        return close.top >= safeTop && close.bottom <= innerHeight && close.right <= innerWidth;
      }), true, 'The notched mobile fixture keeps the close control in the safe viewport');
    }
    if (process.env.PRISM_SCREENSHOT_DIR) {
      await page.screenshot({ path: `${process.env.PRISM_SCREENSHOT_DIR}/prism-popover-${browserName}-${viewport.width}.png` });
    }
    await page.getByRole('button', { name: 'Close footnote', exact: true }).click();
    await note.waitFor({ state: 'hidden' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await note.waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => fixture.menus), 0, 'Native button keyboard activation must not open Prism teaching');
    await page.keyboard.press('Escape');
    await note.waitFor({ state: 'hidden' });
    assert.equal(await trigger.evaluate(el => document.activeElement === el), true);

    // Ancestor font overlays, whole-persona paint, all engines, streaming,
    // repeated processing and disabled state must respect the same boundary.
    for (const engine of ['dom', 'hybrid', 'llm']) for (const mode of ['solid', 'gradient']) {
      await page.evaluate(({ engine, mode }) => {
        fixture.state.config.engine=engine;
        fixture.state.persona.binding.channels.dialogue.paint.mode=mode;
        const content=document.querySelector('#assistant [data-component=MessageContent]');
        if (!content.querySelector('font')) { const font=document.createElement('font');font.color='#112233';font.append(...content.childNodes);content.append(font); }
        prismTest.acceptState(structuredClone(fixture.state));prismTest.processMounted(true);
      }, { engine, mode });
      assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover), `${engine}/${mode}`);
      assert.ok(await page.locator('#assistant font.ldc-prism-paint').count(), 'Portable speaker wrappers around popovers remain enhanced');
      await page.evaluate(() => fixture.events.get('GENERATION_STARTED')({ messageId:'user' }));
      assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover), 'Streaming fill must not leak into popovers');
      await page.evaluate(() => fixture.events.get('GENERATION_STOPPED')({ messageId:'user' }));
    }
    // View replacement is repainted on the host's actual message events.
    await page.evaluate(() => {
      const content=document.querySelector('#assistant [data-component=MessageContent]');
      const replacement=content.cloneNode(true);content.replaceWith(replacement);
      fixture.events.get('MESSAGE_EDITED')({messageId:'assistant'});
    });
    await page.waitForTimeout(120);
    assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover));
    await page.evaluate(() => {fixture.state.preferences.prismEnabled=false;prismTest.acceptState(structuredClone(fixture.state));prismTest.processMounted(true)});
    assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover));
    await page.evaluate(() => fixture.unload());
    assert.equal(await page.locator('.ldc-prism-paint,.ldc-prism-segment').count(), 0);
    assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover));
    await page.evaluate(() => {fixture.state.preferences.prismEnabled=true;fixture.load()});
    await page.waitForFunction(() => document.querySelector('#user [data-component=MessageContent]')?.dataset.prismPaint === 'gradient');
    assert.deepEqual(await page.evaluate(() => popoverSnapshot()), await page.evaluate(() => beforePopover));
    await page.getByRole('button', { name: 'Open details', exact: true }).click();
    await page.getByRole('button', { name: 'Close details', exact: true }).click();
    assert.equal(await page.evaluate(() => fixture.menus), 0);
    assert.deepEqual(errors, []);
    console.log(`Passed ${browserName} native popover styling, pointer/keyboard controls and Prism lifecycle at ${viewport.width}x${viewport.height}.`);
    await page.close();
  }
} finally { await browser.close(); }
