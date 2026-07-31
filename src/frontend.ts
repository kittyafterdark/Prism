// @ts-nocheck
import type { SpindleFrontendContext } from "lumiverse-spindle-types";

const PALETTE_ICON = `
<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3.25a8.75 8.75 0 1 0 0 17.5h1.25a1.75 1.75 0 0 0 0-3.5H12a1.5 1.5 0 0 1 0-3h2.75A6 6 0 0 0 20.75 8.25C20.75 5.49 17.04 3.25 12 3.25Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="7.7" cy="9" r="1" fill="currentColor"/>
  <circle cx="10.1" cy="6.8" r="1" fill="currentColor"/>
  <circle cx="13.4" cy="6.65" r="1" fill="currentColor"/>
  <circle cx="16.25" cy="8.5" r="1" fill="currentColor"/>
</svg>`;

const GEAR_ICON = `
<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.6 3.5h4.8l.55 2.1c.45.18.88.43 1.27.73l2.08-.6 2.4 4.15-1.54 1.52c.03.2.04.4.04.6s-.01.4-.04.6l1.54 1.52-2.4 4.15-2.08-.6c-.39.3-.82.55-1.27.73l-.55 2.1H9.6l-.55-2.1a7.3 7.3 0 0 1-1.27-.73l-2.08.6-2.4-4.15 1.54-1.52A4.8 4.8 0 0 1 4.8 12c0-.2.01-.4.04-.6L3.3 9.88l2.4-4.15 2.08.6c.39-.3.82-.55 1.27-.73l.55-2.1Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.55"/>
</svg>`;

const CSS = `
.ldc-launcher{width:42px;height:42px;border:1px solid var(--lumiverse-border);border-radius:14px;background:color-mix(in srgb,var(--lumiverse-bg-elevated) 88%,transparent);color:var(--lumiverse-primary);display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25);backdrop-filter:blur(12px);cursor:pointer;transition:transform .16s ease,border-color .16s ease}.ldc-launcher:hover{transform:translateY(-1px);border-color:var(--lumiverse-primary)}.ldc-launcher svg{width:21px;height:21px}.ldc-shell,.ldc-shell *{box-sizing:border-box}.ldc-shell{display:flex;flex-direction:column;min-height:420px;color:var(--lumiverse-text)}.ldc-tabs{display:flex;gap:6px;padding:0 0 12px;border-bottom:1px solid var(--lumiverse-border)}.ldc-tab{appearance:none;border:0;border-radius:10px;padding:8px 13px;background:transparent;color:var(--lumiverse-text-muted);font-weight:700;cursor:pointer}.ldc-tab[data-active="true"]{background:var(--lumiverse-primary-015,rgba(128,90,255,.15));color:var(--lumiverse-primary)}.ldc-main{display:grid;grid-template-columns:minmax(145px,190px) minmax(0,1fr);min-height:330px}.ldc-sidebar{padding:12px 10px 12px 0;border-right:1px solid var(--lumiverse-border);overflow:auto;max-height:430px}.ldc-person{width:100%;display:flex;align-items:center;gap:9px;padding:9px;border:1px solid transparent;border-radius:11px;background:transparent;color:var(--lumiverse-text);text-align:left;cursor:pointer}.ldc-person:hover{background:var(--lumiverse-fill-subtle)}.ldc-person[data-active="true"]{border-color:var(--lumiverse-primary-050,rgba(128,90,255,.5));background:var(--lumiverse-primary-015,rgba(128,90,255,.15))}.ldc-swatch{width:13px;height:13px;border-radius:50%;border:1px solid rgba(255,255,255,.35);box-shadow:0 0 0 2px rgba(0,0,0,.15);flex:0 0 auto}.ldc-person-copy{min-width:0}.ldc-person-name{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;font-weight:700}.ldc-person-source{display:block;margin-top:2px;font-size:10.5px;color:var(--lumiverse-text-dim)}.ldc-panel{padding:16px 2px 10px 18px;min-width:0}.ldc-empty{padding:34px 12px;text-align:center;color:var(--lumiverse-text-dim)}.ldc-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:15px}.ldc-heading h3{margin:0;font-size:17px}.ldc-sub{margin-top:4px;color:var(--lumiverse-text-dim);font-size:11.5px}.ldc-source-chip,.ldc-bridge{display:inline-flex;align-items:center;border:1px solid var(--lumiverse-border);border-radius:999px;padding:4px 8px;font-size:10px;color:var(--lumiverse-text-dim);background:var(--lumiverse-fill-subtle)}.ldc-field{display:block;margin:0 0 13px}.ldc-field>span{display:block;margin-bottom:6px;font-size:11.5px;font-weight:700;color:var(--lumiverse-text-muted)}.ldc-field input[type="text"],.ldc-field select{width:100%;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill);color:var(--lumiverse-text);padding:9px 10px;outline:none}.ldc-field input:focus,.ldc-field select:focus{border-color:var(--lumiverse-primary)}.ldc-color-row{display:grid;grid-template-columns:68px 1fr;gap:10px}.ldc-color{width:68px;height:40px;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill);padding:3px;cursor:pointer}.ldc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.ldc-btn{appearance:none;border:1px solid var(--lumiverse-border);border-radius:10px;padding:9px 12px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);font-weight:700;cursor:pointer}.ldc-btn:hover{border-color:var(--lumiverse-primary)}.ldc-btn-primary{border-color:transparent;background:var(--lumiverse-primary);color:var(--lumiverse-primary-contrast,#fff)}.ldc-btn:disabled{opacity:.55;cursor:wait}.ldc-options{margin-top:14px;padding-top:13px;border-top:1px solid var(--lumiverse-border)}.ldc-check{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--lumiverse-text-muted)}.ldc-note{margin:11px 0 0;font-size:10.5px;line-height:1.45;color:var(--lumiverse-text-dim)}.ldc-status{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px solid var(--lumiverse-border);font-size:10.5px;color:var(--lumiverse-text-dim)}.ldc-loading{display:grid;place-items:center;min-height:300px;color:var(--lumiverse-text-dim)}.ldc-error{padding:18px;border:1px solid color-mix(in srgb,var(--lumiverse-danger) 50%,var(--lumiverse-border));border-radius:12px;color:var(--lumiverse-danger)}@media(max-width:620px){.ldc-main{grid-template-columns:112px minmax(0,1fr)}.ldc-panel{padding-left:12px}.ldc-person-source{display:none}.ldc-color-row{grid-template-columns:54px 1fr}.ldc-color{width:54px}}
`;

