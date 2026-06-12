"use client";

import { AnimatePresence, motion } from "motion/react";

interface QuoteOverlayProps {
  show: boolean;
  quote: string;
}

export function QuoteOverlay({ show, quote }: QuoteOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="surface-paper bg-surface px-10 py-8 rounded-sm border border-rule-strong border-t-2 border-t-cobalt shadow-2xl shadow-black/20 max-w-lg mx-6">
            <p
              className="text-2xl sm:text-3xl text-ink text-center italic leading-snug"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              &ldquo;{quote}&rdquo;
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-faint text-center mt-4">
              — donna
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DismissalPopupProps {
  show: boolean;
  text: string;
}

export function DismissalPopup({ show, text }: DismissalPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 right-8 z-50 pointer-events-none"
        >
          <div className="surface-terminal bg-surface px-5 py-3 rounded-sm border border-rule shadow-lg">
            <p className="font-mono text-sm text-gold/90">
              <span className="select-none">{"// "}</span>
              {text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
