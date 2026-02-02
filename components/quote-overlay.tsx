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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="px-8 py-6 rounded-2xl bg-zinc-900/95 border border-violet-500/50 shadow-2xl shadow-violet-500/20 backdrop-blur-sm">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400 text-center italic">
              &ldquo;{quote}&rdquo;
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
          <div className="px-6 py-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 shadow-lg backdrop-blur-sm">
            <p className="text-sm text-amber-400/80 italic">{text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
