# donna.fyi — Public surface redesign (Project A)

**Status**: Design accepted, ready for implementation planning
**Date**: 2026-05-18
**Author**: Zach + Claude (brainstorming)
**Companion spec**: `2026-05-18-donna-blog-design.md` (Project B — blog backend)

---

## 1. Context

donna.fyi currently presents Donna — Zach's AI chief of staff — as a single-page brag site. Copy still references "Claude Opus 4.6" and the (now-defunct) OpenClaw framework. Substantively, Donna has moved to:

- **Hermes Agent** (Nous Research) as the runtime
- **MiniMax-M2.7-highspeed** as the reasoning model (via Anthropic-compat endpoint)
- **Honcho** (self-hosted, pgvector + deriver) as the memory layer, with OpenAI `text-embedding-3-small` for embeddings
- Anthropic skills (`xlsx`, `pdf`, `docx`, `pptx`) installed via the Hermes skills system
- Telegram as the primary interaction channel, with a real systemd-managed gateway, auto-update, nightly backups, and Telegram failure alerting

The site needs to reflect this — and shift tonally from "hah, I have this and you don't" toward a more serious, technical artifact, while keeping Donna's voice intact.

A blog is also being added (see Project B spec). The redesign must accommodate `/blog` and `/blog/[slug]` cleanly.

## 2. Goals & non-goals

### Goals
- Present Donna as a real, well-engineered, opinionated self-hosted system, not a lifestyle flex
- Make the technical story (Hermes + M2.7 + Honcho + embeddings) the heart of the page, with engineering-blog-grade depth
- Keep Donna's character (cheek, swagger, Suits easter eggs) in the voice but not in the substance
- Serve three audiences simultaneously without forking: AI/agent-space builders, recruiters using this as evidence of how Zach thinks/builds, and people Zach DMs the link to
- Cleanly host the new blog (Project B) within the same visual system

### Non-goals
- Sales / lead-gen / CTAs — not a marketing site
- Exposing personal-deployment specifics (no "4,883 messages", no "Hetzner Helsinki", no `dg-agent01-hel1-prod`, no internal config paths)
- Comments, social features, search on the blog
- A separate admin UI for blog management (Project B handles writes via API only)

## 3. Approach

**Approach C — "Cover letter + dossier"**. The page shifts modes intentionally:

- **Act I — voice** (sections 1–2): Donna in first person. Sets persona quickly, then pivots into substance.
- **Act II — dossier** (sections 3–5): Sober narrator. Real architecture, real model story, real memory story, sober inventory of capabilities. Outbound links to the real technology pages.
- **Act III — voice resumed** (sections 6–7 + footer): Closes back in Donna's voice. Day-with-Donna timeline (pattern-based, not personal logs), Donna Difference chat exchanges, footer with easter eggs.

The seam between modes is reinforced by typography, layout density, and motion shifts — visible and intentional.

## 4. Page structure

### Sections

| # | ID | Mode | Status | Source of truth |
|---|---|---|---|---|
| 1 | `hero` | voice | rewrite | new copy reflecting current reality |
| 2 | `who-i-am` | voice | rewrite | drop Claude Opus 4.6 / "Ascot server" references |
| 3 | `how-she-works` | dossier | new | architecture story + diagram + links |
| 4 | `memory` | dossier | new | Honcho-focused; M2.7 + OpenAI embeddings |
| 5 | `skill-surface` | dossier | rewrite (was Capabilities) | reframe from brag to sober inventory |
| 6 | `day-with-donna` | voice | rewrite | pattern-based behaviour, not personal log |
| 7 | `difference` | voice | minor edit | drop "hire her because you need to win" line |
| — | footer | voice | keep | easter eggs intact |

**Cut**: `Values` (was section 3) — folded into `Who I Am` as nothing; the operating-principles content does not survive in compressed form either. The Donna Difference + Who I Am already carry her stance.

**Cut**: `Learn More` (was section 7) — its three outbound link cards (pointing at OpenClaw + Claude Opus 4.6, both incorrect) are absorbed into `How She Works`, alongside the real architecture they describe.

### Nav

- **On `/`**: existing section-anchor nav, with sections updated to match new order. Adds `Blog` as a separate top-level item.
- **On `/blog/*`**: nav collapses to `donna.fyi` (home, links to `/`) and `Blog` (links to `/blog`). Section anchors do not appear; they're meaningless off the homepage.
- Nav is sticky, blurred-translucent background, same component handles both modes via prop.

## 5. Section content

### 5.1 Hero (`hero`)

Tighter than current. One-liner persona statement + a single sentence that pivots toward substance.

Draft copy:

