"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EASE_OUT, gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/use-media-query";
import { beamYAt, beams, layouts, WIDE_QUERY } from "./prism-layout";
import type { Rig } from "./prism-scene";

const PrismScene = dynamic(() => import("./prism-scene"), { ssr: false });

/** If WebGL is unavailable the hero simply keeps its type; the page must not crash. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function PrismStage() {
  const root = useRef<HTMLDivElement>(null);
  const rig = useRef<Rig>({
    source: 0,
    beam0: 0,
    beam1: 0,
    beam2: 0,
    scroll: 0,
    px: 0,
    py: 0,
    motion: true,
  });
  const wide = useMediaQuery(WIDE_QUERY, true);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);

  // Stop rendering while the hero is off screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "80px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A light pointer tilt, only for fine pointers and only when motion is welcome.
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = rig.current;
    const onMove = (event: PointerEvent) => {
      r.px = (event.clientX / window.innerWidth) * 2 - 1;
      r.py = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      r.px = 0;
      r.py = 0;
    };
  }, [reduced]);

  // The light switches on once the scene exists: the white beam reaches the prism,
  // then the three coloured beams leave it, Growth first, and the labels land with them.
  useGSAP(
    () => {
      if (!ready) return;
      const r = rig.current;
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduce) {
            Object.assign(r, { source: 1, beam0: 1, beam1: 1, beam2: 1, scroll: 0, motion: false });
            gsap.set("[data-prism-fade]", { autoAlpha: 1 });
            return;
          }

          r.motion = true;
          gsap
            .timeline({ defaults: { ease: EASE_OUT } })
            .to("[data-prism-canvas]", { autoAlpha: 1, duration: 0.9, ease: "power1.out" }, 0)
            .fromTo(r, { source: 0 }, { source: 1, duration: 1 }, 0.15)
            .fromTo(r, { beam1: 0 }, { beam1: 1, duration: 1.2 }, 0.7)
            .fromTo(r, { beam0: 0 }, { beam0: 1, duration: 1.15 }, 0.79)
            .fromTo(r, { beam2: 0 }, { beam2: 1, duration: 1.1 }, 0.85)
            .to(
              "[data-prism-label]",
              { autoAlpha: 1, duration: 0.5, ease: "power1.out", stagger: { each: 0.06, from: "center" } },
              1.2,
            );

          gsap.to(r, {
            scroll: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        },
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [ready] },
  );

  const frameloop = reduced ? "demand" : inView ? "always" : "never";

  return (
    <div ref={root} className="prism-stage" aria-hidden="true">
      <div className="prism-canvas" data-prism-canvas data-prism-fade>
        <SceneBoundary>
          <PrismScene rig={rig} wide={wide} frameloop={frameloop} onReady={() => setReady(true)} />
        </SceneBoundary>
      </div>
      {(["wide", "narrow"] as const).map((key) => (
        <div key={key} className="prism-labels" data-layout={key}>
          {beams.map((beam) => (
            <span
              key={beam.unit}
              className="prism-label"
              data-prism-label
              data-prism-fade
              style={
                {
                  "--y": beamYAt(layouts[key], beam, layouts[key].labelX),
                  "--beam": beam.color,
                } as CSSProperties
              }
            >
              {beam.label}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
