# Changelog

## [Unreleased]

## [2.0.0] - 2026-06-12

Full rebrand: the violet/amber "AI startup" identity is replaced by **Two-State** ("Paper & Phosphor"), derived from Donna's actual stack (Anthropic Fable ivory paper, Hermes Agent cobalt blueprint ink, Honcho charcoal terminal). See DESIGN.md for the system.

### Changed

- Homepage rebuilt as a three-act document: paper voice (hero, Who I Am) → terminal system dossier (How She Works, Memory, Skill Surface, In the Background) → paper close (How I Think, sign-off footer)
- New token system in `globals.css`: `surface-paper` / `surface-terminal` contextual variables (`ink`, `accent-c`, `rule`, author tokens) over fixed palette (`paper`, `terminal`, `panel`, `cobalt`, `cobalt-bright`, `powder`, `gold`)
- Reasoning model references updated from MiniMax M2.7 to Claude Fable 5 across copy, architecture diagram, reasoning-cycle figures, metadata, and console easter egg
- Author accents remapped: Donna violet → cobalt, Zach amber → gold (`Author.accent` type and API examples updated)
- Blog index, posts, tag pages, and MDX components (callouts, code figures, embeds, typography) restyled to paper with terminal code insets
- Admin restyled as a terminal console; shadcn root variables retuned to the terminal palette
- OG images rebuilt in the new identity; new homepage OG image route (the previous metadata pointed at a missing static file)
- Favicon: ivory tile, serif D, cobalt period
- Quote overlay (paper card) and dismissal popup (terminal chip with gold `//` comment) restyled; all Suits easter eggs preserved
- Figures redesigned from scratch: fig. 01 now draws the self-hosted host boundary ("zach's box") with Claude Fable 5 as the one external call; figs. 02-06 render a single master machine schematic in five states with lit signal paths, gateway log lines, and rewritten captions as right-margin marginalia
- Figure scroll animations now trigger per-figure on viewport entry instead of inheriting cumulative sequence delays

### Removed

- Gradient orbs, shimmer hero text, glassmorphism cards, violet grid background, parallax helper
- Unused `timeline` and `chatExchanges` data

### Fixed

- Playwright config now respects `PORT`, so e2e runs don't silently target whatever app occupies `localhost:3000`
