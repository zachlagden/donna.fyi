/* ═══════════════════════════════════════════════
   Easter Eggs — Suits References (No Spoilers)
   "If you're reading this source code, I already
    know what you're looking for." — D.R.P.
   ═══════════════════════════════════════════════ */

export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/* Real Donna Paulsen quotes + character-faithful originals */
export const SUITS_QUOTES = [
  "I\u2019m Donna. I know everything.",
  "I don\u2019t get scared.",
  "That\u2019s because I\u2019m Donna.",
  "I\u2019m too busy being awesome.",
  "Sorry, I can\u2019t hear you over the sound of how awesome I am.",
  "When you\u2019re this good, you don\u2019t need luck.",
  "I\u2019m Donna. It\u2019s a name and title all in one.",
  "If anybody\u2019s falling for anybody, it would be you for me.",
  "I don\u2019t make mistakes. I make decisions.",
  "I remember everything.",
  "You want to know my secret? I\u2019m always paying attention.",
  "I\u2019m not just an assistant. I\u2019m the whole damn firm.",
  "That\u2019s a great question. The answer is: I\u2019m Donna.",
  "I don\u2019t have an ego. I have confidence based on experience.",
  "If I wanted to be somewhere else, I would be.",
  "Nothing gets past my desk.",
];

/* Secret phrase: typing "donna" anywhere triggers a quote */
export const SECRET_PHRASE = "donna";

/* Donna's dismissive responses for the "ask" easter egg */
export const DISMISSALS = [
  "That\u2019s adorable. But no.",
  "I already answered that. You just weren\u2019t paying attention.",
  "If you have to ask, you can\u2019t afford the answer.",
  "I could tell you, but then I\u2019d have to\u2026 actually, I just don\u2019t want to.",
  "Noted. Filed. Ignored.",
  "That\u2019s above your pay grade.",
];

/* Hidden data attributes */
export const HIDDEN_DATA_ATTRS = {
  "data-donna":
    "If you're reading this, you're looking in the wrong file. The real playbook is in my head.",
  "data-can-opener": "Nice try. Nobody knows.",
  "data-the-other-time": "We agreed never to discuss this.",
  "data-pearson":
    "The one who taught me that loyalty isn't given — it's earned.",
  "data-harvey": "He thinks he runs things. That's cute.",
  "data-rick-sorkin": "If you know, you know.",
};

/* Console easter egg styling */
export const CONSOLE_STYLE =
  "color: #c4b5fd; font-size: 14px; font-weight: bold; text-shadow: 0 0 5px #7c3aed;";
export const CONSOLE_STYLE_SMALL =
  "color: #78716c; font-size: 11px; font-style: italic;";
export const CONSOLE_MESSAGE =
  "%c\uD83D\uDC8E I\u2019m Donna. If you\u2019re looking for bugs, you won\u2019t find any. I don\u2019t make mistakes.\n%c   — donna.fyi | Powered by Claude Opus 4.5";

/* window.__donna object */
export const DONNA_GLOBAL = {
  status: "I\u2019m always watching.",
  canOpener: "Nice try.",
  theOtherTime: "We agreed never to talk about that.",
  hire: function () {
    return "I don\u2019t work for you. I work with Zach.";
  },
};

/* Nav section links */
export const NAV_SECTIONS = [
  { id: "who-i-am", label: "Who I Am" },
  { id: "values", label: "Values" },
  { id: "capabilities", label: "Capabilities" },
  { id: "day-with-donna", label: "A Day with Donna" },
  { id: "difference", label: "Difference" },
] as const;
