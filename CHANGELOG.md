# Changelog

## 1.0.9 — The blind fucks update

- Removes the fullscreen portal's ancestor-level `touch-action: none`, which blocked every descendant scroll gesture even though the editor displayed a scrollbar.
- Gives the editor pane explicit vertical pan ownership and the roster strip explicit horizontal pan ownership.
- Keeps pinch zoom available while preventing the two scroll surfaces from stealing each other's gestures.
- Mounts the high-scale accessibility workspace in a body-level fullscreen portal, outside Lumi's transformed UI-scale tree.
- Fixes 1.30× UI scale expanding Prism beyond the visible viewport in both PWA and browser installs.
- Makes the editor pane the single vertical scroll surface with mobile momentum scrolling.
- Clamps every high-scale editor row and control to the visible width to prevent sideways clipping.
- Restores body scrolling and removes the portal cleanly when Prism closes or switches layouts.
- Makes the horizontal/high-scale layout a true viewport-filling Prism workspace so PWA and browser installs no longer disagree about Lumi's outer modal shell.
- Removes the redundant character profile header and bottom chat-status footer in horizontal mode; the selected roster chip remains the active-character indicator.
- Replaces the oversized **Remove from scene** action with an accessible trash icon in horizontal mode while retaining its confirmation step.
- Adds a sticky accessibility utility rail containing Local/Hybrid/LLM, expand, Settings, and Close controls so hostile zoom cannot strand the modal.
- Removes the redundant Settings button from the horizontal roster action grid.
- Makes the saved/sync preference authoritative in the editor footer and updates it optimistically before persistence.
- Replaces gradient rails with compact circular stop buttons in the horizontal accessibility layout.
- Keeps all two- and three-stop hex values visible at high UI scale with tighter, centered inputs.
- Moves **Reverse direction** onto its own full-width row beneath Direction and Stops so it cannot escape the viewport.
- Adds a first-class **Settings** tab whenever the horizontal accessibility layout is active.
- Adds a second **Settings** action beside the roster controls, so configuration remains reachable even when hostile mobile scaling pushes the header off-screen.
- Pins the accessibility header while its workspace scrolls and changes mobile roster actions to a clean two-by-two grid.
- Adds an Auto/Split/Horizontal roster preference. Auto switches to the horizontal roster above roughly 1.15× effective UI scale or on cramped viewports.
- Reflows the character roster above the editor, removes chunky roster initials, and prevents high-scale/mobile controls from colliding.
- Adds a global toggle to hide Prism saved/sync indicators from both the chat toolbar and editor footer.
- Keeps the accessibility layout available as a manual preference at normal UI scale.
- Gives the host modal body one explicit viewport-safe height and makes Prism fill it exactly.
- Shortens Compact and Auto layouts so they stop drifting toward the bottom edge with dead editor space.
- Budgets for Lumi's title bar and modal chrome instead of sizing the inner shell against the whole viewport.
- Keeps scrolling inside the roster, editor, settings, and review panes; the modal shell itself stays fixed.

## 1.0.8 — Quiet no-chat state

- Treats startup and chat-exit state probes without an active chat as an ordinary empty Prism state instead of throwing a backend error.
- Removes the redundant **Open a chat first** host toast while preserving the inline no-chat message if Prism is opened manually.

## 1.0.7 — Fast UI preferences and compact fit

- Moves modal size and expanded-state persistence onto a global-only backend route that bypasses chat mutation queues and scene rebuilds.
- Serializes global preference writes separately to prevent lost preference updates without blocking behind hydration.
- Tightens Compact spacing, keeps scrolling inside Prism, hides compact pane scrollbars, and prevents the host modal from growing its own scrollbar.

## 1.0.6 — Responsive desktop modal

- Prism now grows automatically on large and ultrawide displays instead of remaining fixed at 780px.
- Added remembered **Auto**, **Compact**, and **Large** interface sizes plus an in-modal expand/restore button.
- Expanded mode uses up to 96% of the viewport with a sensible 1800px cap; mobile remains near full-screen regardless of the desktop preference.
- Large layouts widen the scene roster and scale key controls, avatars, typography, and spacing without using transform scaling.
- Modal dimensions are recalculated when the preference changes, and diagnostics now report the active interface mode.

## 1.0.5 — Persona DOM identity fix

- Persona dialogue candidates now use the binding's stable `speakerUid`, matching the override keys persisted by the backend.
- Persona candidates explicitly report themselves as paintable when a canonical registry color exists, removing the false “color not assigned” underline and tooltip.
- Manual reassignment of a user quote to the active persona no longer loses the speaker after state reload or strips its paint.

## 1.0.3

- Simplified Hybrid review to genuinely new tagged characters only; alias proposals, merge guesses, color drift, known-speaker conflicts, and anonymous colors no longer appear in the user-facing inbox.
- Replaced merge/alias adjudication with three explicit outcomes: **Add to registry**, **Keep temporary**, and **Ignore**.
- **Keep temporary** now resolves the yellow warning while preserving the speaker's name/color as a chat-local provisional continuity hint outside the permanent roster.
- Known characters and temporary cameos are resolved silently during hydration, preventing repeat review cards.
- Temporary speakers expire with provisional evidence and are cleared by **Clear temporary speakers & evidence**.

## 1.0.2

- Resolve inferred Hybrid names against the existing scene roster before creating alias suggestions.
- Treat explicit mismatched known speakers as conflicts instead of proposing that they become aliases of the color owner.
- Suppress one-off weak structural guesses and fragment names such as “in the” until independent evidence exists.
- Preselect known unbound characters when Hybrid finds a color for them.

## 1.0.1

- Serializes per-user, per-chat backend state mutations so editor autosaves, Hybrid hydration, roster changes, and review approval cannot overwrite one another with stale config.
- Makes manual character creation atomic, including an optional detected color, and verifies the new roster entry before reporting success.
- Prevents explicit manual characters from being swallowed by an incidental alias on an automatically discovered speaker.
- Lets Hybrid Review merge tentative evidence into unbound scene characters, including manually added roster entries.
- Selects and scrolls to a newly added character immediately after creation.

## 1.0.0

- Correlates Hybrid hydration with user-scoped generation registry snapshots and never substitutes a previous assistant message.
- Retries delayed message storage, prunes stale observations and overrides, bounds registry state, and expires tentative evidence without counting Prism-induced echoes as independent proof.
- Caps and sanitizes prompt registry data; conflicting canonical colors are quarantined from model injection.
- Separates safe font-tag normalization from optional historical persona markup, with dry runs, recovery backups, rollback, and restore.
- Adds retry-current hydration, temporary-evidence reset, privacy-safe diagnostics, collision-safe registry export/import, and visible collision health.
- Uses the first dialogue stop as the sole canonical registry color.
- Renders gradient dialogue as its first solid stop while a message streams, restoring the full gradient only after completion or cancellation.
- Generates missing colors against the currently rendered Lumi message surface, including light themes, instead of assuming a dark background.
- Ships a reproducible TypeScript build, runnable regression harness, fixtures, and CI verification.

## 0.8.0 – 0.8.3

- Added closed-loop Hybrid discovery, tentative speaker review, provisional continuity, registry revisions, and stable editor identity/order.

## 0.7.0 – 0.7.5

- Added Hybrid, reversible gradient/thought channels, existing-tag attribution, manual roster editing, canonical color synchronization, and theme-paint filtering.

## 0.6.x

- Added Local attribution, one-click scene setup, Cortex reconciliation, manual quote correction, and the integrated Prism modal.