const EXTRA_CSS = `
.ldc-toolbar-host{display:flex;align-items:center}.ldc-toolbar-button{display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--lumiverse-text-dim);opacity:.65;cursor:pointer;transition:all var(--lumiverse-transition-fast,120ms)}.ldc-toolbar-button:hover{opacity:1;color:var(--lumiverse-text);border-color:var(--lumiverse-border-hover,var(--lumiverse-border));background:var(--lumiverse-fill-subtle)}.ldc-toolbar-button svg{width:15px;height:15px}.ldc-tabbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 0 12px;border-bottom:1px solid var(--lumiverse-border)}.ldc-tabbar .ldc-tabs{padding:0;border:0}.ldc-settings-toggle{display:grid;place-items:center;width:32px;height:32px;padding:0}.ldc-settings-toggle svg{width:16px;height:16px}.ldc-settings{padding:16px 2px 8px}.ldc-engine-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.ldc-engine{display:block;padding:14px;border:1px solid var(--lumiverse-border);border-radius:12px;background:var(--lumiverse-fill-subtle);cursor:pointer}.ldc-engine:has(input:checked){border-color:var(--lumiverse-primary);background:var(--lumiverse-primary-015,rgba(128,90,255,.15))}.ldc-engine input{position:absolute;opacity:0;pointer-events:none}.ldc-engine-title{display:flex;align-items:center;gap:8px;font-weight:800;font-size:13px}.ldc-engine-title svg{width:15px;height:15px}.ldc-engine-copy{display:block;margin-top:6px;font-size:11px;line-height:1.45;color:var(--lumiverse-text-dim)}.ldc-dom-dialogue{color:var(--ldc-dom-color)!important}.ldc-dom-whole,.ldc-dom-whole *:not(a):not(button){color:var(--ldc-dom-color)!important}@media(max-width:620px){.ldc-engine-grid{grid-template-columns:1fr}}
`;

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function normalizeHex(value) {
  const raw = String(value || '').trim();
  const short = raw.match(/^#?([0-9a-f]{3})$/i);
  if (short) return `#${short[1].split('').map((c) => c + c).join('').toUpperCase()}`;
  const full = raw.match(/^#?([0-9a-f]{6})$/i);
  return full ? `#${full[1].toUpperCase()}` : null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function setup(ctx: SpindleFrontendContext) {
  const removeStyle = ctx.dom.addStyle(`${CSS}${EXTRA_CSS}`);
  const pending = new Map();
  let modal = null;
  let state = null;
  let activeTab = 'character';
  let selectedCharacterId = null;
  let settingsOpen = false;
  let busy = false;
  let toolbarInjection = null;
  let domRefreshTimer = 0;
  let applyingDomColors = false;

  const request = (type, data = {}) => new Promise((resolve, reject) => {
    const requestId = uid();
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error('The extension backend did not answer.'));
    }, 12000);
    pending.set(requestId, { resolve, reject, timer });
    ctx.sendToBackend({ type, requestId, ...data });
  });

  const unsubBackend = ctx.onBackendMessage((payload) => {
    const task = pending.get(payload?.requestId);
    if (!task) return;
    clearTimeout(task.timer);
    pending.delete(payload.requestId);
    if (payload.type === 'ldc_error') task.reject(new Error(payload.error || 'Unknown error'));
    else task.resolve(payload);
  });

  function setBusy(value) {
    busy = value;
    modal?.root.querySelectorAll('button,input,select').forEach((element) => {
      if (element.dataset.allowBusy === 'true') return;
      element.disabled = value;
    });
  }

  function currentCharacter() {
    return state?.characters?.find((character) => character.id === selectedCharacterId)
      || state?.characters?.[0]
      || null;
  }

  function characterSidebar() {
    if (!state?.characters?.length) {
      return '<div class="ldc-empty">No scene characters found yet.</div>';
    }
    return state.characters.map((character) => {
      const color = character.binding?.color || '#777777';
      return `<button class="ldc-person" data-character-id="${escapeHtml(character.id)}" data-active="${character.id === currentCharacter()?.id}">
        <span class="ldc-swatch" style="background:${escapeHtml(color)}"></span>
        <span class="ldc-person-copy"><span class="ldc-person-name">${escapeHtml(character.name)}</span><span class="ldc-person-source">${escapeHtml(character.source)}</span></span>
      </button>`;
    }).join('');
  }

  function characterPanel(character) {
    if (!character) return '<div class="ldc-empty">Cortex has not registered a character in this scene.</div>';
    const binding = character.binding || {};
    const color = normalizeHex(binding.color) || '#B58CFF';
    const aliases = (binding.aliases?.length ? binding.aliases : character.aliases || []).join(', ');
    return `<div class="ldc-heading"><div><h3>${escapeHtml(character.name)}</h3><div class="ldc-sub">${escapeHtml(character.status || 'active')}</div></div><span class="ldc-source-chip">${escapeHtml(binding.source || character.source)}</span></div>
      <label class="ldc-field"><span>Dialogue color</span><div class="ldc-color-row"><input class="ldc-color" data-role="color-picker" type="color" value="${escapeHtml(color)}"><input data-role="hex" type="text" value="${escapeHtml(color)}" maxlength="7" spellcheck="false"></div></label>
      <label class="ldc-field"><span>Aliases</span><input data-role="aliases" type="text" value="${escapeHtml(aliases)}" placeholder="Hugo, Mr. Vlad, the Mockingbird"></label>
      <div class="ldc-actions"><button class="ldc-btn ldc-btn-primary" data-action="bind-character">Bind color</button></div>
      <p class="ldc-note">Binding also upserts the canonical name and aliases into this chat's Cortex entity graph. DOM mode stays local; LLM sidecar mode persists compatible color tags.</p>`;
  }

  function personaPanel() {
    const persona = state?.persona;
    if (!persona) return '<div class="ldc-empty">No active persona is selected.</div>';
    const binding = persona.binding || {};
    const color = normalizeHex(binding.color) || '#7DB7FF';
    return `<div class="ldc-heading"><div><h3>${escapeHtml(persona.name)}</h3><div class="ldc-sub">${escapeHtml(persona.title || (persona.isNarrator ? 'Narrator persona' : 'Active persona'))}</div></div><span class="ldc-source-chip">active</span></div>
      <label class="ldc-field"><span>Dialogue color</span><div class="ldc-color-row"><input class="ldc-color" data-role="color-picker" type="color" value="${escapeHtml(color)}"><input data-role="hex" type="text" value="${escapeHtml(color)}" maxlength="7" spellcheck="false"></div></label>
      <label class="ldc-field"><span>Automatic user-message coloring</span><select data-role="auto-mode"><option value="off" ${state.config.autoUserMode === 'off' ? 'selected' : ''}>Off</option><option value="quoted" ${state.config.autoUserMode === 'quoted' ? 'selected' : ''}>Quoted dialogue only</option><option value="whole" ${state.config.autoUserMode === 'whole' ? 'selected' : ''}>Whole message</option></select></label>
      <div class="ldc-actions"><button class="ldc-btn ldc-btn-primary" data-action="bind-persona">Bind color</button><button class="ldc-btn" data-action="recolor">Apply to existing chat</button></div>
      <p class="ldc-note">Quoted mode colors straight or curly quoted speech and leaves prose alone. Whole-message mode is useful for chat-style RP, but it will also color narration.</p>`;
  }

  function settingsPanel() {
    const engine = state?.config?.engine === 'dom' ? 'dom' : 'llm';
    return `<section class="ldc-settings">
      <div class="ldc-heading"><div><h3>Coloring engine</h3><div class="ldc-sub">Choose whether Prism changes only the rendered page or asks the model to persist color tags.</div></div></div>
      <div class="ldc-engine-grid">
        <label class="ldc-engine"><input type="radio" name="ldc-engine" value="dom" ${engine === 'dom' ? 'checked' : ''}><span class="ldc-engine-title">${PALETTE_ICON}DOM only</span><span class="ldc-engine-copy">Reversible local coloring. Saved messages and model context stay untouched.</span></label>
        <label class="ldc-engine"><input type="radio" name="ldc-engine" value="llm" ${engine === 'llm' ? 'checked' : ''}><span class="ldc-engine-title">${GEAR_ICON}LLM sidecar</span><span class="ldc-engine-copy">Injects a compact registry and writes compatible &lt;font color&gt; tags into the chat.</span></label>
      </div>
      <p class="ldc-note">DOM-only attribution uses nearby names and aliases, then falls back to the primary character for unlabelled assistant dialogue. Switches apply immediately.</p>
    </section>`;
  }

  function render() {
    if (!modal) return;
    if (!state) {
      modal.root.innerHTML = '<div class="ldc-loading">Reading the scene registry…</div>';
      return;
    }
    if (!state.ok) {
      modal.root.innerHTML = `<div class="ldc-error">${escapeHtml(state.error || 'Could not load this chat.')}</div>`;
      return;
    }
    if (!selectedCharacterId && state.characters?.length) selectedCharacterId = state.characters[0].id;

    modal.root.innerHTML = `<div class="ldc-shell">
      <div class="ldc-tabbar"><div class="ldc-tabs"><button class="ldc-tab" data-tab="character" data-active="${activeTab === 'character' && !settingsOpen}">Character</button><button class="ldc-tab" data-tab="persona" data-active="${activeTab === 'persona' && !settingsOpen}">Persona</button></div><button class="ldc-btn ldc-settings-toggle" data-action="toggle-settings" data-active="${settingsOpen}" title="Prism settings" aria-label="Prism settings">${GEAR_ICON}</button></div>
      ${settingsOpen ? settingsPanel() : `<div class="ldc-main">
        ${activeTab === 'character' ? `<aside class="ldc-sidebar">${characterSidebar()}</aside><section class="ldc-panel">${characterPanel(currentCharacter())}</section>` : `<aside class="ldc-sidebar"><button class="ldc-person" data-active="true"><span class="ldc-swatch" style="background:${escapeHtml(state.persona?.binding?.color || '#777777')}"></span><span class="ldc-person-copy"><span class="ldc-person-name">${escapeHtml(state.persona?.name || 'No persona')}</span><span class="ldc-person-source">currently applied</span></span></button></aside><section class="ldc-panel">${personaPanel()}</section>`}
      </div>`}
      <div class="ldc-status"><span>${escapeHtml(state.chat.name)}</span><span class="ldc-bridge">${state.config.engine === 'dom' ? 'DOM only' : 'LLM sidecar'} · Cortex: ${state.cortexAvailable ? 'linked' : 'permission unavailable'}${state.cortexImportedCount ? ` · imported ${state.cortexImportedCount}` : ''}</span></div>
    </div>`;

    wireModal();
    setBusy(busy);
  }

  function syncColorInputs(root) {
    const picker = root.querySelector('[data-role="color-picker"]');
    const hex = root.querySelector('[data-role="hex"]');
    if (!picker || !hex) return;
    picker.addEventListener('input', () => { hex.value = picker.value.toUpperCase(); });
    hex.addEventListener('input', () => {
      const color = normalizeHex(hex.value);
      if (color) picker.value = color;
    });
    hex.addEventListener('blur', () => {
      const color = normalizeHex(hex.value);
      if (color) hex.value = color;
    });
  }

  async function perform(task) {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch (error) {
      const message = error?.message || String(error);
      await ctx.ui.showConfirm({ title: 'Prism', message, confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'warning' });
    } finally {
      setBusy(false);
    }
  }

  function wireModal() {
    if (!modal) return;
    syncColorInputs(modal.root);
    modal.root.querySelectorAll('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        activeTab = button.dataset.tab;
        settingsOpen = false;
        render();
      });
    });
    modal.root.querySelectorAll('[data-character-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedCharacterId = button.dataset.characterId;
        render();
      });
    });

    modal.root.querySelector('[data-action="toggle-settings"]')?.addEventListener('click', () => {
      settingsOpen = !settingsOpen;
      render();
    });

    modal.root.querySelectorAll('input[name="ldc-engine"]').forEach((input) => {
      input.addEventListener('change', () => perform(async () => {
        if (!input.checked) return;
        const response = await request('ldc_update_options', {
          engine: input.value,
          autoUserMode: state.config.autoUserMode,
        });
        state = response.state;
        scheduleDomRefresh();
        render();
      }));
    });

    modal.root.querySelector('[data-role="auto-mode"]')?.addEventListener('change', (event) => perform(async () => {
      const response = await request('ldc_update_options', {
        engine: state.config.engine,
        autoUserMode: event.target.value,
      });
      state = response.state;
      scheduleDomRefresh();
      render();
    }));

    modal.root.querySelector('[data-action="bind-character"]')?.addEventListener('click', () => perform(async () => {
      const character = currentCharacter();
      const color = normalizeHex(modal.root.querySelector('[data-role="hex"]')?.value);
      if (!character || !color) throw new Error('Enter a valid six-digit hex color.');
      const aliases = String(modal.root.querySelector('[data-role="aliases"]')?.value || '').split(',').map((item) => item.trim()).filter(Boolean);
      const response = await request('ldc_save_binding', {
        chatId: state.chat.id,
        kind: 'character',
        targetId: character.entityId || character.id,
        name: character.name,
        aliases,
        color,
        engine: state.config.engine,
      });
      state = response.state;
      selectedCharacterId = state.characters.find((item) => item.name === character.name)?.id || selectedCharacterId;
      scheduleDomRefresh();
      render();
    }));

    modal.root.querySelector('[data-action="bind-persona"]')?.addEventListener('click', () => perform(async () => {
      const persona = state.persona;
      const color = normalizeHex(modal.root.querySelector('[data-role="hex"]')?.value);
      const mode = modal.root.querySelector('[data-role="auto-mode"]')?.value || state.config.autoUserMode;
      if (!persona || !color) throw new Error('Select a persona and enter a valid six-digit hex color.');
      const response = await request('ldc_save_binding', {
        chatId: state.chat.id,
        kind: 'persona',
        targetId: persona.id,
        name: persona.name,
        aliases: [],
        color,
        autoUserMode: mode,
        engine: state.config.engine,
      });
      state = response.state;
      scheduleDomRefresh();
      render();
    }));

    modal.root.querySelector('[data-action="recolor"]')?.addEventListener('click', () => perform(async () => {
      if (state.config.engine === 'dom') {
        scheduleDomRefresh(true);
        return;
      }
      const choice = await ctx.ui.showConfirm({
        title: 'Apply colors to existing chat?',
        message: 'This rewrites matching old font colors and applies the active persona color to prior user messages. Swipe variants are updated too.',
        confirmLabel: 'Apply colors',
        cancelLabel: 'Cancel',
        variant: 'info',
      });
      if (!choice.confirmed) return;
      await request('ldc_recolor_existing', { chatId: state.chat.id });
    }));
  }

  function unwrapDomColors() {
    document.querySelectorAll('.ldc-dom-dialogue').forEach((span) => {
      span.replaceWith(document.createTextNode(span.textContent || ''));
    });
    document.querySelectorAll('.ldc-dom-whole').forEach((element) => {
      element.classList.remove('ldc-dom-whole');
      element.style.removeProperty('--ldc-dom-color');
    });
  }

  function domCandidates() {
    return (state?.characters || [])
      .filter((character) => normalizeHex(character.binding?.color))
      .map((character) => ({
        name: character.name,
        names: [character.name, ...(character.binding?.aliases || character.aliases || [])]
          .map((name) => String(name || '').trim().toLocaleLowerCase())
          .filter(Boolean),
        color: normalizeHex(character.binding.color),
        primary: String(character.characterId || '') === String(state?.chat?.characterId || ''),
      }));
  }

  function attributedCandidate(text, start, end, candidates, fallback) {
    const lower = text.toLocaleLowerCase();
    const before = lower.slice(Math.max(0, start - 180), start);
    const after = lower.slice(end, Math.min(lower.length, end + 100));
    let winner = null;
    let winnerScore = -Infinity;
    for (const candidate of candidates) {
      for (const name of candidate.names) {
        const beforeIndex = before.lastIndexOf(name);
        if (beforeIndex >= 0) {
          const distance = before.length - (beforeIndex + name.length);
          const tail = before.slice(beforeIndex + name.length);
          const cue = /^\s*(?::|[-—–]|(?:said|says|asked|asks|replied|replies|whispered|whispers|shouted|shouts|murmured|murmurs|called|calls)\b)/i.test(tail);
          const score = 220 - distance + (cue ? 160 : 0);
          if (score > winnerScore) { winner = candidate; winnerScore = score; }
        }
        const afterIndex = after.indexOf(name);
        if (afterIndex >= 0) {
          const tail = after.slice(afterIndex + name.length);
          const cue = /^\s*(?:said|says|asked|asks|replied|replies|whispered|whispers|shouted|shouts|murmured|murmurs)\b/i.test(tail);
          const score = 150 - afterIndex + (cue ? 160 : 0);
          if (score > winnerScore) { winner = candidate; winnerScore = score; }
        }
      }
    }
    return winner || fallback || null;
  }

  function colorQuotedText(root, candidates, fallback) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!node.data.trim() || parent?.closest('font,code,pre,textarea,button,.ldc-dom-dialogue')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const records = [];
    let combined = '';
    while (walker.nextNode()) {
      const node = walker.currentNode;
      records.push({ node, start: combined.length });
      combined += node.data;
    }

    for (let recordIndex = records.length - 1; recordIndex >= 0; recordIndex -= 1) {
      const { node, start } = records[recordIndex];
      const matches = Array.from(node.data.matchAll(/“[^”\n]+”|"[^"\n]+"/g));
      for (let index = matches.length - 1; index >= 0; index -= 1) {
        const match = matches[index];
        const from = match.index;
        const speaker = attributedCandidate(combined, start + from, start + from + match[0].length, candidates, fallback);
        if (!speaker?.color) continue;
        const middle = node.splitText(from);
        const tail = middle.splitText(match[0].length);
        const span = document.createElement('span');
        span.className = 'ldc-dom-dialogue';
        span.dataset.prismSpeaker = speaker.name;
        span.style.setProperty('--ldc-dom-color', speaker.color);
        middle.replaceWith(span);
        span.appendChild(middle);
        void tail;
      }
    }
  }

  function applyDomColors() {
    if (applyingDomColors) return;
    applyingDomColors = true;
    domObserver?.disconnect();
    try {
      unwrapDomColors();
      if (!state?.ok || state.config.engine !== 'dom') return;
      const candidates = domCandidates();
      const fallback = candidates.find((candidate) => candidate.primary) || candidates[0] || null;
      const personaColor = normalizeHex(state.persona?.binding?.color);
      for (const { element } of ctx.dom.listMessageElements()) {
        const content = element.querySelector('[data-component="MessageContent"]');
        if (!content) continue;
        if (element.dataset.part === 'user') {
          if (!personaColor || state.config.autoUserMode === 'off') continue;
          if (state.config.autoUserMode === 'whole') {
            content.classList.add('ldc-dom-whole');
            content.style.setProperty('--ldc-dom-color', personaColor);
          } else {
            const personaCandidate = { name: state.persona.name, names: [state.persona.name.toLocaleLowerCase()], color: personaColor };
            colorQuotedText(content, [personaCandidate], personaCandidate);
          }
        } else if (candidates.length) {
          colorQuotedText(content, candidates, fallback);
        }
      }
    } finally {
      applyingDomColors = false;
      observeDom();
    }
  }

  function scheduleDomRefresh(immediate = false) {
    window.clearTimeout(domRefreshTimer);
    domRefreshTimer = window.setTimeout(applyDomColors, immediate ? 0 : 80);
  }

  function ensureToolbarButton() {
    const toolbar = document.querySelector('[class*="chatToolbar"]');
    if (!toolbar || toolbar.querySelector('[data-prism-toolbar-button]')) return;
    if (toolbarInjection?.isConnected) ctx.dom.uninject(toolbarInjection);
    toolbarInjection = ctx.dom.inject(toolbar, `<span class="ldc-toolbar-host"><button type="button" class="ldc-toolbar-button" data-prism-toolbar-button title="Prism dialogue colors" aria-label="Open Prism dialogue colors">${PALETTE_ICON}</button></span>`, 'beforeend');
    toolbarInjection.querySelector('[data-prism-toolbar-button]')?.addEventListener('click', openPalette);
  }

  let domObserver = new MutationObserver(() => {
    ensureToolbarButton();
    scheduleDomRefresh();
  });

  function observeDom() {
    if (!document.body) return;
    domObserver.disconnect();
    domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  async function openPalette() {
    if (modal) {
      modal.dismiss();
      modal = null;
    }
    state = null;
    modal = ctx.ui.showModal({ title: 'Prism', width: 720, maxHeight: 620 });
    modal.onDismiss(() => { modal = null; });
    render();
    try {
      const response = await request('ldc_load_state', { importCortex: true });
      state = response.state;
      selectedCharacterId = state?.characters?.[0]?.id || null;
      scheduleDomRefresh();
      render();
    } catch (error) {
      state = { ok: false, error: error?.message || String(error) };
      render();
    }
  }

  ensureToolbarButton();
  observeDom();

  const inputAction = ctx.ui.registerInputBarAction({
    id: 'open-dialogue-colors',
    label: 'Prism',
    iconSvg: PALETTE_ICON,
    enabled: true,
  });
  const unsubAction = inputAction.onClick(openPalette);

  const reloadState = (showLoading = false) => {
    if (showLoading && modal) {
      state = null;
      render();
    }
    return request('ldc_load_state', { importCortex: true })
      .then((response) => {
        state = response.state;
        selectedCharacterId = state?.characters?.[0]?.id || null;
        if (modal) render();
        scheduleDomRefresh();
      })
      .catch((error) => {
        state = { ok: false, error: error?.message || String(error) };
        if (modal) render();
        scheduleDomRefresh();
      });
  };

  const unsubChat = ctx.events.on('CHAT_SWITCHED', () => {
    ensureToolbarButton();
    reloadState(true);
  });
  const unsubMessage = ctx.events.on('MESSAGE_SENT', () => scheduleDomRefresh());
  const unsubGeneration = ctx.events.on('GENERATION_ENDED', () => scheduleDomRefresh());
  reloadState();

  return () => {
    for (const task of pending.values()) {
      clearTimeout(task.timer);
      task.reject(new Error('Extension unloaded.'));
    }
    pending.clear();
    window.clearTimeout(domRefreshTimer);
    domObserver.disconnect();
    unwrapDomColors();
    modal?.dismiss();
    unsubChat();
    unsubMessage();
    unsubGeneration();
    unsubAction();
    inputAction.destroy();
    if (toolbarInjection) ctx.dom.uninject(toolbarInjection);
    unsubBackend();
    removeStyle();
    ctx.dom.cleanup();
  };
}
