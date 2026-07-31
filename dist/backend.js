"use strict";
const CONFIG_VAR = 'lumi_dialogue_colors_v1';
const DEFAULT_CONFIG = Object.freeze({
    version: 1,
    engine: 'llm',
    autoUserMode: 'quoted',
    promptCharacterColors: true,
    bindings: {},
});
function cloneDefaultConfig() {
    return {
        version: DEFAULT_CONFIG.version,
        engine: DEFAULT_CONFIG.engine,
        autoUserMode: DEFAULT_CONFIG.autoUserMode,
        promptCharacterColors: DEFAULT_CONFIG.promptCharacterColors,
        bindings: {},
    };
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
function safeConfig(raw) {
    const fallback = cloneDefaultConfig();
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
            const color = normalizeHex(value.color);
            const name = String(value.name || '').trim();
            if (!color || !name)
                continue;
            bindings[key] = {
                kind: value.kind === 'persona' ? 'persona' : 'character',
                targetId: String(value.targetId || ''),
                name,
                aliases: uniqueStrings(value.aliases),
                color,
                previousColors: uniqueStrings(value.previousColors)
                    .map(normalizeHex)
                    .filter(Boolean)
                    .filter((hex) => hex !== color),
                source: value.source === 'cortex' ? 'cortex' : 'manual',
            };
        }
    }
    return {
        version: 1,
        engine: raw.engine === 'dom' ? 'dom' : 'llm',
        autoUserMode: mode,
        promptCharacterColors: raw.promptCharacterColors !== false,
        bindings,
    };
}
async function loadConfig(chatId) {
    try {
        const text = await spindle.variables.chat.get(chatId, CONFIG_VAR);
        if (!text)
            return cloneDefaultConfig();
        return safeConfig(JSON.parse(text));
    }
    catch (error) {
        spindle.log.warn(`Could not read dialogue color config: ${error?.message || error}`);
        return cloneDefaultConfig();
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
function cleanSceneName(value) {
    const name = String(value || '')
        .replace(/^[\s*_\[\]]+/, '')
        .replace(/[\s*_\[\]]+$/, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!name || name.length > 80 || /[<>\n\r{}]/.test(name))
        return '';
    if (/^(?:character|characters|cast|speaker|speakers|npc|npcs|assistant|user|scenario|setting|scene|card)$/i.test(name))
        return '';
    return name;
}
function extractSceneNamesFromText(value) {
    const text = String(value || '');
    if (!text.trim())
        return [];
    const names = [];
    const add = (value) => {
        const name = cleanSceneName(value);
        if (name)
            names.push(name);
    };
    const labelPattern = /(?:^|\n)\s*(?:[-*]\s+)?(?:\*\*|\[)?([^:\]\n]{1,80})(?:\*\*|\])?\s*:\s*(?=["“])/gmu;
    let match;
    while ((match = labelPattern.exec(text)))
        add(match[1]);
    const speechPattern = /(?:^|[\n.!?]\s+)([\p{Lu}][\p{L}\p{N}'’. -]{0,60}?)\s+(?:said|says|asked|asks|replied|replies|whispered|whispers|shouted|shouts|murmured|murmurs)\s*[,.:]\s*(?=["“])/gmu;
    while ((match = speechPattern.exec(text)))
        add(match[1]);
    const castPattern = /(?:^|\n)\s*(?:cast|characters|speakers|npcs)\s*:\s*([^\n]{1,240})/gimu;
    while ((match = castPattern.exec(text))) {
        for (const item of match[1].split(/[,;|/]/))
            add(item.replace(/\s*\([^)]*\)\s*$/, ''));
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
async function getSceneCharacters(chat, cardCharacters, userId) {
    let entities = [];
    let cortexAvailable = true;
    try {
        entities = await spindle.memories.entities.list(chat.id, {
            activeOnly: false,
            limit: 200,
            userId,
        });
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
    try {
        const messages = await spindle.chat.getMessages(chat.id, userId);
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
async function importCortexRegistry(chat, primaryCharacter, characters, config, userId) {
    let imported = 0;
    let macroText = '';
    try {
        const result = await spindle.macros.resolve('{{characterColors}}', {
            chatId: chat.id,
            characterId: primaryCharacter?.id || chat.character_id,
            commit: false,
            userId,
        });
        macroText = result?.text || '';
    }
    catch (error) {
        spindle.log.warn(`Cortex color macro could not be resolved: ${error?.message || error}`);
        return { config, imported, macroText: '' };
    }
    const registry = parseCortexColorMacro(macroText);
    for (const item of registry) {
        const normalized = normalizeName(item.name);
        const sceneCharacter = characters.find((character) => {
            const names = [character.name, ...(character.aliases || [])].map(normalizeName);
            return names.includes(normalized);
        });
        const existing = findBinding(config, 'character', sceneCharacter?.id || normalized, item.name, sceneCharacter?.aliases || []);
        if (existing)
            continue;
        const targetId = sceneCharacter?.id || `cortex-name:${normalized}`;
        config.bindings[`character:${targetId}`] = {
            kind: 'character',
            targetId,
            name: sceneCharacter?.name || item.name,
            aliases: uniqueStrings(sceneCharacter?.aliases),
            color: item.color,
            previousColors: [],
            source: 'cortex',
        };
        imported += 1;
    }
    if (imported > 0)
        await saveConfig(chat.id, config);
    return { config, imported, macroText };
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
    const scene = await getSceneCharacters(chat, cardCharacters, userId);
    let config = await loadConfig(chat.id);
    let cortexImportedCount = 0;
    let cortexMacroText = '';
    if (options.importCortex !== false) {
        const imported = await importCortexRegistry(chat, primaryCharacter, scene.characters, config, userId);
        config = imported.config;
        cortexImportedCount = imported.imported;
        cortexMacroText = imported.macroText;
    }
    const characters = scene.characters.map((character) => ({
        ...character,
        binding: findBinding(config, 'character', character.id, character.name, character.aliases),
    }));
    const personaBinding = persona
        ? findBinding(config, 'persona', persona.id, persona.name, [])
        : null;
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
        cortexAvailable: scene.cortexAvailable,
        cortexImportedCount,
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
        const current = normalizeHex(binding.color);
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
    const color = normalizeHex(payload.color);
    if (!targetId || !name || !color)
        throw new Error('A target, name, and valid hex color are required.');
    const config = await loadConfig(chat.id);
    if (['dom', 'llm'].includes(payload.engine)) {
        config.engine = payload.engine;
        config.promptCharacterColors = payload.engine === 'llm';
    }
    if (['off', 'quoted', 'whole'].includes(payload.autoUserMode)) {
        config.autoUserMode = payload.autoUserMode;
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
        previousColors,
        source: 'manual',
    };
    await saveConfig(chat.id, config);
    await spindle.memories.cortex.invalidateCache(chat.id, userId).catch(() => { });
    return buildState({ importCortex: false }, userId);
}
async function updateOptions(payload, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat)
        throw new Error('Open a chat first.');
    const config = await loadConfig(chat.id);
    if (['dom', 'llm'].includes(payload.engine)) {
        config.engine = payload.engine;
        config.promptCharacterColors = payload.engine === 'llm';
    }
    if (['off', 'quoted', 'whole'].includes(payload.autoUserMode)) {
        config.autoUserMode = payload.autoUserMode;
    }
    if (typeof payload.promptCharacterColors === 'boolean') {
        config.promptCharacterColors = payload.promptCharacterColors;
    }
    await saveConfig(chat.id, config);
    return buildState({ importCortex: false }, userId);
}
async function recolorExisting(chatId, userId) {
    const chat = await spindle.chats.getActive(userId);
    if (!chat || chat.id !== chatId)
        throw new Error('The active chat changed.');
    const config = await loadConfig(chat.id);
    const persona = await spindle.personas.getActive(userId).catch(() => null);
    const personaBinding = persona
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
                next = applyPersonaColor(next, personaBinding.color, config.autoUserMode);
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
function registryInstruction(config) {
    const bindings = Object.values(config.bindings)
        .filter((binding) => normalizeHex(binding.color))
        .sort((a, b) => a.name.localeCompare(b.name));
    if (config.engine !== 'llm' || !config.promptCharacterColors || bindings.length === 0)
        return '';
    const rows = bindings.map((binding) => {
        const aliases = uniqueStrings(binding.aliases);
        const aliasText = aliases.length ? ` (aliases: ${aliases.join(', ')})` : '';
        return `- ${binding.name}${aliasText}: ${binding.color}`;
    }).join('\n');
    return [
        '[Dialogue Color Registry]',
        'For every bound speaker below, wrap only their spoken dialogue in the exact HTML form <font color="#RRGGBB">dialogue</font>.',
        'Do not color narration, actions, scene description, or internal thoughts. Preserve punctuation and do not invent colors for unbound speakers.',
        'When several listed characters speak in one response, use each speaker\'s own bound color.',
        rows,
    ].join('\n');
}
spindle.registerInterceptor(async (messages, context) => {
    const chatId = String(context?.chatId || '');
    if (!chatId)
        return messages;
    const config = await loadConfig(chatId);
    const instruction = registryInstruction(config);
    if (!instruction)
        return messages;
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
        const config = await loadConfig(chatId);
        if (config.engine !== 'llm')
            return;
        if (config.autoUserMode === 'off')
            return;
        const persona = await spindle.personas.getActive(userId).catch(() => null);
        if (!persona)
            return;
        const binding = findBinding(config, 'persona', persona.id, persona.name, []);
        if (!binding)
            return;
        const nextContent = applyPersonaColor(message.content, binding.color, config.autoUserMode);
        if (nextContent === message.content)
            return;
        await spindle.chat.updateMessage(chatId, message.id, {
            content: nextContent,
            metadata: {
                ...(message.metadata || {}),
                lumi_dialogue_colors_applied: true,
                lumi_dialogue_color: binding.color,
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
                const state = await buildState({ importCortex: payload.importCortex !== false }, userId);
                reply('ldc_state', { state });
                break;
            }
            case 'ldc_save_binding': {
                const state = await saveBinding(payload, userId);
                reply('ldc_state', { state, saved: true });
                spindle.toast.success('Dialogue color bound.', { userId });
                break;
            }
            case 'ldc_update_options': {
                const state = await updateOptions(payload, userId);
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
