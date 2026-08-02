const CONFIG_VAR = 'lumi_dialogue_colors_v1';
const GLOBAL_PREFS_VAR = 'prism_preferences_v1';
const FAST_OPTIONAL_TIMEOUT_MS = 4500;
const TRANSCRIPT_TIMEOUT_MS = 12000;
function withTimeout(promise, timeoutMs, label) {
    let timer;
    return Promise.race([
        Promise.resolve(promise),
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
        }),
    ]).finally(() => clearTimeout(timer));
}
const DEFAULT_CONFIG = Object.freeze({
    version: 9,
    engine: 'hybrid',
    autoUserMode: 'quoted',
    personaEnabled: true,
    promptCharacterColors: true,
    promptThoughtColors: false,
    bindings: {},
    overrides: {},
    manualCharacters: {},
    hiddenCharacters: {},
    observations: {},
    hydratedMessages: {},
    dismissedObservationKeys: {},
    registryUsage: {},
    cortexStatus: null,
});
const ENGINE_VALUES = Object.freeze(['dom', 'hybrid', 'llm']);
const recentRegistrySnapshots = new Map();
function normalizeEngine(value, fallback = 'hybrid') {
    return ENGINE_VALUES.includes(value) ? value : (ENGINE_VALUES.includes(fallback) ? fallback : 'hybrid');
}
function usesModelTags(engine) {
    return engine === 'hybrid' || engine === 'llm';
}
function usesDomOverpass(engine) {
    return engine === 'dom' || engine === 'hybrid';
}
const DEFAULT_PREFERENCES = Object.freeze({
    preferredEngine: 'hybrid',
    domAttributionMode: 'balanced',
    autoAssignMissing: true,
    personaMode: 'quoted',
    markUncertain: true,
    thoughtDetection: 'off',
    existingStylePolicy: 'enhance',
    useExistingAsEvidence: true,
});
function cloneDefaultConfig(preferredEngine = DEFAULT_CONFIG.engine) {
    return {
        version: DEFAULT_CONFIG.version,
        engine: normalizeEngine(preferredEngine),
        autoUserMode: DEFAULT_CONFIG.autoUserMode,
        personaEnabled: DEFAULT_CONFIG.personaEnabled,
        promptCharacterColors: DEFAULT_CONFIG.promptCharacterColors,
        promptThoughtColors: DEFAULT_CONFIG.promptThoughtColors,
        bindings: {},
        overrides: {},
        manualCharacters: {},
        hiddenCharacters: {},
        observations: {},
        hydratedMessages: {},
        dismissedObservationKeys: {},
        registryUsage: {},
        cortexStatus: null,
    };
}
function safePreferences(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
        preferredEngine: normalizeEngine(source.preferredEngine),
        domAttributionMode: ['strict', 'balanced', 'aggressive'].includes(source.domAttributionMode)
            ? source.domAttributionMode
            : DEFAULT_PREFERENCES.domAttributionMode,
        autoAssignMissing: source.autoAssignMissing !== false,
        personaMode: ['off', 'quoted', 'whole'].includes(source.personaMode)
            ? source.personaMode
            : DEFAULT_PREFERENCES.personaMode,
        markUncertain: source.markUncertain !== false,
        thoughtDetection: ['off', 'italics', 'single-quotes', 'italics-and-single-quotes'].includes(source.thoughtDetection)
            ? source.thoughtDetection
            : DEFAULT_PREFERENCES.thoughtDetection,
        existingStylePolicy: ['preserve', 'enhance', 'replace'].includes(source.existingStylePolicy)
            ? source.existingStylePolicy
            : DEFAULT_PREFERENCES.existingStylePolicy,
        useExistingAsEvidence: source.useExistingAsEvidence !== false,
    };
}
function defaultPaint(anchor) {
    const color = normalizeHex(anchor) || '#B58CFF';
    return { mode: 'solid', stops: [color], angle: 90, anchor: color };
}
function safePaint(raw, fallbackColor) {
    const anchor = normalizeHex(raw?.anchor) || normalizeHex(fallbackColor) || '#B58CFF';
    const stops = (Array.isArray(raw?.stops) ? raw.stops : []).map(normalizeHex).filter(Boolean).slice(0, 4);
    if (raw?.mode === 'gradient' && stops.length >= 2) {
        return {
            mode: 'gradient',
            stops,
            angle: Math.max(0, Math.min(360, Number(raw.angle) || 90)),
            anchor,
        };
    }
    return { mode: 'solid', stops: [stops[0] || anchor], angle: 90, anchor };
}
function paintSignature(raw, fallbackColor) {
    const paint = safePaint(raw, fallbackColor);
    return JSON.stringify({ mode: paint.mode, stops: paint.stops, angle: paint.angle, anchor: paint.anchor });
}
function safeChannels(raw, fallbackColor, assumeLegacyThoughtLink = false) {
    const canonical = normalizeHex(fallbackColor)
        || normalizeHex(raw?.dialogue?.paint?.stops?.[0])
        || '#B58CFF';
    const dialoguePaint = safePaint(raw?.dialogue?.paint, canonical);
    dialoguePaint.stops[0] = canonical;
    dialoguePaint.anchor = canonical;
    const dialogue = {
        enabled: raw?.dialogue?.enabled !== false,
        paint: dialoguePaint,
    };
    const storedThoughtPaint = safePaint(raw?.thought?.paint, canonical);
    storedThoughtPaint.anchor = canonical;
    const explicitlyLinked = typeof raw?.thought?.linkedToDialogue === 'boolean'
        ? raw.thought.linkedToDialogue
        : null;
    const matchesDialogue = paintSignature(storedThoughtPaint, canonical) === paintSignature(dialogue.paint, canonical);
    const looksLikeLegacyDefault = assumeLegacyThoughtLink
        && paintSignature(storedThoughtPaint, canonical) === paintSignature(defaultPaint(canonical), canonical);
    const linkedToDialogue = explicitlyLinked ?? (!raw?.thought?.paint || matchesDialogue || looksLikeLegacyDefault);
    const thoughtPaint = linkedToDialogue ? safePaint(dialogue.paint, canonical) : storedThoughtPaint;
    thoughtPaint.anchor = canonical;
    return {
        dialogue,
        thought: {
            enabled: raw?.thought?.enabled === true,
            linkedToDialogue,
            paint: thoughtPaint,
        },
    };
}
function bindingRegistryColor(binding, fallbackColor = null) {
    return normalizeHex(binding?.channels?.dialogue?.paint?.stops?.[0])
        || normalizeHex(binding?.color)
        || normalizeHex(fallbackColor);
}
function safeGlobalState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const library = {};
    if (source.library && typeof source.library === 'object') {
        for (const [key, item] of Object.entries(source.library)) {
            const storedColor = normalizeHex(item?.color);
            const color = normalizeHex(item?.channels?.dialogue?.paint?.stops?.[0]) || storedColor;
            if (!color)
                continue;
            library[key] = {
                color,
                channels: safeChannels(item?.channels, color, Number(source.version || 0) < 3),
                aliases: uniqueStrings(item?.aliases),
                name: String(item?.name || '').trim(),
                source: ['cortex', 'transcript', 'preset', 'generated', 'manual'].includes(item?.source) ? item.source : 'library',
                pinned: typeof item?.pinned === 'boolean' ? item.pinned : item?.source !== 'generated',
                updatedAt: Number(item?.updatedAt) || 0,
            };
        }
    }
    return { version: 4, preferences: safePreferences(source.preferences), library };
}
function normalizeHex(value) {
    const raw = String(value || '').trim();
    const short = raw.match(/^#?([0-9a-f]{3})$/i);
    if (short) {
        return `#${short[1].split('').map((c) => c + c).join('').toUpperCase()}`;
    }
    const full = raw.match(/^#?([0-9a-f]{6})$/i);
    return full ? `#${full[1].toUpperCase()}` : null;
}
function normalizeName(value) {
    return String(value || '').trim().toLocaleLowerCase();
}
function uniqueStrings(values) {
    const seen = new Set();
    const output = [];
    for (const value of values || []) {
        const clean = String(value || '').trim();
        const key = normalizeName(clean);
        if (!clean || seen.has(key))
            continue;
        seen.add(key);
        output.push(clean);
    }
    return output;
}
function safeConfig(raw, preferredEngine = DEFAULT_CONFIG.engine) {
    const fallback = cloneDefaultConfig(preferredEngine);
    if (!raw || typeof raw !== 'object')
        return fallback;
    const mode = ['off', 'quoted', 'whole'].includes(raw.autoUserMode)
        ? raw.autoUserMode
        : fallback.autoUserMode;
    const bindings = {};
    if (raw.bindings && typeof raw.bindings === 'object') {
        for (const [key, value] of Object.entries(raw.bindings)) {
            if (!value || typeof value !== 'object')
                continue;
            const storedColor = normalizeHex(value.color);
            const color = normalizeHex(value.channels?.dialogue?.paint?.stops?.[0]) || storedColor;
            const name = String(value.name || '').trim();
            if (!color || !name)
                continue;
            bindings[key] = {
                kind: value.kind === 'persona' ? 'persona' : 'character',
                targetId: String(value.targetId || ''),
                name,
                aliases: uniqueStrings(value.aliases),
                color,
                channels: safeChannels(value.channels, color, Number(raw.version || 0) < 6),
                previousColors: uniqueStrings([
                    ...(value.previousColors || []),
                    ...(storedColor && storedColor !== color ? [storedColor] : []),
                ])
                    .map(normalizeHex)
                    .filter(Boolean)
                    .filter((hex) => hex !== color),
                source: ['cortex', 'transcript', 'preset', 'generated', 'library'].includes(value.source) ? value.source : 'manual',
                pinned: typeof value.pinned === 'boolean' ? value.pinned : value.source !== 'generated',
                speakerUid: String(value.speakerUid || `prism-speaker-${hashString(`${value.kind === 'persona' ? 'persona' : 'character'}:${normalizeName(name) || value.targetId || key}`).toString(36)}`),
                legacyRefs: uniqueStrings([...(value.legacyRefs || []), String(value.targetId || '')]),
            };
        }
    }
    const overrides = {};
    if (raw.overrides && typeof raw.overrides === 'object') {
        for (const [key, value] of Object.entries(raw.overrides)) {
            if (!value || typeof value !== 'object')
                continue;
            const messageId = String(value.messageId || '').trim();
            const contentHash = String(value.contentHash || '').trim();
            const segmentKey = String(value.segmentKey || key || '').trim();
            if (!messageId || !contentHash || !segmentKey)
                continue;
            overrides[key] = {
                messageId,
                swipeId: Math.max(0, Number(value.swipeId) || 0),
                contentHash,
                segmentKey,
                quote: String(value.quote || '').slice(0, 1000),
                speakerKey: value.speakerKey == null ? null : String(value.speakerKey),
                kind: ['dialogue', 'thought', 'ignored'].includes(value.kind) ? value.kind : 'dialogue',
            };
        }
    }
    const manualCharacters = {};
    if (raw.manualCharacters && typeof raw.manualCharacters === 'object') {
        for (const [key, value] of Object.entries(raw.manualCharacters)) {
            const name = cleanSceneName(value?.name);
            if (!name)
                continue;
            const id = String(value?.id || key || `manual:${normalizeName(name)}`);
            manualCharacters[id] = { id, name, aliases: uniqueStrings(value?.aliases), source: value?.source === 'cortex-registry' ? 'cortex-registry' : 'manual-roster' };
        }
    }
    const hiddenCharacters = {};
    if (raw.hiddenCharacters && typeof raw.hiddenCharacters === 'object') {
        for (const [key, value] of Object.entries(raw.hiddenCharacters)) {
            if (value === true && normalizeName(key))
                hiddenCharacters[normalizeName(key)] = true;
        }
    }
    const observations = {};
    if (raw.observations && typeof raw.observations === 'object') {
        for (const [key, value] of Object.entries(raw.observations)) {
            if (!value || typeof value !== 'object')
                continue;
            const id = String(value.id || key || '').trim();
            const messageId = String(value.messageId || '').trim();
            const contentHash = String(value.contentHash || '').trim();
            const observedColor = normalizeHex(value.observedColor);
            if (!id || !messageId || !contentHash || !observedColor)
                continue;
            const kind = ['new-speaker', 'unknown-color', 'color-drift', 'speaker-conflict', 'color-collision', 'alias-suggestion'].includes(value.kind)
                ? value.kind
                : 'unknown-color';
            observations[id] = {
                id,
                groupKey: String(value.groupKey || `${kind}:${normalizeName(value.inferredName)}:${observedColor}`),
                messageId,
                swipeId: Math.max(0, Number(value.swipeId) || 0),
                contentHash,
                quote: String(value.quote || '').slice(0, 1200),
                surroundingText: String(value.surroundingText || '').slice(0, 1600),
                observedColor,
                inferredName: cleanSceneName(value.inferredName) || null,
                matchedSpeakerUid: value.matchedSpeakerUid ? String(value.matchedSpeakerUid) : null,
                registryRevision: String(value.registryRevision || ''),
                kind,
                confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
                status: ['pending', 'approved', 'dismissed'].includes(value.status) ? value.status : 'pending',
                resolvedSpeakerUid: value.resolvedSpeakerUid ? String(value.resolvedSpeakerUid) : null,
                source: ['font', 'inline-style', 'bbcode', 'escaped-tag'].includes(value.source) ? value.source : 'font',
                occurrenceIndex: Math.max(0, Number(value.occurrenceIndex) || 0),
                createdAt: Math.max(0, Number(value.createdAt) || Date.now()),
                lastSeenAt: Math.max(0, Number(value.lastSeenAt) || Number(value.createdAt) || Date.now()),
            };
        }
    }
    const hydratedMessages = {};
    if (raw.hydratedMessages && typeof raw.hydratedMessages === 'object') {
        for (const [key, value] of Object.entries(raw.hydratedMessages).slice(-300)) {
            if (!key || !value || typeof value !== 'object')
                continue;
            hydratedMessages[String(key)] = {
                contentHash: String(value.contentHash || ''),
                swipeId: Math.max(0, Number(value.swipeId) || 0),
                registryRevision: String(value.registryRevision || ''),
                at: Math.max(0, Number(value.at) || 0),
            };
        }
    }
    const dismissedObservationKeys = {};
    if (raw.dismissedObservationKeys && typeof raw.dismissedObservationKeys === 'object') {
        for (const [key, value] of Object.entries(raw.dismissedObservationKeys)) {
            if (value === true && key)
                dismissedObservationKeys[String(key)] = true;
        }
    }
    const registryUsage = {};
    if (raw.registryUsage && typeof raw.registryUsage === 'object') {
        for (const [key, value] of Object.entries(raw.registryUsage)) {
            if (!key || !value || typeof value !== 'object')
                continue;
            registryUsage[String(key)] = { count: Math.max(0, Number(value.count) || 0), lastSeenAt: Math.max(0, Number(value.lastSeenAt) || 0) };
        }
    }
    const speakerKeyMap = new Map();
    for (const binding of Object.values(bindings)) {
        const currentKey = `${binding.kind}:${binding.speakerUid}`;
        speakerKeyMap.set(`${binding.kind}:${binding.targetId}`, currentKey);
        for (const legacyRef of binding.legacyRefs || [])
            speakerKeyMap.set(`${binding.kind}:${legacyRef}`, currentKey);
    }
    for (const override of Object.values(overrides)) {
        if (override.speakerKey && speakerKeyMap.has(override.speakerKey))
            override.speakerKey = speakerKeyMap.get(override.speakerKey);
    }
    return {
        version: 9,
        engine: normalizeEngine(raw.engine, preferredEngine),
        autoUserMode: mode,
        personaEnabled: raw.personaEnabled !== false,
        promptCharacterColors: raw.promptCharacterColors !== false,
        promptThoughtColors: raw.promptThoughtColors === true,
        bindings,
        overrides,
        manualCharacters,
        hiddenCharacters,
        observations,
        hydratedMessages,
        dismissedObservationKeys,
        registryUsage,
        cortexStatus: raw.cortexStatus && typeof raw.cortexStatus === 'object' ? raw.cortexStatus : null,
    };
}
async function loadGlobalState(userId) {
    try {
        const text = await spindle.variables.global.get(GLOBAL_PREFS_VAR, userId);
        const parsed = text ? JSON.parse(text) : null;
        const safe = safeGlobalState(parsed);
        if (parsed && JSON.stringify(parsed) !== JSON.stringify(safe)) {
            await spindle.variables.global.set(GLOBAL_PREFS_VAR, JSON.stringify(safe), userId);
        }
        return safe;
    }
    catch (error) {
        spindle.log.warn(`Could not read Prism preferences: ${error?.message || error}`);
        return safeGlobalState(null);
    }
}
async function saveGlobalState(globalState, userId) {
    const safe = safeGlobalState(globalState);
    await spindle.variables.global.set(GLOBAL_PREFS_VAR, JSON.stringify(safe), userId);
    return safe;
}
async function loadConfig(chatId, userId) {
    const globalState = await loadGlobalState(userId);
    try {
        const text = await spindle.variables.chat.get(chatId, CONFIG_VAR);
        if (!text)
            return cloneDefaultConfig(globalState.preferences.preferredEngine);
        const parsed = JSON.parse(text);
        const safe = safeConfig(parsed, globalState.preferences.preferredEngine);
        if (JSON.stringify(parsed) !== JSON.stringify(safe)) {
            await spindle.variables.chat.set(chatId, CONFIG_VAR, JSON.stringify(safe));
        }
        return safe;
    }
    catch (error) {
        spindle.log.warn(`Could not read dialogue color config: ${error?.message || error}`);
        return cloneDefaultConfig(globalState.preferences.preferredEngine);
    }
}
async function saveConfig(chatId, config) {
    await spindle.variables.chat.set(chatId, CONFIG_VAR, JSON.stringify(safeConfig(config)));
}
function parseCortexColorMacro(text) {
    const source = String(text || '')
        .replace(/<\/?character_colors>/gi, '')
        .replace(/```[a-z]*\n?/gi, '')
        .trim();
    if (!source)
        return [];
    const found = [];
    const patterns = [
        /^\s*(?:[-*]\s*)?([^:=\n]{1,120}?)\s*[:=]\s*["']?(#[0-9a-f]{6})["']?\s*[,;]?\s*$/gim,
        /["']([^"'\n]{1,120})["']\s*:\s*["'](#[0-9a-f]{6})["']/gi,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source))) {
            const name = String(match[1] || '').trim();
            const color = normalizeHex(match[2]);
            if (!name || !color)
                continue;
            if (!found.some((entry) => normalizeName(entry.name) === normalizeName(name))) {
                found.push({ name, color });
            }
        }
    }
    return found;
}
function findBinding(config, kind, targetId, name, aliases = []) {
    const directKey = `${kind}:${targetId}`;
    if (config.bindings[directKey])
        return config.bindings[directKey];
    const candidates = new Set([name, ...aliases].map(normalizeName).filter(Boolean));
    for (const binding of Object.values(config.bindings)) {
        if (binding.kind !== kind)
            continue;
        const names = [binding.name, ...(binding.aliases || [])].map(normalizeName);
        if (names.some((candidate) => candidates.has(candidate)))
            return binding;
    }
    return null;
}
function ensureBindingIdentities(config) {
    let changed = false;
    const keyMap = new Map();
    for (const binding of Object.values(config.bindings || {})) {
        if (!binding.speakerUid) {
            binding.speakerUid = `prism-speaker-${hashString(`${binding.kind}:${normalizeName(binding.name) || binding.targetId}`).toString(36)}`;
            changed = true;
        }
        const refs = uniqueStrings([...(binding.legacyRefs || []), binding.targetId]);
        if (JSON.stringify(refs) !== JSON.stringify(binding.legacyRefs || [])) {
            binding.legacyRefs = refs;
            changed = true;
        }
        const speakerKey = `${binding.kind}:${binding.speakerUid}`;
        keyMap.set(`${binding.kind}:${binding.targetId}`, speakerKey);
        for (const ref of refs)
            keyMap.set(`${binding.kind}:${ref}`, speakerKey);
    }
    for (const override of Object.values(config.overrides || {})) {
        const migrated = override.speakerKey && keyMap.get(override.speakerKey);
        if (migrated && migrated !== override.speakerKey) {
            override.speakerKey = migrated;
            changed = true;
        }
    }
    return changed;
}
function libraryKeysForCharacter(character) {
    return uniqueStrings([
        character?.characterId ? `character-card:${character.characterId}` : '',
        character?.entityId ? `cortex-character:${character.entityId}` : '',
        character?.name ? `character-name:${normalizeName(character.name)}` : '',
    ]);
}
function libraryKeyForPersona(persona) {
    return persona?.id ? `persona:${persona.id}` : `persona-name:${normalizeName(persona?.name)}`;
}
function hashString(value) {
    let hash = 2166136261;
    for (const char of String(value || '')) {
        hash ^= char.codePointAt(0) || 0;
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function hslToHex(hue, saturation, lightness) {
    const h = ((Number(hue) % 360) + 360) % 360;
    const s = Math.max(0, Math.min(100, Number(saturation))) / 100;
    const l = Math.max(0, Math.min(100, Number(lightness))) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0]
        : h < 120 ? [x, c, 0]
            : h < 180 ? [0, c, x]
                : h < 240 ? [0, x, c]
                    : h < 300 ? [x, 0, c]
                        : [c, 0, x];
    return `#${[r, g, b].map((part) => Math.round((part + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
function relativeLuminance(hex) {
    const value = normalizeHex(hex) || '#000000';
    const parts = [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16) / 255)
        .map((part) => (part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4));
    return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
}
function contrastRatio(a, b) {
    const bright = Math.max(relativeLuminance(a), relativeLuminance(b));
    const dark = Math.min(relativeLuminance(a), relativeLuminance(b));
    return (bright + 0.05) / (dark + 0.05);
}
function generatedColor(seed, index = 0) {
    const hue = (hashString(seed) + Number(index) * 137.508) % 360;
    let lightness = 67;
    let color = hslToHex(hue, 68, lightness);
    while (contrastRatio(color, '#15131D') < 4.5 && lightness < 82) {
        lightness += 2;
        color = hslToHex(hue, 68, lightness);
    }
    return color;
}
function hexHue(hex) {
    const value = normalizeHex(hex);
    if (!value)
        return null;
    const [r, g, b] = [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    if (!delta)
        return 0;
    const sector = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return (sector * 60 + 360) % 360;
}
function generatedColorForIdentity(identity, usedColors = []) {
    let hue = hashString(identity) % 360;
    const usedHues = usedColors.map(hexHue).filter((value) => value != null);
    let attempts = 0;
    while (usedHues.some((used) => Math.min(Math.abs(used - hue), 360 - Math.abs(used - hue)) < 34) && attempts < 12) {
        hue = (hue + 137.508) % 360;
        attempts += 1;
    }
    let lightness = 67;
    let color = hslToHex(hue, 68, lightness);
    while (contrastRatio(color, '#15131D') < 4.5 && lightness < 82) {
        lightness += 2;
        color = hslToHex(hue, 68, lightness);
    }
    return color;
}
function bindingLibraryKeys(binding, characters, persona) {
    if (binding.kind === 'persona')
        return [libraryKeyForPersona(persona || binding)];
    const character = characters.find((item) => (String(item.id) === String(binding.targetId)
        || normalizeName(item.name) === normalizeName(binding.name)));
    return character ? libraryKeysForCharacter(character) : [`character-name:${normalizeName(binding.name)}`];
}
function syncBindingsToLibrary(config, characters, persona, globalState) {
    let changed = false;
    for (const binding of Object.values(config.bindings)) {
        const color = bindingRegistryColor(binding);
        if (!color)
            continue;
        const character = binding.kind === 'character' ? characters.find((item) => (String(item.id) === String(binding.targetId)
            || normalizeName(item.name) === normalizeName(binding.name))) : null;
        const stableIdentity = binding.kind === 'persona'
            || Boolean(character?.characterId || character?.entityId)
            || binding.source === 'cortex'
            || (binding.source === 'manual' && binding.pinned === true);
        if (!stableIdentity)
            continue;
        for (const key of bindingLibraryKeys(binding, characters, persona)) {
            const prior = globalState.library[key];
            const next = { color, channels: safeChannels(binding.channels, color), aliases: uniqueStrings(binding.aliases), name: binding.name, source: binding.source, pinned: binding.pinned !== false, updatedAt: Date.now() };
            if (!prior || prior.color !== next.color || prior.source !== next.source || prior.pinned !== next.pinned || JSON.stringify(prior.aliases || []) !== JSON.stringify(next.aliases) || JSON.stringify(prior.channels) !== JSON.stringify(next.channels)) {
                globalState.library[key] = next;
                changed = true;
            }
        }
    }
    return changed;
}
function seedBindingsFromLibrary(config, characters, persona, globalState) {
    let seeded = 0;
    for (const character of characters) {
        if (findBinding(config, 'character', character.id, character.name, character.aliases))
            continue;
        const entry = libraryKeysForCharacter(character).map((key) => globalState.library[key]).find(Boolean);
        if (!entry?.color)
            continue;
        const targetId = String(character.entityId || character.characterId || character.id);
        config.bindings[`character:${targetId}`] = {
            kind: 'character', targetId, name: character.name,
            aliases: uniqueStrings([...(character.aliases || []), ...(entry.aliases || [])]),
            color: entry.color, channels: safeChannels(entry.channels, entry.color), previousColors: [], source: entry.source === 'generated' ? 'generated' : 'library', pinned: entry.pinned !== false,
        };
        seeded += 1;
    }
    if (persona && !findBinding(config, 'persona', persona.id, persona.name, [])) {
        const entry = globalState.library[libraryKeyForPersona(persona)];
        if (entry?.color) {
            const targetId = String(persona.id);
            config.bindings[`persona:${targetId}`] = {
                kind: 'persona', targetId, name: persona.name, aliases: uniqueStrings(entry.aliases),
                color: entry.color, channels: safeChannels(entry.channels, entry.color), previousColors: [], source: entry.source === 'generated' ? 'generated' : 'library', pinned: entry.pinned !== false,
            };
            seeded += 1;
        }
    }
    return seeded;
}
function stripStructuredText(value) {
    let text = String(value || '').replace(/```[\s\S]*?```/g, ' ');
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
            JSON.parse(trimmed);
            return '';
        }
        catch { }
    }
    text = text.split(/\r?\n/).map((line) => {
        const clean = line.trim();
        if (!clean)
            return line;
        if (/^[{}\[\],]+$/.test(clean))
            return '';
        if (/^\s*["'][^"']+["']\s*:\s*(?:["'{\[\d-]|true\b|false\b|null\b)/i.test(clean))
            return '';
        return line;
    }).join('\n');
    return text;
}
function cleanSceneName(value) {
    const name = String(value || '')
        .replace(/^[\s*_\[\]]+/, '')
        .replace(/[\s*_\[\]]+$/, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!name || name.length > 80 || /[<>\n\r{}"`=_]/.test(name))
        return '';
    if (/^(?:character|characters|cast|speaker|speakers|npc|npcs|assistant|user|scenario|setting|scene|card)$/i.test(name))
        return '';
    return name;
}
const DISCOVERY_NAME_STOPWORDS = new Set([
    'i', 'me', 'my', 'mine', 'myself',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself',
    'we', 'us', 'our', 'ours', 'ourselves',
    'they', 'them', 'their', 'theirs', 'themselves',
    'this', 'that', 'these', 'those',
    'a', 'an', 'the', 'someone', 'somebody', 'nobody',
    'let us', 'sometimes a', 'sometimes an', 'sometimes the',
]);
function cleanDiscoveredSceneName(value) {
    const name = cleanSceneName(String(value || '').replace(/['’]s$/i, ''));
    if (!name || DISCOVERY_NAME_STOPWORDS.has(name.toLocaleLowerCase()))
        return '';
    // Prose fragments produced by a loose grammar usually contain lowercase
    // lexical words ("The newspapers", "Let us"). Real multi-word names in
    // automatic speech tags should otherwise look like proper names. Declared
    // cast lists bypass this check below because their contents are explicit.
    const particles = new Set(['da', 'de', 'del', 'della', 'di', 'du', 'la', 'le', 'of', 'the', 'van', 'von']);
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length > 6)
        return '';
    if (words.some((word, index) => {
        const bare = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
        if (!bare || /^\d/u.test(bare) || /^[\p{Lu}]/u.test(bare))
            return false;
        return index === 0 || !particles.has(bare.toLocaleLowerCase());
    }))
        return '';
    return name;
}
const REPORTING_VERB_SOURCE = '(?:say|said|says|ask|asked|asks|reply|replied|replies|answer|answered|answers|announce|announced|announces|observe|observed|observes|remark|remarked|remarks|state|stated|states|declare|declared|declares|note|noted|notes|explain|explained|explains|add|added|adds|continue|continued|continues|whisper|whispered|whispers|murmur|murmured|murmurs|mutter|muttered|mutters|breathe|breathed|breathes|hiss|hissed|hisses|growl|growled|growls|drawl|drawled|drawls|intone|intoned|intones|shout|shouted|shouts|yell|yelled|yells|cry|cried|cries|call|called|calls|snap|snapped|snaps|bark|barked|barks|exclaim|exclaimed|exclaims|retort|retorted|retorts|protest|protested|protests|insist|insisted|insists|warn|warned|warns|demand|demanded|demands|urge|urged|urges|correct|corrected|corrects|admit|admitted|admits|concede|conceded|concedes|agree|agreed|agrees|object|objected|objects|promise|promised|promises|laugh|laughed|laughs|sigh|sighed|sighs|scoff|scoffed|scoffs|groan|groaned|groans|repeat|repeated|repeats|echo|echoed|echoes|offer|offered|offers|assure|assured|assures)';
function extractSceneNamesFromText(value) {
    const text = stripStructuredText(value);
    if (!text.trim())
        return [];
    const names = [];
    const add = (value, declared = false) => {
        const name = declared
            ? cleanSceneName(String(value || '').replace(/['’]s$/i, ''))
            : cleanDiscoveredSceneName(value);
        if (name)
            names.push(name);
    };
    const labelPattern = /(?:^|\n)\s*(?:[-*]\s+)?(?:\*\*|\[)?([^:\]\n*]{1,80}?)(?:\*\*|\])?\s*:\s*(?:\*\*)?\s*(?=["“])/gmu;
    let match;
    while ((match = labelPattern.exec(text)))
        add(match[1], true);
    const knownBefore = new RegExp(`(?:^|[\\n.!?]\\s+)([\\p{Lu}][\\p{L}\\p{N}'’. -]{0,60}?)\\s+${REPORTING_VERB_SOURCE}\\b(?:[^"“”\\n]{0,160})?[,:.]\\s*(?=["“])`, 'gmu');
    while ((match = knownBefore.exec(text)))
        add(match[1]);
    const knownAfter = new RegExp(`["”][^"“”\\n]{1,500}["”]\\s*[,;.!?—–-]*\\s*([\\p{Lu}][\\p{L}\\p{N}'’. -]{0,60}?)\\s+${REPORTING_VERB_SOURCE}\\b`, 'gmu');
    while ((match = knownAfter.exec(text)))
        add(match[1]);
    const castPattern = /(?:^|\n)\s*(?:cast|characters|speakers|npcs)\s*:\s*([^\n]{1,240})/gimu;
    while ((match = castPattern.exec(text))) {
        for (const item of match[1].split(/[,;|/]/))
            add(item.replace(/\s*\([^)]*\)\s*$/, ''), true);
    }
    return uniqueStrings(names);
}
function extractSceneNamesFromCard(card) {
    const names = [];
    const extensions = card?.extensions && typeof card.extensions === 'object' ? card.extensions : {};
    for (const key of ['character_names', 'characterNames', 'cast_names', 'castNames', 'characters', 'cast']) {
        const value = extensions[key];
        if (!Array.isArray(value))
            continue;
        for (const item of value)
            names.push(cleanSceneName(typeof item === 'string' ? item : item?.name));
    }
    for (const field of ['description', 'personality', 'scenario', 'first_mes', 'mes_example', 'system_prompt', 'post_history_instructions']) {
        names.push(...extractSceneNamesFromText(card?.[field]));
    }
    return uniqueStrings(names.filter(Boolean));
}
function mergeSceneCharacter(characters, candidate) {
    const candidateNames = new Set([candidate.name, ...(candidate.aliases || [])].map(normalizeName).filter(Boolean));
    const existing = characters.find((entry) => {
        const entryNames = [entry.name, ...(entry.aliases || [])].map(normalizeName);
        return entryNames.some((name) => candidateNames.has(name));
    });
    if (!existing) {
        characters.push(candidate);
        return candidate;
    }
    existing.entityId = existing.entityId || candidate.entityId || null;
    existing.characterId = existing.characterId || candidate.characterId || null;
    existing.aliases = uniqueStrings([...(existing.aliases || []), ...(candidate.aliases || [])])
        .filter((alias) => normalizeName(alias) !== normalizeName(existing.name));
    existing.status = existing.status || candidate.status || 'active';
    existing.source = uniqueStrings([...(String(existing.source || '').split('+')), ...(String(candidate.source || '').split('+'))]).join('+');
    if (existing.entityId)
        existing.id = String(existing.entityId);
    else if (existing.characterId)
        existing.id = String(existing.characterId);
    existing.key = `character:${existing.id}`;
    return existing;
}
async function getSceneCharacters(chat, cardCharacters, userId, options = {}) {
    let entities = [];
    let cortexAvailable = true;
    try {
        entities = await withTimeout(spindle.memories.entities.list(chat.id, {
            activeOnly: false,
            limit: 200,
            userId,
        }), FAST_OPTIONAL_TIMEOUT_MS, 'Cortex entity list');
    }
    catch (error) {
        cortexAvailable = false;
        spindle.log.warn(`Cortex entity list unavailable: ${error?.message || error}`);
    }
    const characters = [];
    const groupIds = new Set(Array.isArray(chat?.metadata?.character_ids)
        ? chat.metadata.character_ids.map(String)
        : []);
    for (const entity of entities || []) {
        if ((entity?.entityType || entity?.type) !== 'character' || !entity?.name)
            continue;
        mergeSceneCharacter(characters, {
            id: String(entity.id),
            key: `character:${entity.id}`,
            entityId: String(entity.id),
            characterId: null,
            name: String(entity.name),
            aliases: uniqueStrings(entity.aliases),
            status: String(entity.status || 'active'),
            source: 'cortex',
        });
    }
    for (const card of cardCharacters || []) {
        const extractedNames = extractSceneNamesFromCard(card);
        const cardName = cleanSceneName(card?.name);
        const isContainerCard = !groupIds.has(String(card?.id || '')) && (!cardName
            || /(?:scenario|setting|scene|world|multichar|multi[- ]character|roleplay)/i.test(cardName)
            || extractedNames.filter((name) => normalizeName(name) !== normalizeName(cardName)).length >= 2);
        if (cardName && !isContainerCard) {
            mergeSceneCharacter(characters, {
                id: String(card.id),
                key: `character:${card.id}`,
                entityId: null,
                characterId: String(card.id),
                name: cardName,
                aliases: [],
                status: 'active',
                source: 'card',
            });
        }
        for (const name of extractedNames) {
            mergeSceneCharacter(characters, {
                id: `scene-name:${normalizeName(name)}`,
                key: `character:scene-name:${normalizeName(name)}`,
                entityId: null,
                characterId: null,
                name,
                aliases: [],
                status: 'active',
                source: 'card-cast',
            });
        }
    }
    if (options.scanTranscript === true) {
        try {
            const messages = await withTimeout(spindle.chat.getMessages(chat.id, userId), TRANSCRIPT_TIMEOUT_MS, 'Transcript speaker scan');
            for (const message of messages || []) {
                const isUser = message?.role === 'user' || message?.is_user === true;
                if (!isUser && message?.name) {
                    const name = cleanSceneName(message.name);
                    if (name)
                        mergeSceneCharacter(characters, {
                            id: `scene-name:${normalizeName(name)}`,
                            key: `character:scene-name:${normalizeName(name)}`,
                            entityId: null,
                            characterId: null,
                            name,
                            aliases: [],
                            status: 'active',
                            source: 'transcript',
                        });
                }
                for (const name of extractSceneNamesFromText(message?.content)) {
                    mergeSceneCharacter(characters, {
                        id: `scene-name:${normalizeName(name)}`,
                        key: `character:scene-name:${normalizeName(name)}`,
                        entityId: null,
                        characterId: null,
                        name,
                        aliases: [],
                        status: 'active',
                        source: 'transcript',
                    });
                }
            }
        }
        catch (error) {
            spindle.log.warn(`Transcript speaker scan unavailable: ${error?.message || error}`);
        }
    }
    characters.sort((a, b) => {
        const aGroup = groupIds.has(String(a.characterId || '')) ? 1 : 0;
        const bGroup = groupIds.has(String(b.characterId || '')) ? 1 : 0;
        if (aGroup !== bGroup)
            return bGroup - aGroup;
        const aPrimary = String(a.characterId || '') === String(chat.character_id || '') ? 1 : 0;
        const bPrimary = String(b.characterId || '') === String(chat.character_id || '') ? 1 : 0;
        if (aPrimary !== bPrimary)
            return bPrimary - aPrimary;
        return a.name.localeCompare(b.name);
    });
    return { characters, cortexAvailable };
}
function sceneReferenceNames(character, characters) {
    const names = uniqueStrings([character.name, ...(character.aliases || [])]);
    const canonicalParts = String(character.name || '').split(/\s+/).map(cleanSceneName).filter((part) => part.length >= 2);
    for (const part of [canonicalParts[0], canonicalParts.at(-1)].filter(Boolean)) {
        const owners = characters.filter((candidate) => (String(candidate.name || '').split(/\s+/).some((token) => normalizeName(token) === normalizeName(part))));
        if (owners.length === 1)
            names.push(part);
    }
    return uniqueStrings(names);
}
function matchSceneCharacter(characters, name) {
    const needle = normalizeName(name);
    if (!needle)
        return null;
    const exact = characters.find((character) => ([character.name, ...(character.aliases || [])].map(normalizeName).includes(needle)));
    if (exact)
        return exact;
    const partial = characters.filter((character) => sceneReferenceNames(character, characters).map(normalizeName).includes(needle));
    return partial.length === 1 ? partial[0] : null;
}
function characterNearStyledRange(text, start, end, characters, messageName) {
    const lower = text.toLocaleLowerCase();
    const beforeWindow = lower.slice(Math.max(0, start - 140), start);
    const afterWindow = lower.slice(end, Math.min(lower.length, end + 100));
    const before = beforeWindow.slice(beforeWindow.lastIndexOf('\n') + 1);
    const nextLineBreak = afterWindow.indexOf('\n');
    const after = nextLineBreak >= 0 ? afterWindow.slice(0, nextLineBreak) : afterWindow;
    let winner = null;
    let winnerScore = -Infinity;
    for (const character of characters) {
        for (const rawName of sceneReferenceNames(character, characters)) {
            const name = normalizeName(rawName);
            if (!name)
                continue;
            const beforeIndex = before.lastIndexOf(name);
            if (beforeIndex >= 0) {
                const score = 140 - (before.length - beforeIndex - name.length);
                if (score > winnerScore) {
                    winner = character;
                    winnerScore = score;
                }
            }
            const afterIndex = after.indexOf(name);
            if (afterIndex >= 0) {
                const score = 155 - afterIndex;
                if (score > winnerScore) {
                    winner = character;
                    winnerScore = score;
                }
            }
        }
    }
    return winner || matchSceneCharacter(characters, messageName);
}
function styledColorRanges(value) {
    const text = String(value || '')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");
    const ranges = [];
    const patterns = [
        /<font\b[^>]*\bcolor\s*=\s*["']?(#[0-9a-f]{6}|#[0-9a-f]{3})["']?[^>]*>[\s\S]*?<\/font>/gi,
        /<span\b[^>]*\bstyle\s*=\s*["'][^"']*\bcolor\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
        /\[color\s*=\s*["']?(#[0-9a-f]{6}|#[0-9a-f]{3})["']?\][\s\S]*?\[\/color\]/gi,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text))) {
            const color = normalizeHex(match[1]);
            if (color)
                ranges.push({ color, start: match.index, end: match.index + match[0].length });
        }
    }
    return { text, ranges };
}
async function importTranscriptRegistry(chat, characters, config, userId) {
    let messages = [];
    try {
        messages = await withTimeout(spindle.chat.getMessages(chat.id, userId), TRANSCRIPT_TIMEOUT_MS, 'Existing dialogue color scan');
    }
    catch (error) {
        spindle.log.warn(`Existing dialogue colors could not be scanned: ${error?.message || error}`);
        return { config, imported: 0, detected: 0 };
    }
    const votes = new Map();
    const detectedColors = new Set();
    const vote = (character, color, weight = 1) => {
        if (!character || !color)
            return;
        const key = normalizeName(character.name);
        if (!votes.has(color))
            votes.set(color, new Map());
        votes.get(color).set(key, (votes.get(color).get(key) || 0) + weight);
    };
    for (const message of messages || []) {
        const isUser = message?.role === 'user' || message?.is_user === true;
        if (isUser)
            continue;
        const variants = Array.isArray(message.swipes) && message.swipes.length ? message.swipes : [message.content];
        for (const variant of variants) {
            for (const item of parseCortexColorMacro(variant)) {
                const character = matchSceneCharacter(characters, item.name);
                if (character) {
                    detectedColors.add(item.color);
                    vote(character, item.color, 5);
                }
            }
            const styled = styledColorRanges(variant);
            const messageColors = new Set(styled.ranges.map((range) => range.color));
            for (const range of styled.ranges) {
                detectedColors.add(range.color);
                vote(characterNearStyledRange(styled.text, range.start, range.end, characters, message.name), range.color, 2);
            }
            if (messageColors.size === 1) {
                const messageCharacter = matchSceneCharacter(characters, message.name);
                if (messageCharacter)
                    vote(messageCharacter, [...messageColors][0], 2);
            }
        }
    }
    const assignments = new Map();
    for (const [color, colorVotes] of votes) {
        const ranked = [...colorVotes.entries()].sort((a, b) => b[1] - a[1]);
        if (ranked[0])
            assignments.set(color, ranked[0][0]);
    }
    for (const binding of Object.values(config.bindings)) {
        const registryColor = bindingRegistryColor(binding);
        if (binding.kind === 'character' && registryColor) {
            assignments.set(registryColor, normalizeName(binding.name));
        }
    }
    const assignedNames = new Set(assignments.values());
    const remainingColors = [...detectedColors].filter((color) => !assignments.has(color));
    const remainingCharacters = characters.filter((character) => (!assignedNames.has(normalizeName(character.name))
        && !findBinding(config, 'character', character.id, character.name, character.aliases)));
    if (assignments.size > 0 && remainingColors.length === 1 && remainingCharacters.length === 1) {
        assignments.set(remainingColors[0], normalizeName(remainingCharacters[0].name));
    }
    let imported = 0;
    for (const [color, normalizedName] of assignments) {
        const character = matchSceneCharacter(characters, normalizedName);
        if (!character || findBinding(config, 'character', character.id, character.name, character.aliases))
            continue;
        const targetId = String(character.entityId || character.characterId || character.id);
        config.bindings[`character:${targetId}`] = {
            kind: 'character',
            targetId,
            name: character.name,
            aliases: uniqueStrings(character.aliases),
            color,
            channels: safeChannels(null, color),
            previousColors: [],
            source: 'transcript',
        };
        imported += 1;
    }
    if (imported > 0)
        await saveConfig(chat.id, config);
    return { config, imported, detected: detectedColors.size };
}
function migrateOverrideSpeakerKey(config, oldKey, newKey) {
    if (!oldKey || !newKey || oldKey === newKey)
        return 0;
    let migrated = 0;
    for (const override of Object.values(config.overrides || {})) {
        if (override.speakerKey === oldKey) {
            override.speakerKey = newKey;
            migrated += 1;
        }
    }
    return migrated;
}
function cortexMayReplace(binding, repairMode) {
    if (!binding)
        return true;
    if (binding.source === 'manual')
        return false;
    return repairMode && ['generated', 'library', 'transcript', 'preset', 'cortex'].includes(binding.source);
}
async function importCortexRegistry(chat, primaryCharacter, characters, config, userId, mode = 'missing') {
    let imported = 0;
    let repaired = 0;
    let macroText = '';
    const conflicts = [];
    const registryOnly = [];
    const repairMode = mode === 'repair';
    const health = {
        entitiesAvailable: true,
        macroResolved: false,
        registryEntries: 0,
        matchedEntries: 0,
        importedEntries: 0,
        repairedEntries: 0,
        localOnlyCharacters: 0,
        registryOnlyCharacters: 0,
        conflicts,
        unmatchedEntries: registryOnly,
        lastError: null,
        lastSyncAt: Date.now(),
    };
    try {
        const result = await withTimeout(spindle.macros.resolve('{{characterColors}}', {
            chatId: chat.id,
            characterId: primaryCharacter?.id || chat.character_id,
            commit: false,
            userId,
        }), FAST_OPTIONAL_TIMEOUT_MS, 'Cortex color macro');
        macroText = result?.text || '';
        health.macroResolved = true;
    }
    catch (error) {
        health.lastError = error?.message || String(error);
        spindle.log.warn(`Cortex color macro could not be resolved: ${health.lastError}`);
        config.cortexStatus = health;
        await saveConfig(chat.id, config);
        return { config, imported, repaired, macroText: '', health };
    }
    const registry = parseCortexColorMacro(macroText);
    health.registryEntries = registry.length;
    const registryNames = new Set(registry.map((item) => normalizeName(item.name)));
    for (const item of registry) {
        const normalized = normalizeName(item.name);
        if (config.hiddenCharacters?.[normalized])
            continue;
        let sceneCharacter = characters.find((character) => {
            const names = [character.name, ...(character.aliases || [])].map(normalizeName);
            return names.includes(normalized);
        });
        if (!sceneCharacter) {
            const targetId = `cortex-name:${normalized}`;
            sceneCharacter = mergeSceneCharacter(characters, {
                id: targetId,
                key: `character:${targetId}`,
                entityId: null,
                characterId: null,
                name: item.name,
                aliases: [],
                status: 'registry-only',
                source: 'cortex-registry',
            });
            config.manualCharacters[targetId] = { id: targetId, name: item.name, aliases: [], source: 'cortex-registry' };
            registryOnly.push({ name: item.name, color: item.color, targetId });
        }
        health.matchedEntries += 1;
        const targetId = String(sceneCharacter.entityId || sceneCharacter.characterId || sceneCharacter.id || `cortex-name:${normalized}`);
        const existing = findBinding(config, 'character', targetId, sceneCharacter.name, sceneCharacter.aliases || []);
        const oldEntry = existing ? Object.entries(config.bindings).find(([, binding]) => binding === existing) : null;
        if (existing && bindingRegistryColor(existing) === item.color) {
            if (repairMode && oldEntry?.[0] !== `character:${targetId}` && existing.source !== 'manual') {
                delete config.bindings[oldEntry[0]];
                existing.targetId = targetId;
                existing.name = sceneCharacter.name;
                existing.aliases = uniqueStrings([...(existing.aliases || []), ...(sceneCharacter.aliases || [])]);
                config.bindings[`character:${targetId}`] = existing;
                migrateOverrideSpeakerKey(config, oldEntry[0], `character:${targetId}`);
                repaired += 1;
            }
            continue;
        }
        if (existing && !cortexMayReplace(existing, repairMode)) {
            conflicts.push({ name: sceneCharacter.name, localColor: bindingRegistryColor(existing), cortexColor: item.color, source: existing.source, pinned: existing.pinned === true });
            continue;
        }
        if (existing && !repairMode)
            continue;
        const previousColors = uniqueStrings([...(existing?.previousColors || []), bindingRegistryColor(existing)])
            .map(normalizeHex).filter(Boolean).filter((color) => color !== item.color);
        const nextKey = `character:${targetId}`;
        if (oldEntry)
            delete config.bindings[oldEntry[0]];
        config.bindings[nextKey] = {
            kind: 'character', targetId, name: sceneCharacter.name || item.name,
            aliases: uniqueStrings([...(sceneCharacter.aliases || []), ...(existing?.aliases || [])]),
            color: item.color, channels: safeChannels(null, item.color), previousColors,
            source: 'cortex', pinned: true,
            speakerUid: existing?.speakerUid || `prism-speaker-${hashString(`character:${normalized}`).toString(36)}`,
            legacyRefs: uniqueStrings([...(existing?.legacyRefs || []), existing?.targetId, targetId]),
        };
        if (oldEntry)
            migrateOverrideSpeakerKey(config, oldEntry[0], nextKey);
        if (existing)
            repaired += 1;
        else
            imported += 1;
    }
    health.importedEntries = imported;
    health.repairedEntries = repaired;
    health.registryOnlyCharacters = registryOnly.length;
    health.localOnlyCharacters = characters.filter((character) => ![character.name, ...(character.aliases || [])].map(normalizeName).some((name) => registryNames.has(name))).length;
    config.cortexStatus = health;
    await saveConfig(chat.id, config);
    return { config, imported, repaired, macroText, health };
}
async function buildState(options = {}, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat) {
        return { ok: false, error: 'Open a chat first.' };
    }
    const cardIds = uniqueStrings([
        ...(Array.isArray(chat?.metadata?.character_ids) ? chat.metadata.character_ids : []),
        chat.character_id,
    ]);
    const [cardCharacters, persona] = await Promise.all([
        Promise.all(cardIds.map((characterId) => spindle.characters.get(characterId, userId).catch(() => null)))
            .then((characters) => characters.filter(Boolean)),
        spindle.personas.getActive(userId).catch(() => null),
    ]);
    const primaryCharacter = cardCharacters.find((character) => String(character.id) === String(chat.character_id)) || cardCharacters[0] || null;
    const scene = await getSceneCharacters(chat, cardCharacters, userId, {
        scanTranscript: options.scanTranscript === true,
    });
    let config = await loadConfig(chat.id, userId);
    for (const manual of Object.values(config.manualCharacters || {})) {
        mergeSceneCharacter(scene.characters, {
            id: String(manual.id),
            key: `character:${manual.id}`,
            entityId: null,
            characterId: null,
            name: manual.name,
            aliases: uniqueStrings(manual.aliases),
            status: 'active',
            source: manual.source === 'cortex-registry' ? 'cortex-registry' : 'manual-roster',
        });
    }
    scene.characters = scene.characters.filter((character) => !config.hiddenCharacters?.[normalizeName(character.name)]);
    let globalState = await loadGlobalState(userId);
    let cortexImportedCount = 0;
    let transcriptImportedCount = 0;
    let transcriptColorsDetected = 0;
    let cortexMacroText = '';
    let cortexHealth = config.cortexStatus && typeof config.cortexStatus === 'object'
        ? { ...config.cortexStatus, entitiesAvailable: scene.cortexAvailable }
        : { entitiesAvailable: scene.cortexAvailable, macroResolved: false, registryEntries: 0, matchedEntries: 0, importedEntries: 0, repairedEntries: 0, localOnlyCharacters: scene.characters.length, registryOnlyCharacters: 0, conflicts: [], unmatchedEntries: [], lastError: scene.cortexAvailable ? null : 'Cortex entity list unavailable.', lastSyncAt: null };
    if (options.importCortex !== false) {
        const imported = await importCortexRegistry(chat, primaryCharacter, scene.characters, config, userId, options.cortexMode === 'repair' ? 'repair' : 'missing');
        config = imported.config;
        cortexImportedCount = imported.imported;
        cortexMacroText = imported.macroText;
        cortexHealth = { ...imported.health, entitiesAvailable: scene.cortexAvailable };
        if (options.scanTranscript === true) {
            const transcriptImported = await importTranscriptRegistry(chat, scene.characters, config, userId);
            config = transcriptImported.config;
            transcriptImportedCount = transcriptImported.imported;
            transcriptColorsDetected = transcriptImported.detected;
        }
    }
    const librarySeededCount = seedBindingsFromLibrary(config, scene.characters, persona, globalState);
    const identityMigrated = ensureBindingIdentities(config);
    if (librarySeededCount > 0 || identityMigrated)
        await saveConfig(chat.id, config);
    if (syncBindingsToLibrary(config, scene.characters, persona, globalState)) {
        globalState = await saveGlobalState(globalState, userId);
    }
    const characters = scene.characters.map((character) => ({
        ...character,
        binding: findBinding(config, 'character', character.id, character.name, character.aliases),
    }));
    const personaBinding = persona
        ? findBinding(config, 'persona', persona.id, persona.name, [])
        : null;
    const registry = compileRegistry(config);
    const reviewGroups = pendingReviewGroups(config);
    return {
        ok: true,
        chat: { id: chat.id, name: chat.name, characterId: chat.character_id },
        characters,
        persona: persona
            ? {
                id: String(persona.id),
                name: String(persona.name),
                title: String(persona.title || ''),
                isNarrator: Boolean(persona.is_narrator),
                binding: personaBinding,
            }
            : null,
        config,
        registry,
        reviewGroups,
        pendingReviewCount: reviewGroups.length,
        preferences: globalState.preferences,
        cortexAvailable: scene.cortexAvailable,
        cortex: cortexHealth,
        cortexImportedCount,
        transcriptImportedCount,
        transcriptColorsDetected,
        librarySeededCount,
        cortexRegistryDetected: parseCortexColorMacro(cortexMacroText).length,
        cortexBridge: 'macro-import + transcript-learning',
    };
}
function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function replaceKnownColors(content, config, kind) {
    let output = String(content || '');
    for (const binding of Object.values(config.bindings)) {
        if (kind && binding.kind !== kind)
            continue;
        const current = bindingRegistryColor(binding);
        if (!current)
            continue;
        const oldColors = uniqueStrings(binding.previousColors)
            .map(normalizeHex)
            .filter(Boolean)
            .filter((hex) => hex !== current);
        for (const oldColor of oldColors) {
            const pattern = new RegExp(`(<font\\b[^>]*\\bcolor\\s*=\\s*["']?)${escapeRegExp(oldColor)}(["']?[^>]*>)`, 'gi');
            output = output.replace(pattern, `$1${current}$2`);
        }
    }
    return output;
}
function wrapQuotedDialogue(content, color) {
    const source = String(content || '');
    const protectedBlocks = [];
    const tokenized = source.replace(/<font\b[^>]*>[\s\S]*?<\/font>/gi, (block) => {
        const token = `\uE000${protectedBlocks.length}\uE001`;
        protectedBlocks.push(block);
        return token;
    });
    const colored = tokenized
        .replace(/“([^”\n]+)”/g, `<font color="${color}">“$1”</font>`)
        .replace(/(^|[\s([{>—–-])"([^"\n]+)"(?=$|[\s)\]}>.,!?;:—–-])/gm, `$1<font color="${color}">"$2"</font>`);
    return colored.replace(/\uE000(\d+)\uE001/g, (_, index) => protectedBlocks[Number(index)] || '');
}
function applyPersonaColor(content, color, mode) {
    const normalized = normalizeHex(color);
    if (!normalized || mode === 'off')
        return String(content || '');
    const source = String(content || '');
    if (mode === 'whole') {
        if (/^\s*<font\b[^>]*>[\s\S]*<\/font>\s*$/i.test(source))
            return source;
        return `<font color="${normalized}">${source}</font>`;
    }
    return wrapQuotedDialogue(source, normalized);
}
async function saveBinding(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && payload.chatId !== chat.id)) {
        throw new Error('The active chat changed. Reopen the palette and try again.');
    }
    const kind = payload.kind === 'persona' ? 'persona' : 'character';
    const targetId = String(payload.targetId || '').trim();
    const name = String(payload.name || '').trim();
    const aliases = uniqueStrings(payload.aliases);
    const requestedChannels = payload.channels || null;
    const color = normalizeHex(requestedChannels?.dialogue?.paint?.stops?.[0])
        || normalizeHex(payload.color);
    if (!targetId || !name || !color)
        throw new Error('A target, name, and valid dialogue color are required.');
    const config = await loadConfig(chat.id, userId);
    if (ENGINE_VALUES.includes(payload.engine)) {
        config.engine = payload.engine;
        config.promptCharacterColors = usesModelTags(payload.engine);
    }
    if (['off', 'quoted', 'whole'].includes(payload.autoUserMode)) {
        config.autoUserMode = payload.autoUserMode;
    }
    if (typeof payload.personaEnabled === 'boolean') {
        config.personaEnabled = payload.personaEnabled;
    }
    if (typeof payload.promptCharacterColors === 'boolean') {
        config.promptCharacterColors = payload.promptCharacterColors;
    }
    const old = findBinding(config, kind, targetId, name, aliases);
    const previousColors = uniqueStrings([
        ...(old?.previousColors || []),
        ...(old?.color && old.color !== color ? [old.color] : []),
    ]).map(normalizeHex).filter(Boolean).filter((hex) => hex !== color);
    let resolvedTargetId = targetId;
    if (kind === 'character') {
        try {
            const entity = await spindle.memories.entities.upsert(chat.id, {
                name,
                type: 'character',
                aliases,
                confidence: 1,
            }, { userId });
            if (entity?.id)
                resolvedTargetId = String(entity.id);
        }
        catch (error) {
            spindle.log.warn(`Cortex alias upsert skipped: ${error?.message || error}`);
        }
    }
    else {
        try {
            await spindle.memories.entities.upsert(chat.id, {
                name,
                type: 'character',
                aliases: [],
                confidence: 1,
            }, { userId });
        }
        catch (error) {
            spindle.log.warn(`Persona Cortex upsert skipped: ${error?.message || error}`);
        }
    }
    for (const [key, binding] of Object.entries(config.bindings)) {
        if (binding === old || (binding.kind === kind && normalizeName(binding.name) === normalizeName(name))) {
            delete config.bindings[key];
        }
    }
    config.bindings[`${kind}:${resolvedTargetId}`] = {
        kind,
        targetId: resolvedTargetId,
        name,
        aliases,
        color,
        channels: safeChannels(requestedChannels || old?.channels, color),
        previousColors,
        source: 'manual',
        pinned: true,
        speakerUid: old?.speakerUid || `prism-speaker-${hashString(`${kind}:${normalizeName(name) || resolvedTargetId}`).toString(36)}`,
        legacyRefs: uniqueStrings([...(old?.legacyRefs || []), old?.targetId, targetId, resolvedTargetId]),
    };
    ensureBindingIdentities(config);
    await saveConfig(chat.id, config);
    await spindle.memories.cortex.invalidateCache(chat.id, userId).catch(() => { });
    return buildState({ importCortex: false }, userId);
}
async function addSceneCharacter(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && String(payload.chatId) !== String(chat.id))) {
        throw new Error('The active chat changed. Reopen Prism and try again.');
    }
    const name = cleanSceneName(payload.name);
    if (!name)
        throw new Error('Enter a short character name without markup.');
    const aliases = uniqueStrings(payload.aliases)
        .filter((alias) => normalizeName(alias) !== normalizeName(name));
    const config = await loadConfig(chat.id, userId);
    const existing = Object.values(config.manualCharacters || {})
        .find((item) => normalizeName(item.name) === normalizeName(name));
    const id = existing?.id || `manual:${hashString(normalizeName(name)).toString(36)}`;
    config.manualCharacters[id] = { id, name, aliases, source: 'manual-roster' };
    delete config.hiddenCharacters[normalizeName(name)];
    await saveConfig(chat.id, config);
    return buildState({ importCortex: false }, userId);
}
async function removeSceneCharacter(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && String(payload.chatId) !== String(chat.id))) {
        throw new Error('The active chat changed. Reopen Prism and try again.');
    }
    const name = cleanSceneName(payload.name);
    if (!name)
        throw new Error('Prism could not identify that roster entry.');
    const config = await loadConfig(chat.id, userId);
    for (const [key, item] of Object.entries(config.manualCharacters || {})) {
        if (String(item.id) === String(payload.characterId) || normalizeName(item.name) === normalizeName(name)) {
            delete config.manualCharacters[key];
        }
    }
    config.hiddenCharacters[normalizeName(name)] = true;
    await saveConfig(chat.id, config);
    return buildState({ importCortex: false }, userId);
}
async function updateOptions(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat)
        throw new Error('Open a chat first.');
    const config = await loadConfig(chat.id, userId);
    if (ENGINE_VALUES.includes(payload.engine)) {
        config.engine = payload.engine;
        config.promptCharacterColors = usesModelTags(payload.engine);
    }
    if (['off', 'quoted', 'whole'].includes(payload.autoUserMode)) {
        config.autoUserMode = payload.autoUserMode;
    }
    if (typeof payload.personaEnabled === 'boolean') {
        config.personaEnabled = payload.personaEnabled;
    }
    if (typeof payload.promptCharacterColors === 'boolean') {
        config.promptCharacterColors = payload.promptCharacterColors;
    }
    if (typeof payload.promptThoughtColors === 'boolean') {
        config.promptThoughtColors = payload.promptThoughtColors;
    }
    let globalState = await loadGlobalState(userId);
    if (ENGINE_VALUES.includes(payload.engine)) {
        globalState.preferences.preferredEngine = payload.engine;
    }
    if (['strict', 'balanced', 'aggressive'].includes(payload.domAttributionMode)) {
        globalState.preferences.domAttributionMode = payload.domAttributionMode;
    }
    if (typeof payload.markUncertain === 'boolean') {
        globalState.preferences.markUncertain = payload.markUncertain;
    }
    if (typeof payload.autoAssignMissing === 'boolean') {
        globalState.preferences.autoAssignMissing = payload.autoAssignMissing;
    }
    if (['off', 'italics', 'single-quotes', 'italics-and-single-quotes'].includes(payload.thoughtDetection)) {
        globalState.preferences.thoughtDetection = payload.thoughtDetection;
    }
    if (['preserve', 'enhance', 'replace'].includes(payload.existingStylePolicy)) {
        globalState.preferences.existingStylePolicy = payload.existingStylePolicy;
    }
    if (typeof payload.useExistingAsEvidence === 'boolean') {
        globalState.preferences.useExistingAsEvidence = payload.useExistingAsEvidence;
    }
    if (['off', 'quoted', 'whole'].includes(payload.autoUserMode)) {
        globalState.preferences.personaMode = payload.autoUserMode;
    }
    await saveGlobalState(globalState, userId);
    await saveConfig(chat.id, config);
    return buildState({ importCortex: false }, userId);
}
async function assignSceneColors(payload, userId) {
    const state = await buildState({ importCortex: true, scanTranscript: true }, userId);
    if (!state.ok)
        throw new Error(state.error || 'Open a chat first.');
    const chatId = state.chat.id;
    const config = await loadConfig(chatId, userId);
    const globalState = await loadGlobalState(userId);
    const regenerate = payload?.regenerate === true;
    let assigned = 0;
    const usedColors = Object.values(config.bindings)
        .filter((binding) => !regenerate || binding.pinned !== false || binding.source !== 'generated')
        .map((binding) => bindingRegistryColor(binding))
        .filter(Boolean);
    config.engine = normalizeEngine(config.engine, globalState.preferences.preferredEngine);
    config.promptCharacterColors = usesModelTags(config.engine);
    config.autoUserMode = 'quoted';
    globalState.preferences.preferredEngine = config.engine;
    globalState.preferences.personaMode = 'quoted';
    const sortedCharacters = [...(state.characters || [])].sort((a, b) => (libraryKeysForCharacter(a)[0].localeCompare(libraryKeysForCharacter(b)[0])));
    for (const character of sortedCharacters) {
        const existing = findBinding(config, 'character', character.id, character.name, character.aliases);
        if (existing && (!regenerate || existing.pinned !== false || existing.source !== 'generated'))
            continue;
        if (existing) {
            for (const [key, value] of Object.entries(config.bindings)) {
                if (value === existing)
                    delete config.bindings[key];
            }
        }
        const targetId = String(character.entityId || character.characterId || character.id);
        const identity = libraryKeysForCharacter(character)[0] || `character-name:${normalizeName(character.name)}`;
        const color = generatedColorForIdentity(identity, usedColors);
        config.bindings[`character:${targetId}`] = {
            kind: 'character', targetId, name: character.name, aliases: uniqueStrings(character.aliases),
            color, channels: safeChannels(null, color), previousColors: [], source: 'generated', pinned: false,
        };
        usedColors.push(color);
        assigned += 1;
    }
    const persona = state.persona;
    if (persona && config.personaEnabled !== false) {
        const existing = findBinding(config, 'persona', persona.id, persona.name, []);
        if (!existing || (regenerate && existing.pinned === false && existing.source === 'generated')) {
            if (existing) {
                for (const [key, value] of Object.entries(config.bindings)) {
                    if (value === existing)
                        delete config.bindings[key];
                }
            }
            const targetId = String(persona.id);
            const identity = libraryKeyForPersona(persona);
            const color = generatedColorForIdentity(identity, usedColors);
            config.bindings[`persona:${targetId}`] = {
                kind: 'persona', targetId, name: persona.name, aliases: [],
                color, channels: safeChannels(null, color), previousColors: [], source: 'generated', pinned: false,
            };
            assigned += 1;
        }
    }
    syncBindingsToLibrary(config, state.characters || [], persona, globalState);
    await Promise.all([saveConfig(chatId, config), saveGlobalState(globalState, userId)]);
    return { state: await buildState({ importCortex: false }, userId), assigned };
}
async function saveQuoteOverride(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && String(payload.chatId) !== String(chat.id))) {
        throw new Error('The active chat changed.');
    }
    const messageId = String(payload.messageId || '').trim();
    const contentHash = String(payload.contentHash || '').trim();
    const segmentKey = String(payload.segmentKey || '').trim();
    if (!messageId || !contentHash || !segmentKey)
        throw new Error('This quote could not be identified safely.');
    const config = await loadConfig(chat.id, userId);
    const existingColor = normalizeHex(payload.existingColor);
    const speakerKey = payload.speakerKey == null ? null : String(payload.speakerKey);
    if (existingColor && speakerKey) {
        const binding = config.bindings[speakerKey] || Object.values(config.bindings).find((candidate) => `${candidate.kind}:${candidate.speakerUid}` === speakerKey);
        const alreadyOwned = Object.values(config.bindings).some((candidate) => (candidate !== binding
            && [bindingRegistryColor(candidate), candidate.channels?.dialogue?.paint?.anchor, ...(candidate.previousColors || [])]
                .map(normalizeHex).filter(Boolean).includes(existingColor)));
        if (binding && !alreadyOwned && bindingRegistryColor(binding) !== existingColor) {
            binding.previousColors = uniqueStrings([...(binding.previousColors || []), existingColor])
                .map(normalizeHex).filter(Boolean).filter((color) => color !== bindingRegistryColor(binding));
        }
    }
    const overrideKey = `${messageId}:${Math.max(0, Number(payload.swipeId) || 0)}:${segmentKey}`;
    config.overrides[overrideKey] = {
        messageId,
        swipeId: Math.max(0, Number(payload.swipeId) || 0),
        contentHash,
        segmentKey,
        quote: String(payload.quote || '').slice(0, 1000),
        speakerKey,
        kind: ['dialogue', 'thought', 'ignored'].includes(payload.kind) ? payload.kind : 'dialogue',
    };
    await saveConfig(chat.id, config);
    return buildState({ importCortex: false }, userId);
}
async function recolorExisting(chatId, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || chat.id !== chatId)
        throw new Error('The active chat changed.');
    const config = await loadConfig(chat.id, userId);
    const persona = await spindle.personas.getActive(userId).catch(() => null);
    const personaBinding = config.personaEnabled !== false && persona
        ? findBinding(config, 'persona', persona.id, persona.name, [])
        : null;
    const messages = await spindle.chat.getMessages(chat.id, userId);
    let changed = 0;
    for (const message of messages) {
        const originalSwipes = Array.isArray(message.swipes) && message.swipes.length
            ? message.swipes
            : [message.content];
        const nextSwipes = originalSwipes.map((swipe) => {
            const bindingKind = (message.role === 'user' || message.is_user === true) ? 'persona' : 'character';
            let next = replaceKnownColors(swipe, config, bindingKind);
            if (message.role === 'user' && personaBinding) {
                next = applyPersonaColor(next, bindingRegistryColor(personaBinding), config.autoUserMode);
            }
            return next;
        });
        if (nextSwipes.every((value, index) => value === originalSwipes[index]))
            continue;
        await spindle.chat.updateMessage(chat.id, message.id, {
            swipes: nextSwipes,
            swipe_id: Math.min(Number(message.swipe_id) || 0, nextSwipes.length - 1),
            metadata: {
                ...(message.metadata || {}),
                lumi_dialogue_colors_applied: true,
            },
        }, userId);
        changed += 1;
    }
    return { changed };
}
function decodeObservedText(value) {
    return String(value || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractPortableColorTags(content) {
    const text = String(content || '');
    const found = [];
    const patterns = [
        { source: 'font', pattern: /<font\b[^>]*\bcolor\s*=\s*["']?(#[0-9a-f]{3,6})["']?[^>]*>([\s\S]*?)<\/font>/gi },
        { source: 'inline-style', pattern: /<span\b[^>]*\bstyle\s*=\s*["'][^"']*\bcolor\s*:\s*(#[0-9a-f]{3,6})[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi },
        { source: 'bbcode', pattern: /\[color\s*=\s*["']?(#[0-9a-f]{3,6})["']?\]([\s\S]*?)\[\/color\]/gi },
    ];
    for (const { source, pattern } of patterns) {
        let match;
        while ((match = pattern.exec(text))) {
            const color = normalizeHex(match[1]);
            const quote = decodeObservedText(match[2]);
            if (!color || !quote)
                continue;
            found.push({ start: match.index, end: match.index + match[0].length, color, quote, source });
        }
    }
    return found.sort((a, b) => a.start - b.start || b.end - a.end)
        .filter((entry, index, list) => !list.slice(0, index).some((parent) => entry.start >= parent.start && entry.end <= parent.end));
}
function knownRegistrySpeakerByName(registry, value) {
    const name = normalizeName(value);
    if (!name)
        return null;
    const matches = registry.entries.filter((entry) => [entry.name, ...(entry.aliases || [])].map(normalizeName).includes(name));
    return matches.length === 1 ? matches[0] : null;
}
function inferTagSpeakerName(content, tag) {
    const before = decodeObservedText(String(content || '').slice(Math.max(0, tag.start - 280), tag.start));
    const after = decodeObservedText(String(content || '').slice(tag.end, tag.end + 280));
    const probe = `${before.slice(-220)} "${tag.quote.replace(/^[“”"]|[“”"]$/g, '')}" ${after.slice(0, 220)}`;
    const names = extractSceneNamesFromText(probe);
    if (names.length === 1)
        return names[0];
    const afterStructural = after.match(/^\s*[,;.!?—–-]*\s*([\p{Lu}][\p{L}\p{N}'’. -]{0,60}?)\s+[\p{Ll}][\p{L}'’-]{2,28}\b/u);
    const beforeStructural = before.match(/([\p{Lu}][\p{L}\p{N}'’. -]{0,60}?)\s+[\p{Ll}][\p{L}'’-]{2,28}\b(?:[^.!?]{0,140})?$/u);
    return cleanDiscoveredSceneName(afterStructural?.[1] || beforeStructural?.[1]) || null;
}
function classifyTagObservation(tag, inferredName, registry) {
    const colorOwner = registry.byColor?.[tag.color] || null;
    const inferredSpeaker = knownRegistrySpeakerByName(registry, inferredName);
    const collision = (registry.conflicts || []).find((item) => item.color === tag.color);
    if (collision)
        return { kind: 'color-collision', confidence: 0.98, matchedSpeakerUid: inferredSpeaker?.speakerUid || null, confirmed: false };
    if (colorOwner && !inferredName)
        return { kind: 'confirmed-use', confidence: 0.9, matchedSpeakerUid: colorOwner.speakerUid, confirmed: true };
    if (colorOwner && inferredSpeaker?.speakerUid === colorOwner.speakerUid)
        return { kind: 'confirmed-use', confidence: 0.99, matchedSpeakerUid: colorOwner.speakerUid, confirmed: true };
    if (colorOwner && inferredSpeaker)
        return { kind: 'speaker-conflict', confidence: 0.96, matchedSpeakerUid: inferredSpeaker.speakerUid, confirmed: false };
    if (colorOwner && inferredName)
        return { kind: 'alias-suggestion', confidence: 0.82, matchedSpeakerUid: colorOwner.speakerUid, confirmed: false };
    if (!colorOwner && inferredSpeaker)
        return { kind: 'color-drift', confidence: 0.95, matchedSpeakerUid: inferredSpeaker.speakerUid, confirmed: false };
    if (!colorOwner && inferredName)
        return { kind: 'new-speaker', confidence: 0.9, matchedSpeakerUid: null, confirmed: false };
    return { kind: 'unknown-color', confidence: 0.55, matchedSpeakerUid: null, confirmed: false };
}
function pendingReviewGroups(config) {
    const groups = new Map();
    for (const observation of Object.values(config.observations || {})) {
        if (observation.status !== 'pending')
            continue;
        if (!groups.has(observation.groupKey))
            groups.set(observation.groupKey, {
                groupKey: observation.groupKey,
                kind: observation.kind,
                inferredName: observation.inferredName,
                observedColor: observation.observedColor,
                matchedSpeakerUid: observation.matchedSpeakerUid,
                confidence: observation.confidence,
                count: 0,
                messageIds: new Set(),
                examples: [],
                firstSeenAt: observation.createdAt,
                lastSeenAt: observation.lastSeenAt,
            });
        const group = groups.get(observation.groupKey);
        group.count += 1;
        group.messageIds.add(observation.messageId);
        group.confidence = Math.max(group.confidence, observation.confidence);
        group.firstSeenAt = Math.min(group.firstSeenAt, observation.createdAt);
        group.lastSeenAt = Math.max(group.lastSeenAt, observation.lastSeenAt);
        if (observation.quote && !group.examples.includes(observation.quote) && group.examples.length < 4)
            group.examples.push(observation.quote);
    }
    return [...groups.values()].map((group) => ({ ...group, messageCount: group.messageIds.size, messageIds: undefined }))
        .sort((a, b) => b.confidence - a.confidence || b.lastSeenAt - a.lastSeenAt);
}
async function hydrateGeneratedMessage(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && String(payload.chatId) !== String(chat.id)))
        throw new Error('The active chat changed before Prism could hydrate it.');
    const config = await loadConfig(chat.id, userId);
    if (config.engine !== 'hybrid')
        return { state: await buildState({ importCortex: false }, userId), observations: [], pendingCount: pendingReviewGroups(config).length, skipped: 'not-hybrid' };
    const messages = await withTimeout(spindle.chat.getMessages(chat.id, userId), TRANSCRIPT_TIMEOUT_MS, 'Generated message hydration');
    const requestedId = String(payload.messageId || '');
    const message = messages.find((item) => String(item.id) === requestedId)
        || [...messages].reverse().find((item) => item.role === 'assistant' || item.is_user === false);
    if (!message)
        throw new Error('Prism could not find the generated assistant message.');
    const swipeId = Math.max(0, Number(message.swipe_id) || 0);
    const content = Array.isArray(message.swipes) && message.swipes.length
        ? String(message.swipes[Math.min(swipeId, message.swipes.length - 1)] || '')
        : String(message.content || '');
    const contentHash = hashString(content).toString(36);
    const hydrationKey = `${message.id}:${swipeId}:${contentHash}`;
    if (config.hydratedMessages?.[hydrationKey]) {
        return { state: await buildState({ importCortex: false }, userId), observations: [], pendingCount: pendingReviewGroups(config).length, skipped: 'already-hydrated' };
    }
    const registry = latestRegistrySnapshot(chat.id, config);
    const tags = extractPortableColorTags(content);
    const added = [];
    const occurrences = new Map();
    for (const tag of tags) {
        const occurrenceIndex = occurrences.get(`${tag.color}:${tag.quote}`) || 0;
        occurrences.set(`${tag.color}:${tag.quote}`, occurrenceIndex + 1);
        const inferredName = inferTagSpeakerName(content, tag);
        const classification = classifyTagObservation(tag, inferredName, registry);
        if (classification.confirmed) {
            const usage = config.registryUsage[classification.matchedSpeakerUid] || { count: 0, lastSeenAt: 0 };
            usage.count += 1;
            usage.lastSeenAt = Date.now();
            config.registryUsage[classification.matchedSpeakerUid] = usage;
            continue;
        }
        const groupKey = [classification.kind, normalizeName(inferredName), tag.color, classification.matchedSpeakerUid || ''].join(':');
        if (config.dismissedObservationKeys?.[groupKey])
            continue;
        const id = `obs-${hashString([message.id, swipeId, contentHash, tag.start, tag.color, occurrenceIndex].join('|')).toString(36)}`;
        const observation = {
            id, groupKey, messageId: String(message.id), swipeId, contentHash,
            quote: tag.quote, surroundingText: decodeObservedText(content.slice(Math.max(0, tag.start - 140), tag.end + 140)),
            observedColor: tag.color, inferredName, matchedSpeakerUid: classification.matchedSpeakerUid,
            registryRevision: registry.revision, kind: classification.kind, confidence: classification.confidence,
            status: 'pending', resolvedSpeakerUid: null, source: tag.source, occurrenceIndex,
            createdAt: Date.now(), lastSeenAt: Date.now(),
        };
        config.observations[id] = observation;
        added.push(observation);
    }
    config.hydratedMessages[hydrationKey] = { contentHash, swipeId, registryRevision: registry.revision, at: Date.now() };
    const hydrationKeys = Object.keys(config.hydratedMessages);
    while (hydrationKeys.length > 300)
        delete config.hydratedMessages[hydrationKeys.shift()];
    await saveConfig(chat.id, config);
    const state = await buildState({ importCortex: false }, userId);
    return { state, observations: added, pendingCount: pendingReviewGroups(config).length, registryRevision: registry.revision };
}
function bindingBySpeakerUid(config, speakerUid) {
    return Object.values(config.bindings || {}).find((binding) => String(binding.speakerUid) === String(speakerUid)) || null;
}
function setBindingRegistryColor(binding, rawColor) {
    const color = normalizeHex(rawColor);
    if (!binding || !color)
        return false;
    const oldColor = bindingRegistryColor(binding);
    if (oldColor && oldColor !== color) {
        binding.previousColors = uniqueStrings([...(binding.previousColors || []), oldColor])
            .map(normalizeHex).filter(Boolean).filter((value) => value !== color);
    }
    binding.color = color;
    binding.channels = safeChannels(binding.channels, color);
    binding.channels.dialogue.paint.stops[0] = color;
    binding.channels.dialogue.paint.anchor = color;
    binding.channels.thought.paint.anchor = color;
    if (binding.channels.thought.linkedToDialogue !== false)
        binding.channels.thought.paint = safePaint(binding.channels.dialogue.paint, color);
    return oldColor !== color;
}
async function resolveObservationGroup(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || (payload.chatId && String(payload.chatId) !== String(chat.id)))
        throw new Error('The active chat changed before Prism could save the review.');
    const config = await loadConfig(chat.id, userId);
    const groupKey = String(payload.groupKey || '');
    const observations = Object.values(config.observations || {}).filter((observation) => observation.groupKey === groupKey && observation.status === 'pending');
    if (!groupKey || observations.length === 0)
        return { state: await buildState({ importCortex: false }, userId), pendingCount: pendingReviewGroups(config).length };
    if (payload.action === 'dismiss') {
        for (const observation of observations)
            observation.status = 'dismissed';
        config.dismissedObservationKeys[groupKey] = true;
        await saveConfig(chat.id, config);
        const state = await buildState({ importCortex: false }, userId);
        return { state, pendingCount: state.pendingReviewCount, dismissed: observations.length };
    }
    const first = observations[0];
    let binding = payload.mergeSpeakerUid ? bindingBySpeakerUid(config, payload.mergeSpeakerUid) : null;
    const name = cleanSceneName(payload.name || first.inferredName || binding?.name);
    if (!binding && !name)
        throw new Error('Name this tentative character or merge it with an existing character.');
    const color = normalizeHex(payload.color) || bindingRegistryColor(binding) || first.observedColor;
    if (!color)
        throw new Error('Choose a valid six-digit registry color.');
    const collision = visibleRegistryBindings(config).find((candidate) => candidate !== binding && bindingRegistryColor(candidate) === color);
    if (collision)
        throw new Error(`${color} already belongs to ${collision.name}. Choose another color before approving.`);
    if (!binding) {
        let targetId = `manual:${hashString(normalizeName(name)).toString(36)}`;
        try {
            const entity = await spindle.memories.entities.upsert(chat.id, { name, type: 'character', aliases: uniqueStrings(payload.aliases), confidence: 1 }, { userId });
            if (entity?.id)
                targetId = String(entity.id);
        }
        catch (error) {
            spindle.log.warn(`Tentative character Cortex upsert skipped: ${error?.message || error}`);
        }
        const aliases = uniqueStrings(payload.aliases).filter((alias) => normalizeName(alias) !== normalizeName(name));
        const manualId = `manual:${hashString(normalizeName(name)).toString(36)}`;
        config.manualCharacters[manualId] = { id: manualId, name, aliases, source: 'manual-roster' };
        delete config.hiddenCharacters[normalizeName(name)];
        binding = {
            kind: 'character', targetId, name, aliases, color,
            channels: safeChannels(null, color), previousColors: [], source: 'manual', pinned: true,
            speakerUid: `prism-speaker-${hashString(`character:${normalizeName(name)}`).toString(36)}`,
            legacyRefs: uniqueStrings([manualId, targetId]),
        };
        config.bindings[`character:${targetId}`] = binding;
    }
    else {
        const inferredAlias = first.inferredName && normalizeName(first.inferredName) !== normalizeName(binding.name) ? first.inferredName : null;
        binding.aliases = uniqueStrings([...(binding.aliases || []), ...(payload.aliases || []), inferredAlias]);
        binding.source = 'manual';
        binding.pinned = true;
        setBindingRegistryColor(binding, color);
    }
    const observedColorOwnedElsewhere = visibleRegistryBindings(config).some((candidate) => candidate !== binding && bindingRegistryColor(candidate) === first.observedColor);
    if (!observedColorOwnedElsewhere && first.observedColor !== bindingRegistryColor(binding)) {
        binding.previousColors = uniqueStrings([...(binding.previousColors || []), first.observedColor])
            .map(normalizeHex).filter(Boolean).filter((value) => value !== bindingRegistryColor(binding));
    }
    for (const observation of observations) {
        observation.status = 'approved';
        observation.resolvedSpeakerUid = binding.speakerUid;
        observation.lastSeenAt = Date.now();
    }
    delete config.dismissedObservationKeys[groupKey];
    ensureBindingIdentities(config);
    await saveConfig(chat.id, config);
    const state = await buildState({ importCortex: false }, userId);
    return { state, pendingCount: state.pendingReviewCount, approved: observations.length, speakerUid: binding.speakerUid };
}
function registryBindingPriority(binding) {
    const sourcePriority = { manual: 60, cortex: 50, transcript: 40, preset: 30, library: 20, generated: 10 };
    return (binding.pinned === true ? 100 : 0) + (sourcePriority[binding.source] || 0);
}
function visibleRegistryBindings(config) {
    const selected = new Map();
    for (const binding of Object.values(config.bindings || {})) {
        if (!bindingRegistryColor(binding))
            continue;
        if (binding.kind === 'persona' && config.personaEnabled === false)
            continue;
        if (binding.kind !== 'persona' && config.hiddenCharacters?.[normalizeName(binding.name)])
            continue;
        const key = `${binding.kind}:${normalizeName(binding.name)}`;
        const current = selected.get(key);
        if (!current || registryBindingPriority(binding) > registryBindingPriority(current))
            selected.set(key, binding);
    }
    return [...selected.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function compileRegistry(config) {
    const candidates = visibleRegistryBindings(config).map((binding) => ({
        speakerUid: String(binding.speakerUid || `prism-speaker-${hashString(`${binding.kind}:${normalizeName(binding.name)}`).toString(36)}`),
        kind: binding.kind === 'persona' ? 'persona' : 'character',
        targetId: String(binding.targetId || ''),
        name: String(binding.name || ''),
        aliases: uniqueStrings(binding.aliases).sort((a, b) => a.localeCompare(b)),
        color: bindingRegistryColor(binding),
        source: binding.source || 'manual',
    })).filter((entry) => entry.color && entry.name);
    const ownersByColor = new Map();
    for (const entry of candidates) {
        if (!ownersByColor.has(entry.color))
            ownersByColor.set(entry.color, []);
        ownersByColor.get(entry.color).push(entry);
    }
    const conflicts = [...ownersByColor.entries()]
        .filter(([, owners]) => owners.length > 1)
        .map(([color, owners]) => ({ color, speakers: owners.map((entry) => ({ speakerUid: entry.speakerUid, name: entry.name })) }));
    const conflictingColors = new Set(conflicts.map((conflict) => conflict.color));
    const entries = candidates.filter((entry) => !conflictingColors.has(entry.color));
    const revisionSource = entries.map((entry) => [entry.speakerUid, entry.kind, entry.name, entry.color, ...entry.aliases].join('|')).sort().join('\n');
    const revision = hashString(revisionSource).toString(16).padStart(8, '0');
    const byColor = Object.fromEntries(entries.map((entry) => [entry.color, entry]));
    const bySpeakerUid = Object.fromEntries(entries.map((entry) => [entry.speakerUid, entry]));
    const pendingCount = Object.values(config.observations || {}).filter((observation) => observation.status === 'pending').length;
    return { revision, entries, byColor, bySpeakerUid, conflicts, pendingCount };
}
function rememberRegistrySnapshot(chatId, snapshot) {
    if (!chatId || !snapshot)
        return;
    const history = recentRegistrySnapshots.get(String(chatId)) || [];
    history.push({ ...snapshot, injectedAt: Date.now() });
    while (history.length > 6)
        history.shift();
    recentRegistrySnapshots.set(String(chatId), history);
}
function latestRegistrySnapshot(chatId, config) {
    const history = recentRegistrySnapshots.get(String(chatId)) || [];
    return history.at(-1) || compileRegistry(config);
}
function registryInstruction(config, registry = compileRegistry(config)) {
    const bindings = registry.entries;
    if (!usesModelTags(config.engine) || !config.promptCharacterColors || bindings.length === 0)
        return '';
    const rows = bindings.map((binding) => {
        const aliases = uniqueStrings(binding.aliases);
        const aliasText = aliases.length ? ` (aliases: ${aliases.join(', ')})` : '';
        return `- ${binding.name}${aliasText}: ${binding.color}`;
    }).join('\n');
    const thoughtInstruction = config.promptThoughtColors
        ? 'For direct internal thought only, use <i><font color="#RRGGBB">thought</font></i> with the same speaker anchor. Do not mark actions, narration, description, or ordinary emphasis as thought.'
        : 'Do not color internal thoughts.';
    return [
        '[Prism Dialogue Markup Registry]',
        `Prism registry revision: ${registry.revision}`,
        'Mark speaker identity in the response with portable HTML font tags. For every bound speaker below, wrap each complete spoken segment, including its quotation marks, in exactly <font color="#RRGGBB">"dialogue"</font>.',
        `Use only the listed canonical hex for that speaker. Do not add style attributes, CSS, gradients, data attributes, or invented colors. Do not color narration, actions, scene description, or reporting clauses. ${thoughtInstruction}`,
        'If a speaker is uncertain or unbound, leave that segment uncolored instead of guessing. Preserve all wording and punctuation. When several listed characters speak, tag each segment with its own speaker color.',
        'Prism will preserve these tags as authoritative identity anchors and may locally repair any untagged gaps after rendering.',
        rows,
    ].join('\n');
}
spindle.registerInterceptor(async (messages, context) => {
    const chatId = String(context?.chatId || '');
    if (!chatId)
        return messages;
    const userId = context?.userId;
    const config = await loadConfig(chatId, userId);
    const registry = compileRegistry(config);
    const instruction = registryInstruction(config, registry);
    if (!instruction)
        return messages;
    rememberRegistrySnapshot(chatId, registry);
    const injected = { role: 'system', content: instruction };
    const next = [...messages];
    const last = next[next.length - 1];
    const insertAt = last?.role === 'assistant' ? next.length - 1 : next.length;
    next.splice(insertAt, 0, injected);
    return {
        messages: next,
        breakdown: [{ messageIndex: insertAt, name: 'Dialogue Color Registry' }],
    };
}, 175);
spindle.on('MESSAGE_SENT', async (payload, userId) => {
    try {
        const chatId = String(payload?.chatId || '');
        const message = payload?.message;
        if (!chatId || !message || message.role !== 'user')
            return;
        if (message.metadata?.lumi_dialogue_colors_applied)
            return;
        const config = await loadConfig(chatId, userId);
        if (!usesModelTags(config.engine))
            return;
        if (config.personaEnabled === false)
            return;
        if (config.autoUserMode === 'off')
            return;
        const persona = await spindle.personas.getActive(userId).catch(() => null);
        if (!persona)
            return;
        const binding = findBinding(config, 'persona', persona.id, persona.name, []);
        if (!binding)
            return;
        const registry = compileRegistry(config);
        const registryColor = registry.bySpeakerUid?.[binding.speakerUid]?.color || null;
        if (!registryColor)
            return;
        const nextContent = applyPersonaColor(message.content, registryColor, config.autoUserMode);
        if (nextContent === message.content)
            return;
        await spindle.chat.updateMessage(chatId, message.id, {
            content: nextContent,
            metadata: {
                ...(message.metadata || {}),
                lumi_dialogue_colors_applied: true,
                lumi_dialogue_color: registryColor,
            },
        }, userId);
    }
    catch (error) {
        spindle.log.error(`Automatic user dialogue coloring failed: ${error?.message || error}`);
    }
});
spindle.onFrontendMessage(async (payload, userId) => {
    const requestId = payload?.requestId;
    const reply = (type, data = {}) => spindle.sendToFrontend({ type, requestId, ...data }, userId);
    try {
        switch (payload?.type) {
            case 'ldc_load_state': {
                const state = await buildState({
                    importCortex: payload.importCortex === true,
                    scanTranscript: payload.scanTranscript === true,
                }, userId);
                reply('ldc_state', { state });
                break;
            }
            case 'ldc_hydrate_message': {
                const result = await hydrateGeneratedMessage(payload, userId);
                reply('ldc_hydrate_result', result);
                break;
            }
            case 'ldc_review_observation': {
                const result = await resolveObservationGroup(payload, userId);
                reply('ldc_review_result', result);
                break;
            }
            case 'ldc_save_binding': {
                const state = await saveBinding(payload, userId);
                reply('ldc_state', { state, saved: true });
                break;
            }
            case 'ldc_add_character': {
                const state = await addSceneCharacter(payload, userId);
                reply('ldc_state', { state, saved: true });
                spindle.toast.success(`${cleanSceneName(payload.name)} added to this scene.`, { userId });
                break;
            }
            case 'ldc_remove_character': {
                const state = await removeSceneCharacter(payload, userId);
                reply('ldc_state', { state, saved: true });
                spindle.toast.success(`${cleanSceneName(payload.name)} removed from this scene.`, { userId });
                break;
            }
            case 'ldc_update_options': {
                const state = await updateOptions(payload, userId);
                reply('ldc_state', { state, saved: true });
                break;
            }
            case 'ldc_cortex_sync': {
                const state = await buildState({ importCortex: true, cortexMode: 'missing', scanTranscript: true }, userId);
                reply('ldc_state', { state, saved: true });
                break;
            }
            case 'ldc_cortex_repair': {
                const state = await buildState({ importCortex: true, cortexMode: 'repair', scanTranscript: true }, userId);
                reply('ldc_state', { state, saved: true });
                break;
            }
            case 'ldc_setup_scene':
            case 'ldc_assign_colors': {
                const result = await assignSceneColors(payload, userId);
                reply('ldc_state', { state: result.state, assigned: result.assigned, saved: true });
                spindle.toast.success(result.assigned
                    ? `Assigned ${result.assigned} scene color${result.assigned === 1 ? '' : 's'}.`
                    : 'Scene colors are ready.', { userId });
                break;
            }
            case 'ldc_save_override': {
                const state = await saveQuoteOverride(payload, userId);
                reply('ldc_state', { state, saved: true });
                break;
            }
            case 'ldc_recolor_existing': {
                const result = await recolorExisting(String(payload.chatId || ''), userId);
                reply('ldc_recolor_result', result);
                spindle.toast.success(`Updated ${result.changed} message${result.changed === 1 ? '' : 's'}.`, { userId });
                break;
            }
            default:
                break;
        }
    }
    catch (error) {
        reply('ldc_error', { error: error?.message || String(error) });
        spindle.toast.error(error?.message || 'Prism failed.', { userId });
    }
});
spindle.log.info('Prism loaded.');
