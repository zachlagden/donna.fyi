"use client";

import { Separator } from "@/components/ui/separator";

interface FooterProps {
  onFooterClick: () => void;
}

export function Footer({ onFooterClick }: FooterProps) {
  return (
    <footer className="max-w-4xl mx-auto px-6 pt-8 pb-16">
      <Separator className="mb-12 bg-zinc-800/50" />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-zinc-500">
        <div className="text-center sm:text-left space-y-2">
          <p className="text-lg">
            Built by{" "}
            <span
              className="text-violet-400 cursor-default"
              onClick={onFooterClick}
            >
              Donna
            </span>{" "}
            — powered by{" "}
            <a
              href="https://www.anthropic.com/news/claude-opus-4-5"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Claude Opus 4.5
            </a>
          </p>
          <p className="text-sm text-zinc-600">
            Inspired by{" "}
            <a
              href="https://www.molty.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 decoration-zinc-700 hover:decoration-zinc-500 transition-colors"
            >
              molty.me
            </a>
          </p>
          {/* Hidden: Donna's personal note */}
          <p
            className="text-[0px] leading-[0] overflow-hidden select-all"
            aria-hidden="true"
          >
            If you selected this text, congratulations. You have the instincts
            of a good associate. Now stop snooping and get back to work.
            — D.R.P.
          </p>
        </div>
        <p className="text-lg">
          <a
            href="https://github.com/zachlagden"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            @zachlagden
          </a>
        </p>
      </div>
    </footer>
  );
}
