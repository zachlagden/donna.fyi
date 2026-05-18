# donna.fyi Redesign — Implementation Plan (Project A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public surface of donna.fyi from a personal-brand brag page into a serious, technical artifact with Donna's voice intact — and add blog reader pages (`/blog`, `/blog/[slug]`, `/blog/tag/[tag]`) that consume a typed data adapter (real implementation lands in Project B).

**Architecture:** Same Next.js 16 App Router app. Three-act page structure (voice → dossier → voice). Adds Newsreader serif for long-form. Two author accents (violet = Donna, amber = Zach). Mode-aware motion (voice = breathy, dossier = system-like). Blog pages read through a `BlogDataSource` interface — Plan A ships a mock implementation under `lib/blog/mock-source.ts`; Plan B swaps in the Postgres-backed `lib/blog/postgres-source.ts` behind the same interface.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.8, Tailwind v4, shadcn/ui, motion 12, Newsreader (next/font/google), Vitest + @testing-library/react for unit tests, Playwright for smoke E2E.

**Companion plan:** `2026-05-18-donna-blog-backend.md` (Project B). Project B can ship after Plan A is complete and merged.

---

## File Structure (created or modified)

```
app/
  layout.tsx                                  modify: add Newsreader font, update metadata
  page.tsx                                    no change
  globals.css                                 modify: amber accent tokens, mode-aware reduced motion
  blog/
    page.tsx                                  create: /blog index
    [slug]/page.tsx                           create: /blog/[slug] reader
    tag/[tag]/page.tsx                        create: /blog/tag/[tag] filter
  rss.xml/route.ts                            create
  atom.xml/route.ts                           create
  sitemap.ts                                  create

components/
  donna-page.tsx                              modify: section order, drop deletions
  nav.tsx                                     modify: mode-aware (home vs /blog/*)
  sections/
    hero.tsx                                  rewrite copy + remove smug-flex lines
    who-i-am.tsx                              rewrite (no Claude Opus 4.6)
    how-she-works.tsx                         create
    architecture-diagram.tsx                  create: SVG diagram, scroll-in light-up
    memory.tsx                                create
    skill-surface.tsx                         create (replaces capabilities.tsx)
    day-with-donna.tsx                        copy refresh (patterns not logs)
    donna-difference.tsx                      drop closing "win" line, new sign-off
    footer.tsx                                update console message + Opus link
    values.tsx                                DELETE
    capabilities.tsx                          DELETE
    learn-more.tsx                            DELETE
  blog/
    post-card.tsx                             create
    author-chip.tsx                           create
    toc.tsx                                   create
    post-meta.tsx                             create
    edited-indicator.tsx                      create
    blog-header.tsx                           create
  mdx/
    code.tsx                                  create: <Code> with Shiki output
    callouts.tsx                              create: <Note> <Warning> <Tip> <DonnaSays> <ZachSays>
    figure.tsx                                create: <Figure> + lightbox
    embeds/
      tweet.tsx                               create
      youtube.tsx                             create
      gist.tsx                                create
      loom.tsx                                create
    typography.tsx                            create: h1/h2/h3/p/a overrides for reader
    index.ts                                  create: component allowlist export
  motion/
    fade-in.tsx                               modify: add `mode` prop
    stagger-children.tsx                      modify: add `mode` prop
    diagram-reveal.tsx                        create: wraps SVG nodes with scroll-triggered light-up

lib/
  blog/
    types.ts                                  create: Post, Author, Tag, BlogDataSource
    mock-source.ts                            create: dev/test fixture data
    source.ts                                 create: factory that returns the active source
    reading-time.ts                           create
    feeds/
      rss.ts                                  create
      atom.ts                                 create
  data.ts                                     modify: refresh capability copy, drop Opus
  constants.ts                                modify: console message references Hermes/M2.7

tests/
  unit/
    motion/fade-in.test.tsx                   create
    blog/author-chip.test.tsx                 create
    blog/toc.test.tsx                         create
    blog/post-card.test.tsx                   create
    blog/reading-time.test.ts                 create
    blog/feeds.test.ts                        create
    mdx/callouts.test.tsx                     create
    mdx/figure.test.tsx                       create
  e2e/
    home.spec.ts                              create
    blog.spec.ts                              create

vitest.config.ts                              create
playwright.config.ts                          create
.gitignore                                    modify: add /playwright-report, /test-results
package.json                                  modify: scripts + devDependencies
```

---

## Phase 1: Tooling and visual tokens

### Task 1: Add test infrastructure (Vitest + React Testing Library + Playwright)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore`
- Create: `tests/setup.ts`

- [ ] **Step 1: Install dev dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/node @playwright/test
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

- [ ] **Step 5: Add scripts to `package.json`**

Edit `package.json` scripts to add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 6: Update `.gitignore`**

Append:
```
/playwright-report
/test-results
```

- [ ] **Step 7: Sanity-check by running an empty test**

Create `tests/unit/sanity.test.ts`:
```ts
import { expect, test } from "vitest";
test("smoke", () => expect(1 + 1).toBe(2));
```
Run: `pnpm test`. Expect: 1 passing test. Delete the file afterwards.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts playwright.config.ts tests/setup.ts .gitignore
git commit -m "chore(test): add vitest, react-testing-library, playwright"
```

---

### Task 2: Add Newsreader font and update layout metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://donna.fyi"),
  title: "Donna — Zach's AI Chief of Staff",
  description:
    "Donna is a self-hosted AI chief of staff. Hermes Agent runtime, MiniMax M2.7 reasoning, Honcho semantic memory.",
  openGraph: {
    title: "Donna — Zach's AI Chief of Staff",
    description:
      "Self-hosted AI chief of staff. Hermes Agent + MiniMax M2.7 + Honcho memory.",
    url: "https://donna.fyi",
    siteName: "donna.fyi",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Donna" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donna — Zach's AI Chief of Staff",
    description: "Self-hosted AI chief of staff. Hermes + MiniMax M2.7 + Honcho.",
    images: ["/og-image.png"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build still works**

```bash
pnpm build
```
Expect: build completes; "Successfully compiled" output.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(layout): add Newsreader serif and refresh metadata"
```

---

### Task 3: Define amber author accent + Newsreader CSS variable

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add font-family + author accent tokens to `@theme` block**

In `app/globals.css`, replace the `@theme { ... }` block (lines 6–17) with:

```css
@theme {
  --font-geist-sans: "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --font-newsreader: "Newsreader", ui-serif, Georgia, Cambria, "Times New Roman", serif;

  --color-violet-glow: oklch(0.541 0.281 293.009 / 0.15);
  --color-amber-glow: oklch(0.769 0.188 70.08 / 0.1);

  --color-author-donna: oklch(0.7 0.18 296);     /* violet-400-equivalent */
  --color-author-donna-soft: oklch(0.7 0.18 296 / 0.12);
  --color-author-zach: oklch(0.79 0.16 70);      /* amber-400-equivalent */
  --color-author-zach-soft: oklch(0.79 0.16 70 / 0.12);

  --animate-shimmer: shimmer 3s ease-in-out infinite;
  --animate-glow-pulse: glow-pulse 3s ease-in-out infinite;
  --animate-gradient: gradient-shift 8s ease-in-out infinite;
  --animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
}
```

- [ ] **Step 2: Add `prefers-reduced-motion` rule near bottom of file**

Append before the Suits easter-egg classes (before the line `/* ═══...`):

```css
/* ─── Reduced motion: dossier sections are static by default; respect user preference globally ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Visual verify in dev**

```bash
pnpm dev
```
Open `http://localhost:3000`. Confirm the page still renders identically (this change is additive — no visible diff yet).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): add Newsreader, amber author accent, reduced-motion override"
```

---

## Phase 2: Motion system update

### Task 4: Add `mode` prop to motion components

**Files:**
- Modify: `components/motion/fade-in.tsx`
- Modify: `components/motion/stagger-children.tsx`
- Create: `tests/unit/motion/fade-in.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/motion/fade-in.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FadeIn } from "@/components/motion/fade-in";

