import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { fixtureSource, fixtureCss } from './persona-save.mjs';

// Reuse an installed diagnostics runtime without adding a Prism dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height, layout] of [[1280, 900, 'split'], [390, 844, 'tabs']]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<style>:root{--lumiverse-primary:#b58cff;--lumiverse-text:#eee;--lumiverse-text-dim:#bbb;--lumiverse-text-muted:#ccc;--lumiverse-border:#444;--lumiverse-fill-subtle:#222;--lumiverse-bg:#111}body{margin:0;background:#111}.ldc-shell{height:100vh}.ldc-panel{overflow:auto;padding:16px}${fixtureCss}</style><div class="ldc-shell" data-prism-layout="${layout}"><div class="ldc-panel" id="root"></div></div>`);
    await page.addScriptTag({ content: `${fixtureSource}\nlayout='${layout}';showIndicator=false;render();` });
    const save = page.getByRole('button', { name: 'Save persona colors and options now' });
    assert.equal(await save.count(), 1);
    assert.equal(await save.isVisible(), true);
    await page.locator('[data-role=hex]').fill('#AA3300');
    await save.click();
    await page.waitForFunction(() => !busy && saveStatus === 'saved');
    assert.equal(await page.evaluate(() => state.persona.binding.color), '#AA3300');
    // A persona choice immediately after editing paint must not discard that paint.
    await page.locator('[data-role=hex]').fill('#22AA77');
    await page.locator('[data-role=persona-in-cast]').check();
    await page.waitForFunction(() => !busy && state.config.personaInCast === true);
    assert.equal(await page.locator('[data-role=hex]').inputValue(), '#22AA77');
    // The native button keyboard path uses the same save action.
    await page.locator('[data-role=hex]').fill('#3344DD');
    await save.focus();
    await save.press('Enter');
    await page.waitForFunction(() => !busy && state.persona.binding.color === '#3344DD');
    await page.evaluate(() => { document.getElementById('root').innerHTML='';render(); });
    assert.equal(await page.locator('[data-role=hex]').inputValue(), '#3344DD');
    assert.equal(await page.locator('[data-role=persona-in-cast]').isChecked(), true);
    assert.equal(await save.count(), 1);
    assert.deepEqual(errors, []);
    console.log(`Passed persona pointer/keyboard save, option changes, and editor remount at ${width}x${height} (${layout}).`);
    await page.close();
  }
} finally {
  await browser.close();
}
