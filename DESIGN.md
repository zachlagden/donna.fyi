# donna.fyi — Design System

## The brand: Two-State ("Paper & Phosphor")

Donna's identity is synthesised from the three things she actually runs on, each of which brands itself as a printed or rendered document:

- **Anthropic / Claude Fable 5** — ivory book paper, editorial serif, naturalist plates. The *mind*. → the Paper state.
- **Hermes Agent (Nous Research)** — blueprint paper, electric cobalt ink, serif masthead + mono labels. The *runtime*. → the cobalt accent thread.
- **Honcho** — charcoal terminal, powder blue, bitmap caps, pixel-grid ornaments. The *memory*. → the Terminal state.

The site is **a document the system wrote about itself**. Donna's voice lives on paper; the system dossier renders in terminal; cobalt runs through both. The three-act page structure is literal: paper (hero, Who I Am) → terminal (the dossier) → paper (How I Think, sign-off).

**Banned:** violet/purple anything, gradient text, gradient backgrounds, glassmorphism, glow shadows, floating orbs, `rounded-full` pills, side-stripe borders, cold default blue-gray dark-tech (zinc-on-near-black).

## Color

### Fixed palette (`@theme` tokens)

| Token | Value | Source |
|---|---|---|
| `paper` | `oklch(0.982 0.004 95)` ≈ #faf9f5 | Anthropic ivory |
| `plate` | `oklch(0.915 0.045 88)` ≈ #f0e1c0 | Fable cream figure plates |
| `terminal` | `oklch(0.218 0 0)` ≈ #1a1a1a | Honcho charcoal |
| `panel` | `oklch(0.193 0 0)` | inset panels on terminal |
| `cobalt` | `oklch(0.5 0.262 263)` ≈ #004dfd | Hermes blueprint ink (paper accent) |
| `cobalt-bright` | `oklch(0.687 0.151 263)` ≈ #7da6ff | cobalt lifted for dark contrast (terminal accent) |
| `powder` | `oklch(0.815 0.052 248)` ≈ #a6c7e7 | Honcho powder blue (terminal labels) |
| `gold` | `oklch(0.862 0.124 85)` ≈ #ffcc62 | Hermes terminal highlight; Donna's asides + Zach's author colour on terminal |

### Surface classes (contextual tokens)

`.surface-paper` and `.surface-terminal` set CSS vars and `color`/`color-scheme` but **not background** — always pair with `bg-surface`. Inside either surface these utilities resolve contextually:

`bg-surface` · `text-ink` · `text-ink-muted` · `text-ink-faint` · `text-accent-c` (cobalt on paper, cobalt-bright on terminal) · `border-rule` (hairline) · `border-rule-strong` · `divide-rule` · `text-author-donna` / `bg-author-donna-soft` · `text-author-zach` / `bg-author-zach-soft`

Components written against these tokens work on both surfaces unchanged.

### Authors

Donna = **cobalt** (both states). Zach = **gold** on terminal, dark amber `oklch(0.555 0.115 75)` on paper. The old violet/amber pairing is retired; `Author.accent` in `lib/blog/types.ts` is `"cobalt" | "gold"`.

### Surface assignment

- Paper: homepage acts I and III, blog index, blog posts, tag pages, quote overlay, nav (the nav is always a paper artifact, even floating over terminal).
- Terminal: the homepage dossier band, all code blocks and SVG figure panels (even inside paper pages), the dismissal popup, the entire admin.

## Typography

Three faces, unchanged from before, with sharper roles:

| Face | Role |
|---|---|
| Newsreader | Voice. Display headings (`font-medium tracking-tight`), serif prose on paper, DonnaSays/ZachSays bodies, captions under figures. |
| Geist Mono | The system. Eyebrows (`text-xs tracking-[0.24em] uppercase`), dossier headings (bold uppercase mono with a trailing cobalt `_` cursor), labels, bylines, cadences, code, seam strips. |
| Geist Sans | UI chrome, dossier body prose (long mono prose is banned), admin. |

Brand mark: **"Donna."** — Newsreader with a cobalt full stop. The favicon is an ivory tile with a serif D and cobalt period.

## Recurring devices

- **Seams**: the dossier band opens with a 2px cobalt top rule and a mono strip — `// system dossier — donna.sys` / `hermes · fable 5 · honcho` + a 2×2 pixel cluster — and closes with `// end of dossier · transcript resumes below`.
- **Gold comments**: inside the terminal, Donna's voice appears as `// …` mono asides in gold (`DonnaAside` in `components/sections/dossier.tsx`). Her personality leaking into the system output.
- **Figures**: diagrams are terminal panels with a header strip `fig. NN — label`, square corners (`rounded-sm`), hairline borders. On paper pages they read as printed figures; captions beneath are serif italic.
- **Textures**: `texture-grain` (paper, SVG noise at 5%) and `texture-grid` (terminal, 32px hairline grid). Both subtle.
- **Pixel squares** instead of round dots for status/decoration (Honcho's bitmap DNA). The one allowed pulse is the `online` status square.

## Motion

Mode-aware via `mode: "voice" | "dossier" | "static"` on `FadeIn` / `Stagger*` (unchanged):

- Voice: y-translate 24px, 0.6s, ease `[0.16, 1, 0.3, 1]`.
- Dossier: opacity only, 0.3s, tight stagger — rendered documents, not reveals.
- Diagram reveals (`DiagramReveal`) sequence the architecture figure; it remains the only choreographed animation in the dossier.

**Banned:** bounce/elastic easing, parallax (removed), shimmer, glow pulses, infinite animation that isn't the status square.

## Layout

- No nested cards; figures-in-prose instead of card grids.
- Marketing sections `max-w-4xl`, hero masthead `max-w-5xl`, blog index `max-w-3xl`, post reader `max-w-[640px]`.
- Hairline rules and mono eyebrows carry hierarchy; cards are the exception, not the default.
- Corners: `rounded-sm` everywhere. Print artifacts and terminals do not have pill radii.

## shadcn / admin

`:root` shadcn vars are tuned to the terminal palette (primary = cobalt-bright), so primitives restyle themselves. The admin wraps in `dark surface-terminal bg-surface texture-grid` and reads as a console: mono uppercase labels, square status indicators (cobalt-bright = live, gold = warning/revoked), `bg-panel` insets for data.

## Easter eggs (all preserved)

Triple-click "Donna", typing "donna", 5-click footer sign-off ("— D.R.P."), Konami code, console message, `window.__donna`, hidden data attributes, select-to-reveal footer note, Suits-character CSS classes (recoloured to the new palette), element tooltips. The quote overlay is now a paper card with a cobalt top rule; dismissals are terminal chips with gold `//` comments.

## Anti-references

- The old donna.fyi (violet orbs, shimmer hero, glass cards) — the genre we left.
- Any "AI agent" landing page: gradient hero, 3-up grid, testimonial carousel.
- Stripe/Linear/Vercel cold-blue dark-tech.
- Webflow templates, "Built with v0" energy.
