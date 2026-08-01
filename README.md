# Prism

Prism gives Lumiverse scenes deterministic dialogue colors without requiring roleplayers to type formatting tags. Local mode is the default: it changes rendered dialogue only, leaving saved messages and model context untouched.

Existing formatting is authoritative. Prism indexes real or escaped `<font color>`, inline color styles, and `[color]` regions as protected segments, uses uniquely matched colors as speaker evidence, and fills only unstyled gaps. Local solid/gradient overlays are reversible; only the explicit bake action rewrites saved markup.

## Local-first workflow

- **Set up scene** imports Cortex, preset, and transcript colors, then fills only missing character/persona colors.
- **Local / LLM** is visible in the modal top bar and remembered across chats.
- **Balanced attribution** uses labels, speech verbs, action beats, continuity, and bubble authors without silently blaming the primary character.
- Paragraph-aware dialogue turns recognize expanded reporting verbs, preserve prose continuations, and alternate quote-only replies only after two speakers are established.
- Existing legacy colors can establish dialogue turns, teach Prism their owner, and receive the owner’s current local paint without changing the underlying tag.
- Dialogue and thought channels have independent solid/gradient paint, with the canonical hex retained for Cortex and portable transcript markup.
- Italic and single-quoted thought detection is opt-in and never participates in dialogue alternation.
- Low-confidence dialogue is marked with a dotted underline.
- Every detected segment—including unresolved, disabled, and ignored dialogue—is wrapped as a teachable target. Right-click, long-press, or focus it and press Enter to assign its speaker or content type.
- Quote detection follows rendered text across nested emphasis nodes, so `"This is <em>extremely</em> inconvenient"` remains one assignable segment.
- The editor autosaves, keeps identity and save state sticky, shows a single color in Solid mode, and reveals the harmonic second stop only when Gradient is enabled.
- Dialogue and thought previews render their actual independent channel paint, and the top-bar unresolved review action jumps directly to teachable gaps.
- Add missing people or remove noisy discovered entries directly from the scene roster; manual aliases can map generic bubble labels such as `narrator` to the right person.
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
- Keeps the **Local / LLM** engine switch visible in the modal header; the cog contains attribution behavior only.
- In DOM-only mode, colors rendered dialogue reversibly without changing saved messages or model context.
- In LLM-sidecar mode, injects the active registry so models emit the correct `<font color="#RRGGBB">...</font>` tags.
- Imports attributable colors from existing `<font color>`, inline `style="color:…"`, and `[color=…]` dialogue, including preset-produced transcripts.
- Renders escaped legacy color tags with allowlisted inline emphasis in both engines without mutating the saved message.
- Offers Preserve, Enhance, and Replace-visually policies for existing tags; all remain non-destructive.
- The confirmation-heavy **Bake current colors** action can rewrite matching legacy colors and persona dialogue in saved messages, including swipe variants.

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

- Character output is guided at prompt time rather than post-processed. That avoids guessing who spoke when one assistant message contains several speakers.
- Existing untagged assistant prose is not heuristically recolored because speaker attribution would be unsafe. Existing known color tags are migrated when a binding changes.
- Existing-tag migration is role-scoped: character color history can only rewrite assistant messages, while persona color history can only rewrite user messages.
- Scenario, setting, and multi-character container cards are treated as cast sources instead of automatically being mistaken for speakers when a real cast can be identified.
- JSON objects, JSON-property lines, fenced code, and identifier-like structured keys are excluded from speaker discovery.
- Change the `github` and `homepage` fields in `spindle.json` if you publish under a different repository URL.

## Operator-scoped installs

Prism forwards the originating `userId` through active-chat, persona, Cortex, chat-mutation, macro, toast, and frontend-reply calls. This keeps globally installed/operator-scoped copies isolated to the user who opened the palette.
