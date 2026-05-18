import {
  MessageSquare, ListTodo, Globe, Server, Home, Code, FileText,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Capabilities · Categorised
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
          "Reads and triages email across multiple inboxes; drafts replies on demand.",
      },
      {
        name: "Telegram",
        description:
          "Primary user channel. Voice notes, text, attachments.",
      },
      {
        name: "WhatsApp",
        description: "Monitors chats, flags unreads, drafts replies.",
      },
      {
        name: "Discord",
        description:
          "Server monitoring, message alerts.",
      },
      {
        name: "Signal",
        description: "Secure messaging for sensitive communications.",
      },
      {
        name: "Voice / TTS",
        description:
          "Text-to-speech via Google Home speakers; speech-to-text via Whisper.",
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
          "Reads and writes across multiple synced calendars.",
      },
      {
        name: "Google Tasks",
        description: "Tracks tasks, reminders, and follow-ups.",
      },
      {
        name: "Notion",
        description:
          "Workspace management, project tracking, structured databases.",
      },
      {
        name: "Habit Tracking",
        description: "Logs nutrition, exercise, and habits with daily nudges.",
      },
      {
        name: "Daily Briefings",
        description:
          "Generates morning reports covering calendar, priorities, and anomalies.",
      },
      {
        name: "Cron Scheduling",
        description:
          "Runs scheduled tasks on cron.",
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
          "Web search via SearXNG and Brave.",
      },
      {
        name: "URL Summarisation",
        description: "Summarises URLs to key points.",
      },
      {
        name: "YouTube / Podcasts",
        description: "Transcribes and summarises video and audio.",
      },
      {
        name: "Newsletter Reader",
        description:
          "Reads subscribed newsletters and flags relevant items.",
      },
      {
        name: "Browser Automation",
        description:
          "Playwright and headless Chrome for scraping and form-filling.",
      },
      {
        name: "Image Analysis",
        description: "Vision model for screenshots, documents, and images.",
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
          "Coolify, Docker, SSH, deployment pipelines.",
      },
      {
        name: "Cloudflare",
        description:
          "DNS, SSL, and cache purging across domains via Cloudflare.",
      },
      {
        name: "GitHub CI/CD",
        description: "Repository management, Actions, deployments.",
      },
      {
        name: "Pi-hole",
        description:
          "Home DNS-level ad blocking and network filtering.",
      },
      {
        name: "Train Times",
        description:
          "Real-time UK rail data.",
      },
    ],
  },
  {
    icon: Home,
    name: "Smart Home",
    tools: [
      {
        name: "Google Home",
        description: "Speaker control, Chromecast, voice announcements.",
      },
      {
        name: "Tapo Devices",
        description: "Smart plugs, switches, and automation routines.",
      },
      {
        name: "Lighting",
        description: "Scene control, schedules, mood automation.",
      },
      {
        name: "Energy Monitoring",
        description: "Tracks usage and flags anomalies.",
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
          "Spawns sub-agents for coding tasks.",
      },
      {
        name: "File Management",
        description: "Reads, writes, and organises files.",
      },
      {
        name: "Git Operations",
        description: "Commits, branches, and PRs.",
      },
      {
        name: "Shell Execution",
        description: "Direct command-line execution.",
      },
    ],
  },
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
];

/* ═══════════════════════════════════════════════
   A Day with Donna · Timeline
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

/* ═══════════════════════════════════════════════
   Donna Difference · Chat exchanges
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
