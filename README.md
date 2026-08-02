# Prism

Prism gives Lumiverse scenes deterministic dialogue colors without requiring roleplayers to type formatting tags. Local mode is the default: it changes rendered dialogue only, leaving saved messages and model context untouched.

Existing formatting is authoritative. Prism indexes real or escaped `<font color>`, inline color styles, and `[color]` regions as protected segments, uses uniquely matched colors as speaker evidence, and fills only unstyled gaps. Local solid/gradient overlays are reversible. The saved-tag normalization action only updates matching portable font colors; it does not persist heuristic or gradient overlays.

## Local-first workflow

- v0.7.3 fixes live solid-color previews in the editor and gives solid paint the same full-width visual preview treatment as gradients. v0.7.2 keeps thought paint linked to dialogue paint until it is deliberately customized, and makes roster swatches render the actual dialogue solid/gradient paint. v0.7.1 refined the modal language and settings layout. v0.7.0 added a **Hybrid** engine: the model emits portable canonical `<font color>` identity tags first, then Prism preserves those tags as authoritative anchors and applies a conservative DOM overpass only to untagged gaps.

- **Set up scene** imports Cortex, preset, and transcript colors, then fills only missing character/persona colors.
- **Local / Hybrid / LLM** is visible in the modal top bar and remembered across chats.
- **Balanced attribution** uses labels, speech verbs, action beats, continuity, and bubble authors without silently blaming the primary character.
- Paragraph-aware dialogue turns recognize expanded reporting verbs, preserve prose continuations, and alternate quote-only replies only after two speakers are established.
- Existing legacy colors can establish dialogue turns, teach Prism their owner, and receive the owner’s current local paint without changing the underlying tag.
- Dialogue and thought channels have independent solid/gradient paint, with the canonical hex retained for Cortex and portable transcript markup.
- Italic and single-quoted thought detection is opt-in and never participates in dialogue alternation.
- Low-confidence dialogue is marked with a dotted underline.
- Every detected segment—including unresolved, disabled, and ignored dialogue—is wrapped as a teachable target. Right-click, long-press, or focus it and press Enter to assign its speaker or content type.
- Quote detection follows rendered text across nested emphasis nodes, so `"This is <em>extremely</em> inconvenient"` remains one assignable segment.
- The editor autosaves, keeps identity and save state sticky, shows a single color in Solid mode, and reveals the harmonic second stop only when Gradient is enabled.
- Color dragging updates the preview in place and saves without rebuilding or disabling the editor, preserving the native picker and both sidebar/editor scroll positions.
- Gradient paint is delegated to CSS feature fallback directly, preventing supported Lumi renderers from being incorrectly downgraded to the anchor color.
- Routine bindings and quote corrections use a persistent mint/gold `Saved` / `Saving…` indicator beside the Prism toolbar button and in the sticky editor footer instead of stacking success toasts.
- Gradients support two or three stops from the compact selector beside Direction. Newly enabled gradients default to a mirrored `edge → harmonic accent → edge` treatment, while existing two-stop paints remain unchanged.
- Speaker recognition is independent from paint availability: uncolored scene members remain candidates for names, speech tags, continuity, bubble ownership, and manual corrections.
- Cortex now reports registry health and exposes separate **Sync missing** and **Repair links** operations. Repair replaces generated/library/transcript colors, preserves manual decisions as visible conflicts, records previous colors, and brings registry-only characters into the roster.
- Bindings carry stable Prism speaker IDs and legacy references, so Cortex/card relinking migrates quote corrections instead of orphaning them.
- Structural speech tags and speech-noun constructions supplement the reporting-verb dictionary in both rendered attribution and backend scene discovery.
- Temporary generated or transcript-only `scene-name:` guesses remain chat-local until they gain a stable card/Cortex identity or are manually pinned.
- Dialogue and thought previews render their actual independent channel paint, and the top-bar unresolved review action jumps directly to teachable gaps.
- Add missing characters or remove noisy discovered entries directly from the scene roster; manual aliases can map generic bubble labels such as `narrator` to the right character.
- Manual corrections remain chat-local and expire when the source message content changes.
- Character/persona colors are reused globally; generated colors remain regenerable.

A small Spindle extension for binding per-speaker dialogue colors in Lumiverse.

## What it does

