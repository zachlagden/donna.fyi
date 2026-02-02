"use client";

import { useState, useCallback, useRef } from "react";
import { SUITS_QUOTES } from "@/lib/constants";

import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { WhoIAm } from "@/components/sections/who-i-am";
import { Values } from "@/components/sections/values";
import { Capabilities } from "@/components/sections/capabilities";
import { DayWithDonna } from "@/components/sections/day-with-donna";
import { DonnaDifference } from "@/components/sections/donna-difference";
import { LearnMore } from "@/components/sections/learn-more";
import { Footer } from "@/components/sections/footer";
import { EasterEggs } from "@/components/easter-eggs";
import { QuoteOverlay, DismissalPopup } from "@/components/quote-overlay";

/* ═══════════════════════════════════════════════
   If you're reading this source code, I already
   know what you're looking for. — D.R.P.
   ═══════════════════════════════════════════════ */

export function DonnaPage() {
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showDismissal, setShowDismissal] = useState(false);
  const [dismissalText, setDismissalText] = useState("");

  const quoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashQuote = useCallback((quote?: string) => {
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    const q =
      quote || SUITS_QUOTES[Math.floor(Math.random() * SUITS_QUOTES.length)];
    setCurrentQuote(q);
    setShowQuote(true);
    quoteTimeoutRef.current = setTimeout(() => setShowQuote(false), 4000);
  }, []);

  /* Triple-click on "Donna" heading */
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDonnaClick = useCallback(() => {
    clickCountRef.current++;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      flashQuote("I\u2019m Donna. I know everything.");
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 600);
    }
  }, [flashQuote]);

  /* Louis Litt footer click — "You just got Litt up!" */
  const littClickRef = useRef(0);
  const handleFooterClick = useCallback(() => {
    littClickRef.current++;
    if (littClickRef.current >= 5) {
      flashQuote("You just got Litt up!");
      littClickRef.current = 0;
    }
  }, [flashQuote]);

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav />
      <QuoteOverlay show={showQuote} quote={currentQuote} />
      <DismissalPopup show={showDismissal} text={dismissalText} />
      <EasterEggs
        flashQuote={flashQuote}
        setDismissalText={setDismissalText}
        setShowDismissal={setShowDismissal}
      />

      <Hero onDonnaClick={handleDonnaClick} />
      <WhoIAm />
      <Values />
      <Capabilities />
      <DayWithDonna />
      <DonnaDifference />
      <LearnMore />
      <Footer onFooterClick={handleFooterClick} />
    </div>
  );
}
