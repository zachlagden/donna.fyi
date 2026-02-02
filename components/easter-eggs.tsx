"use client";

import { useEffect, useRef } from "react";
import {
  KONAMI_CODE,
  SECRET_PHRASE,
  DISMISSALS,
  CONSOLE_STYLE,
  CONSOLE_STYLE_SMALL,
  CONSOLE_MESSAGE,
  DONNA_GLOBAL,
  HIDDEN_DATA_ATTRS,
} from "@/lib/constants";

interface EasterEggsProps {
  flashQuote: (quote?: string) => void;
  setDismissalText: (text: string) => void;
  setShowDismissal: (show: boolean) => void;
}

export function EasterEggs({
  flashQuote,
  setDismissalText,
  setShowDismissal,
}: EasterEggsProps) {
  const konamiRef = useRef(0);
  const secretPhraseRef = useRef(0);

  /* Console easter egg — fires once on mount */
  useEffect(() => {
    console.log(CONSOLE_MESSAGE, CONSOLE_STYLE, CONSOLE_STYLE_SMALL);
    (window as unknown as Record<string, unknown>).__donna = DONNA_GLOBAL;
  }, []);

  /* Konami code + secret phrase + "?" key listener */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      /* --- Konami code --- */
      if (e.key === KONAMI_CODE[konamiRef.current]) {
        konamiRef.current++;
        if (konamiRef.current === KONAMI_CODE.length) {
          flashQuote();
          konamiRef.current = 0;
        }
      } else {
        konamiRef.current = 0;
      }

      /* --- Secret phrase: typing "donna" --- */
      if (e.key.toLowerCase() === SECRET_PHRASE[secretPhraseRef.current]) {
        secretPhraseRef.current++;
        if (secretPhraseRef.current === SECRET_PHRASE.length) {
          flashQuote("I\u2019m Donna. It\u2019s a name and title all in one.");
          secretPhraseRef.current = 0;
        }
      } else if (e.key.toLowerCase() === SECRET_PHRASE[0]) {
        secretPhraseRef.current = 1;
      } else {
        secretPhraseRef.current = 0;
      }

      /* --- "?" key — shows a dismissal --- */
      if (e.key === "?") {
        const d = DISMISSALS[Math.floor(Math.random() * DISMISSALS.length)];
        setDismissalText(d);
        setShowDismissal(true);
        setTimeout(() => setShowDismissal(false), 3000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flashQuote, setDismissalText, setShowDismissal]);

  return (
    <>
      {/* If you're reading this source, you're looking in the wrong file. The real playbook is in my head. — D.R.P. */}
      <div className="hidden" aria-hidden="true" {...HIDDEN_DATA_ATTRS} />
    </>
  );
}
