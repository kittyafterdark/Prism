# Prism regression corpus

`fixtures/attribution.json` covers reporting verbs, structural speech tags, speech nouns, unpainted known speakers, cross-node Markdown, structured data, legacy colors, collisions, and unseeded alternation.

`fixtures/cortex-reconciliation.json` covers safe sync, repair precedence, manual conflicts, registry-only roster entries, stable override identity, and chat-local temporary generated colors.

`fixtures/scene-discovery.json` keeps ordinary card prose out of the roster while preserving explicit labels, declared cast lists, and known reporting-verb discovery.

`fixtures/theme-paint.json` separates Lumi theme presentation from portable legacy evidence while keeping real font and escaped tags authoritative.

`fixtures/registry-visibility.json` covers hidden-character prompt removal, stale binding deduplication, and disabled persona exclusion.

`fixtures/registry-color-sync.json` covers migration from split visual/canonical colors, first-stop prompt hydration, and custom thought paint retaining the dialogue registry anchor.

The release verification harness loads the compiled frontend in a DOM fixture and exposes the backend reconciliation helpers under an isolated test build. It must confirm these fixtures before `dist/` is regenerated.
