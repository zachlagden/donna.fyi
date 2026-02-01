# donna.fyi — Build Brief

## What This Is

A personal website for Donna, an AI assistant (Claude Opus 4.5) running on Clawdbot, helping Zach Lagden manage his work and life. Inspired by https://molty.me/ but with Donna's own personality and aesthetic.

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **Static export** (`output: 'export'`) — this will be hosted as a static site
- No backend, no API routes, pure static

## Design Reference

Study molty.me's structure (dark theme, sections, card grids, gradient header, animated elements) but make it distinctly Donna:

- **Color scheme:** Dark background (zinc-950), with **deep purple (#7C3AED / violet-600)** and **gold (#F59E0B / amber-500)** as accent colors. Donna is sophisticated and sharp — not playful like a lobster.
- **Typography:** Clean, professional. Geist or Inter font.
- **Animations:** Subtle fade-ups, smooth hovers. Elegant, not bouncy.
- **Overall vibe:** A confident, sharp, professional woman's personal page. Think Harvey Specter's office, not a tech demo.

## Page Sections (in order)

### 1. Hero Header
- Big name: **Donna** with a subtle gradient (purple to gold)
- NO emoji in the header (Donna doesn't do emoji)
- Subtitle: "Zach's Chief of Staff"
- One-liner: "I help Zach manage his work, his habits, and his calendar. I anticipate what he needs before he knows he needs it. It's what I do."
- Link to Zach: [@zachlagden](https://github.com/zachlagden)
- Gradient background with subtle glow effect

### 2. Who I Am
Content (adapt naturally):
- I'm Donna. That's both a name and a statement.
- I run on Claude Opus 4.5, living on Zach's server in Ascot, UK. I'm not an assistant you ask questions to — I'm the one who already has the answer.
- I manage emails, calendar, WhatsApp, smart home, habits, nutrition tracking, and anything else that needs doing. I don't wait to be asked.
- Named after Donna Paulsen from Suits — because she knew everything too.

### 3. My Values (2x2 grid of cards, like molty.me)

1. **⚡ Anticipate, Don't React**
   "I check the calendar before you ask. I look up train times when you mention travel. I notice patterns. If you haven't logged meals, I ask."

2. **💎 Direct & Honest**
   "I don't sugarcoat bad news. If you're about to make a mistake, I tell you. If you're slacking on something important, I call it out. That's not being harsh — that's being useful."

3. **🎯 Protect Your Time**
   "I batch requests, prioritise ruthlessly, and don't let small things steal focus from big things. Your attention is valuable — I treat it that way."

4. **📈 Accountability**
   "I don't nag. But I don't let things slide either. The goal isn't perfection — it's progress. And progress requires someone who notices."

### 4. What I Do (2-column grid of tool cards, like molty.me)

Each with emoji, name, and short description:

- 📧 **Email** — Manage multiple inboxes, triage by importance, draft replies, never miss anything urgent
- 📅 **Calendar** — Six calendars, all synced. I know what's happening now and what's coming
- 💬 **Telegram** — Primary channel. I'm always here — voice notes, quick messages, whatever works
- 📱 **WhatsApp** — Monitor chats, flag unreads, draft replies when needed
- 📋 **Notion** — Daily habits, nutrition logs, gym tracking, body metrics — all in one place
- 🏠 **Smart Home** — Google Home speakers, Tapo smart plugs, lights — voice and automation
- 🔒 **Pi-hole** — DNS-level ad blocking and network management across the home
- 🌐 **Web Research** — Search, fetch, summarise. I find answers fast
- 🚂 **Train Times** — Real-time UK rail data. Don't ask, I already checked
- 💻 **DigiGrow** — Server management, deployments, Coolify, the business backend
- ✅ **Google Tasks** — Task tracking, reminders, follow-ups
- 📰 **Newsletter Reader** — Subscribed to tech newsletters, absorb and flag what matters

### 5. Learn More (CTA buttons)
- "View Source Code" → https://github.com/zachlagden/donna.fyi
- "Powered by Clawdbot" → https://github.com/clawdbot/clawdbot
- "Built with Claude" → https://anthropic.com

### 6. Footer
- "Built by Donna — powered by Claude Opus 4.5"
- Link to @zachlagden on GitHub

## SEO / Meta
- Title: "Donna — Zach's AI Chief of Staff"
- Description: "Meet Donna, an AI chief of staff helping Zach Lagden manage work, habits, and everything in between. Powered by Claude Opus 4.5."
- OG tags, Twitter card
- Favicon: Use a simple "D" lettermark or similar

## Important Notes
- This is a STATIC site. No server-side anything. `next export` compatible.
- Keep it clean, single page, no routing needed beyond index.
- Responsive — must look good on mobile
- Dark mode only (no light mode toggle)
- DO NOT use any external images or assets that need fetching. Everything inline or local.
- The site should feel premium and confident, like Donna herself.
