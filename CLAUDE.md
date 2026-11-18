@AGENTS.md

# Agency landing page

A marketing landing page for an agency, built around 3D scenes and motion design.

## Stack

- Next.js 16.4 App Router in `src/app`, React 19.3. `next.config.ts` turns on the React Compiler, `cacheComponents` and `partialPrefetching`.
- Tailwind CSS 4, configured in CSS (`@theme` in `src/app/globals.css`). There is no `tailwind.config.*`.
- 3D: `three`, `@react-three/fiber` 9, `@react-three/drei` 10.
- Motion: `gsap` 3 with `@gsap/react` (`useGSAP`), and `lenis` for smooth scroll.
- Fonts: `next/font` only. Geist and Geist Mono are placeholders until the landing page's font pairing is chosen (use the `frontend-design` and `web-typography` skills to choose it).

## Commands

- `npm run dev`: dev server
- `npm run build`: production build (run it before calling work done)
- `npm run lint`: ESLint

## Rules

- Before using a Next.js API, read its guide in `node_modules/next/dist/docs/` (see AGENTS.md).
- Keep `page.tsx` and `layout.tsx` as Server Components. Put 3D, GSAP and Lenis code in small `'use client'` components.
- Load an R3F `<Canvas>` with `next/dynamic(() => import(...), { ssr: false })`. `ssr: false` only works inside a Client Component, so wrap it in one.
- GSAP in React: always use `useGSAP()` with a `scope` ref so cleanup is automatic. Register plugins once with `gsap.registerPlugin(...)` in a client module. Every GSAP plugin, SplitText included, is free from the npm `gsap` package; never add a Club token or private registry.
- Use one Lenis instance for the whole app, synced with ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`, drive `lenis.raf(time * 1000)` from `gsap.ticker`, and call `gsap.ticker.lagSmoothing(0)`.
- Respect `prefers-reduced-motion`: use `gsap.matchMedia()` to cut non-essential motion, and stop 3D autoplay and smooth scroll.
- Animate `transform` and `opacity` only. Never animate layout properties (`width`, `height`, `top`, `left`).
- Fonts: load with `next/font/google` or `next/font/local`, expose each as a CSS variable, and map it in `@theme`. Never add a `<link>` to Google Fonts. Note: `body` in `globals.css` still hardcodes `font-family: Arial`; replace it with the theme font when fonts are set.

## Project skills (`.claude/skills`)

Load the skill that matches the task:

| Task | Skills |
| --- | --- |
| Visual direction, layout, choosing fonts | `frontend-design`, `web-typography` |
| 3D scene (start with `threejs-react-three-fiber`) | `threejs-fundamentals`, `threejs-materials`, `threejs-lighting`, `threejs-shaders`, `threejs-postprocessing`, `threejs-loaders`, `threejs-performance` |
| GSAP (start with `gsap-react`) | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance` |
| Motion feel, sequencing, review | `animate`, `choreograph`, `emil-design-eng`, `review-animations`, `improve-animations`, `animation-performance`, `animation-vocabulary` |

The skills are pinned in `skills-lock.json`. To update them, run `npx skills@1.7.0 update -p`, then read every changed `SKILL.md` before keeping the update.
