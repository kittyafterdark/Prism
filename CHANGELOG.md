# Changelog

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
