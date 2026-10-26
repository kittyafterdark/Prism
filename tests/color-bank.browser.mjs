import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { colorBankFixture } from './color-bank.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const source = await fs.readFile(new URL('../src/frontend.ts', import.meta.url), 'utf8');
const frontend = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace('export function setup','function setup');
const host = `
(()=>{${colorBankFixture}})();
let openAction;const fixtureEvents=new Map(),uiErrors=[];let copiedBank='';
Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{copiedBank=text}},configurable:true});
const ctx={
  dom:{addStyle(css){const node=document.createElement('style');node.textContent=css;document.head.append(node);return()=>node.remove()},listMessageElements:()=>[],inject(target,html){const node=document.createElement('div');node.innerHTML=html;target.append(node);return node},uninject(node){node.remove()},cleanup(){}},
  events:{on(name,fn){fixtureEvents.set(name,fn);return()=>fixtureEvents.delete(name)}},
  onBackendMessage(fn){bankFixture.connect(fn);return()=>bankFixture.connect(null)},sendToBackend(payload){void bankFixture.send(payload)},
  ui:{registerInputBarAction(){return{onClick(fn){openAction=fn;return()=>openAction=null},destroy(){}}},showConfirm:async options=>{uiErrors.push(options.message);return{confirmed:false}},showModal(options){const backdrop=document.createElement('div'),card=document.createElement('section'),root=document.createElement('div');backdrop.className='host-backdrop';card.className='host-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','Prism');card.style.width=Math.min(options.width,innerWidth-40)+'px';card.style.maxHeight=options.maxHeight+'px';root.className='host-body';const head=document.createElement('header'),close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Close Prism');close.textContent='×';head.append(close);close.onclick=()=>{if(closed)return;closed=true;backdrop.remove();callbacks.forEach(fn=>fn())};card.append(head,root);backdrop.append(card);document.body.append(backdrop);const callbacks=new Set();let closed=false;return{root,dismiss(){if(closed)return;closed=true;backdrop.remove();callbacks.forEach(fn=>fn())},onDismiss(fn){callbacks.add(fn);return()=>callbacks.delete(fn)}}}}
};
${frontend}
globalThis.uiFixture={async load(){await bankFixture.reset();this.unload=setup(ctx)},open:()=>openAction(),errors:uiErrors,get copied(){return copiedBank},switchChat(id){bankFixture.host.chatId=id;fixtureEvents.get('CHAT_SWITCHED')?.()}};
`;

