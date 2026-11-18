"use client";

import { useRef, type ReactNode } from "react";
import { EASE_OUT, gsap, useGSAP } from "@/lib/gsap";

// Delays shrink (90ms, then 70ms) so the three lines read as one wave, not a queue.
const DELAYS = [0, 0.09, 0.16];

/**
 * The hero's three beams arrive at the services: each unit's light line draws in once,
 * the first time the grid scrolls into view. Reduced motion shows the lines as they are.
 */
export function BeamReveal({ className, children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-beam-line]", {
          scaleX: 0,
          duration: 1.1,
          ease: EASE_OUT,
          delay: (i: number) => DELAYS[i] ?? 0,
          scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
