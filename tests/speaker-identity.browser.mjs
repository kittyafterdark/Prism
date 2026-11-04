import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { colorBankFixture } from './color-bank.mjs';

const playwright = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const frontend = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace('export function setup','function setup');
const host = `
(()=>{${colorBankFixture}})();
let openAction;const events=new Map(),errors=[],menus=[];
const ctx={
  dom:{addStyle(css){const node=document.createElement('style');node.textContent=css;document.head.append(node);return()=>node.remove()},listMessageElements:()=>[{messageId:'fixture-message',element:document.getElementById('message')}],inject(target,html){const node=document.createElement('div');node.innerHTML=html;target.append(node);return node},uninject(node){node.remove()},cleanup(){}},
  events:{on(name,fn){events.set(name,fn);return()=>events.delete(name)}},
  onBackendMessage(fn){bankFixture.connect(fn);return()=>bankFixture.connect(null)},sendToBackend(payload){void bankFixture.send(payload)},
  ui:{registerInputBarAction(){return{onClick(fn){openAction=fn;return()=>openAction=null},destroy(){}}},showConfirm:async options=>{errors.push(options.message);return{confirmed:false}},
    showContextMenu(options){menus.push(options.items);return new Promise(resolve=>{const menu=document.createElement('div');menu.className='fixture-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-label','Recolor segment');const finish=selectedKey=>{menu.remove();resolve({selectedKey})};for(const item of options.items){const button=document.createElement('button');button.textContent=item.label;button.disabled=!!item.disabled;button.dataset.key=item.key;if(item.active!=null)button.setAttribute('aria-pressed',String(item.active));button.onclick=()=>finish(item.key);menu.append(button)}menu.onkeydown=event=>{if(event.key==='Escape')finish(null)};document.body.append(menu);menu.querySelector('button:not(:disabled)').focus()})},
    showModal(options){const backdrop=document.createElement('div'),card=document.createElement('section'),root=document.createElement('div');backdrop.className='host-backdrop';card.className='host-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Prism');card.style.width=Math.min(options.width,innerWidth-40)+'px';card.style.maxHeight=options.maxHeight+'px';root.className='host-body';const close=document.createElement('button');close.setAttribute('aria-label','Close Prism');close.textContent='Close';card.append(close,root);backdrop.append(card);document.body.append(backdrop);const callbacks=new Set();let closed=false;const dismiss=()=>{if(closed)return;closed=true;backdrop.remove();callbacks.forEach(fn=>fn())};close.onclick=dismiss;return{root,dismiss,onDismiss(fn){callbacks.add(fn);return()=>callbacks.delete(fn)}}}
  }
};
${frontend}
globalThis.fixture={errors,menus,async load(){await bankFixture.reset();bankFixture.host.entities=[{id:'entity-a',type:'character',name:'Ada',aliases:[]},{id:'entity-b',type:'character',name:'Charles Babbage',aliases:[]}];const key='chat-a|lumi_dialogue_colors_v1',config=JSON.parse(bankFixture.host.chats.get(key)),ada=config.bindings['character:entity-a'];config.bindings['character:entity-b']={...ada,targetId:'entity-b',name:'Charles Babbage',aliases:[],legacyRefs:['entity-b'],color:'#445566',channels:bankFixture.functions.safeChannels(null,'#445566')};bankFixture.host.chats.set(key,JSON.stringify(config));this.mount()},mount(){this.unload=setup(ctx)},open:()=>openAction()};
`;

