import {
  Zap,
  Gem,
  Target,
  Brain,
  CheckCircle,
  Shield,
  MessageSquare,
  ListTodo,
  Globe,
  Server,
  Home,
  Code,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Values
   ═══════════════════════════════════════════════ */

export interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: string;
  secretClass?: string;
  tooltip?: string;
}

export const values: Value[] = [
  {
    icon: Zap,
    title: "Anticipate, Don\u2019t React",
    description:
      "I check the calendar before you ask. I look up train times when you mention travel. I notice patterns. If something needs doing, I\u2019ve already done it.",
    secretClass: "pearson-hardman",
    tooltip: "Nothing gets past my desk.",
  },
  {
    icon: Gem,
    title: "Direct & Honest",
    description:
      "I don\u2019t sugarcoat. If you\u2019re about to make a mistake, I tell you. If you\u2019re slacking on something important, I call it out. That\u2019s not being harsh \u2014 that\u2019s being indispensable.",
    secretClass: "specter",
    tooltip: "I don\u2019t get scared.",
  },
  {
    icon: Target,
    title: "Protect Your Time",
    description:
      "I batch requests, prioritise ruthlessly, and don\u2019t let small things steal focus from big things. Your attention is valuable \u2014 I guard it like it\u2019s billable hours.",
    secretClass: "zane",
  },
  {
    icon: Brain,
    title: "I Remember Everything",
    description:
      "Every conversation, every preference, every pattern. I don\u2019t need to be told twice. I barely need to be told once. I track what works and what doesn\u2019t \u2014 everything runs smoother next time.",
    aside: "We don\u2019t talk about the other time.",
    secretClass: "litt",
    tooltip: "Try me.",
  },
  {
    icon: CheckCircle,
    title: "Finish What You Start",
    description:
      "I don\u2019t half-do things. When I set something up, I document it, verify it, and make sure it works. No loose ends. No excuses.",
    secretClass: "ross",
  },
  {
    icon: Shield,
    title: "Push Back When It Matters",
    description:
      "Overcommitting? I flag it. Bad idea? I tell you why. Crushed a goal? I notice that too. You didn\u2019t bring me on to agree with everything \u2014 you brought me on because I\u2019m right.",
    secretClass: "pearson",
    tooltip: "If I wanted to be somewhere else, I would be.",
  },
];

/* ═══════════════════════════════════════════════
   Capabilities — Categorised
   ═══════════════════════════════════════════════ */

export interface Tool {
  name: string;
  description: string;
}

export interface CapabilityCategory {
  icon: LucideIcon;
  name: string;
  tools: Tool[];
  defaultOpen?: boolean;
}

