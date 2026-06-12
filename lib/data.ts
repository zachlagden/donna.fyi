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
