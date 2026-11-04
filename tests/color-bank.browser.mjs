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

const browser = await playwright[process.env.PRISM_BROWSER || 'chromium'].launch({headless:true});
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
    const assertBankLayout=async actions=>{
      const shell=await page.locator('.ldc-settings-shell').boundingBox(),content=await page.locator('[data-bank-workspace]').boundingBox(),footer=await actions.boundingBox(),scroller=await page.locator('.ldc-bank-scroll').boundingBox();
      assert.ok(content.y>=shell.y-1&&content.y+content.height<=shell.y+shell.height+1,'Bank content fits the settings grid row');
      assert.ok(footer.y>=notch&&footer.y+footer.height<=height+1,'Bank actions stay inside the safe viewport');
      assert.ok(footer.y>=shell.y-1&&footer.y+footer.height<=shell.y+shell.height+1,'Bank actions are not clipped by the settings workspace');
      assert.ok(scroller.height>0&&scroller.y+scroller.height<=footer.y+1,'Bank actions leave a separate scrollable list');
    };

    // Both profile controls and Enter save the complete visible draft.
    await page.locator('summary').filter({hasText:'Identity and attribution'}).press('Enter');
    const profileName=page.getByRole('textbox',{name:/^Character name/}),profileAliases=page.getByRole('textbox',{name:/^Aliases/});
    await profileName.fill('Ada Lovelace');
    await profileAliases.fill('Countess');
    await page.getByRole('textbox',{name:'Gradient stop 1',exact:true}).fill('#FF0000');
    await page.getByRole('button',{name:'Save chat profile',exact:true}).last().click();
    await page.getByRole('button',{name:/Ada Lovelace/}).first().waitFor();
    await page.waitForFunction(()=>document.activeElement?.matches('.ldc-save-now'));
    await page.waitForFunction(async()=>{const binding=(await bankFixture.state()).characters[0].binding;return binding.color==='#FF0000'&&binding.aliases.includes('Countess')&&binding.aliases.includes('Ada')});
    await profileAliases.fill('Lady Ada');
    await page.locator('.ldc-identity-card').getByRole('button',{name:'Save chat profile',exact:true}).click();
    await page.waitForFunction(()=>document.activeElement?.matches('.ldc-identity-card [data-action=save-now]'));
    await page.waitForFunction(async()=>{const binding=(await bankFixture.state()).characters[0].binding;return binding.aliases.length===1&&binding.aliases[0]==='Lady Ada'});
    await profileName.fill('Ada Byron');
    await profileAliases.press('Enter');
    await page.getByRole('button',{name:/Ada Byron/}).first().waitFor();
    await page.waitForFunction(()=>document.activeElement?.matches('[data-role=aliases]'));
    assert.equal(await page.getByRole('button',{name:'Save name',exact:true}).count(),0);
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    await page.evaluate(()=>uiFixture.open());
    await page.getByRole('button',{name:/Ada Byron/}).first().waitFor();
    assert.equal(await page.getByRole('textbox',{name:'Gradient stop 1',exact:true}).inputValue(),'#FF0000');

    // An NPC may have several same-name bank versions. Saving must display the
    // version just written, even when an older unrelated version is first.
    await page.evaluate(async()=>{
      await bankFixture.send({type:'ldc_add_character',chatId:bankFixture.host.chatId,name:'Enji Todoroki',color:'#FF5500'});
      const key='user-a|prism_preferences_v1',raw=JSON.parse(bankFixture.host.global.get(key));
      raw.library={'character-card:old-enji':{name:'Enji Todoroki',aliases:[],color:'#FF5500',channels:bankFixture.functions.safeChannels(null,'#FF5500'),source:'manual',pinned:true},...raw.library};
      bankFixture.host.global.set(key,JSON.stringify(raw));uiFixture.unload();uiFixture.unload=setup(ctx);
    });
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    await page.getByRole('button',{name:/Enji Todoroki/}).first().click();
    await page.getByRole('textbox',{name:'Gradient stop 1',exact:true}).fill('#FF0000');
    const npcBank=page.locator('.ldc-editor-bank');
    await npcBank.locator('summary').press('Enter');
    await npcBank.getByRole('button',{name:'Save to bank',exact:true}).click();
    await npcBank.getByRole('status').getByText('Saved to bank. This is the shared base for new chats.',{exact:true}).waitFor();
    assert.match(await npcBank.getByRole('combobox',{name:'Banked identity',exact:true}).locator('option:checked').textContent(),/#FF0000/);
    assert.match(await npcBank.locator('[data-editor-bank-preview]').textContent(),/#FF0000/);
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    await page.evaluate(()=>uiFixture.open());
    await npcBank.locator('summary').press('Enter');
    assert.match(await npcBank.getByRole('combobox',{name:'Banked identity',exact:true}).locator('option:checked').textContent(),/#FF0000/);
    console.log('Passed unified profile controls, Enter, reopening and exact NPC bank feedback at '+width+'x'+height+'.');
    await page.evaluate(()=>uiFixture.unload());
    await page.evaluate(()=>uiFixture.load());
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    // Real editor -> backend -> scoped storage, using controlled host data.
    await page.getByLabel('Paint',{exact:true}).selectOption('gradient');
    const direction=page.getByRole('slider',{name:'Gradient direction',exact:true});
    await direction.waitFor();
    await page.getByRole('combobox',{name:'Stops',exact:true}).selectOption('2');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.channels.dialogue.paint.stops.length===2);
    await direction.press('End');
    await direction.press('ArrowLeft');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.channels.dialogue.paint.angle===359);
    assert.equal(await direction.getAttribute('aria-valuetext'),'359 degrees');
    await page.getByLabel('Paint',{exact:true}).selectOption('radial');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.channels.dialogue.paint.type==='radial');
    assert.equal(await page.getByRole('slider',{name:'Gradient direction'}).count(),0);
    await page.getByRole('textbox',{name:'Gradient stop 1',exact:true}).fill('#445566');
    const bankDetails=page.locator('.ldc-editor-bank');
    await bankDetails.locator('summary').press('Enter');
    assert.equal(await page.getByRole('combobox',{name:'Banked identity',exact:true}).count(),1);
    assert.deepEqual(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.filter((id,index)=>ids.indexOf(id)!==index)}),[]);
    await page.getByRole('button',{name:'Save to bank',exact:true}).click();
    await page.waitForFunction(async()=>{const state=await bankFixture.state();return state.colorBank.some(entry=>entry.scope==='library'&&entry.color==='#445566'&&entry.channels.dialogue.paint.type==='radial')});
    await page.waitForFunction(()=>document.activeElement?.matches('[data-editor-bank-save]'));
    assert.match(await page.locator('.ldc-preview-dialogue').evaluate(el=>getComputedStyle(el).backgroundImage),/^radial-gradient/);
    await page.getByRole('textbox',{name:'Gradient stop 1',exact:true}).fill('#AA3366');
    await page.getByRole('button',{name:'Use banked identity',exact:true}).press('Enter');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.color==='#445566');
    await page.waitForFunction(()=>document.activeElement?.matches('[data-editor-bank-use]'));
    const bankRect=await page.getByRole('button',{name:'Use banked identity',exact:true}).boundingBox();
    assert.ok(bankRect.y>=notch&&bankRect.y+bankRect.height<=height+1,'Bank action stays within the safe viewport');
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/editor-bank-radial-'+width+'.png'})}
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    await page.evaluate(()=>uiFixture.open());
    await page.waitForFunction(()=>document.querySelector('[data-role=paint-mode]')?.value==='radial');
    await page.evaluate(()=>uiFixture.switchChat('bank-editor-new-chat'));
    await page.waitForFunction(async()=>{const state=await bankFixture.state();return state.chat.id==='bank-editor-new-chat'&&state.characters[0].binding.color==='#445566'&&state.characters[0].binding.channels.dialogue.paint.type==='radial'});
    await page.evaluate(()=>uiFixture.unload());
    await page.evaluate(()=>uiFixture.load());
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    console.log('Passed editor bank save/use, radial preview, keyboard direction slider, focus, close/reopen and new-chat base at '+width+'x'+height+'.');
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
    await assertBankLayout(strip);
    if(width===844){
      const navigation=page.getByRole('navigation',{name:'Prism settings sections',exact:true}),buttons=navigation.getByRole('button'),bounds=await navigation.boundingBox();
      await buttons.first().focus();
      for(let index=0;index<await buttons.count();index++){
        if(index)await page.keyboard.press('Tab');
        assert.equal(await buttons.nth(index).evaluate(node=>node===document.activeElement),true,'Settings sections stay in keyboard order');
        const button=await buttons.nth(index).boundingBox();
        assert.ok(button.y>=bounds.y-1&&button.y+button.height<=bounds.y+bounds.height+1,'Keyboard focus scrolls short-window settings navigation into view');
      }
    }

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
    await assertBankLayout(strip);
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
    await page.evaluate(async()=>{uiFixture.unload();await bankFixture.reset();await bankFixture.seedDuplicates();uiFixture.unload=setup(ctx)});
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    await openBank();
    await page.getByRole('button',{name:'Review duplicates (2)',exact:true}).click();
    const reviewActions=page.getByRole('group',{name:'Duplicate review actions',exact:true});
    assert.equal(await reviewActions.getByRole('button',{name:'Apply chosen colors',exact:true}).isDisabled(),true,'No duplicate version is selected automatically');
    assert.equal(await page.getByRole('radio',{checked:true}).count(),0);
    const characterGroup=page.getByRole('group',{name:'Ada · character',exact:true});
    const personaGroup=page.getByRole('group',{name:'Ada · persona',exact:true});
    await characterGroup.getByRole('radio',{name:/Preserve version 2 for Ada/}).check();
    await personaGroup.getByRole('radio',{name:'Keep all versions for Ada',exact:true}).check();
    await reviewActions.getByText('2 of 2 reviewed · 1 to consolidate',{exact:true}).waitFor();
    await assertBankLayout(reviewActions);
    await page.getByRole('button',{name:'Copy Color Bank backup',exact:true}).click();
    assert.equal(await page.evaluate(()=>JSON.parse(uiFixture.copied).entries.length),7);
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/color-bank-dedupe-'+width+'.png'})}
    await reviewActions.getByRole('button',{name:'Apply chosen colors',exact:true}).press('Enter');
    await assertBankLayout(reviewActions);
    await reviewActions.getByRole('button',{name:'Keep reviewing',exact:true}).press('Escape');
    assert.equal(await reviewActions.getByRole('button',{name:'Apply chosen colors',exact:true}).evaluate(node=>node===document.activeElement),true);
    await reviewActions.getByRole('button',{name:'Apply chosen colors',exact:true}).click();
    await reviewActions.getByRole('button',{name:'Confirm chosen colors',exact:true}).press('Enter');
    await page.getByRole('button',{name:'Review duplicates (1)',exact:true}).waitFor();
    assert.equal(await page.getByRole('article').count(),4,'Chosen character variants consolidate while persona variants remain');
    const kept=page.getByRole('article',{name:'Ada · Saved library',exact:true});
    await kept.getByText('Dialogue · #445566 → #778899 → #AABBCC · off',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Current chat (1)',exact:true}).click();
    await page.getByRole('article',{name:'Ada · Current chat',exact:true}).getByText('Dialogue · #112233',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Review duplicates (1)',exact:true}).click();
    await page.getByRole('radio',{name:'Keep all versions for Ada',exact:true}).check();
    assert.equal(await reviewActions.getByRole('button',{name:'Apply chosen colors',exact:true}).isDisabled(),true,'Keeping all versions schedules no writes');
    await page.getByRole('button',{name:'Cancel review',exact:true}).click();
    await page.getByRole('button',{name:'Review duplicates (1)',exact:true}).waitFor();
    await page.evaluate(async()=>{uiFixture.unload();await bankFixture.reset();await bankFixture.seedDuplicates();uiFixture.unload=setup(ctx)});
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    const openAdd=async()=>{const menu=page.getByLabel('Scene actions',{exact:true});if(await menu.count()&&!await menu.evaluate(node=>node.parentElement.open))await menu.click();await page.getByRole('button',{name:'+ Add character',exact:true}).click()};
    await openAdd();
    const addDialog=page.getByRole('dialog',{name:'Add scene character',exact:true});
    const addBounds=await addDialog.boundingBox();
    assert.ok(addBounds.y>=notch&&addBounds.y+addBounds.height<=height+1,'Add character stays inside the notched safe viewport');
    assert.ok(await addDialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Suggestions do not widen the dialog');
    const addName=addDialog.getByRole('textbox',{name:'Name',exact:true});
    const suggestions=addDialog.getByRole('group',{name:'Saved character suggestions',exact:true});
    assert.equal(await suggestions.getByRole('button').count(),4,'Only saved characters are suggested; persona entries are excluded');
    await addName.fill('Ada third');
    assert.equal(await suggestions.getByRole('button').count(),1,'Typing an alias finds the saved character');
    await addName.fill('Ada');
    assert.equal(await suggestions.getByRole('button').count(),3,'Different saved color versions stay selectable');
    const gradientSuggestion=suggestions.getByRole('button').filter({hasText:'#445566 → #778899 → #AABBCC'});
    await gradientSuggestion.press('Enter');
    assert.equal(await addName.inputValue(),'Ada');
    assert.equal(await addDialog.getByRole('textbox',{name:/^Aliases/}).inputValue(),'A');
    await addName.fill('Someone new');
    assert.equal(await addDialog.getByRole('textbox',{name:/^Aliases/}).inputValue(),'','Changing the name clears autofilled aliases and saved colors');
    await addName.fill('Ada');
    await gradientSuggestion.click();
    const addButton=addDialog.getByRole('button',{name:'Add character',exact:true});
    const addClose=addDialog.getByRole('button',{name:'Close',exact:true});
    await addClose.focus();
    await addClose.press('Shift+Tab');
    assert.equal(await addButton.evaluate(node=>node===document.activeElement),true,'Tab focus stays inside the Add dialog');
    await addButton.press('Tab');
    assert.equal(await addClose.evaluate(node=>node===document.activeElement),true);
    if(process.env.PRISM_SCREENSHOT_DIR){await fs.mkdir(process.env.PRISM_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.PRISM_SCREENSHOT_DIR+'/add-saved-'+width+'.png'})}
    await addButton.press('Enter');
    await addDialog.waitFor({state:'detached'});
    await page.waitForFunction(()=>document.activeElement?.matches('[data-character-id]'));
    const addedPaint=await page.evaluate(async()=>{const state=await bankFixture.state();return state.characters.find(character=>character.name==='Ada').binding});
    assert.equal(addedPaint.color,'#445566');
    assert.equal(addedPaint.channels.dialogue.paint.stops.length,3);
    assert.equal(addedPaint.channels.dialogue.enabled,false);
    assert.equal(addedPaint.channels.thought.linkedToDialogue,false);
    await openAdd();
    assert.equal(await addName.inputValue(),'','Reopening starts a new character draft');
    await addClose.press('Escape');
    await addDialog.waitFor({state:'detached'});
    assert.equal(await page.getByRole('dialog',{name:'Prism',exact:true}).count(),1,'Escape dismisses Add without closing Prism');
    await openAdd();
    await addName.fill('Brand new');
    await addDialog.getByRole('textbox',{name:/^Aliases/}).fill('Storyteller');
    await addName.press('Enter');
    await addDialog.waitFor({state:'detached'});
    assert.equal(await page.evaluate(async()=>(await bankFixture.state()).characters.some(character=>character.name==='Brand new')),true,'Manual entry still works');
    await openAdd();
    await page.evaluate(()=>{bankFixture.host.global.clear();bankFixture.host.chats.clear()});
    await addDialog.getByRole('button',{name:'Refresh saved characters',exact:true}).click();
    await addDialog.getByText('No saved characters match. You can still add a new character.',{exact:true}).waitFor();
    assert.equal(await suggestions.getByRole('button').count(),0,'Empty library still permits manual entry');
    await addClose.press('Escape');
    await page.evaluate(async()=>{
      uiFixture.unload();
      await bankFixture.reset();
      bankFixture.host.entities=[
        {id:'entity-a',type:'character',name:'Ada',aliases:['Charles','Babbage','Charles Babbage','Grace','Hopper','Grace Hopper','Rear Admiral']},
        {id:'entity-b',type:'character',name:'Charles Babbage',aliases:['Charles']},
        {id:'entity-c',type:'character',name:'Grace Hopper',aliases:['Grace']},
      ];
      uiFixture.unload=setup(ctx);
    });
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    await page.locator('summary').filter({hasText:'Identity and attribution'}).press('Enter');
    assert.equal(await profileAliases.inputValue(),'', 'An empty binding overrides stale discovered aliases in the editor');
    await profileAliases.fill('Charles, Babbage, Charles Babbage, Grace, Hopper, Grace Hopper, Rear Admiral');
    await profileAliases.press('Enter');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.aliases.length===7);
    await profileAliases.fill('');
    await page.locator('.ldc-identity-card').getByRole('button',{name:'Save chat profile',exact:true}).click();
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.aliases.length===0);
    assert.equal(await profileAliases.inputValue(),'','Explicit Save keeps the cleared field empty');
    await page.getByRole('button',{name:'Close Prism',exact:true}).click();
    await page.evaluate(()=>uiFixture.open());
    await page.locator('summary').filter({hasText:'Identity and attribution'}).press('Enter');
    assert.equal(await profileAliases.inputValue(),'','Cleared aliases stay empty after reopening');
    await profileAliases.fill('Temporary alias');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.aliases.includes('Temporary alias'));
    await profileAliases.fill('');
    await page.waitForFunction(async()=>(await bankFixture.state()).characters[0].binding.aliases.length===0);
    assert.equal(await profileAliases.inputValue(),'','Autosave also preserves an empty list');
    await page.evaluate(()=>{uiFixture.unload();uiFixture.unload=setup(ctx)});
    await page.waitForSelector('[data-prism-toolbar-button]');
    await page.evaluate(()=>uiFixture.open());
    await page.locator('summary').filter({hasText:'Identity and attribution'}).press('Enter');
    assert.equal(await profileAliases.inputValue(),'','Remount reloads the empty profile despite stale host aliases');
    assert.equal(await page.evaluate(async()=>(await bankFixture.state()).characters.length),3,'Other characters remain separate');
    await profileAliases.scrollIntoViewIfNeeded();
    const aliasBox=await profileAliases.boundingBox();
    assert.ok(aliasBox.y>=notch&&aliasBox.y+aliasBox.height<=height,'Alias input stays inside the safe viewport');
    console.log('Passed empty aliases, explicit save, autosave, reopening, remount and separate host identities at '+width+'x'+height+'.');
    assert.deepEqual(await page.evaluate(()=>uiFixture.errors),[]);
    assert.deepEqual(errors,[]);
    await page.evaluate(()=>uiFixture.unload());
    assert.equal(await page.locator('.ldc-shell').count(),0);
    console.log('Passed Color Bank browser interactions, keyboard, focus, backup, scopes, persistence, navigation and lifecycle at '+width+'x'+height+', safe top '+notch+'.');
    await page.close();
  }
} finally { await browser.close(); }
