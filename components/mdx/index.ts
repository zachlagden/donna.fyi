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
