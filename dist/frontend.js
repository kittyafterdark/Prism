const PALETTE_ICON = `
<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3.25a8.75 8.75 0 1 0 0 17.5h1.25a1.75 1.75 0 0 0 0-3.5H12a1.5 1.5 0 0 1 0-3h2.75A6 6 0 0 0 20.75 8.25C20.75 5.49 17.04 3.25 12 3.25Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="7.7" cy="9" r="1" fill="currentColor"/>
  <circle cx="10.1" cy="6.8" r="1" fill="currentColor"/>
  <circle cx="13.4" cy="6.65" r="1" fill="currentColor"/>
  <circle cx="16.25" cy="8.5" r="1" fill="currentColor"/>
</svg>`;

const CSS = `
.ldc-launcher{width:42px;height:42px;border:1px solid var(--lumiverse-border);border-radius:14px;background:color-mix(in srgb,var(--lumiverse-bg-elevated) 88%,transparent);color:var(--lumiverse-primary);display:grid;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25);backdrop-filter:blur(12px);cursor:pointer;transition:transform .16s ease,border-color .16s ease}.ldc-launcher:hover{transform:translateY(-1px);border-color:var(--lumiverse-primary)}.ldc-launcher svg{width:21px;height:21px}.ldc-shell,.ldc-shell *{box-sizing:border-box}.ldc-shell{display:flex;flex-direction:column;min-height:420px;color:var(--lumiverse-text)}.ldc-tabs{display:flex;gap:6px;padding:0 0 12px;border-bottom:1px solid var(--lumiverse-border)}.ldc-tab{appearance:none;border:0;border-radius:10px;padding:8px 13px;background:transparent;color:var(--lumiverse-text-muted);font-weight:700;cursor:pointer}.ldc-tab[data-active="true"]{background:var(--lumiverse-primary-015,rgba(128,90,255,.15));color:var(--lumiverse-primary)}.ldc-main{display:grid;grid-template-columns:minmax(145px,190px) minmax(0,1fr);min-height:330px}.ldc-sidebar{padding:12px 10px 12px 0;border-right:1px solid var(--lumiverse-border);overflow:auto;max-height:430px}.ldc-person{width:100%;display:flex;align-items:center;gap:9px;padding:9px;border:1px solid transparent;border-radius:11px;background:transparent;color:var(--lumiverse-text);text-align:left;cursor:pointer}.ldc-person:hover{background:var(--lumiverse-fill-subtle)}.ldc-person[data-active="true"]{border-color:var(--lumiverse-primary-050,rgba(128,90,255,.5));background:var(--lumiverse-primary-015,rgba(128,90,255,.15))}.ldc-swatch{width:13px;height:13px;border-radius:50%;border:1px solid rgba(255,255,255,.35);box-shadow:0 0 0 2px rgba(0,0,0,.15);flex:0 0 auto}.ldc-person-copy{min-width:0}.ldc-person-name{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;font-weight:700}.ldc-person-source{display:block;margin-top:2px;font-size:10.5px;color:var(--lumiverse-text-dim)}.ldc-panel{padding:16px 2px 10px 18px;min-width:0}.ldc-empty{padding:34px 12px;text-align:center;color:var(--lumiverse-text-dim)}.ldc-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:15px}.ldc-heading h3{margin:0;font-size:17px}.ldc-sub{margin-top:4px;color:var(--lumiverse-text-dim);font-size:11.5px}.ldc-source-chip,.ldc-bridge{display:inline-flex;align-items:center;border:1px solid var(--lumiverse-border);border-radius:999px;padding:4px 8px;font-size:10px;color:var(--lumiverse-text-dim);background:var(--lumiverse-fill-subtle)}.ldc-field{display:block;margin:0 0 13px}.ldc-field>span{display:block;margin-bottom:6px;font-size:11.5px;font-weight:700;color:var(--lumiverse-text-muted)}.ldc-field input[type="text"],.ldc-field select{width:100%;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill);color:var(--lumiverse-text);padding:9px 10px;outline:none}.ldc-field input:focus,.ldc-field select:focus{border-color:var(--lumiverse-primary)}.ldc-color-row{display:grid;grid-template-columns:68px 1fr;gap:10px}.ldc-color{width:68px;height:40px;border:1px solid var(--lumiverse-border);border-radius:10px;background:var(--lumiverse-fill);padding:3px;cursor:pointer}.ldc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.ldc-btn{appearance:none;border:1px solid var(--lumiverse-border);border-radius:10px;padding:9px 12px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);font-weight:700;cursor:pointer}.ldc-btn:hover{border-color:var(--lumiverse-primary)}.ldc-btn-primary{border-color:transparent;background:var(--lumiverse-primary);color:var(--lumiverse-primary-contrast,#fff)}.ldc-btn:disabled{opacity:.55;cursor:wait}.ldc-options{margin-top:14px;padding-top:13px;border-top:1px solid var(--lumiverse-border)}.ldc-check{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--lumiverse-text-muted)}.ldc-note{margin:11px 0 0;font-size:10.5px;line-height:1.45;color:var(--lumiverse-text-dim)}.ldc-status{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px solid var(--lumiverse-border);font-size:10.5px;color:var(--lumiverse-text-dim)}.ldc-loading{display:grid;place-items:center;min-height:300px;color:var(--lumiverse-text-dim)}.ldc-error{padding:18px;border:1px solid color-mix(in srgb,var(--lumiverse-danger) 50%,var(--lumiverse-border));border-radius:12px;color:var(--lumiverse-danger)}@media(max-width:620px){.ldc-main{grid-template-columns:112px minmax(0,1fr)}.ldc-panel{padding-left:12px}.ldc-person-source{display:none}.ldc-color-row{grid-template-columns:54px 1fr}.ldc-color{width:54px}}
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

export function setup(ctx) {
  const removeStyle = ctx.dom.addStyle(CSS);
  const pending = new Map();
  let modal = null;
  let state = null;
  let activeTab = 'character';
  let selectedCharacterId = null;
  let busy = false;

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
      <p class="ldc-note">Binding also upserts the canonical name and aliases into this chat's Cortex entity graph. The exact color is injected into generation and learned by Cortex from the resulting transcript tags.</p>`;
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
      <div class="ldc-tabs"><button class="ldc-tab" data-tab="character" data-active="${activeTab === 'character'}">Character</button><button class="ldc-tab" data-tab="persona" data-active="${activeTab === 'persona'}">Persona</button></div>
      <div class="ldc-main">
        ${activeTab === 'character' ? `<aside class="ldc-sidebar">${characterSidebar()}</aside><section class="ldc-panel">${characterPanel(currentCharacter())}</section>` : `<aside class="ldc-sidebar"><button class="ldc-person" data-active="true"><span class="ldc-swatch" style="background:${escapeHtml(state.persona?.binding?.color || '#777777')}"></span><span class="ldc-person-copy"><span class="ldc-person-name">${escapeHtml(state.persona?.name || 'No persona')}</span><span class="ldc-person-source">currently applied</span></span></button></aside><section class="ldc-panel">${personaPanel()}</section>`}
      </div>
      <div class="ldc-options"><label class="ldc-check"><input data-role="prompt-toggle" type="checkbox" ${state.config.promptCharacterColors ? 'checked' : ''}> Inject bound colors into normal generations</label></div>
      <div class="ldc-status"><span>${escapeHtml(state.chat.name)}</span><span class="ldc-bridge">Cortex: ${state.cortexAvailable ? 'linked' : 'permission unavailable'}${state.cortexImportedCount ? ` · imported ${state.cortexImportedCount}` : ''}</span></div>
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
      await ctx.ui.showConfirm({ title: 'Dialogue Colors', message, confirmLabel: 'Okay', cancelLabel: 'Close', variant: 'warning' });
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
        render();
      });
    });
    modal.root.querySelectorAll('[data-character-id]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedCharacterId = button.dataset.characterId;
        render();
      });
    });

    const promptToggle = modal.root.querySelector('[data-role="prompt-toggle"]');
    promptToggle?.addEventListener('change', () => perform(async () => {
      const response = await request('ldc_update_options', {
        promptCharacterColors: promptToggle.checked,
        autoUserMode: state.config.autoUserMode,
      });
      state = response.state;
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
        promptCharacterColors: promptToggle?.checked ?? state.config.promptCharacterColors,
      });
      state = response.state;
      selectedCharacterId = state.characters.find((item) => item.name === character.name)?.id || selectedCharacterId;
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
        promptCharacterColors: promptToggle?.checked ?? state.config.promptCharacterColors,
      });
      state = response.state;
      render();
    }));

    modal.root.querySelector('[data-action="recolor"]')?.addEventListener('click', () => perform(async () => {
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

  async function openPalette() {
    if (modal) {
      modal.dismiss();
      modal = null;
    }
    state = null;
    modal = ctx.ui.showModal({ title: 'Dialogue Colors', width: 720, maxHeight: 620 });
    modal.onDismiss(() => { modal = null; });
    render();
    try {
      const response = await request('ldc_load_state', { importCortex: true });
      state = response.state;
      selectedCharacterId = state?.characters?.[0]?.id || null;
      render();
    } catch (error) {
      state = { ok: false, error: error?.message || String(error) };
      render();
    }
  }

  let widget = null;
  try {
    widget = ctx.ui.createFloatWidget({
      width: 46,
      height: 46,
      initialPosition: { x: Math.max(12, window.innerWidth - 78), y: 76 },
      snapToEdge: true,
      tooltip: 'Dialogue Colors',
      chromeless: true,
    });
    widget.root.innerHTML = `<button class="ldc-launcher" aria-label="Open Dialogue Colors">${PALETTE_ICON}</button>`;
    widget.root.querySelector('button')?.addEventListener('click', openPalette);
  } catch (error) {
    console.warn('[Lumi Dialogue Colors] Float widget unavailable:', error);
  }

  const inputAction = ctx.ui.registerInputBarAction({
    id: 'open-dialogue-colors',
    label: 'Dialogue Colors',
    iconSvg: PALETTE_ICON,
    enabled: true,
  });
  const unsubAction = inputAction.onClick(openPalette);

  const unsubChat = ctx.events.on('CHAT_SWITCHED', () => {
    if (modal) {
      state = null;
      render();
      request('ldc_load_state', { importCortex: true })
        .then((response) => {
          state = response.state;
          selectedCharacterId = state?.characters?.[0]?.id || null;
          render();
        })
        .catch((error) => {
          state = { ok: false, error: error?.message || String(error) };
          render();
        });
    }
  });

  return () => {
    for (const task of pending.values()) {
      clearTimeout(task.timer);
      task.reject(new Error('Extension unloaded.'));
    }
    pending.clear();
    modal?.dismiss();
    unsubChat();
    unsubAction();
    inputAction.destroy();
    widget?.destroy();
    unsubBackend();
    removeStyle();
    ctx.dom.cleanup();
  };
}