const browser = await chromium.launch({headless:true});
try {
  for (const [width,height,notch] of [[1280,900,0],[390,844,59],[844,390,0]]) {
    const page=await browser.newPage({viewport:{width,height},hasTouch:width<600,isMobile:width<600});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--lumiverse-ui-scale:1;--app-interactive-safe-top:${notch}px;--lumiverse-primary:#b58cff;--lumiverse-text:#eee;--lumiverse-text-muted:#ccc;--lumiverse-text-dim:#aaa;--lumiverse-border:#444;--lumiverse-bg:#111;--lumiverse-bg-elevated:#181820;--lumiverse-fill-subtle:#222;--lumiverse-fill:#222}*{box-sizing:border-box}body{margin:0;background:#09090b;font:14px sans-serif}.host-backdrop{position:fixed;inset:0;display:grid;place-items:center;background:#0009}.host-card{display:flex;flex-direction:column;overflow:hidden;background:#111;color:#eee;border:1px solid #444;border-radius:12px}.host-body{padding:16px;overflow:auto;display:flex;flex-direction:column;min-height:0}</style><div id="root"><div class="chatToolbar"></div></div>`);
    await page.addScriptTag({content:host});
    await page.evaluate(()=>uiFixture.load());
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    const openBank=async()=>{await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Color Bank',exact:true}).click()};
    await openBank();
    const library=page.getByRole('article',{name:'Ada · Saved library',exact:true});
    const chat=page.getByRole('article',{name:'Ada · Current chat',exact:true});
    assert.equal(await page.getByRole('article').count(),1,'Current chat is the default instead of the combined library');
    assert.equal(await library.count(),0);
    await page.getByRole('button',{name:'All (2)',exact:true}).click();
    await library.waitFor();
    assert.equal(await page.getByRole('article').count(),2);
    const search=page.getByRole('searchbox',{name:'Search Color Bank'});
    await search.fill('nonexistent');
    assert.equal(await page.getByRole('article').count(),0);
    await page.getByText('No saved colors match this view.',{exact:true}).waitFor({state:'visible'});
    await search.fill('current chat');
    assert.equal(await page.getByRole('article').count(),1);
    await search.fill('');
    await page.getByRole('button',{name:'Copy Color Bank backup',exact:true}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(uiFixture.copied).entries.length),2);
    await library.getByText('Edit Ada · Saved library',{exact:true}).press('Enter');
    await library.getByLabel('Dialogue colors · one to three hex values, separated by commas',{exact:true}).fill('#445566, #778899, #AABBCC');
    await library.getByLabel('Dialogue gradient angle',{exact:true}).fill('135');
    await library.getByLabel('Link thoughts to dialogue colors',{exact:true}).uncheck();
    await library.getByLabel('Thought colors · one to three hex values, separated by commas',{exact:true}).fill('#DDEEFF');
    await library.getByLabel('Enable thought colors',{exact:true}).check();
    await library.getByRole('button',{name:'Save Ada · Saved library',exact:true}).press('Enter');
    await library.getByText('Dialogue · #445566 → #778899 → #AABBCC',{exact:true}).waitFor();
    await page.waitForFunction(()=>document.activeElement?.matches('[data-bank-detail=edit] summary'));
    await chat.getByText('Dialogue · #112233',{exact:true}).waitFor();
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/color-bank-filled-'+width+'.png'})}
    await library.getByRole('button',{name:'Delete Ada · Saved library',exact:true}).click();
    assert.equal(await library.getByRole('button',{name:'Keep color',exact:true}).evaluate(button=>button===document.activeElement),true);
    await library.getByRole('button',{name:'Keep color',exact:true}).press('Escape');
    assert.equal(await library.getByRole('button',{name:'Delete Ada · Saved library',exact:true}).evaluate(button=>button===document.activeElement),true,'Escape cancels deletion and restores focus');
    await library.getByRole('button',{name:'Delete Ada · Saved library',exact:true}).click();
    await library.getByRole('button',{name:'Delete saved color',exact:true}).press('Enter');
    await library.waitFor({state:'detached'});
    await chat.waitFor();
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    await page.evaluate(()=>uiFixture.open());
    await openBank();
    assert.equal(await library.count(),0,'Library deletion persists after close/reopen');
    await search.scrollIntoViewIfNeeded();
    const top=await search.boundingBox();
    assert.ok(top.y>=notch,'Search respects canonical safe top');
    if(width<720){const close=await page.getByRole('button',{name:'Close Prism',exact:true}).boundingBox();assert.ok(close.y>=notch,'Close control respects notch')}
    assert.ok(await page.locator('.ldc-settings-content').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Bank fits available width');
    await chat.getByRole('button',{name:'Delete Ada · Current chat',exact:true}).click();
    await chat.getByRole('button',{name:'Delete saved color',exact:true}).click();
    await chat.waitFor({state:'detached'});
    await page.getByText('No saved colors match this view.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Look & feel',exact:true}).click();
    await page.getByRole('button',{name:'Color Bank',exact:true}).click();
    assert.equal(await page.getByRole('article').count(),0);
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/color-bank-'+width+'.png'})}
    await page.evaluate(()=>{uiFixture.unload();uiFixture.unload=setup(ctx)});
    await page.evaluate(()=>uiFixture.open());
    await openBank();
    assert.equal(await page.getByRole('article').count(),0,'Deleted colors stay deleted after extension reload');
    await page.evaluate(()=>uiFixture.switchChat('chat-b'));
    await openBank();
    assert.equal(await page.getByRole('article').count(),0,'New chat does not inherit deleted colors');
    // A realistic bank catches scope leaks, layout failures and scroll jumps
    // which the two-entry fixture cannot expose.
    await page.evaluate(async()=>{uiFixture.unload();await bankFixture.reset();await bankFixture.seedMany(151);uiFixture.unload=setup(ctx)});
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    await openBank();
    assert.equal(await page.getByRole('article').count(),1,'151 library rows do not leak into Current chat');
    await page.getByRole('button',{name:'Saved library (151)',exact:true}).click();
    assert.equal(await page.getByRole('article').count(),151);
    const columns=await page.locator('[data-bank-list]').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(columns,width===1280?2:1,'Columns follow the available bank width');
    await page.getByRole('button',{name:'Select colors',exact:true}).click();
    const strip=page.getByRole('group',{name:'Color Bank bulk actions',exact:true});
    await strip.waitFor();
    await strip.getByRole('button',{name:'Select visible',exact:true}).click();
    await strip.getByText('151 selected',{exact:true}).waitFor();
    await strip.getByRole('button',{name:'Clear selection',exact:true}).click();
    assert.equal(await strip.getByRole('button',{name:'Delete selected',exact:true}).isDisabled(),true);
    await search.fill('Guest 08');
    await strip.getByRole('button',{name:'Select visible',exact:true}).click();
    await strip.getByText('10 selected',{exact:true}).waitFor();
    await strip.getByRole('button',{name:'Copy selected',exact:true}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(uiFixture.copied).entries.length),10);
    await search.fill('');
    await strip.getByText('0 selected',{exact:true}).waitFor();
    const guest=index=>page.getByRole('article',{name:'Guest '+index+' · Saved library',exact:true});
    await guest('060').getByRole('checkbox',{name:'Select Guest 060 · Saved library',exact:true}).check();
    await guest('061').getByRole('checkbox',{name:'Select Guest 061 · Saved library',exact:true}).check();
    await strip.getByText('2 selected',{exact:true}).waitFor();
    const footer=await strip.boundingBox(),scroller=await page.locator('.ldc-bank-scroll').boundingBox();
    assert.ok(footer.y>=notch&&footer.y+footer.height<=height+1,'Bulk strip stays inside the safe viewport');
    assert.ok(scroller.y+scroller.height<=footer.y+1,'Bulk strip does not cover list content');
    await guest('060').getByText('Edit Guest 060 · Saved library',{exact:true}).press('Enter');
    await guest('060').getByLabel('Dialogue colors · one to three hex values, separated by commas',{exact:true}).fill('#123456');
    const save=guest('060').getByRole('button',{name:'Save Guest 060 · Saved library',exact:true});
    await save.scrollIntoViewIfNeeded();
    const scrollBeforeSave=await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop);
    await save.press('Enter');
    await guest('060').getByText('Dialogue · #123456',{exact:true}).waitFor();
    await page.waitForFunction(()=>!document.querySelector('[data-bank-search]').disabled);
    assert.ok(Math.abs(await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop)-scrollBeforeSave)<2,'Saving a deep row does not jump to the top');
    assert.equal(await guest('060').locator('[data-bank-detail=edit]').evaluate(node=>node.open),true,'Open editor survives saving');
    await strip.getByText('2 selected',{exact:true}).waitFor();
    await strip.getByRole('button',{name:'Delete selected',exact:true}).click();
    await strip.getByRole('button',{name:'Keep selected colors',exact:true}).press('Escape');
    await strip.getByRole('button',{name:'Delete selected',exact:true}).click();
    const scrollBeforeDelete=await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop);
    await strip.getByRole('button',{name:'Confirm deletion',exact:true}).press('Enter');
    await guest('060').waitFor({state:'detached'});
    await guest('061').waitFor({state:'detached'});
    assert.ok(Math.abs(await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop)-scrollBeforeDelete)<2,'Bulk deletion preserves a deep scroll position');
    await strip.getByText('0 selected',{exact:true}).waitFor();
    assert.equal(await page.getByRole('article').count(),149);
    await guest('062').getByRole('button',{name:'Delete Guest 062 · Saved library',exact:true}).click();
    const deleteSingle=guest('062').getByRole('button',{name:'Delete saved color',exact:true});
    await deleteSingle.scrollIntoViewIfNeeded();
    const scrollBeforeSingle=await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop);
    await deleteSingle.press('Enter');
    await guest('062').waitFor({state:'detached'});
    assert.ok(Math.abs(await page.locator('.ldc-bank-scroll').evaluate(node=>node.scrollTop)-scrollBeforeSingle)<2,'Single deletion also preserves deep scroll position');
    assert.equal(await page.getByRole('article').count(),148);
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/color-bank-bulk-'+width+'.png'})}
    await page.getByRole('button',{name:'Current chat (1)',exact:true}).click();
    assert.equal(await page.getByRole('article').count(),1,'Bulk library deletion leaves chat assignment');
    assert.equal(await strip.count(),0,'Changing scope exits bulk selection');
    assert.deepEqual(await page.evaluate(()=>uiFixture.errors),[]);
    assert.deepEqual(errors,[]);
    await page.evaluate(()=>uiFixture.unload());
    assert.equal(await page.locator('.ldc-shell').count(),0);
    console.log('Passed Color Bank browser interactions, keyboard, focus, backup, scopes, persistence, navigation and lifecycle at '+width+'x'+height+', safe top '+notch+'.');
    await page.close();
  }
} finally { await browser.close(); }
