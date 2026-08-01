# Prism

Prism gives Lumiverse scenes deterministic dialogue colors without requiring roleplayers to type formatting tags. Local mode is the default: it changes rendered dialogue only, leaving saved messages and model context untouched.

## Local-first workflow

- **Set up scene** imports Cortex, preset, and transcript colors, then fills only missing character/persona colors.
- **Local / LLM** is visible in the modal top bar and remembered across chats.
- **Balanced attribution** uses labels, speech verbs, action beats, continuity, and bubble authors without silently blaming the primary character.
- Low-confidence dialogue is marked with a dotted underline.
- Right-click, long-press, or focus a colored quote and press Enter to teach Prism its speaker.
- Manual corrections remain chat-local and expire when the source message content changes.
- Character/persona colors are reused globally; generated colors remain regenerable.

A small Spindle extension for binding per-speaker dialogue colors in Lumiverse.

## What it does

- Adds a compact palette button to Lumiverse's chat toolbar using the stable `[class*="chatToolbar"]` class-fragment selector.
- Also registers **Prism** in the input-bar Extras menu as a fallback.
- Opens a native Lumiverse modal with **Character** and **Persona** tabs.
- Builds the scene roster from every group-card member, camel-cased Cortex character entities, explicit card cast lists, and speaker labels already present in the transcript.
- Lets you bind a hex color and aliases to each character.
- Shows the currently active persona and can automatically color its sent dialogue.
- Offers **DOM only** and **LLM sidecar** engines from the modal's settings cog.
- In DOM-only mode, colors rendered dialogue reversibly without changing saved messages or model context.
- In LLM-sidecar mode, injects the active registry so models emit the correct `<font color="#RRGGBB">...</font>` tags.
- Imports attributable colors from existing `<font color>`, inline `style="color:…"`, and `[color=…]` dialogue, including preset-produced transcripts.
- Renders escaped legacy color tags visually in both engines without mutating the saved message.
- Can rewrite matching colors and persona dialogue in existing messages, including swipe variants.

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