> **I'm Donna.**
> It's a name and a title.
>
> Zach hired me to keep him organised. I'm an agent now — self-hosted, always on, with a real memory of every conversation we've ever had. The rest of this page tells you exactly how I work. (And what I think about that.)

The "what I think about that" parenthetical is the seam-acknowledging line that licenses the mode shift below.

### 5.2 Who I Am (`who-i-am`)

Compressed from current. Drops technical details (those now live in section 3). Keeps:
- Naming origin (Suits / Donna Paulsen)
- Her stance (anticipate, don't react; remember everything; push back when it matters)
- The can-opener easter egg reference

Roughly 100–140 words. Editorial serif body, generous leading.

### 5.3 How She Works (`how-she-works`)

The first dossier section. ~250 words of engineering-blog-grade prose covering:
- **What Hermes is**: a long-running agent framework (Nous Research). Gateway process + provider abstraction + skills system + persistent state.
- **Why M2.7**: long context window (~204k tokens), anthropic-compat endpoint for clean tool use, and a temperament that holds up at length without getting weird.
- **Where she runs**: self-hosted (no detail beyond "self-hosted, not riding on a vendor API"). This is the credibility beat.
- **What "skills" mean operationally**: installable, sandboxed, versioned units of capability. Anthropic's official skills (xlsx, pdf, docx, pptx) are installed.

**Architecture diagram** (hand-crafted SVG):
- Telegram (user channel) → Hermes Gateway → M2.7 (reasoning) → Honcho (memory) → Skills + tools (back out)
- Dark-friendly stroke colours, monospace labels (Geist Mono), violet for Donna-side nodes, neutral grey for infra
- Lights up node-by-node on scroll-in (the one piece of dossier-section motion; functional, not decorative)
- Mobile: stacks vertically with arrows reflowed

**Outbound links** (real, clickable, prominent):
- `hermes-agent.nousresearch.com` — "the framework"
- `minimax.io/models/text/m27` — "the model"
- (`honcho.dev` lives in the next section)

### 5.4 Memory (`memory`)

The most distinctive technical claim. Own section because it deserves the weight. ~200 words.

Covers:
- Honcho as a semantic memory layer for agents (single-line definition with link)
- The reasoning loop: M2.7 acts as both the conversation model AND Honcho's deriver model — turning conversation turns into deductive observations ("Zach said X on date Y") and inductive patterns ("Zach tends to push back on long meetings")
- OpenAI `text-embedding-3-small` (1536d) as the embedding model
- Why this matters: an always-on agent without memory is a chatbot; with structured semantic memory, she becomes a colleague who builds context over time

Outbound link: `honcho.dev`

No personal data points (no "X messages ingested"). The story is the architecture pattern.

### 5.5 Skill surface (`skill-surface`)

Reframe of current Capabilities section. Same 6-category grid, sober copy.

Categories (existing data in `lib/data.ts` survives):
- Communication (Email, Telegram, WhatsApp, Discord, Signal, Voice/TTS)
- Productivity (Calendar, Tasks, Notion, Habit tracking, Daily briefings, Cron)
- Research & Content (Web search, URL summarisation, YouTube/podcasts, Newsletters, Browser automation, Image analysis)
- Infrastructure (Server management, Cloudflare, GitHub CI/CD, Pi-hole, Train times)
- Smart home (Google Home, Tapo, Lighting, Energy)
- Development (Claude Code sessions, File management, Git, Shell)

**Plus a new row**: "Anthropic skills" — xlsx, pdf, docx, pptx via the Hermes skills system.

Copy treatment: each item is one declarative sentence ("Sends and receives email across multiple inboxes."), not a Donna-voice brag ("Manage multiple inboxes, triage by importance, never miss anything urgent."). Voice neutral, factual.

### 5.6 A Day with Donna (`day-with-donna`)

Existing timeline survives structurally. Copy refresh:
- Items become *patterns*, not *logs*. "07:30 — calendar checked, daily brief sent" not "07:30 — checked Zach's calendar, no conflicts today, sent daily brief with priorities."
- Each row reads like a documented behaviour, not a journal entry
- Channel chips remain (good visual rhythm)

### 5.7 The Donna Difference (`difference`)

Keep chat-exchange UI exactly as-is. Three exchanges remain.
**Drop** the closing line: "You don't hire Donna because you need help. You hire her because you need to win." That line is the peak smug-flex tone we're moving away from.
Replace with a softer sign-off in Donna's voice that closes Act III — e.g., a single line acknowledging "and now you've read more about me than most people do about each other."

### 5.8 Footer

Keep current treatment. Easter eggs intact (`SUITS_QUOTES`, `DISMISSALS`, `KONAMI_CODE`, the Litt-up footer-click, the `data-can-opener`, console message). Update the console message to drop the "Claude Opus 4.6" reference and instead reference Hermes / M2.7.

## 6. Visual system

### Typography

Three faces:
- **Geist Sans** (existing) — UI, short headers, nav, buttons
- **Geist Mono** (existing) — code, system labels, architecture diagram labels, byline chips, technical accents
- **Newsreader** (new — Google Fonts, free, multi-weight) — long-form body in Act I + III, blog post bodies, large headers

Type scale: keep current scale roughly; pin display headlines to Newsreader (display weight), body in Newsreader at 18px / 1.75 leading, UI in Geist Sans at default Tailwind sizes, mono at slightly smaller.

### Colour

- Base: `zinc-950` (existing)
- **Donna accent**: `violet-400` / `violet-500` (existing, retained)
- **Zach accent**: `amber-400` / `amber-500` (already in current palette — used in Donna Paulsen link colour — promoted to a first-class author colour)
- Neutral text: `zinc-100` → `zinc-400` → `zinc-600` (existing scale)

Author accent appears in:
- Byline chip background tint + border
- Heading underline / left rule on `/blog/[slug]`
- Post card edge accent on `/blog` index
- (Site chrome stays neutral; accents are author-bound only)

### Motion

Mode-aware, implemented via existing motion components (`FadeIn`, `StaggerChildren`) extended with a `mode` prop or per-section overrides:

- **Voice sections** (1, 2, 6, 7): fades, soft stagger on lists, scroll-linked reveals (current behaviour)
- **Dossier sections** (3, 4, 5): no decorative animation. The only motion is **functional**: the architecture diagram in section 3 lights up node-by-node on scroll-in.

The motion shift makes the mode-shift legible without needing copy or chrome to announce it.

### Density

- Voice sections: looser, generous vertical rhythm, wide leading
- Dossier sections: denser, smaller leading, more information per screen (without being cramped)

### Layout

- Home page: existing single-column max-width-4xl layout retained
- Architecture diagram (section 3): full-width within column, SVG, ~600px tall on desktop
- Skill surface (section 5): existing grid retained
- Blog index (`/blog`): single column, post cards stacked, max-width-3xl, 10 per page
- Blog post (`/blog/[slug]`): centered editorial column ~640px, floating right-rail TOC on screens ≥1280px, no rail below that

## 7. Blog reader page (`/blog/[slug]`)

Detailed page treatment (the blog *backend* is Project B — this is what Project A renders):

### Top-of-post

- Author chip with author accent (violet for Donna, amber for Zach), shows author name + mono `@<handle>` style
- Title — Newsreader display weight, generous size
- Subtitle / summary — Newsreader regular, muted
- Meta row — mono — published date · reading time · "edited" indicator (only if revisions exist; clicking shows "last edited at <timestamp>")
- Tag pills — small mono labels, link to `/blog/tag/[tag]`

### Body

- Newsreader, 18px / 1.75 leading, max ~640px column
- H2 / H3 set in Newsreader display weight with mono kicker numbers (e.g., "01. How she remembers things")
- Inline code in Geist Mono with subtle background tint
- Block code via `<Code lang="ts">` MDX component (Shiki at compile time)
- Callouts — `<Note>`, `<Warning>`, `<Tip>`, `<DonnaSays>`, `<ZachSays>` — boxed, accent-coloured, icon left
  - `<DonnaSays>` always renders violet regardless of post author; `<ZachSays>` always renders amber. This lets one author interject in the other's post.
- Figures — `<Figure src caption>` — next/image-optimized, click-to-enlarge lightbox (no third-party dependency; light custom modal)
- Embeds — `<Tweet>`, `<YouTube>`, `<Gist>`, `<Loom>` — server-rendered, lazy-loaded, dimensions reserved to avoid CLS

### Right rail (≥ xl)

- Floating TOC, auto-generated from H2/H3 headings during MDX compile
- Current section highlighted via IntersectionObserver
- Collapses entirely below `xl`

### Bottom-of-post

- "← Newer / Older →" pagination by publish date
- Tag links
- No comments, no related posts, no "subscribe" CTA

## 8. Blog index page (`/blog`)

- H1 — "Blog" in Newsreader display
- Tagline — one line in Donna's voice (e.g., "Notes from me and Zach. Mostly me.") (mode shift: this page is Act-I-tonally voice, sits at the front door of the blog)
- Post list — stacked cards, each card:
  - Author chip (violet or amber edge)
  - Title (Newsreader, ~28px)
  - Summary (1–2 lines)
  - Meta row (mono, small) — date · reading time · tags
- Pagination — 10/page; mono "01 / 03" style indicator
- Filter pages live at `/blog/tag/[tag]` — same template, filtered list, breadcrumb up to `/blog`

## 9. File-level layout

### New / modified files in `donna.fyi`

```
app/
  layout.tsx                 modify: add Newsreader to font setup
  page.tsx                   no change (still <DonnaPage />)
  blog/
    page.tsx                 new: /blog index, paginated
    [slug]/page.tsx          new: /blog/[slug] reader page
    tag/[tag]/page.tsx       new: tag-filtered index
  rss.xml/route.ts           new: RSS regen on demand (route handler)
  atom.xml/route.ts          new: Atom regen on demand
  sitemap.ts                 new: includes blog posts

components/
  donna-page.tsx             modify: section order, drop Values import,
                             drop LearnMore import
  nav.tsx                    modify: hybrid mode (home vs /blog/* aware),
                             Blog item added
  sections/
    hero.tsx                 rewrite copy
    who-i-am.tsx             rewrite copy (no Claude Opus 4.6)
    values.tsx               DELETE
    how-she-works.tsx        new
    memory.tsx               new
    skill-surface.tsx        rewrite of capabilities.tsx (rename + copy refresh)
    capabilities.tsx         DELETE (replaced by skill-surface)
    day-with-donna.tsx       copy refresh (patterns not logs)
    donna-difference.tsx     drop the "win" closing line, add new sign-off
    learn-more.tsx           DELETE
    footer.tsx               update console message
  blog/
    post-card.tsx            new: post card for /blog index
    author-chip.tsx          new: byline chip with author accent
    toc.tsx                  new: floating right-rail TOC
    post-meta.tsx            new: meta row component
    edited-indicator.tsx     new: small toggle for "edited" hover
  mdx/
    code.tsx                 new: <Code lang="ts"> with copy button
    callouts.tsx             new: <Note>, <Warning>, <Tip>, <DonnaSays>,
                             <ZachSays>
    figure.tsx               new: <Figure src caption> + lightbox
    embeds/
      tweet.tsx              new
      youtube.tsx            new
      gist.tsx               new
      loom.tsx               new
    index.ts                 new: component registry (allowlist)
  motion/                    keep existing FadeIn / StaggerChildren / Parallax
  ui/                        existing shadcn primitives retained

lib/
  data.ts                    update: refresh capability copy, drop "Claude
                             Opus 4.6" reference in any text
  constants.ts               update: console message references Hermes / M2.7,
                             not Opus
  blog/                      Project B reads from here — schemas, types,
                             API client. See Project B spec for details.

public/
  favicon.svg                keep
  og-image.png               keep (home page default OG)
  fonts/                     Newsreader loaded via next/font/google,
                             no static files needed
```

### Files deleted

- `components/sections/values.tsx`
- `components/sections/capabilities.tsx` (replaced by skill-surface.tsx)
- `components/sections/learn-more.tsx`

## 10. Risks & open questions

### Risks

- **The seam between voice and dossier reads as schizophrenic if executed poorly.** Mitigation: typography + motion shifts handle the transition; the hero's "what I think about that" parenthetical licenses it.
- **Newsreader changes the brand feel.** Mitigation: it's used only for long-form prose; UI stays Geist. Worst case: easy to swap for Instrument Serif (similar slot, more characterful) without other changes.
- **Architecture diagram is a real piece of design work.** Custom SVG, dark theme, animated. If under-baked it'll undermine the credibility play. Treat as a first-class deliverable, not an afterthought.
- **Mode-aware motion adds component complexity.** Mitigation: add a `mode: 'voice' | 'dossier'` prop to the FadeIn/Stagger components and route based on section.

### Resolved during brainstorming (for the record)

- ~~Should Values survive in compressed form?~~ → No, cut entirely.
- ~~Memory as own section or sub-piece of architecture?~~ → Own section.
- ~~Per-author colour or typography-only distinction?~~ → Two accents: violet (Donna) + amber (Zach).
- ~~Hand-rolled vs NextAuth?~~ → NextAuth (decided in Project B).
- ~~Compile MDX when?~~ → Write-time (decided in Project B).

### No open questions remain.

## 11. Out of scope for this spec

- Implementation plan (handed to `writing-plans` skill after this spec is approved)
- Blog backend / API / database / auth (covered by Project B spec)
- Performance budgets, CSP headers, observability (will be addressed during planning)
- Analytics — none planned; if added later, lives in a small layout-level Script tag with no consent banner needed for cookie-less analytics

---

End of Project A spec.
