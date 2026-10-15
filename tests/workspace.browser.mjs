import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Runs the complete frontend setup against controlled public Spindle boundaries.
// PLAYWRIGHT_MODULE can reuse Lumiverse's diagnostics or the bundled runtime.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const source=await fs.readFile(new URL('../src/frontend.ts',import.meta.url),'utf8');
const frontend=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace('export function setup','function setup');
const host=`
let backendListener,openAction;const events=new Map(),requests=[];
const binding={kind:'character',name:'Gabrielle',targetId:'character',speakerUid:'prism-speaker-test',color:'#87B3CF',source:'library'};
let fixtureState={ok:true,chat:{id:'chat',name:'A deliberately long scene title to verify the footer stays contained at every viewport and UI scale'},characters:[{id:'character',name:'Gabrielle',aliases:[],status:'active',binding}],persona:{id:'persona',name:'Kitty',title:'Active persona',binding:{...binding,kind:'persona',name:'Kitty',targetId:'persona',speakerUid:'prism-speaker-persona'}},config:{engine:'hybrid',autoUserMode:'quoted',personaEnabled:true,personaInCast:false,bindings:{character:binding},overrides:{}},preferences:{modalLayout:'split',modalSize:'auto',modalScale:1,showSaveIndicator:true,prismEnabled:true},registry:{entries:[],conflicts:[]},cortexAvailable:true,pendingReviewCount:0};
const injections=new Set();
const ctx={
  dom:{addStyle(css){const el=document.createElement('style');el.textContent=css;document.head.append(el);return()=>el.remove()},listMessageElements:()=>[],inject(target,html){const el=document.createElement('div');el.innerHTML=html;target.append(el);injections.add(el);return el},uninject(el){el.remove();injections.delete(el)},cleanup(){for(const el of injections)el.remove()}},
  events:{on(name,fn){events.set(name,fn);return()=>events.delete(name)}},
  onBackendMessage(fn){backendListener=fn;return()=>backendListener=null},
  sendToBackend(payload){requests.push(payload);setTimeout(()=>{if(!backendListener)return;if(payload.type==='ldc_update_ui_preferences')Object.assign(fixtureState.preferences,payload);if(payload.type==='ldc_update_options')Object.assign(fixtureState.config,payload);if(payload.type==='ldc_save_binding'){const target=payload.kind==='persona'?fixtureState.persona:fixtureState.characters[0];target.binding={...target.binding,...payload}}backendListener({requestId:payload.requestId,type:'ldc_state',state:structuredClone(fixtureState),preferences:structuredClone(fixtureState.preferences)})},2)},
  ui:{registerInputBarAction(){return {onClick(fn){openAction=fn;return()=>openAction=null},destroy(){}}},showConfirm:async options=>{throw Error(options.message)},showModal(options){const backdrop=document.createElement('div'),card=document.createElement('section'),head=document.createElement('header'),root=document.createElement('div');backdrop.className='host-backdrop';card.className='host-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Prism');card.style.width=Math.min(options.width,innerWidth/Number(getComputedStyle(document.documentElement).getPropertyValue('--lumiverse-ui-scale'))-40)+'px';card.style.maxHeight=options.maxHeight+'px';head.innerHTML='<strong>Prism</strong><button aria-label="Close Prism">×</button>';root.className='host-body';card.append(head,root);backdrop.append(card);document.body.append(backdrop);const callbacks=new Set();let closed=false;const handle={root,dismiss(){if(closed)return;closed=true;backdrop.remove();callbacks.forEach(fn=>fn())},onDismiss(fn){callbacks.add(fn);return()=>callbacks.delete(fn)}};head.querySelector('button').onclick=handle.dismiss;return handle}}
};
${frontend}
window.fixture={requests,events,get state(){return fixtureState},open:()=>openAction(),unload:null,load(){this.unload=setup(ctx)},switchChat(){fixtureState.chat.id='second-chat';events.get('CHAT_SWITCHED')?.()}};
window.fixture.load();
`;
const browser=await chromium.launch({headless:true});
try{
  for(const [width,height,scale,notch] of [[1280,900,.67,0],[1280,900,1,0],[1280,900,1.25,0],[532,884,.67,0],[390,844,1,59],[844,390,.85,0]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--lumiverse-ui-scale:${scale};--app-interactive-safe-top:${notch/scale}px;--lumiverse-primary:#b58cff;--lumiverse-text:#eee;--lumiverse-text-muted:#ccc;--lumiverse-text-dim:#aaa;--lumiverse-border:#444;--lumiverse-bg:#111;--lumiverse-bg-elevated:#181820;--lumiverse-fill-subtle:#222}*{box-sizing:border-box}body{margin:0;background:#09090b;font:14px sans-serif;zoom:var(--lumiverse-ui-scale);width:calc(100vw / var(--lumiverse-ui-scale));height:calc(100vh / var(--lumiverse-ui-scale))}.host-backdrop{position:fixed;inset:0;width:calc(100vw / var(--lumiverse-ui-scale));height:calc(100vh / var(--lumiverse-ui-scale));display:grid;place-items:center;background:#0009}.host-card{display:flex;flex-direction:column;overflow:hidden;background:#111;color:#eee;border:1px solid #444;border-radius:12px}.host-card>header{display:flex;justify-content:space-between;flex:0 0 auto;padding:12px 16px}.host-body{padding:16px;overflow:auto;display:flex;flex-direction:column;min-height:0}.host-card button{font:inherit}</style><div id="root"><div class="chatToolbar"></div></div>`);
    assert.equal(await page.evaluate(()=>innerWidth),width);
    await page.addScriptTag({content:host});
    assert.deepEqual(errors,[]);
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>window.fixture.open());
    await page.getByRole('button',{name:'Persona',exact:true}).click();
    await page.getByRole('button',{name:'Save persona colors',exact:true}).waitFor();
    assert.equal(await page.locator('.ldc-side').count(),0);
    assert.equal(await page.locator('.ldc-persona-note').count(),0);
    assert.equal(await page.locator('.ldc-top [data-engine]').count(),0);
    assert.equal(await page.getByRole('button',{name:'Persona',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.getByLabel('Color stop 1',{exact:true}).getAttribute('type'),'color');
    assert.equal(await page.locator('.ldc-shell button').evaluateAll(buttons=>buttons.filter(button=>!button.textContent.trim()&&!button.getAttribute('aria-label')&&!button.getAttribute('title')).length),0);
    const order=await page.evaluate(()=>{
      const paint=document.querySelector('.ldc-editor-controls'),save=document.querySelector('.ldc-persona-save'),options=document.querySelector('.ldc-persona-options');
      const footer=document.querySelector('.ldc-status'),shell=document.querySelector('.ldc-shell');
      return {paintBeforeSave:!!(paint.compareDocumentPosition(save)&Node.DOCUMENT_POSITION_FOLLOWING),saveBeforeOptions:!!(save.compareDocumentPosition(options)&Node.DOCUMENT_POSITION_FOLLOWING),footerBottom:footer.getBoundingClientRect().bottom,shellBottom:shell.getBoundingClientRect().bottom,dialogBottom:shell.closest('[role=dialog]').getBoundingClientRect().bottom,footerWidth:footer.clientWidth,footerScrollWidth:footer.scrollWidth,scale:shell.dataset.prismEffectiveScale};
    });
    assert.equal(order.paintBeforeSave,true);assert.equal(order.saveBeforeOptions,true);assert.equal(Number(order.scale),scale);
    assert.ok(order.footerBottom<=order.shellBottom+1,'Footer is contained');
    assert.ok(order.footerBottom<=order.dialogBottom+1,'Footer fits inside host dialog');
    assert.ok(order.footerScrollWidth<=order.footerWidth+1,'Footer text wraps without horizontal clipping');
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:`${process.env.PRISM_SCREENSHOT_DIR}/persona-${width}-${scale}.png`})}
    await page.locator('[data-role=hex]').fill('#445566');
    await page.getByRole('button',{name:'Save persona colors',exact:true}).press('Enter');
    await page.waitForFunction(()=>window.fixture.state.persona.binding.color==='#445566');
    await page.getByText('Identity and attribution',{exact:true}).first().press('Enter');
    assert.equal(await page.locator('details.ldc-details').getAttribute('open'),'');
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    const engines=page.getByRole('group',{name:'Coloring engine',exact:true});
    assert.equal(await engines.count(),1);
    await engines.getByRole('button',{name:'Local',exact:true}).click();
    await page.waitForFunction(()=>window.fixture.state.config.engine==='dom');
    await page.waitForFunction(()=>document.querySelector('[data-engine=dom]')?.getAttribute('aria-pressed')==='true');
    await page.getByRole('button',{name:'Persona',exact:true}).click();
    assert.equal(await page.locator('[data-role=hex]').inputValue(),'#445566');
    // Remount using the actual layout selector, then check notch-safe controls.
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.locator('[data-role=modal-layout]').selectOption('accessibility');
    await page.getByRole('button',{name:'Restore Prism window',exact:true}).waitFor();
    await page.getByRole('button',{name:'Persona',exact:true}).click();
    await page.locator('[data-role=hex]').fill('#667788');
    await page.getByRole('button',{name:'Save persona colors',exact:true}).click();
    await page.waitForFunction(()=>window.fixture.state.persona.binding.color==='#667788');
    const editorPages=page.getByRole('group',{name:'Persona editor sections',exact:true});
    await editorPages.getByRole('button',{name:'Identity',exact:true}).click();
    assert.equal(await editorPages.getByRole('button',{name:'Identity',exact:true}).getAttribute('aria-pressed'),'true');
    const restore=await page.getByRole('button',{name:'Restore Prism window',exact:true}).boundingBox();
    assert.ok(restore.y>=notch-1,'Fullscreen actions respect canonical safe top');
    assert.ok(restore.x+restore.width<=width+1,'Fullscreen actions stay within viewport');
    await page.getByRole('button',{name:'Restore Prism window',exact:true}).click();
    await page.waitForFunction(()=>window.fixture.state.preferences.modalLayout==='horizontal');
    await page.evaluate(()=>window.fixture.unload());
    assert.equal(await page.locator('.ldc-shell').count(),0);
    assert.equal(await page.locator('[data-prism-toolbar-button]').count(),0);
    await page.evaluate(()=>window.fixture.load());
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>window.fixture.switchChat());
    await page.evaluate(()=>window.fixture.open());
    await page.getByRole('button',{name:'Persona',exact:true}).click();
    assert.equal(await page.locator('[data-role=hex]').inputValue(),'#667788');
    assert.deepEqual(errors,[]);
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:`${process.env.PRISM_SCREENSHOT_DIR}/prism-${width}-${scale}.png`})}
    console.log(`Passed complete Prism workspace at ${width}x${height}, scale ${scale}, safe top ${notch}: hierarchy, save, keyboard disclosure, engines, footer, layout remount, unload/reload, navigation.`);
    await page.close();
  }
}finally{await browser.close()}