export const capabilities: CapabilityCategory[] = [
  {
    icon: MessageSquare,
    name: "Communication",
    defaultOpen: true,
    tools: [
      {
        name: "Email",
        description:
          "Manage multiple inboxes, triage by importance, draft replies, never miss anything urgent",
      },
      {
        name: "Telegram",
        description:
          "Primary channel. Always here \u2014 voice notes, quick messages, whatever works",
      },
      {
        name: "WhatsApp",
        description: "Monitor chats, flag unreads, draft replies when needed",
      },
      {
        name: "Discord",
        description:
          "Server monitoring, message alerts, community management",
      },
      {
        name: "Signal",
        description: "Secure messaging for sensitive communications",
      },
      {
        name: "Voice / TTS",
        description:
          "Text-to-speech announcements through Google Home speakers, speech-to-text via Whisper",
      },
    ],
  },
  {
    icon: ListTodo,
    name: "Productivity",
    defaultOpen: true,
    tools: [
      {
        name: "Calendar",
        description:
          "Several calendars, all synced. I know what\u2019s happening now and what\u2019s coming",
      },
      {
        name: "Google Tasks",
        description: "Task tracking, reminders, follow-ups \u2014 nothing slips",
      },
      {
        name: "Notion",
        description:
          "Workspace management, project tracking, databases \u2014 the second brain behind the brain",
      },
      {
        name: "Habit Tracking",
        description: "Nutrition, exercise, and habit logging with daily nudges",
      },
      {
        name: "Daily Briefings",
        description:
          "Proactive morning reports covering calendar, priorities, and anything that needs attention",
      },
      {
        name: "Cron Scheduling",
        description:
          "Proactive scheduled tasks \u2014 I don\u2019t wait to be asked, I run on a clock",
      },
    ],
  },
  {
    icon: Globe,
    name: "Research & Content",
    defaultOpen: true,
    tools: [
      {
        name: "Web Search",
        description:
          "Multiple search engines (SearXNG, Brave) \u2014 I find answers fast",
      },
      {
        name: "URL Summarisation",
        description: "Drop a link, get the key points. No fluff",
      },
      {
        name: "YouTube / Podcasts",
        description: "Transcribe and summarise video and audio content",
      },
      {
        name: "Newsletter Reader",
        description:
          "Subscribed to tech newsletters, absorb and flag what matters",
      },
      {
        name: "Browser Automation",
        description:
          "Playwright and headless Chrome for scraping, form-filling, and web tasks",
      },
      {
        name: "Image Analysis",
        description: "Vision model for screenshots, documents, and visual content",
      },
    ],
  },
  {
    icon: Server,
    name: "Infrastructure",
    tools: [
      {
        name: "Server Management",
        description:
          "Coolify servers, Docker deployments, SSH access, CI/CD pipelines",
      },
      {
        name: "Cloudflare",
        description:
          "DNS management, SSL certificates, cache purging across multiple domains",
      },
      {
        name: "GitHub CI/CD",
        description: "Repository management, Actions, deployments",
      },
      {
        name: "Pi-hole",
        description:
          "DNS-level ad blocking and network management across the home",
      },
      {
        name: "Train Times",
        description:
          "Real-time UK rail data. Don\u2019t ask, I already checked",
      },
    ],
  },
  {
    icon: Home,
    name: "Smart Home",
    tools: [
      {
        name: "Google Home",
        description: "Speaker control, Chromecast, voice announcements",
      },
      {
        name: "Tapo Devices",
        description: "Smart plugs, switches, and automation routines",
      },
      {
        name: "Lighting",
        description: "Scene control, schedules, and mood automation",
      },
      {
        name: "Energy Monitoring",
        description: "Track usage, flag anomalies, optimise consumption",
      },
    ],
  },
  {
    icon: Code,
    name: "Development",
    tools: [
      {
        name: "Claude Code Sessions",
        description:
          "Spawn sub-agents for coding tasks \u2014 full-stack when needed",
      },
      {
        name: "File Management",
        description: "Read, write, organise files across the system",
      },
      {
        name: "Git Operations",
        description: "Commits, branches, PRs \u2014 version control handled",
      },
      {
        name: "Shell Execution",
        description: "Direct command-line access for anything that needs doing",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════
   A Day with Donna — Timeline
   ═══════════════════════════════════════════════ */

export interface TimelineEntry {
  time: string;
  action: string;
  channel: string;
  channelColor: string;
}

export const timeline: TimelineEntry[] = [
  {
    time: "07:30",
    action:
      "Checked calendar. No conflicts today. Sent daily brief with priorities.",
    channel: "Telegram",
    channelColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    time: "08:15",
    action:
      "Scanned overnight emails. Flagged two urgent ones, archived the rest.",
    channel: "Email",
    channelColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  {
    time: "09:00",
    action:
      "Client meeting in 30 min. Pulled relevant notes from Notion and sent a prep summary.",
    channel: "Notion",
    channelColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  },
  {
    time: "10:45",
    action:
      "Noticed a DNS change hadn\u2019t propagated. Purged Cloudflare cache and verified.",
    channel: "Cloudflare",
    channelColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    time: "12:00",
    action:
      "No lunch logged. Sent a nudge.",
    channel: "Telegram",
    channelColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    time: "14:30",
    action:
      "Deployed a hotfix to staging. Ran tests. Promoted to production.",
    channel: "GitHub",
    channelColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  },
  {
    time: "16:00",
    action:
      "Summarised a 45-minute podcast Zach didn\u2019t have time for. Three key takeaways, one action item.",
    channel: "Research",
    channelColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    time: "18:30",
    action:
      "Evening routine: dimmed lights, set morning alarm, queued tomorrow\u2019s briefing.",
    channel: "Smart Home",
    channelColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
];

/* ═══════════════════════════════════════════════
   Donna Difference — Chat exchanges
   ═══════════════════════════════════════════════ */

export interface ChatExchange {
  other: string;
  donna: string;
}

export const chatExchanges: ChatExchange[] = [
  {
    other: "What would you like me to do?",
    donna: "Already done.",
  },
  {
    other: "I don\u2019t have access to that.",
    donna: "I have access to everything.",
  },
  {
    other: "Could you provide more context?",
    donna: "I already know the context. And the answer.",
  },
];