- Adds a compact palette button to Lumiverse's chat toolbar using the stable `[class*="chatToolbar"]` class-fragment selector.
- Also registers **Prism** in the input-bar Extras menu as a fallback.
- Opens a native Lumiverse modal with **Character** and **Persona** tabs.
- Builds the scene roster from every group-card member, camel-cased Cortex character entities, explicit card cast lists, and speaker labels already present in the transcript.
- Lets you bind a hex color and aliases to each character, and manually curate the per-chat roster.
- Shows the currently active persona and can automatically color its sent dialogue.
- Keeps the **Local / Hybrid / LLM** engine switch visible in the modal header; the cog contains attribution behavior only.
- In DOM-only mode, colors rendered dialogue reversibly without changing saved messages or model context.
- In Hybrid and LLM-sidecar modes, injects the active registry so models emit the correct canonical `<font color="#RRGGBB">...</font>` tags. Hybrid then fills only missing untagged dialogue locally; pure LLM mode does not.
- Imports attributable colors from existing `<font color>`, inline `style="color:…"`, and `[color=…]` dialogue, including preset-produced transcripts.
- Renders escaped legacy color tags with allowlisted inline emphasis in both engines without mutating the saved message.
- Offers Preserve, Enhance, and Replace-visually policies for existing tags; all remain non-destructive.
- The confirmation-heavy **Normalize saved font colors** updates matching legacy `<font color>` tags and persona markup in saved messages, including swipe variants. Reversible DOM gradients and heuristic-only paint are intentionally not persisted.

## Engines

- **Local** — no prompt injection and no saved assistant markup. Prism heuristically paints the rendered DOM only.
- **Hybrid** — injects the registry so the model writes canonical font tags, treats those tags as authoritative speaker anchors, enhances them with local solid/gradient paint, and conservatively fills untagged dialogue gaps.
- **LLM** — injects the same portable registry but performs no heuristic gap filling; only existing/model-emitted tags receive Prism overlays.

Hybrid also applies persona font tags to newly sent user dialogue using the selected Off / Quoted / Whole-message policy.

## Cortex integration

The extension uses only supported Spindle surfaces:

1. It reads the current Cortex color registry through the built-in `{{characterColors}}` macro.
2. It upserts character names and aliases through `spindle.memories.entities`.
3. It writes real `<font color>` tags into the transcript and generation output, which gives Cortex normal evidence to learn/reinforce its own dialogue-color registry.

Lumiverse does not currently expose direct `memory_font_colors` CRUD through the public Spindle Memory API. This extension intentionally does not poke private database tables or undocumented frontend state.

## User-message modes

- **Off** — do not modify newly sent user messages.
- **Quoted dialogue only** — color straight or curly quoted speech while leaving narration untouched.
- **Whole message** — wrap the entire user message; useful for chat-style RP.

## Install

This zip is repository-ready. Put the files in a Git repository and install it through Lumiverse's Spindle extension manager, or copy the unpacked folder into the extension location used by your local Lumiverse setup.

Grant the requested permissions when prompted. The toolbar button and input-bar Extras fallback use the regular frontend DOM and modal surfaces; Prism no longer requests a floating-widget permission.

## Notes

- In **Hybrid**, character output is guided at prompt time and then locally repaired. Model-emitted tags outrank every heuristic; Prism never recolors or nests over a tagged segment.
- Hybrid defers low-confidence local guesses instead of painting them automatically. Deferred segments remain underlined, teachable, and available from the unresolved review control.
- In pure **LLM** mode, existing untagged assistant prose is left alone. In **Local**, all coloring remains render-only.
- Existing-tag migration is role-scoped: character color history can only rewrite assistant messages, while persona color history can only rewrite user messages.
- Scenario, setting, and multi-character container cards are treated as cast sources instead of automatically being mistaken for speakers when a real cast can be identified.
- JSON objects, JSON-property lines, fenced code, and identifier-like structured keys are excluded from speaker discovery.
- Change the `github` and `homepage` fields in `spindle.json` if you publish under a different repository URL.

## Operator-scoped installs

Prism forwards the originating `userId` through active-chat, persona, Cortex, chat-mutation, macro, toast, and frontend-reply calls. This keeps globally installed/operator-scoped copies isolated to the user who opened the palette.
