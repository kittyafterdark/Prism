# Prism

A small Spindle extension for binding per-speaker dialogue colors in Lumiverse.

## What it does

- Adds a draggable palette button near the top edge of the chat UI.
- Also registers **Dialogue Colors** in the input-bar Extras menu as a fallback.
- Opens a native Lumiverse modal with **Character** and **Persona** tabs.
- Lists character entities currently known to the active chat's Memory Cortex.
- Lets you bind a hex color and aliases to each character.
- Shows the currently active persona and can automatically color its sent dialogue.
- Injects the active registry into normal generations so models emit the correct `<font color="#RRGGBB">...</font>` tags.
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

Grant the requested permissions when prompted. If `ui_panels` is denied, the floating button will be unavailable, but the input-bar Extras action can still open the modal.

## Notes

- Character output is guided at prompt time rather than post-processed. That avoids guessing who spoke when one assistant message contains several speakers.
- Existing untagged assistant prose is not heuristically recolored because speaker attribution would be unsafe. Existing known color tags are migrated when a binding changes.
- Change the `github` and `homepage` fields in `spindle.json` if you publish under a different repository URL.
