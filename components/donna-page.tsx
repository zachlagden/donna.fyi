"use client";

import { useState, useCallback, useRef } from "react";
import { SUITS_QUOTES } from "@/lib/constants";

import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { WhoIAm } from "@/components/sections/who-i-am";
import { HowSheWorks } from "@/components/sections/how-she-works";
import { Memory } from "@/components/sections/memory";
import { SkillSurface } from "@/components/sections/skill-surface";
import { DayWithDonna } from "@/components/sections/day-with-donna";
import { DonnaDifference } from "@/components/sections/donna-difference";
import { Footer } from "@/components/sections/footer";
import { EasterEggs } from "@/components/easter-eggs";
import { QuoteOverlay, DismissalPopup } from "@/components/quote-overlay";

export function DonnaPage() {
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  const [showDismissal, setShowDismissal] = useState(false);
  const [dismissalText, setDismissalText] = useState("");
  const quoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashQuote = useCallback((quote?: string) => {
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    const q = quote || SUITS_QUOTES[Math.floor(Math.random() * SUITS_QUOTES.length)];
    setCurrentQuote(q);
    setShowQuote(true);
    quoteTimeoutRef.current = setTimeout(() => setShowQuote(false), 4000);
  }, []);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDonnaClick = useCallback(() => {
    clickCountRef.current++;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      flashQuote("I’m Donna. I know everything.");
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 600);
    }
  }, [flashQuote]);

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
      <EasterEggs flashQuote={flashQuote} setDismissalText={setDismissalText} setShowDismissal={setShowDismissal} />

      <Hero onDonnaClick={handleDonnaClick} />
      <WhoIAm />
      <HowSheWorks />
      <Memory />
      <SkillSurface />
      <DayWithDonna />
      <DonnaDifference />
      <Footer onFooterClick={handleFooterClick} />
    </div>
  );
}
