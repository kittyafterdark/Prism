# Prism

Prism gives Lumiverse scenes deterministic, reversible dialogue and thought colors without making roleplayers type formatting tags. Hybrid is the default for new installs: it emits portable `<font color>` identity tags, rehydrates the finished response, and asks only whether genuinely new tagged speakers should enter the confirmed registry.

## Engines

- **Local** — colors the rendered DOM only. Saved messages and model context are unchanged.
- **Hybrid** — asks the model for portable canonical font tags, enhances those tags locally, fills confident untagged gaps, and asks only whether genuinely new tagged speakers should be registered, kept temporary, or ignored.
- **LLM** — asks the model for canonical font tags and enhances those tags locally, without heuristic gap filling.

Existing engine choices survive migration. Hybrid is the default only for a fresh configuration.

## Everyday workflow

1. Open Prism from the chat toolbar.
2. Use **Set up scene** to import Cortex/transcript colors and generate collision-safe colors for anything missing.
3. Edit solid or two/three-stop gradient paint directly in the roster editor. The first dialogue stop is always the character’s canonical registry color.
4. In Local or Hybrid, right-click, long-press, or keyboard-open any detected segment to correct its speaker or content type.
5. In Hybrid, click the yellow **Awaiting review** status only when Prism finds a clearly named, genuinely new tagged speaker. Register recurring characters, keep cameos temporary, or ignore them.

During generation, gradient text temporarily renders as its first canonical stop. Prism restores the full gradient only when the response completes or is cancelled, preventing streaming repaint flicker.

## Existing formatting

Portable `<font color>`, escaped legacy tags, BBCode colors, and explicit inline colors are protected. Prism may use a uniquely matched tag as speaker evidence and may apply a reversible local solid/gradient overlay, but it does not destructively rewrite saved markup while rendering.

Lumi theme colors applied as presentation are not treated as legacy speaker evidence.

The rendering trust order is:

1. Manual correction.
2. Confirmed tag consistent with explicit prose.
3. Explicit speaker label or reporting clause.
4. Confirmed tag without contradictory prose.
5. Tentative observed tag.
6. Paragraph/action continuity.
7. Bubble ownership and carefully seeded alternation.
8. Unresolved, teachable text.

## Hybrid closed loop

Hybrid compiles one registry snapshot for prompt injection, persona tags, DOM matching, collision detection, and hydration. Snapshots are scoped by operator and chat, correlated to a generation, capped, and expired.

After generation, Prism inspects only the requested assistant message. Delayed storage is retried; Prism never substitutes the previous assistant message. Known characters and conflicts resolve silently. Only clearly named new speakers with unused tag colors enter review; temporary speakers preserve chat continuity without joining the permanent roster.

Provisional model echoes do not count as independent evidence. Weak discoveries require two independent sightings, and provisional hints expire after inactivity.

## Transcript tools

**Normalize existing font tags** performs a dry run, changes only matching legacy tags, skips ambiguous shared colors, and stores a recovery backup. It does not bake gradients or heuristic DOM paint and does not add persona formatting.

**Historical persona colors** is a separate opt-in operation for older user messages. Both operations roll back partial failures and expose **Restore last backup**.

## Registry and diagnostics

Settings can copy privacy-safe diagnostics, export the confirmed registry as JSON, import a prior Prism registry, retry the last hydration, rescan only the current message, or reset temporary evidence without touching confirmed colors.

Diagnostics omit message text and include the Prism/schema version, engine, registry revision, speaker/collision counts, unresolved count, Cortex health, hydration state, toolbar/DOM health, and backend roundtrip time.

## Cortex

Prism uses supported Spindle surfaces:

- Reads `{{characterColors}}`.
- Reconciles character names and aliases through Cortex entities.
- Writes portable canonical font tags in Hybrid/LLM and configured persona output.

**Sync missing** fills genuinely absent links. **Repair links** can replace generated/library/transcript guesses while preserving manual pinned decisions as visible conflicts.

## Install

Install the repository or release archive through Lumiverse’s Spindle extension manager, or copy the unpacked folder into the local extension directory. Grant the requested chat, character, persona, memory, mutation, interceptor, and generation-event permissions.

The toolbar mount uses the stable `[class*="chatToolbar"]` fragment and also registers Prism in the input-bar Extras menu.

## Development

Requirements: Node.js 22 or newer.

```sh
npm ci
npm run build
npm test
npm run verify
```

`npm run build` compiles both Spindle entrypoints to ESM. The regression harness checks attribution/scene fixtures, canonical color migration, operator-scoped snapshots, exact-message hydration, state garbage collection, prompt budgets and sanitization, provisional anti-feedback behavior, transcript dry runs/rollback, streaming paint lifecycle, and source/dist consistency.

CI rebuilds the distribution and fails if `dist/` differs from source.

## Privacy and limits

- Local mode never injects instructions or changes assistant messages.
- Hybrid/LLM prompt data is sanitized, alias/name limited, capped at 48 confirmed speakers and 12 provisional hints, and hard-limited to 8,000 characters.
- Manual quote corrections stay chat-local and expire when their source content changes.
- Temporary scene-name colors remain chat-local unless confirmed by a stable card/Cortex identity or manually pinned.
- Thought detection is opt-in because roleplay italics are gloriously ambiguous.

See [CHANGELOG.md](CHANGELOG.md) for release history.


### High-scale editor cards

At narrow widths or elevated Lumi UI scale, Prism uses horizontally swipeable Paint and Identity cards instead of relying on vertical modal scrolling.

### Dense split layout on narrow screens

When Split roster is used below 980 CSS pixels, Auto size now keeps Prism in a shorter landscape/square card and applies a layout-aware desktop density. This mirrors the cleaner zoomed-out presentation without requiring users to change Lumi's global browser zoom. Explicit Large/Expanded sizing and the horizontal accessibility workspace are unaffected.
