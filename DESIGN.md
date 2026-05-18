# donna.fyi — Design System

## Color strategy

**Committed.** One saturated color (violet) carries the brand identity. Amber appears as the second-author accent and a tertiary glow. Everything else is tinted-zinc neutrals.

### Tokens (OKLCH)

| Role | Token | Value | Notes |
|---|---|---|---|
| Surface base | `--background` | `oklch(0.145 0 0)` | Near-black, no chroma. Body bg. |
| Surface raised | `--card` | `oklch(0.16 0.004 285)` | Slight violet tint |
| Surface deepest | `--zinc-950` | tailwind | Used for cards inside cards |
| Foreground | `--foreground` | `oklch(0.985 0 0)` | Near-white, no chroma |
| Primary (Donna) | `--primary` | `oklch(0.627 0.265 303.9)` | Violet, full saturation |
| Accent (Zach) | `--accent` | `oklch(0.769 0.188 70.08)` | Amber, second author |
| Author Donna | `--color-author-donna` | `oklch(0.7 0.18 296)` | Chip/edge accent |
| Author Donna soft | `--color-author-donna-soft` | `oklch(0.7 0.18 296 / 0.12)` | Background tint |
| Author Zach | `--color-author-zach` | `oklch(0.79 0.16 70)` | Chip/edge accent |
| Author Zach soft | `--color-author-zach-soft` | `oklch(0.79 0.16 70 / 0.12)` | Background tint |
| Violet glow | `--color-violet-glow` | `oklch(0.541 0.281 293.009 / 0.15)` | Diffuse background glows |
| Amber glow | `--color-amber-glow` | `oklch(0.769 0.188 70.08 / 0.1)` | Secondary glows |

**Banned:** `#000`, `#fff`, cold default blue, gradient text used decoratively (the hero shimmer is the one exception — it's THE brand moment).

## Theme

**Dark.** Scene sentence: *Someone in their late twenties, on a 14-inch laptop screen in low ambient light, evaluating whether the person who built this is serious. They are not skimming. They are reading.*

Dark is required because (a) the persona — Donna — is a quietly powerful presence rather than a friendly one, (b) the architecture diagram demands a dark canvas to glow against, (c) reading at length wants reduced retinal load when the content is dense, (d) the audience overlaps significantly with people who use dark IDEs and tools all day.

## Typography

Three faces. Each has a job.

| Face | Variable | Role |
|---|---|---|
| Geist Sans | `--font-geist-sans` | UI, nav, buttons, short labels, metadata |
| Geist Mono | `--font-geist-mono` | Code, system labels, eyebrow tags, diagram labels, post bylines |
| Newsreader | `--font-newsreader` | Long-form prose (voice sections, blog body), big serif display headers |

### Scale

Hierarchy through scale + weight contrast. Body line length 65-75ch (max-width container `~640px` for blog reader, `~3xl` for marketing sections).

- Display (Donna title, blog post H1): 5xl - 10rem, Newsreader semibold/black
- Section H2: 4xl - 5xl, sans bold (currently) — **candidate for switch to Newsreader display weight in refresh**
- Hero subtitle: 2xl - 3xl, sans light, tracking-wide
- Body voice: 1.05-1.125rem, Newsreader 400, leading 1.6-1.75
- Body dossier: 1.05rem, sans 400, leading 1.5
- Eyebrow: xs uppercase, tracking-[0.2em], mono, zinc-500
- Mono labels: xs-sm, mono, zinc-500

**Banned:** flat scales, all-bold pages, headings smaller than body text.

## Motion

Mode-aware via `mode: "voice" | "dossier" | "static"` prop on `FadeIn` + `Stagger*`.

- **Voice mode** (sections 1, 2, 6, 7): y-translate 24px, opacity 0→1, duration 0.6s, ease `[0.16, 1, 0.3, 1]` (ease-out-quart), stagger 0.1s
- **Dossier mode** (sections 3, 4, 5): no y-translate (only opacity), shorter duration 0.3s, tighter stagger 0.04s — sections feel like rendered documents, not animated reveals
- **Static mode**: no animation. For below-the-fold safety / a11y respect

### Functional motion

The architecture diagram nodes reveal sequentially on scroll-in via `DiagramReveal` (motion.g with whileInView opacity). This is the only decorative animation in the dossier; it's earning its place because the diagram IS the substance.

**Banned:** bounce / elastic easing, animating layout properties, decorative parallax on body content, infinite spinning anything that isn't a status dot.

## Layout

- **No nested cards.**
- **Same-padding-every-section is monotony.** Voice sections breathe (py-24+), dossier sections can vary (py-20 with denser internals).
- **Cards are not the default.** Use full borders, eyebrow text, leading numerals, or just a horizontal divider. Currently several sections use cards by reflex — flag for refinement.
- **Container max-widths:** marketing sections `max-w-4xl`, blog index `max-w-3xl`, blog post reader `max-w-[640px]` with optional `xl:` right rail.

## Components in use (high-level)

- shadcn/ui primitives: Button, Card, Badge, Separator, Collapsible, Tooltip, Progress
- Custom: Nav (mode-aware), Hero, section components, ArchitectureDiagram (SVG), AuthorChip, PostCard, Toc, PostMeta, EditedIndicator, BlogHeader
- MDX components (allowlist): Code (Shiki), Note/Warning/Tip/DonnaSays/ZachSays callouts, Figure with lightbox, Tweet/YouTube/Gist/Loom embeds, typography overrides

## Easter eggs (part of the design)

- Triple-click "Donna" in hero → flashes a Suits quote
- Type "donna" anywhere → flashes a quote
- 5-click footer → "You just got Litt up!"
- DevTools console: hidden message
- Various `data-*` attributes referencing Suits characters
- Hidden Donna note in footer (visible only when text-selected)
- Konami code → quote
- Multiple element-level tooltips on hover

These are intentional. They survive every refresh.

## Anti-references / things to avoid

- Stripe / Linear / Vercel cold-blue dark-tech look
- "AI agent for X" landing page genre (gradient hero + 3-up grid + testimonial)
- Side-stripe borders (banned by shared laws — currently used on the blog PostCard left edge — refactor target)
- Gradient text as decoration (the hero shimmer is the one earned exception)
- Glassmorphism as default (currently `.glass-card` exists but is being phased out as components are rebuilt)
- Identical card grids (the Skill surface collapsibles are a candidate for differentiation)
