# MOON Slice and Freeze implementation plan

**Goal:** Deliver a separate playable MOON preview with a cohesive brand, more satisfying Slice feedback, and a fashion-led Freeze experience.

**Architecture:** Keep the current React shell, PlayCanvas scenes, MediaPipe tracker and scoring. Add round-owned DOM/SVG presentation driven by the existing game clocks, plus small pure feedback helpers. Camera readability, bounded effects, independent players and cleanup are release requirements.

**Tech stack:** TypeScript, React, PlayCanvas, native CSS/SVG, Web Audio, Vite, Playwright.

Visual thesis: expressive arcade graphics with crisp type, citrus cuts and chrome/coral party accents; the live player remains the visual centre.
Content plan: compact MOON identity, one readable action cue, a small per-player mastery indicator and short earned celebrations. No new dashboard or competing panels.
Interaction thesis: directional cut impacts and milestone feedback; freeze-mode scene/sound changes; immediate choice and preview of party equipment.

## Tasks

1. Establish brand and visual tokens. Modify main.tsx, index.html and manifest.json; create moon.css and tokens.css. Add MOON wordmark and preserve profile/storage compatibility. Keep original routes and all games available.
2. Add pure experience helpers and tests for cut-feedback labels/timing and Freeze hold-chain feedback. Run a failing test before implementing those helpers. No extra points from visual effects or an absent player.
3. Create round-owned moon-slice.ts + moon-slice.css. Wire game slice.ts cut/bomb/power/slash events to lightweight directional impacts, readable combo progress and phase cues. Improve the fruit's material presentation without adding hand equipment or input smoothing. Add an original Slice music theme.
4. Create three Freeze gear choices (Chrome, Prism, Minimal), persisted per browser and selectable during briefing. Refine geometry in disco-gear.ts; tune the live-camera party layer and add a clear persistent dance/freeze/hold status and per-player successful-hold chains. Retain existing soundtrack choices and synchronized gating; no new external music licences.
5. Test pure rules and TypeScript/build. Use the standard web-game client plus focused synthetic-camera checks for actual Slice hits/bombs/combos, Freeze phase/audio/hold transitions, preferences, pause, recovery, two players, reduced effects and cleanup. Inspect desktop/tablet screenshots. Real-device latency is still a hardware acceptance item.
6. Commit to feature/moon-slice-freeze, push and create a draft PR. Publish a Vercel preview and return its verified READY URL. Do not merge into production in this pass.

Expected changes: src/main.tsx, src/setup.tsx, src/party-options.tsx, src/audio.ts, src/dance-music.ts, src/disco-gear.ts, src/freeze-party.ts/css, src/games/slice.ts, src/games/freeze.ts, package.json, index.html, public/manifest.json, public/icon.svg, plus new presentation/helper/test files and this plan/progress notes. No deletions. No tracking-model or scoring-threshold changes.