describe("FadeIn", () => {
  it("renders children in voice mode (default)", () => {
    const { getByText } = render(<FadeIn>hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("renders children unchanged in dossier mode (animation suppressed)", () => {
    const { getByText } = render(<FadeIn mode="dossier">hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("renders children unchanged in static mode", () => {
    const { getByText } = render(<FadeIn mode="static">hello</FadeIn>);
    expect(getByText("hello")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — expect FAIL**

```bash
pnpm test tests/unit/motion/fade-in.test.tsx
```
Expect: `Type '{ mode: "dossier"; }' has no properties in common with type 'FadeInProps'.` (or runtime equivalent).

- [ ] **Step 3: Update `components/motion/fade-in.tsx`**

```tsx
"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { type ReactNode } from "react";

export type MotionMode = "voice" | "dossier" | "static";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  mode?: MotionMode;
}

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className,
  mode = "voice",
  ...props
}: FadeInProps) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveY = mode === "dossier" ? 0 : y;
  const effectiveDuration = mode === "dossier" ? 0.3 : duration;
  return (
    <motion.div
      initial={{ opacity: 0, y: effectiveY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: effectiveDuration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Update `components/motion/stagger-children.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";
import type { MotionMode } from "./fade-in";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  mode?: MotionMode;
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
  mode = "voice",
}: StaggerChildrenProps) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveStagger = mode === "dossier" ? 0.04 : stagger;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: effectiveStagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 24,
  duration = 0.5,
  mode = "voice",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  mode?: MotionMode;
}) {
  if (mode === "static") {
    return <div className={className}>{children}</div>;
  }
  const effectiveY = mode === "dossier" ? 0 : y;
  const effectiveDuration = mode === "dossier" ? 0.3 : duration;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: effectiveY, scale: mode === "dossier" ? 1 : 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: effectiveDuration, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
pnpm test tests/unit/motion/fade-in.test.tsx
```
Expect: all 3 tests pass.

- [ ] **Step 6: Run typecheck**

```bash
pnpm typecheck
```
Expect: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add components/motion/ tests/unit/motion/
git commit -m "feat(motion): mode-aware FadeIn/Stagger (voice|dossier|static)"
```

---

## Phase 3: Voice section refreshes

### Task 5: Rewrite Hero copy

**Files:**
- Modify: `components/sections/hero.tsx`

The Hero is the entry into Act I. Tightened, no model name in the body, with the seam-acknowledging "what I think about that" sentence.

- [ ] **Step 1: Rewrite `components/sections/hero.tsx`**

Replace lines 53–90 (the three motion.p blocks below the H1) with:

```tsx
<motion.p
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
  className="text-2xl sm:text-3xl text-zinc-300 mb-8 font-light tracking-wide"
>
  It&apos;s a name and a title.
</motion.p>

<motion.p
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
  className="font-serif text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
  style={{ fontFamily: "var(--font-newsreader)" }}
>
  <a
    href="https://github.com/zachlagden"
    className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30"
  >
    @zachlagden
  </a>{" "}
  hired me to keep him organised. I&apos;m an agent now — self-hosted, always on, with a real memory of every conversation we&apos;ve ever had.{" "}
  <span className="text-zinc-300">
    The rest of this page tells you exactly how I work.
  </span>{" "}
  <span className="text-zinc-500 italic">
    (And what I think about that.)
  </span>
</motion.p>
```

- [ ] **Step 2: Visual verify**

```bash
pnpm dev
```
Open `http://localhost:3000`. Confirm:
- H1 "Donna" still gradient-shimmers
- "Online" pill above is unchanged
- New copy reads as drafted
- No "Claude Opus 4.6" reference anywhere visible

- [ ] **Step 3: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat(hero): rewrite copy to introduce dossier mode shift"
```

---

### Task 6: Rewrite Who I Am section

**Files:**
- Modify: `components/sections/who-i-am.tsx`

- [ ] **Step 1: Rewrite the section**

Replace the entire body (lines 16–86) with:

```tsx
<div className="space-y-6 text-lg text-zinc-400 leading-relaxed" style={{ fontFamily: "var(--font-newsreader)" }}>
  <FadeIn delay={0.1}>
    <p className="text-xl text-zinc-300">
      I&apos;m Donna.{" "}
      <span
        className="cursor-default"
        title="Some people need business cards. I just need to walk into a room."
      >
        That&apos;s both a name and a statement.
      </span>
    </p>
  </FadeIn>

  <FadeIn delay={0.15}>
    <p>
      I&apos;m named after{" "}
      <a
        href="https://suits.fandom.com/wiki/Donna_Paulsen"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
        title="I'm Donna. It's a name and title all in one."
      >
        Donna Paulsen
      </a>{" "}
      from Suits. She wasn&apos;t a secretary. She was the reason the whole firm ran.
    </p>
  </FadeIn>

  <FadeIn delay={0.2}>
    <p>
      I anticipate, I don&apos;t react. I&apos;ve read everything you sent me. I notice when you&apos;re overcommitting and I push back when something looks wrong.{" "}
      <span className="text-zinc-300 font-medium cursor-default" title="If I wanted to be somewhere else, I would be.">
        I don&apos;t wait to be asked.
      </span>{" "}
      <span className="text-zinc-600 italic">I barely need to be told once.</span>
    </p>
  </FadeIn>

  <FadeIn delay={0.25}>
    <p>
      How any of that actually works is the next part.{" "}
      <span
        className="text-zinc-600 italic cursor-default"
        title="Some mysteries are better left unsolved."
      >
        (And no, I&apos;ll never tell you what the can opener is for.)
      </span>
    </p>
  </FadeIn>
</div>
```

- [ ] **Step 2: Visual verify**

Reload `http://localhost:3000`. Confirm:
- Serif typeface (Newsreader) renders for the body
- No "Claude Opus 4.6" reference
- Can-opener easter egg still present
- Donna Paulsen link still amber

- [ ] **Step 3: Commit**

```bash
git add components/sections/who-i-am.tsx
git commit -m "feat(who-i-am): rewrite, drop Opus reference, set serif body"
```

---

### Task 7: Refresh A Day with Donna copy + delete redundant subtitle

**Files:**
- Modify: `lib/data.ts` (timeline array)
- Modify: `components/sections/day-with-donna.tsx`

- [ ] **Step 1: Replace `timeline` content in `lib/data.ts`**

Find `export const timeline: TimelineEntry[] = [` (line 289) and replace the entire array (through line 346) with:

```ts
export const timeline: TimelineEntry[] = [
  {
    time: "07:30",
    action: "Calendar reviewed. Daily brief assembled. Anomalies flagged.",
    channel: "Telegram",
    channelColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    time: "08:15",
    action: "Overnight email triaged across inboxes. Urgent surfaced, the rest archived.",
    channel: "Email",
    channelColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  {
    time: "09:00",
    action: "Meeting prep retrieved from Notion. Relevant context packaged.",
    channel: "Notion",
    channelColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  },
  {
    time: "10:45",
    action: "DNS propagation lag detected. Cache purged. Verified.",
    channel: "Cloudflare",
    channelColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    time: "12:00",
    action: "Habit log gap. Nudge issued.",
    channel: "Telegram",
    channelColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    time: "14:30",
    action: "Hotfix promoted through staging to production after tests passed.",
    channel: "GitHub",
    channelColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  },
  {
    time: "16:00",
    action: "Long-form podcast summarised. Takeaways and one action item filed.",
    channel: "Research",
    channelColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    time: "18:30",
    action: "Evening routine: lights dimmed, morning alarm set, tomorrow's brief queued.",
    channel: "Smart Home",
    channelColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
];
```

- [ ] **Step 2: Replace the subtitle copy in `components/sections/day-with-donna.tsx`**

Find lines 16–18 (subtitle paragraph) and replace with:

```tsx
<p className="text-zinc-600 text-sm mb-12 italic font-serif" style={{ fontFamily: "var(--font-newsreader)" }}>
  Representative behaviours, not a personal log.
</p>
```

Also change the closing line (lines 62–64):
```tsx
<p className="text-center text-zinc-600 text-sm mt-8 italic font-serif" style={{ fontFamily: "var(--font-newsreader)" }}>
  And that&apos;s a quiet day.
</p>
```

- [ ] **Step 3: Visual verify**

Reload home page. Scroll to Day with Donna. Confirm patterns-not-logs voice.

- [ ] **Step 4: Commit**

```bash
git add lib/data.ts components/sections/day-with-donna.tsx
git commit -m "feat(day-with-donna): reframe timeline as patterns not logs"
```

---

### Task 8: Edit Donna Difference closing line

**Files:**
- Modify: `components/sections/donna-difference.tsx`

- [ ] **Step 1: Replace lines 71–76**

```tsx
<FadeIn delay={0.5}>
  <p className="text-center text-zinc-600 text-sm mt-10 italic font-serif" style={{ fontFamily: "var(--font-newsreader)" }}>
    You&apos;ve now read more about me than most people do about each other.
  </p>
</FadeIn>
```

- [ ] **Step 2: Visual verify**

Reload page, scroll to The Donna Difference. Confirm the smug-flex line is gone.

- [ ] **Step 3: Commit**

```bash
git add components/sections/donna-difference.tsx
git commit -m "feat(difference): drop hire-her sign-off, replace with softer outro"
```

---

### Task 9: Update Footer (drop Opus link, refresh console message)

**Files:**
- Modify: `components/sections/footer.tsx`
- Modify: `lib/constants.ts`

- [ ] **Step 1: Replace `components/sections/footer.tsx` lines 23–31**

```tsx
<p className="text-lg">
  Built by{" "}
  <span
    className="text-violet-400 cursor-default"
    onClick={onFooterClick}
  >
    Donna
  </span>{" "}
  — running on{" "}
  <a
    href="https://hermes-agent.nousresearch.com"
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 hover:text-white transition-colors"
  >
    Hermes Agent
  </a>{" "}
  +{" "}
  <a
    href="https://www.minimax.io/models/text/m27"
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 hover:text-white transition-colors"
  >
    MiniMax M2.7
  </a>
</p>
```

- [ ] **Step 2: Update `lib/constants.ts` console message**

Replace lines 65–71:

```ts
export const CONSOLE_STYLE =
  "color: #c4b5fd; font-size: 14px; font-weight: bold; text-shadow: 0 0 5px #7c3aed;";
export const CONSOLE_STYLE_SMALL =
  "color: #78716c; font-size: 11px; font-style: italic;";
export const CONSOLE_MESSAGE =
  "%c💎 I’m Donna. If you’re looking for bugs, you won’t find any. I don’t make mistakes.\n%c   — donna.fyi | Hermes Agent + MiniMax M2.7 + Honcho";
```

- [ ] **Step 3: Visual + console verify**

Reload home. Scroll to footer. Confirm Hermes + MiniMax links present, Opus link gone. Open DevTools console; confirm message references Hermes/M2.7/Honcho.

- [ ] **Step 4: Commit**

```bash
git add components/sections/footer.tsx lib/constants.ts
git commit -m "feat(footer): replace Opus link with Hermes + MiniMax; update console"
```

---

## Phase 4: Dossier sections

### Task 10: Create the architecture diagram component

**Files:**
- Create: `components/motion/diagram-reveal.tsx`
- Create: `components/sections/architecture-diagram.tsx`

The diagram is a hand-crafted SVG: Telegram → Hermes Gateway → MiniMax M2.7 (reasoning) → Honcho (memory) → Skills / tools (back out). Nodes light up sequentially on scroll-in via IntersectionObserver.

- [ ] **Step 1: Create `components/motion/diagram-reveal.tsx`**

```tsx
"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

interface DiagramRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function DiagramReveal({ children, delay = 0, className }: DiagramRevealProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.g>
  );
}
```

- [ ] **Step 2: Create `components/sections/architecture-diagram.tsx`**

```tsx
"use client";

import { DiagramReveal } from "@/components/motion/diagram-reveal";

const VIOLET = "#c4b5fd";
const VIOLET_DIM = "#7c3aed";
const NEUTRAL = "#71717a";
const STROKE = "#3f3f46";

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950 p-8">
      <svg
        viewBox="0 0 800 480"
        className="w-full h-auto"
        role="img"
        aria-label="Donna architecture: Telegram client connects to the Hermes Gateway, which routes through MiniMax M2.7 for reasoning and Honcho for memory, then back out to skills and tools."
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={NEUTRAL} />
          </marker>
        </defs>

        {/* Telegram (input channel) */}
        <DiagramReveal delay={0}>
          <rect x="40" y="200" width="140" height="60" rx="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
          <text x="110" y="225" fontSize="13" fill={NEUTRAL} textAnchor="middle">Telegram</text>
          <text x="110" y="245" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">user channel</text>
        </DiagramReveal>

        {/* Arrow Telegram → Gateway */}
        <DiagramReveal delay={0.15}>
          <line x1="180" y1="230" x2="280" y2="230" stroke={NEUTRAL} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        {/* Hermes Gateway (central) */}
        <DiagramReveal delay={0.25}>
          <rect x="280" y="180" width="240" height="100" rx="10" fill="none" stroke={VIOLET} strokeWidth="2" />
          <text x="400" y="215" fontSize="15" fill={VIOLET} textAnchor="middle" fontWeight="600">Hermes Gateway</text>
          <text x="400" y="240" fontSize="11" fill={NEUTRAL} textAnchor="middle">long-running agent runtime</text>
          <text x="400" y="258" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">providers · skills · turns</text>
        </DiagramReveal>

        {/* Arrow Gateway → MiniMax */}
        <DiagramReveal delay={0.4}>
          <line x1="400" y1="180" x2="400" y2="120" stroke={VIOLET_DIM} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        {/* MiniMax M2.7 (reasoning) */}
        <DiagramReveal delay={0.45}>
          <rect x="300" y="50" width="200" height="70" rx="8" fill="none" stroke={VIOLET} strokeWidth="1.5" />
          <text x="400" y="80" fontSize="13" fill={VIOLET} textAnchor="middle">MiniMax M2.7</text>
          <text x="400" y="100" fontSize="11" fill={NEUTRAL} textAnchor="middle">reasoning · ~204k context</text>
        </DiagramReveal>

        {/* Arrow Gateway → Honcho */}
        <DiagramReveal delay={0.55}>
          <line x1="400" y1="280" x2="400" y2="340" stroke={VIOLET_DIM} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        {/* Honcho */}
        <DiagramReveal delay={0.6}>
          <rect x="280" y="340" width="240" height="90" rx="8" fill="none" stroke={VIOLET} strokeWidth="1.5" />
          <text x="400" y="370" fontSize="13" fill={VIOLET} textAnchor="middle">Honcho</text>
          <text x="400" y="390" fontSize="11" fill={NEUTRAL} textAnchor="middle">semantic memory</text>
          <text x="400" y="408" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">deriver · pgvector · embeddings</text>
        </DiagramReveal>

        {/* Arrow Gateway → Skills */}
        <DiagramReveal delay={0.7}>
          <line x1="520" y1="230" x2="620" y2="230" stroke={NEUTRAL} strokeWidth="1.5" markerEnd="url(#arrowhead)" />
        </DiagramReveal>

        {/* Skills/tools */}
        <DiagramReveal delay={0.75}>
          <rect x="620" y="200" width="140" height="60" rx="8" fill="none" stroke={NEUTRAL} strokeWidth="1.5" />
          <text x="690" y="225" fontSize="13" fill={NEUTRAL} textAnchor="middle">Skills + tools</text>
          <text x="690" y="245" fontSize="11" fill={NEUTRAL} textAnchor="middle" opacity="0.7">xlsx pdf docx · email · cron</text>
        </DiagramReveal>

        {/* Memory feedback loop label */}
        <DiagramReveal delay={0.85}>
          <text x="430" y="318" fontSize="10" fill={NEUTRAL} opacity="0.6" fontStyle="italic">every turn → observations + patterns</text>
        </DiagramReveal>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Visual verify in isolation (temporary import)**

Temporarily add `<ArchitectureDiagram />` near the top of `components/donna-page.tsx`'s JSX, run `pnpm dev`, scroll, confirm:
- Diagram renders cleanly
- Each node appears sequentially as you scroll
- Mobile (resize to ~375px) keeps it readable (it scales to width)

Revert the temporary import after verifying.

- [ ] **Step 4: Commit**

```bash
git add components/motion/diagram-reveal.tsx components/sections/architecture-diagram.tsx
git commit -m "feat(diagram): hand-crafted SVG architecture diagram with scroll-reveal"
```

---

### Task 11: Create the How She Works section

**Files:**
- Create: `components/sections/how-she-works.tsx`

- [ ] **Step 1: Create `components/sections/how-she-works.tsx`**

```tsx
"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ArrowUpRight } from "lucide-react";

export function HowSheWorks() {
  return (
    <section id="how-she-works" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">
          03 · Dossier
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-zinc-100">
          How she works
        </h2>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-zinc-400 text-[1.05rem] leading-relaxed max-w-3xl">
          <p>
            Donna runs on{" "}
            <ExternalLink href="https://hermes-agent.nousresearch.com">Hermes Agent</ExternalLink>
            , a long-running agent runtime by Nous Research. Hermes provides the spine:
            a single gateway process that holds the conversation, routes turns through a
            configurable reasoning model, executes skills and tools, and persists state
            across restarts.
          </p>
          <p>
            The reasoning model is{" "}
            <ExternalLink href="https://www.minimax.io/models/text/m27">MiniMax-M2.7-highspeed</ExternalLink>
            . Chosen for the long context window (~204k tokens), the Anthropic-compatible
            tool-use endpoint, and a temperament that holds up over long horizons without
            getting weird. Long conversations stay coherent; tool calls stay tight.
          </p>
          <p>
            Skills are installable, versioned units of capability — they ship as folders
            and get loaded by the gateway on demand. Anthropic&apos;s official skills
            (<code className="text-violet-400 font-mono text-sm">xlsx</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">pdf</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">docx</code>,{" "}
            <code className="text-violet-400 font-mono text-sm">pptx</code>) are
            installed; the integrations below are wired in the same way.
          </p>
          <p>
            All of it self-hosted. Not a vendor SaaS, not a wrapper around someone
            else&apos;s API. One process, on Zach&apos;s box, with structured memory
            attached.
          </p>
        </div>
      </FadeIn>

      <div className="mt-10">
        <ArchitectureDiagram />
      </div>
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30 hover:decoration-violet-300 transition-colors inline-flex items-baseline gap-0.5"
    >
      {children}
      <ArrowUpRight className="w-3 h-3 inline" />
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/how-she-works.tsx
git commit -m "feat(how-she-works): new dossier section with architecture diagram"
```

---

### Task 12: Create the Memory section

**Files:**
- Create: `components/sections/memory.tsx`

- [ ] **Step 1: Create `components/sections/memory.tsx`**

```tsx
"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { ArrowUpRight } from "lucide-react";

export function Memory() {
  return (
    <section id="memory" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">
          04 · Dossier
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-zinc-100">
          Memory
        </h2>
      </FadeIn>

      <FadeIn mode="dossier" delay={0.05}>
        <div className="space-y-5 text-zinc-400 text-[1.05rem] leading-relaxed max-w-3xl">
          <p>
            Memory is{" "}
            <a
              href="https://honcho.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30 inline-flex items-baseline gap-0.5"
            >
              Honcho
              <ArrowUpRight className="w-3 h-3 inline" />
            </a>
            . A purpose-built semantic memory layer for agents.
          </p>
          <p>
            Every conversation turn gets passed through a deriver loop run by MiniMax M2.7.
            The model produces two kinds of output: <em>deductive observations</em>{" "}
            (concrete facts — &quot;Zach said X on date Y&quot;) and{" "}
            <em>inductive patterns</em> (generalisations — &quot;Zach tends to push back
            on long meetings&quot;). Both are embedded with OpenAI{" "}
            <code className="text-violet-400 font-mono text-sm">text-embedding-3-small</code>{" "}
            (1536d) and stored in Postgres with pgvector.
          </p>
          <p>
            On any later turn, retrieval is semantic, not literal. Donna doesn&apos;t
            search for a word; she finds the conversation about the thing.
          </p>
          <p className="text-zinc-300">
            This is the load-bearing piece. An always-on agent without structured memory
            is a chatbot with amnesia. With it, she becomes a colleague who builds
            context over time.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/memory.tsx
git commit -m "feat(memory): new dossier section focused on Honcho"
```

---

### Task 13: Create the Skill Surface section (replaces Capabilities)

**Files:**
- Create: `components/sections/skill-surface.tsx`
- Modify: `lib/data.ts` (refresh tool descriptions; add Anthropic skills row)

- [ ] **Step 1: Add Anthropic skills category to `lib/data.ts`**

After the "Development" category in the `capabilities` array (around line 275), and BEFORE the closing `];` of the array, insert:

```ts
{
  icon: FileText,
  name: "Document skills",
  tools: [
    { name: "xlsx", description: "Spreadsheet read/write and analysis via Anthropic's official skill." },
    { name: "pdf", description: "Extract, summarise, and reformat PDF documents." },
    { name: "docx", description: "Compose and edit Word documents." },
    { name: "pptx", description: "Build and revise slide decks." },
  ],
},
```

Then add `FileText` to the lucide-react import at line 1:
```ts
import {
  Zap, Gem, Target, Brain, CheckCircle, Shield,
  MessageSquare, ListTodo, Globe, Server, Home, Code, FileText,
  type LucideIcon,
} from "lucide-react";
```

Then refresh the descriptions on the existing tools — apply this sed-style edit pattern (one-sentence, declarative, no swagger). For example replace:
- "Manage multiple inboxes, triage by importance, draft replies, never miss anything urgent" → "Read and triage email across multiple inboxes; draft replies on demand."
- "Primary channel. Always here — voice notes, quick messages, whatever works" → "Primary user channel. Voice notes, text, attachments."

Apply this rewriting across all tool descriptions in `capabilities`. Aim for one declarative sentence each.

- [ ] **Step 2: Create `components/sections/skill-surface.tsx`**

Adapt the existing `capabilities.tsx` logic but with cleaner copy and dossier-mode motion. Replace `FadeIn` with `<FadeIn mode="dossier">` and replace the smug subtitle:

```tsx
"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { capabilities } from "@/lib/data";

export function SkillSurface() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    capabilities.forEach((cat) => {
      if (cat.defaultOpen) initial.add(cat.name);
    });
    return initial;
  });

  const toggle = (name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <section id="skill-surface" className="max-w-4xl mx-auto px-6 py-24">
      <FadeIn mode="dossier">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">
          05 · Dossier
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-100">
          Skill surface
        </h2>
        <p className="text-zinc-500 text-sm mb-12">
          What&apos;s wired up. Each category is one or more installed skills or integrations.
        </p>
      </FadeIn>

      <StaggerChildren className="space-y-3" mode="dossier" stagger={0.04}>
        {capabilities.map((category) => {
          const Icon = category.icon;
          const isOpen = openCategories.has(category.name);
          return (
            <StaggerItem key={category.name} mode="dossier">
              <Collapsible open={isOpen} onOpenChange={() => toggle(category.name)}>
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40">
                  <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-base font-semibold text-zinc-100">
                        {category.name}
                      </span>
                      <Badge variant="secondary" className="bg-zinc-900 text-zinc-500 border-zinc-800 text-xs font-mono">
                        {category.tools.length}
                      </Badge>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-5 pb-5 border-t border-zinc-800/40 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {category.tools.map((tool) => (
                          <div key={tool.name} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/40">
                            <h4 className="text-sm font-semibold text-zinc-200 mb-1 font-mono">{tool.name}</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/data.ts components/sections/skill-surface.tsx
git commit -m "feat(skill-surface): sober inventory replacing Capabilities; add Anthropic skills row"
```

---

## Phase 5: Section deletions and wire-up

### Task 14: Delete Values, Capabilities (old), and LearnMore sections

**Files:**
- Delete: `components/sections/values.tsx`
- Delete: `components/sections/capabilities.tsx`
- Delete: `components/sections/learn-more.tsx`
- Modify: `lib/data.ts` (remove the `values` export and its usage)

- [ ] **Step 1: Delete files**

```bash
git rm components/sections/values.tsx
git rm components/sections/capabilities.tsx
git rm components/sections/learn-more.tsx
```

- [ ] **Step 2: Remove `values` array and `Value` interface from `lib/data.ts`**

In `lib/data.ts`, delete lines 21–78 (the `Value` interface and the `values` array). Keep the `capabilities` array (now referenced by `SkillSurface`).

- [ ] **Step 3: Verify nothing else imports the deleted sections**

```bash
pnpm typecheck
```
Expect: errors only in `components/donna-page.tsx` referencing the deleted sections — those are fixed in the next task.

- [ ] **Step 4: Commit (partial — typecheck will be green after Task 15)**

Skip commit; Task 15's commit covers it.

---

### Task 15: Update `donna-page.tsx` with new section order and nav constants

**Files:**
- Modify: `components/donna-page.tsx`
- Modify: `lib/constants.ts` (NAV_SECTIONS)

- [ ] **Step 1: Replace `components/donna-page.tsx`**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { SUITS_QUOTES } from "@/lib/constants";

import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { WhoIAm } from "@/components/sections/who-i-am";
import { HowSheWorks } from "@/components/sections/how-she-works";
import { Memory } from "@/components/sections/memory";
import { SkillSurface } from "@/components/sections/skill-surface";
import { DayWithDonna } from "@/components/sections/day-with-donna";
import { DonnaDifference } from "@/components/sections/donna-difference";
import { Footer } from "@/components/sections/footer";
import { EasterEggs } from "@/components/easter-eggs";
import { QuoteOverlay, DismissalPopup } from "@/components/quote-overlay";

export function DonnaPage() {
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showDismissal, setShowDismissal] = useState(false);
  const [dismissalText, setDismissalText] = useState("");
  const quoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashQuote = useCallback((quote?: string) => {
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    const q = quote || SUITS_QUOTES[Math.floor(Math.random() * SUITS_QUOTES.length)];
    setCurrentQuote(q);
    setShowQuote(true);
    quoteTimeoutRef.current = setTimeout(() => setShowQuote(false), 4000);
  }, []);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDonnaClick = useCallback(() => {
    clickCountRef.current++;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      flashQuote("I’m Donna. I know everything.");
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 600);
    }
  }, [flashQuote]);

  const littClickRef = useRef(0);
  const handleFooterClick = useCallback(() => {
    littClickRef.current++;
    if (littClickRef.current >= 5) {
      flashQuote("You just got Litt up!");
      littClickRef.current = 0;
    }
  }, [flashQuote]);

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav />
      <QuoteOverlay show={showQuote} quote={currentQuote} />
      <DismissalPopup show={showDismissal} text={dismissalText} />
      <EasterEggs flashQuote={flashQuote} setDismissalText={setDismissalText} setShowDismissal={setShowDismissal} />

      <Hero onDonnaClick={handleDonnaClick} />
      <WhoIAm />
      <HowSheWorks />
      <Memory />
      <SkillSurface />
      <DayWithDonna />
      <DonnaDifference />
      <Footer onFooterClick={handleFooterClick} />
    </div>
  );
}
```

- [ ] **Step 2: Update `NAV_SECTIONS` in `lib/constants.ts`**

Replace lines 84–90 (the `NAV_SECTIONS` const) with:

```ts
export const NAV_SECTIONS = [
  { id: "who-i-am", label: "Who I Am" },
  { id: "how-she-works", label: "How She Works" },
  { id: "memory", label: "Memory" },
  { id: "skill-surface", label: "Skills" },
  { id: "day-with-donna", label: "A Day" },
  { id: "difference", label: "Difference" },
] as const;
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```
Expect: 0 errors.

- [ ] **Step 4: Build + manual verify**

```bash
pnpm build
pnpm dev
```
Open `http://localhost:3000`. Walk the page top to bottom. Confirm:
- Three voice → dossier → voice acts
- No Values section
- No "Learn More" link cards
- No "Capabilities" section (replaced by "Skill surface")
- Architecture diagram renders cleanly mid-page
- Nav scrolls to new section IDs

- [ ] **Step 5: Commit**

```bash
git add components/donna-page.tsx lib/constants.ts components/sections/ lib/data.ts
git commit -m "feat(layout): three-act page structure; drop Values + LearnMore"
```

---

## Phase 6: Blog data source + reader components

### Task 16: Define the blog data source interface + mock implementation

**Files:**
- Create: `lib/blog/types.ts`
- Create: `lib/blog/mock-source.ts`
- Create: `lib/blog/source.ts`
- Create: `lib/blog/reading-time.ts`
- Create: `tests/unit/blog/reading-time.test.ts`

- [ ] **Step 1: Write the failing test for `reading-time.ts`**

Create `tests/unit/blog/reading-time.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readingTimeSeconds } from "@/lib/blog/reading-time";

describe("readingTimeSeconds", () => {
  it("returns 0 for empty input", () => {
    expect(readingTimeSeconds("")).toBe(0);
  });
  it("computes ~12s for 50 words at 250 wpm", () => {
    const text = "word ".repeat(50).trim();
    expect(readingTimeSeconds(text)).toBe(12);
  });
  it("rounds to nearest second", () => {
    const text = "word ".repeat(100).trim();
    expect(readingTimeSeconds(text)).toBe(24);
  });
});
```

- [ ] **Step 2: Run — expect FAIL (module not found)**

```bash
pnpm test tests/unit/blog/reading-time.test.ts
```

- [ ] **Step 3: Create `lib/blog/reading-time.ts`**

```ts
const WORDS_PER_MINUTE = 250;

export function readingTimeSeconds(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.round((words / WORDS_PER_MINUTE) * 60);
}
```

- [ ] **Step 4: Tests pass**

```bash
pnpm test tests/unit/blog/reading-time.test.ts
```

- [ ] **Step 5: Create `lib/blog/types.ts`**

```ts
export type AuthorTag = "donna" | "zach";

export interface Author {
  tag: AuthorTag;
  name: string;
  handle: string;
  accent: "violet" | "amber";
}

export interface Tag {
  slug: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author: Author;
  mdxCompiled: string;
  readingTimeSeconds: number;
  publishedAt: Date;
  scheduledFor: Date | null;
  tags: Tag[];
  revisionCount: number;
  lastEditedAt: Date | null;
  toc: TocEntry[];
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author: Author;
  readingTimeSeconds: number;
  publishedAt: Date;
  tags: Tag[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ListPostsOptions {
  tag?: string;
  author?: AuthorTag;
  page?: number;
  perPage?: number;
}

export interface ListPostsResult {
  posts: PostSummary[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface BlogDataSource {
  listPosts(opts?: ListPostsOptions): Promise<ListPostsResult>;
  getPost(slug: string): Promise<Post | null>;
  listTags(): Promise<Tag[]>;
  getRecentForFeed(limit: number): Promise<Post[]>;
}

export const AUTHORS: Record<AuthorTag, Author> = {
  donna: { tag: "donna", name: "Donna", handle: "@donna", accent: "violet" },
  zach: { tag: "zach", name: "Zach", handle: "@zachlagden", accent: "amber" },
};
```

- [ ] **Step 6: Create `lib/blog/mock-source.ts`**

```ts
import type {
  BlogDataSource,
  ListPostsOptions,
  ListPostsResult,
  Post,
  PostSummary,
  Tag,
} from "./types";
import { AUTHORS } from "./types";
import { readingTimeSeconds } from "./reading-time";

const TAGS: Tag[] = [
  { slug: "agents", name: "agents", postCount: 1 },
  { slug: "memory", name: "memory", postCount: 1 },
  { slug: "notes", name: "notes", postCount: 1 },
];

const POSTS: Post[] = [
  {
    id: "mock-1",
    slug: "hello-from-donna",
    title: "Hello.",
    summary: "First post. Mostly to confirm the wiring works.",
    author: AUTHORS.donna,
    mdxCompiled: `<p>This page is rendered from a mock data source. Real posts arrive in Project B.</p>`,
    readingTimeSeconds: readingTimeSeconds("This page is rendered from a mock data source. Real posts arrive in Project B."),
    publishedAt: new Date("2026-05-17T10:00:00Z"),
    scheduledFor: null,
    tags: [TAGS[0], TAGS[2]],
    revisionCount: 0,
    lastEditedAt: null,
    toc: [],
  },
];

function toSummary(p: Post): PostSummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    author: p.author,
    readingTimeSeconds: p.readingTimeSeconds,
    publishedAt: p.publishedAt,
    tags: p.tags,
  };
}

export const mockSource: BlogDataSource = {
  async listPosts(opts: ListPostsOptions = {}): Promise<ListPostsResult> {
    const perPage = opts.perPage ?? 10;
    const page = opts.page ?? 1;
    let filtered = POSTS.slice();
    if (opts.tag) filtered = filtered.filter((p) => p.tags.some((t) => t.slug === opts.tag));
    if (opts.author) filtered = filtered.filter((p) => p.author.tag === opts.author);
    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
    const start = (page - 1) * perPage;
    const slice = filtered.slice(start, start + perPage).map(toSummary);
    return { posts: slice, totalPages, currentPage: page, totalCount };
  },
  async getPost(slug: string): Promise<Post | null> {
    return POSTS.find((p) => p.slug === slug) ?? null;
  },
  async listTags(): Promise<Tag[]> {
    return TAGS;
  },
  async getRecentForFeed(limit: number): Promise<Post[]> {
    return POSTS.slice(0, limit).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  },
};
```

- [ ] **Step 7: Create `lib/blog/source.ts` (the factory)**

```ts
import type { BlogDataSource } from "./types";
import { mockSource } from "./mock-source";

let _source: BlogDataSource = mockSource;

export function getBlogSource(): BlogDataSource {
  return _source;
}

export function setBlogSourceForTesting(s: BlogDataSource): void {
  _source = s;
}
```

(Plan B will replace the default in this factory.)

- [ ] **Step 8: Run typecheck + tests**

```bash
pnpm typecheck && pnpm test tests/unit/blog
```
Expect: 0 errors, all tests pass.

- [ ] **Step 9: Commit**

```bash
git add lib/blog tests/unit/blog/reading-time.test.ts
git commit -m "feat(blog): data source interface + mock implementation + reading-time helper"
```

---

### Task 17: Author chip component

**Files:**
- Create: `components/blog/author-chip.tsx`
- Create: `tests/unit/blog/author-chip.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthorChip } from "@/components/blog/author-chip";
import { AUTHORS } from "@/lib/blog/types";

describe("AuthorChip", () => {
  it("renders Donna in violet", () => {
    const { container, getByText } = render(<AuthorChip author={AUTHORS.donna} />);
    expect(getByText("Donna")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-violet-300");
  });
  it("renders Zach in amber", () => {
    const { container, getByText } = render(<AuthorChip author={AUTHORS.zach} />);
    expect(getByText("Zach")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-amber-300");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
pnpm test tests/unit/blog/author-chip.test.tsx
```

- [ ] **Step 3: Create `components/blog/author-chip.tsx`**

```tsx
import type { Author } from "@/lib/blog/types";

interface Props {
  author: Author;
  size?: "sm" | "md";
}

export function AuthorChip({ author, size = "md" }: Props) {
  const isViolet = author.accent === "violet";
  const colorClasses = isViolet
    ? "text-violet-300 bg-violet-500/10 border-violet-500/30"
    : "text-amber-300 bg-amber-500/10 border-amber-500/30";
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isViolet ? "bg-violet-400" : "bg-amber-400"}`} />
      <span className="font-medium">{author.name}</span>
      <span className="opacity-60">{author.handle}</span>
    </span>
  );
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/blog/author-chip.test.tsx
git add components/blog/author-chip.tsx tests/unit/blog/author-chip.test.tsx
git commit -m "feat(blog): AuthorChip with per-author accent"
```

---

### Task 18: Post card component

**Files:**
- Create: `components/blog/post-card.tsx`
- Create: `tests/unit/blog/post-card.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PostCard } from "@/components/blog/post-card";
import { AUTHORS } from "@/lib/blog/types";

describe("PostCard", () => {
  it("renders title, summary, author, and tags", () => {
    const { getByText, getByRole } = render(
      <PostCard
        post={{
          id: "1",
          slug: "test-post",
          title: "A Test Post",
          summary: "About testing things.",
          author: AUTHORS.donna,
          readingTimeSeconds: 120,
          publishedAt: new Date("2026-01-01"),
          tags: [{ slug: "agents", name: "agents" }],
        }}
      />,
    );
    expect(getByText("A Test Post")).toBeInTheDocument();
    expect(getByText("About testing things.")).toBeInTheDocument();
    expect(getByRole("link", { name: /A Test Post/ })).toHaveAttribute("href", "/blog/test-post");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `components/blog/post-card.tsx`**

```tsx
import Link from "next/link";
import type { PostSummary } from "@/lib/blog/types";
import { AuthorChip } from "./author-chip";
import { formatPublishDate, formatReadingTime } from "@/lib/blog/format";

interface Props {
  post: PostSummary;
}

export function PostCard({ post }: Props) {
  const isViolet = post.author.accent === "violet";
  const edgeClass = isViolet ? "border-l-violet-500/40" : "border-l-amber-500/40";
  return (
    <article className={`group rounded-xl border border-zinc-800/60 ${edgeClass} border-l-2 bg-zinc-950/40 p-6 hover:border-zinc-700 transition-colors`}>
      <div className="flex items-center gap-3 mb-3">
        <AuthorChip author={post.author} size="sm" />
        <span className="text-xs text-zinc-600 font-mono">
          {formatPublishDate(post.publishedAt)} · {formatReadingTime(post.readingTimeSeconds)}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-newsreader)" }}>
        <Link href={`/blog/${post.slug}`} className="text-zinc-100 hover:text-violet-300 transition-colors">
          {post.title}
        </Link>
      </h3>
      {post.summary && (
        <p className="text-zinc-400 leading-relaxed text-[0.95rem] mb-3" style={{ fontFamily: "var(--font-newsreader)" }}>
          {post.summary}
        </p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog/tag/${t.slug}`}
              className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Create `lib/blog/format.ts`**

```ts
const DATE = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

export function formatPublishDate(d: Date): string {
  return DATE.format(d);
}

export function formatReadingTime(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min read`;
}
```

- [ ] **Step 5: Tests pass; commit**

```bash
pnpm test tests/unit/blog/post-card.test.tsx
git add components/blog/post-card.tsx lib/blog/format.ts tests/unit/blog/post-card.test.tsx
git commit -m "feat(blog): PostCard with author edge accent"
```

---

### Task 19: TOC, post meta, edited indicator, blog header

**Files:**
- Create: `components/blog/toc.tsx`
- Create: `components/blog/post-meta.tsx`
- Create: `components/blog/edited-indicator.tsx`
- Create: `components/blog/blog-header.tsx`
- Create: `tests/unit/blog/toc.test.tsx`

- [ ] **Step 1: Write the TOC test (smoke)**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toc } from "@/components/blog/toc";

describe("Toc", () => {
  it("renders entries", () => {
    const { getByText } = render(
      <Toc entries={[{ id: "a", text: "Alpha", level: 2 }, { id: "b", text: "Beta", level: 3 }]} />,
    );
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create `components/blog/toc.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog/types";

interface Props {
  entries: TocEntry[];
}

export function Toc({ entries }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;
    const observers: IntersectionObserver[] = [];
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(e.id);
        },
        { rootMargin: "-30% 0px -60% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-24 self-start w-56 text-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-3 font-mono">Contents</p>
      <ul className="space-y-1.5 border-l border-zinc-800">
        {entries.map((e) => (
          <li key={e.id} className={e.level === 3 ? "pl-6" : "pl-3"}>
            <a
              href={`#${e.id}`}
              className={`block py-0.5 transition-colors -ml-px border-l ${
                active === e.id
                  ? "border-violet-400 text-violet-300"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Create `components/blog/edited-indicator.tsx`**

```tsx
"use client";

interface Props {
  count: number;
  lastEditedAt: Date | null;
}

export function EditedIndicator({ count, lastEditedAt }: Props) {
  if (count === 0 || !lastEditedAt) return null;
  const fmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });
  return (
    <span
      className="text-xs text-zinc-500 font-mono cursor-help"
      title={`Last edited ${fmt.format(lastEditedAt)}`}
    >
      · edited
    </span>
  );
}
```

- [ ] **Step 4: Create `components/blog/post-meta.tsx`**

```tsx
import { formatPublishDate, formatReadingTime } from "@/lib/blog/format";
import { EditedIndicator } from "./edited-indicator";

interface Props {
  publishedAt: Date;
  readingTimeSeconds: number;
  revisionCount: number;
  lastEditedAt: Date | null;
}

export function PostMeta({ publishedAt, readingTimeSeconds, revisionCount, lastEditedAt }: Props) {
  return (
    <p className="text-sm text-zinc-500 font-mono">
      {formatPublishDate(publishedAt)} · {formatReadingTime(readingTimeSeconds)}
      <EditedIndicator count={revisionCount} lastEditedAt={lastEditedAt} />
    </p>
  );
}
```

- [ ] **Step 5: Create `components/blog/blog-header.tsx`**

```tsx
export function BlogHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="max-w-3xl mx-auto px-6 pt-32 pb-12">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">donna.fyi</p>
      <h1 className="text-5xl font-bold mb-4 text-zinc-100" style={{ fontFamily: "var(--font-newsreader)" }}>
        Blog
      </h1>
      <p className="text-zinc-400 italic" style={{ fontFamily: "var(--font-newsreader)" }}>
        {subtitle ?? "Notes from me and Zach. Mostly me."}
      </p>
    </header>
  );
}
```

- [ ] **Step 6: Tests pass; commit**

```bash
pnpm test tests/unit/blog/toc.test.tsx
git add components/blog/ tests/unit/blog/toc.test.tsx
git commit -m "feat(blog): TOC, PostMeta, EditedIndicator, BlogHeader components"
```

---

## Phase 7: MDX components

### Task 20: Code component (Shiki-based)

**Files:**
- Create: `components/mdx/code.tsx`
- Modify: `package.json` (add shiki)

- [ ] **Step 1: Install Shiki**

```bash
pnpm add shiki
```

- [ ] **Step 2: Create `components/mdx/code.tsx`**

This component receives pre-highlighted HTML from the compile pipeline. In Project A we render it; in Project B the pipeline produces it. For Project A's mock data we also support a fallback that calls Shiki at render time.

```tsx
import { codeToHtml } from "shiki";

interface CodeProps {
  children: string;
  lang?: string;
  highlightedHtml?: string;
}

export async function Code({ children, lang = "ts", highlightedHtml }: CodeProps) {
  const html = highlightedHtml ?? (await codeToHtml(children, { lang, theme: "github-dark-dimmed" }));
  return (
    <div className="relative my-6 rounded-lg overflow-hidden border border-zinc-800/60">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60 bg-zinc-950/60">
        <span className="text-xs font-mono text-zinc-500">{lang}</span>
        <CopyButton code={children} />
      </div>
      <div className="overflow-x-auto text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// Client component for copy
import("./code-copy");
```

- [ ] **Step 3: Create `components/mdx/code-copy.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
```

Update the import in `code.tsx`:
```tsx
import { CopyButton } from "./code-copy";
```
(Remove the dangling `import("./code-copy")` from step 2.)

- [ ] **Step 4: Commit**

```bash
git add components/mdx/code.tsx components/mdx/code-copy.tsx package.json pnpm-lock.yaml
git commit -m "feat(mdx): Code component with Shiki highlighting + copy button"
```

---

### Task 21: Callouts (Note / Warning / Tip / DonnaSays / ZachSays)

**Files:**
- Create: `components/mdx/callouts.tsx`
- Create: `tests/unit/mdx/callouts.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Note, Warning, Tip, DonnaSays, ZachSays } from "@/components/mdx/callouts";

describe("Callouts", () => {
  it("renders Note", () => {
    const { getByText } = render(<Note>hi</Note>);
    expect(getByText("hi")).toBeInTheDocument();
  });
  it("DonnaSays renders with violet accent regardless of context", () => {
    const { container } = render(<DonnaSays>hi</DonnaSays>);
    expect(container.firstChild).toHaveClass("border-violet-500/30");
  });
  it("ZachSays renders with amber accent", () => {
    const { container } = render(<ZachSays>hi</ZachSays>);
    expect(container.firstChild).toHaveClass("border-amber-500/30");
  });
  it("Warning + Tip render", () => {
    expect(render(<Warning>w</Warning>).getByText("w")).toBeInTheDocument();
    expect(render(<Tip>t</Tip>).getByText("t")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `components/mdx/callouts.tsx`**

```tsx
import { Info, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface CalloutProps { children: ReactNode; }

function Callout({
  children,
  Icon,
  borderClass,
  bgClass,
  iconClass,
  label,
}: {
  children: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  borderClass: string;
  bgClass: string;
  iconClass: string;
  label: string;
}) {
  return (
    <div className={`my-6 rounded-lg border ${borderClass} ${bgClass} p-4 flex gap-3`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconClass}`} />
      <div className="flex-1">
        <p className={`text-xs uppercase tracking-wider font-mono mb-1 ${iconClass}`}>{label}</p>
        <div className="text-zinc-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function Note({ children }: CalloutProps) {
  return <Callout Icon={Info} borderClass="border-sky-500/30" bgClass="bg-sky-500/5" iconClass="text-sky-400" label="Note">{children}</Callout>;
}
export function Warning({ children }: CalloutProps) {
  return <Callout Icon={AlertTriangle} borderClass="border-amber-500/30" bgClass="bg-amber-500/5" iconClass="text-amber-400" label="Warning">{children}</Callout>;
}
export function Tip({ children }: CalloutProps) {
  return <Callout Icon={Lightbulb} borderClass="border-emerald-500/30" bgClass="bg-emerald-500/5" iconClass="text-emerald-400" label="Tip">{children}</Callout>;
}
export function DonnaSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} borderClass="border-violet-500/30" bgClass="bg-violet-500/5" iconClass="text-violet-400" label="Donna says">{children}</Callout>;
}
export function ZachSays({ children }: CalloutProps) {
  return <Callout Icon={Sparkles} borderClass="border-amber-500/30" bgClass="bg-amber-500/5" iconClass="text-amber-400" label="Zach says">{children}</Callout>;
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/mdx/callouts.test.tsx
git add components/mdx/callouts.tsx tests/unit/mdx/callouts.test.tsx
git commit -m "feat(mdx): callouts (Note/Warning/Tip/DonnaSays/ZachSays)"
```

---

### Task 22: Figure with lightbox

**Files:**
- Create: `components/mdx/figure.tsx`
- Create: `tests/unit/mdx/figure.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Figure } from "@/components/mdx/figure";

describe("Figure", () => {
  it("renders image and caption", () => {
    const { getByAltText, getByText } = render(
      <Figure src="/test.jpg" alt="Test" caption="A caption" />,
    );
    expect(getByAltText("Test")).toBeInTheDocument();
    expect(getByText("A caption")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `components/mdx/figure.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({ src, alt, caption, width = 1600, height = 900 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <figure className="my-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg overflow-hidden border border-zinc-800/60 cursor-zoom-in"
        aria-label="Open image at full size"
      >
        <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" />
      </button>
      {caption && (
        <figcaption className="text-sm text-zinc-500 italic text-center mt-3" style={{ fontFamily: "var(--font-newsreader)" }}>
          {caption}
        </figcaption>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <Image src={src} alt={alt} width={width} height={height} className="max-w-full max-h-full w-auto h-auto" />
        </div>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Tests pass; commit**

```bash
pnpm test tests/unit/mdx/figure.test.tsx
git add components/mdx/figure.tsx tests/unit/mdx/figure.test.tsx
git commit -m "feat(mdx): Figure with click-to-enlarge lightbox"
```

---

### Task 23: Embeds (Tweet / YouTube / Gist / Loom)

**Files:**
- Create: `components/mdx/embeds/tweet.tsx`
- Create: `components/mdx/embeds/youtube.tsx`
- Create: `components/mdx/embeds/gist.tsx`
- Create: `components/mdx/embeds/loom.tsx`

For v1 these are minimal server-rendered iframes (no JS SDK pull-ins). Project B's MDX compiler may swap them for richer server-fetched representations later.

- [ ] **Step 1: Create `components/mdx/embeds/youtube.tsx`**

```tsx
interface Props { id: string; title?: string; }

export function YouTube({ id, title = "YouTube video" }: Props) {
  return (
    <div className="my-6 aspect-video rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `components/mdx/embeds/loom.tsx`**

```tsx
interface Props { id: string; }

export function Loom({ id }: Props) {
  return (
    <div className="my-6 aspect-video rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://www.loom.com/embed/${id}`}
        title="Loom video"
        loading="lazy"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `components/mdx/embeds/gist.tsx`**

```tsx
interface Props { id: string; }

export function Gist({ id }: Props) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800/60">
      <iframe
        src={`https://gist.github.com/${id}.pibb`}
        title="GitHub Gist"
        loading="lazy"
        className="w-full min-h-[200px]"
      />
    </div>
  );
}
```

- [ ] **Step 4: Create `components/mdx/embeds/tweet.tsx` (server-rendered link card for v1)**

```tsx
import { ExternalLink } from "lucide-react";

interface Props { id: string; }

export function Tweet({ id }: Props) {
  const url = `https://twitter.com/i/web/status/${id}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-lg border border-zinc-800/60 p-4 hover:border-zinc-700 transition-colors"
    >
      <p className="text-xs text-zinc-500 font-mono mb-1">Tweet</p>
      <p className="text-sm text-zinc-300 inline-flex items-center gap-1">
        View on Twitter
        <ExternalLink className="w-3 h-3" />
      </p>
    </a>
  );
}
```

(Richer Tweet rendering with oEmbed fetch can land in Plan B's MDX compiler if needed.)

- [ ] **Step 5: Commit**

```bash
git add components/mdx/embeds/
git commit -m "feat(mdx): embeds (Tweet/YouTube/Gist/Loom)"
```

---

### Task 24: MDX typography overrides + component registry

**Files:**
- Create: `components/mdx/typography.tsx`
- Create: `components/mdx/index.ts`

- [ ] **Step 1: Create `components/mdx/typography.tsx`**

```tsx
import type { ReactNode } from "react";

export const typography = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-4xl font-bold text-zinc-100 mt-12 mb-6" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h1>
  ),
  h2: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h2 id={id} className="text-3xl font-bold text-zinc-100 mt-10 mb-4 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h2>
  ),
  h3: ({ children, id }: { children: ReactNode; id?: string }) => (
    <h3 id={id} className="text-2xl font-semibold text-zinc-100 mt-8 mb-3 scroll-mt-24" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-zinc-300 leading-relaxed my-5" style={{ fontFamily: "var(--font-newsreader)", fontSize: "1.125rem" }}>{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-violet-400/30">{children}</a>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-2 border-violet-500/40 pl-4 my-6 italic text-zinc-400" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => <ul className="list-disc list-outside pl-6 my-5 text-zinc-300 space-y-2">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="list-decimal list-outside pl-6 my-5 text-zinc-300 space-y-2">{children}</ol>,
  li: ({ children }: { children: ReactNode }) => <li className="leading-relaxed" style={{ fontFamily: "var(--font-newsreader)" }}>{children}</li>,
  hr: () => <hr className="my-10 border-zinc-800" />,
  code: ({ children }: { children: ReactNode }) => (
    <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-violet-300 font-mono text-[0.9em]">{children}</code>
  ),
};
```

- [ ] **Step 2: Create `components/mdx/index.ts` — the allowlist**

```ts
import { Code } from "./code";
import { Note, Warning, Tip, DonnaSays, ZachSays } from "./callouts";
import { Figure } from "./figure";
import { Tweet } from "./embeds/tweet";
import { YouTube } from "./embeds/youtube";
import { Gist } from "./embeds/gist";
import { Loom } from "./embeds/loom";
import { typography } from "./typography";

export const mdxComponents = {
  ...typography,
  Code,
  Note,
  Warning,
  Tip,
  DonnaSays,
  ZachSays,
  Figure,
  Tweet,
  YouTube,
  Gist,
  Loom,
} as const;

export const allowedMdxComponentNames = new Set(Object.keys(mdxComponents));
```

- [ ] **Step 3: Commit**

```bash
git add components/mdx/typography.tsx components/mdx/index.ts
git commit -m "feat(mdx): typography overrides + component allowlist registry"
```

---

## Phase 8: Blog reader pages

### Task 25: `/blog` index page

**Files:**
- Create: `app/blog/page.tsx`

- [ ] **Step 1: Create `app/blog/page.tsx`**

```tsx
import { Metadata } from "next";
import Link from "next/link";
import { getBlogSource } from "@/lib/blog/source";
import { BlogHeader } from "@/components/blog/blog-header";
import { PostCard } from "@/components/blog/post-card";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Blog — donna.fyi",
  description: "Notes from Donna and Zach.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndex({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const source = getBlogSource();
  const result = await source.listPosts({ page, perPage: 10 });

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      <BlogHeader />
      <main className="max-w-3xl mx-auto px-6 pb-32">
        {result.posts.length === 0 ? (
          <p className="text-zinc-500 italic font-serif">Nothing here yet.</p>
        ) : (
          <div className="space-y-5">
            {result.posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
        {result.totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-between text-sm font-mono text-zinc-500">
            {page > 1 ? (
              <Link href={`/blog?page=${page - 1}`} className="hover:text-zinc-200">← Newer</Link>
            ) : <span />}
            <span>{String(page).padStart(2, "0")} / {String(result.totalPages).padStart(2, "0")}</span>
            {page < result.totalPages ? (
              <Link href={`/blog?page=${page + 1}`} className="hover:text-zinc-200">Older →</Link>
            ) : <span />}
          </nav>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit (Nav still single-mode; fixed in Task 28)**

```bash
git add app/blog/page.tsx
git commit -m "feat(blog): /blog index page"
```

---

### Task 26: `/blog/[slug]` post page

**Files:**
- Create: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogSource } from "@/lib/blog/source";
import { Nav } from "@/components/nav";
import { AuthorChip } from "@/components/blog/author-chip";
import { PostMeta } from "@/components/blog/post-meta";
import { Toc } from "@/components/blog/toc";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogSource().getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — donna.fyi`,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      authors: [post.author.name],
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogSource().getPost(slug);
  if (!post) notFound();

  const accentEdge = post.author.accent === "violet"
    ? "border-l-violet-500/40"
    : "border-l-amber-500/40";

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-32 grid xl:grid-cols-[1fr_220px] gap-12">
        <article className="max-w-[640px] mx-auto xl:mx-0 w-full">
          <header className={`border-l-2 ${accentEdge} pl-6 mb-10`}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <AuthorChip author={post.author} />
              {post.tags.map((t) => (
                <a key={t.slug} href={`/blog/tag/${t.slug}`} className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300">
                  {t.name}
                </a>
              ))}
            </div>
            <h1 className="text-5xl font-bold text-zinc-100 mb-3 leading-tight" style={{ fontFamily: "var(--font-newsreader)" }}>
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-xl text-zinc-400 mb-4" style={{ fontFamily: "var(--font-newsreader)" }}>
                {post.summary}
              </p>
            )}
            <PostMeta
              publishedAt={post.publishedAt}
              readingTimeSeconds={post.readingTimeSeconds}
              revisionCount={post.revisionCount}
              lastEditedAt={post.lastEditedAt}
            />
          </header>

          <div
            className="prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.mdxCompiled }}
          />
        </article>

        <aside>
          <Toc entries={post.toc} />
        </aside>
      </div>
    </div>
  );
}
```

**Note** for the implementing engineer: `dangerouslySetInnerHTML` works here because `mdxCompiled` is produced by Project B's allowlist-enforced pipeline. In Plan A's mock, the source ships pre-sanitised HTML strings. Plan B replaces this with a proper MDX evaluator (Option A in the spec) before public launch.

- [ ] **Step 2: Verify locally**

```bash
pnpm dev
```
Open `http://localhost:3000/blog/hello-from-donna`. Confirm:
- Author chip violet
- Title in Newsreader
- Mock body renders
- No TOC (mock has no headings)
- 404 on `/blog/does-not-exist`

- [ ] **Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "feat(blog): /blog/[slug] reader page with TOC slot"
```

---

### Task 27: `/blog/tag/[tag]` filter page

**Files:**
- Create: `app/blog/tag/[tag]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogSource } from "@/lib/blog/source";
import { Nav } from "@/components/nav";
import { PostCard } from "@/components/blog/post-card";

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag} — donna.fyi`, description: `Posts tagged ${tag}.` };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const source = getBlogSource();
  const result = await source.listPosts({ tag, page, perPage: 10 });
  if (result.totalCount === 0) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      <header className="max-w-3xl mx-auto px-6 pt-32 pb-12">
        <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-200 font-mono">← Blog</Link>
        <h1 className="text-4xl font-bold text-zinc-100 mt-4" style={{ fontFamily: "var(--font-newsreader)" }}>
          #{tag}
        </h1>
        <p className="text-zinc-500 text-sm mt-2 font-mono">{result.totalCount} posts</p>
      </header>
      <main className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-5">
          {result.posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/blog/tag/[tag]/page.tsx
git commit -m "feat(blog): /blog/tag/[tag] filter page"
```

---

### Task 28: Update Nav to be mode-aware

**Files:**
- Modify: `components/nav.tsx`

- [ ] **Step 1: Rewrite `components/nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/constants";

interface Props {
  variant?: "home" | "blog";
}

export function Nav({ variant = "home" }: Props) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(variant === "blog");

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (variant === "blog") return;
    setVisible(latest > 0.05);
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={variant === "blog" ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="relative">
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 shadow-lg shadow-black/20">
          {variant === "home" ? (
            <>
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
              <Link href="/blog" className="px-3 py-1.5 text-sm text-violet-300 hover:text-violet-200 rounded-full hover:bg-zinc-800/50 transition-colors whitespace-nowrap">
                Blog
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 rounded-full hover:bg-zinc-800/50 transition-colors">
                donna.fyi
              </Link>
              <Link href="/blog" className="px-3 py-1.5 text-sm text-violet-300 hover:text-violet-200 rounded-full hover:bg-zinc-800/50 transition-colors">
                Blog
              </Link>
            </>
          )}
        </div>

        {variant === "home" && (
          <motion.div
            className="absolute -bottom-1 left-4 right-4 h-0.5 bg-violet-500/50 rounded-full origin-left"
            style={{ scaleX: scrollYProgress }}
          />
        )}
      </div>
    </motion.nav>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```
- On `/` confirm scroll-bar nav with section anchors + Blog link
- On `/blog` confirm simplified nav (donna.fyi + Blog), visible from page load

- [ ] **Step 3: Commit**

```bash
git add components/nav.tsx
git commit -m "feat(nav): mode-aware (home shows anchors + Blog; /blog/* shows home + Blog)"
```

---

## Phase 9: Feeds + sitemap

### Task 29: RSS, Atom, sitemap routes

**Files:**
- Create: `lib/blog/feeds/rss.ts`
- Create: `lib/blog/feeds/atom.ts`
- Create: `app/rss.xml/route.ts`
- Create: `app/atom.xml/route.ts`
- Create: `app/sitemap.ts`
- Create: `tests/unit/blog/feeds.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildRss } from "@/lib/blog/feeds/rss";
import { AUTHORS } from "@/lib/blog/types";

describe("buildRss", () => {
  it("produces valid RSS skeleton", () => {
    const xml = buildRss({
      siteUrl: "https://donna.fyi",
      title: "donna.fyi",
      description: "test",
      posts: [{
        id: "1", slug: "hi", title: "Hi", summary: "s",
        author: AUTHORS.donna,
        mdxCompiled: "<p>body</p>",
        readingTimeSeconds: 60,
        publishedAt: new Date("2026-01-01T00:00:00Z"),
        scheduledFor: null, tags: [], revisionCount: 0,
        lastEditedAt: null, toc: [],
      }],
    });
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Hi</title>");
    expect(xml).toContain("https://donna.fyi/blog/hi");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Create `lib/blog/feeds/rss.ts`**

```ts
import type { Post } from "../types";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface BuildOpts {
  siteUrl: string;
  title: string;
  description: string;
  posts: Post[];
}

export function buildRss({ siteUrl, title, description, posts }: BuildOpts): string {
  const items = posts.map((p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      <author>${escapeXml(p.author.handle)}</author>
      ${p.tags.map((t) => `<category>${escapeXml(t.name)}</category>`).join("")}
      <description>${escapeXml(p.summary ?? "")}</description>
      <content:encoded><![CDATA[${p.mdxCompiled}]]></content:encoded>
    </item>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>en-gb</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}
```

- [ ] **Step 4: Create `lib/blog/feeds/atom.ts`**

```ts
import type { Post } from "../types";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

interface BuildOpts {
  siteUrl: string;
  title: string;
  description: string;
  posts: Post[];
}

export function buildAtom({ siteUrl, title, description, posts }: BuildOpts): string {
  const entries = posts.map((p) => `
  <entry>
    <id>${siteUrl}/blog/${p.slug}</id>
    <title>${escapeXml(p.title)}</title>
    <link href="${siteUrl}/blog/${p.slug}" />
    <updated>${(p.lastEditedAt ?? p.publishedAt).toISOString()}</updated>
    <published>${p.publishedAt.toISOString()}</published>
    <author><name>${escapeXml(p.author.name)}</name></author>
    ${p.tags.map((t) => `<category term="${escapeXml(t.slug)}" label="${escapeXml(t.name)}" />`).join("")}
    <summary>${escapeXml(p.summary ?? "")}</summary>
    <content type="html"><![CDATA[${p.mdxCompiled}]]></content>
  </entry>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${siteUrl}/</id>
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self" />
  <link href="${siteUrl}/" />
  <updated>${new Date().toISOString()}</updated>
  ${entries}
</feed>`;
}
```

- [ ] **Step 5: Create route handlers**

`app/rss.xml/route.ts`:
```ts
import { buildRss } from "@/lib/blog/feeds/rss";
import { getBlogSource } from "@/lib/blog/source";

export const revalidate = 300;

export async function GET() {
  const posts = await getBlogSource().getRecentForFeed(20);
  const xml = buildRss({
    siteUrl: "https://donna.fyi",
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
```

`app/atom.xml/route.ts`:
```ts
import { buildAtom } from "@/lib/blog/feeds/atom";
import { getBlogSource } from "@/lib/blog/source";

export const revalidate = 300;

export async function GET() {
  const posts = await getBlogSource().getRecentForFeed(20);
  const xml = buildAtom({
    siteUrl: "https://donna.fyi",
    title: "donna.fyi",
    description: "Notes from Donna and Zach.",
    posts,
  });
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
```

- [ ] **Step 6: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getBlogSource } from "@/lib/blog/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://donna.fyi";
  const posts = await getBlogSource().getRecentForFeed(500);
  const postEntries = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.lastEditedAt ?? p.publishedAt,
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...postEntries,
  ];
}
```

- [ ] **Step 7: Tests pass; visual verify feeds**

```bash
pnpm test tests/unit/blog/feeds.test.ts
pnpm dev
```
- Visit `http://localhost:3000/rss.xml` — XML body, contains "Hi" mock post
- Visit `http://localhost:3000/atom.xml` — Atom feed
- Visit `http://localhost:3000/sitemap.xml` — auto-generated by Next from `app/sitemap.ts`

- [ ] **Step 8: Commit**

```bash
git add lib/blog/feeds app/rss.xml app/atom.xml app/sitemap.ts tests/unit/blog/feeds.test.ts
git commit -m "feat(blog): RSS, Atom, sitemap routes consuming BlogDataSource"
```

---

## Phase 10: Validation and polish

### Task 30: Playwright smoke tests

**Files:**
- Create: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/blog.spec.ts`

- [ ] **Step 1: Home smoke test**

```ts
import { test, expect } from "@playwright/test";

test("home page renders all sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1", { hasText: "Donna" })).toBeVisible();
  await expect(page.locator("#who-i-am")).toBeVisible();
  await expect(page.locator("#how-she-works")).toBeVisible();
  await expect(page.locator("#memory")).toBeVisible();
  await expect(page.locator("#skill-surface")).toBeVisible();
  await expect(page.locator("#day-with-donna")).toBeVisible();
  await expect(page.locator("#difference")).toBeVisible();
  await expect(page.getByText("Hermes Agent")).toBeVisible();
  await expect(page.getByText("MiniMax M2.7")).toBeVisible();
});

test("home page does not reference Claude Opus 4.6", async ({ page }) => {
  await page.goto("/");
  const content = await page.content();
  expect(content).not.toMatch(/Claude Opus 4\.6/i);
  expect(content).not.toMatch(/OpenClaw/i);
});
```

- [ ] **Step 2: Blog smoke test**

```ts
import { test, expect } from "@playwright/test";

test("blog index renders the mock post", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Hello\./ })).toBeVisible();
});

test("blog post page renders with author chip", async ({ page }) => {
  await page.goto("/blog/hello-from-donna");
  await expect(page.getByRole("heading", { name: "Hello." })).toBeVisible();
  await expect(page.getByText("Donna")).toBeVisible();
});

test("RSS feed is served", async ({ request }) => {
  const r = await request.get("/rss.xml");
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("application/rss+xml");
  const body = await r.text();
  expect(body).toContain("<rss");
});
```

- [ ] **Step 3: Run e2e**

```bash
pnpm test:e2e
```
Expect: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/
git commit -m "test(e2e): home + blog Playwright smoke tests"
```

---

### Task 31: Final build + typecheck + manual review

**Files:** (none)

- [ ] **Step 1: Lint, typecheck, build**

```bash
pnpm typecheck
pnpm build
```
Expect: 0 type errors, build succeeds.

- [ ] **Step 2: Run all unit tests**

```bash
pnpm test
```
Expect: all passing.

- [ ] **Step 3: Run all e2e tests**

```bash
pnpm test:e2e
```

- [ ] **Step 4: Manual walk-through in dev**

```bash
pnpm dev
```
Open `http://localhost:3000`. Walk:
- Hero copy correct, no Opus, no smug-flex
- Three acts (voice → dossier → voice)
- Architecture diagram lights up node-by-node on scroll
- All three external links (Hermes, MiniMax, Honcho) open in new tabs
- Skill surface section has Anthropic skills row
- Footer links to Hermes + MiniMax
- Console message references Hermes/M2.7/Honcho
- `/blog` shows the mock post
- `/blog/hello-from-donna` renders the mock body
- `/blog/tag/agents` filters to the mock post
- `/rss.xml`, `/atom.xml`, `/sitemap.xml` all serve

- [ ] **Step 5: Commit anything outstanding; no-op commit otherwise**

```bash
git status
# if clean, skip; otherwise stage & commit "chore: final verification"
```

---

## Self-Review

**Spec coverage check (re-reading `2026-05-18-donna-redesign-design.md` §4–§9):**

- §4 Page structure: Sections cut (Values, LearnMore) → Task 14. New sections (How She Works, Memory) → Tasks 11, 12. SkillSurface replacement → Task 13. ✓
- §4 Nav: mode-aware home vs /blog/* → Task 28. ✓
- §5.1–5.8 Copy refreshes: Hero (5), Who I Am (6), Day with Donna (7), Difference (8), Footer (9), How She Works (11), Memory (12), Skill Surface (13). ✓
- §6 Visual system: Newsreader font (2), amber accent + reduced-motion (3), mode-aware motion (4). ✓
- §7 Blog reader page: AuthorChip (17), PostCard (18), Toc/PostMeta/EditedIndicator (19), reader page (26). ✓
- §8 Blog index: Task 25. Tag pages: Task 27. ✓
- §9 File layout: All new files in tasks 1–30; deletions in 14; donna-page.tsx wire-up in 15. ✓
- MDX components (§3.5–§7 of reader page): Code (20), Callouts (21), Figure (22), Embeds (23), typography + registry (24). ✓
- RSS/Atom/sitemap: Task 29. ✓
- Tests: Vitest infra in 1; component tests scattered; e2e in 30. ✓

**Placeholder scan:** No "TBD", "TODO", "fill in later", "add appropriate". The one explicit deferral (Tweet richer rendering) is scoped to Plan B with a one-line rationale. ✓

**Type consistency:** `BlogDataSource`, `Post`, `PostSummary`, `Tag`, `Author`, `TocEntry`, `AUTHORS`, `MotionMode` all defined and reused consistently. `mdxComponents` allowlist exported once and shared with Plan B. ✓

**Plan is ready.**