const browserName = process.env.PRISM_BROWSER || 'chromium';
const browser = await playwright[browserName].launch({headless:true});
try {
  for (const [width,height,notch] of [[1280,900,0],[390,844,59]]) {
    const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--lumiverse-ui-scale:1;--app-interactive-safe-top:${notch}px;--lumiverse-primary:#b58cff;--lumiverse-text:#eee;--lumiverse-text-muted:#ccc;--lumiverse-text-dim:#aaa;--lumiverse-border:#444;--lumiverse-bg:#111;--lumiverse-bg-elevated:#181820;--lumiverse-fill-subtle:#222;--lumiverse-fill:#222}*{box-sizing:border-box}body{margin:0;background:#09090b;color:#eee;font:14px sans-serif}#message{margin-top:calc(var(--app-interactive-safe-top) + 20px)}.host-backdrop{position:fixed;inset:0;display:grid;place-items:center;background:#0009}.host-card{display:flex;flex-direction:column;overflow:hidden;background:#111;color:#eee;border:1px solid #444;border-radius:12px}.host-body{padding:16px;overflow:auto;display:flex;flex-direction:column;min-height:0}.fixture-menu{position:fixed;inset:var(--app-interactive-safe-top) 10px auto;z-index:2147483647;display:flex;flex-direction:column;background:#111}.fixture-menu button{min-height:32px}</style><div id="root"><div class="chatToolbar"></div><article id="message" data-part="character"><div data-component="MessageContent"><p><font color="#445566">"Wait here."</font></p></div></article></div>`);
    await page.addScriptTag({content:host});
    await page.evaluate(()=>fixture.load());
    const segment=page.locator('#message [data-prism-speaker]');
    await page.waitForFunction(()=>document.querySelector('#message [data-prism-speaker]')?.dataset.prismSpeaker==='Charles Babbage');
    assert.doesNotMatch(await segment.getAttribute('title'),/claimed by multiple/);
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>fixture.open());
    const selected=page.locator('[data-character-id="entity-b"]');
    await selected.click();
    const heading=()=>page.locator('[data-character-id="entity-b"][data-active="true"] .ldc-person-name');
    await heading().waitFor();
    const thoughts=()=>page.getByRole('button',{name:'Thoughts',exact:true});
    await thoughts().press('Enter');
    await page.waitForFunction(()=>document.querySelector('[data-channel="thought"]')?.getAttribute('aria-pressed')==='true');
    await heading().waitFor();
    await page.getByRole('button',{name:'Dialogue',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('[data-channel="dialogue"]')?.getAttribute('aria-pressed')==='true');
    await heading().waitFor();
    await page.getByRole('checkbox',{name:'Enable dialogue paint',exact:true}).uncheck();
    await page.waitForFunction(async()=>(await bankFixture.state()).characters.find(c=>c.id==='entity-b').binding.channels.dialogue.enabled===false);
    await page.getByRole('checkbox',{name:'Enable dialogue paint',exact:true}).check();
    await page.waitForFunction(async()=>(await bankFixture.state()).characters.find(c=>c.id==='entity-b').binding.channels.dialogue.enabled===true);
    await heading().waitFor();
    const close=page.getByRole('button',{name:'Close Prism',exact:true});
    const closeBox=await close.boundingBox();
    assert.ok(closeBox.y>=notch&&closeBox.y+closeBox.height<=height,'Close stays within the safe viewport');
    await close.click();

    // The full frontend/backend/storage path must select exactly one speaker.
    if(width>600)await segment.click({button:'right'});
    else {
      // Let the queued paint from the last editor save settle before the gesture.
      await page.waitForTimeout(150);
      await segment.tap();
      await page.waitForFunction(()=>document.querySelector('#message .ldc-prism-tap-selected'));
      await segment.tap();
    }
    const menu=page.getByRole('dialog',{name:'Recolor segment',exact:true});
    await menu.waitFor();
    const speakerKeys=await page.evaluate(()=>fixture.menus.at(-1).filter(item=>item.key.startsWith('speaker:')).map(item=>item.key));
    assert.equal(new Set(speakerKeys).size,speakerKeys.length,'Speaker menu keys are unique');
    assert.equal(await menu.locator('button[aria-pressed="true"][data-key^="speaker:"]').count(),1);
    assert.equal(await menu.getByRole('button',{name:'Charles Babbage',exact:true}).getAttribute('aria-pressed'),'true');
    await menu.getByRole('button',{name:'Ada',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#message [data-prism-speaker]')?.dataset.prismSpeaker==='Ada');
    assert.equal(await segment.evaluate(el=>getComputedStyle(el).color),'rgb(17, 34, 51)');
    await segment.focus();await page.keyboard.press('Enter');
    await menu.waitFor();
    assert.equal(await menu.locator('button[aria-pressed="true"][data-key^="speaker:"]').count(),1);
    assert.equal(await menu.getByRole('button',{name:'Ada',exact:true}).getAttribute('aria-pressed'),'true');
    await menu.getByRole('button',{name:'Charles Babbage',exact:true}).press('Enter');
    await page.waitForFunction(()=>document.querySelector('#message [data-prism-speaker]')?.dataset.prismSpeaker==='Charles Babbage');
    assert.equal(await segment.evaluate(el=>getComputedStyle(el).color),'rgb(68, 85, 102)');
    await segment.focus();await page.keyboard.press('Enter');
    await menu.waitFor();
    assert.equal(await menu.locator('button[aria-pressed="true"][data-key^="speaker:"]').count(),1);
    await page.keyboard.press('Escape');
    await menu.waitFor({state:'detached'});

    await page.evaluate(()=>fixture.open());
    await heading().waitFor();
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    const saved=await page.evaluate(async()=>{const state=await bankFixture.state();return state.characters.map(c=>({id:c.id,uid:c.binding.speakerUid,color:c.binding.color,aliases:c.binding.aliases}))});
    assert.equal(new Set(saved.map(c=>c.uid)).size,2);
    assert.deepEqual(saved.map(c=>c.color),['#112233','#445566']);
    assert.deepEqual(saved.map(c=>c.aliases),[[],[]]);
    await page.evaluate(()=>fixture.unload());
    assert.equal(await page.locator('[data-prism-speaker]').count(),0);
    await page.evaluate(()=>fixture.mount());
    await page.waitForFunction(()=>document.querySelector('#message [data-prism-speaker]')?.dataset.prismSpeaker==='Charles Babbage');
    await page.evaluate(()=>fixture.open());
    await selected.click();await heading().waitFor();
    await thoughts().click();
    await page.waitForFunction(()=>document.querySelector('[data-channel="thought"]')?.getAttribute('aria-pressed')==='true');
    await heading().waitFor();
    assert.deepEqual(await page.evaluate(()=>fixture.errors),[]);
    assert.deepEqual(errors,[]);
    await page.evaluate(()=>fixture.unload());
    console.log('Passed '+browserName+' recovered speaker IDs, channel navigation, paint toggles, single menu selection, mouse/touch/keyboard correction, reopen and remount at '+width+'x'+height+'.');
    await page.close();
  }
} finally {await browser.close()}
