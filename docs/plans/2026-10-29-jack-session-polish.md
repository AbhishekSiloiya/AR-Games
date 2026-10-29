# MOON Jack Attack and session polish implementation plan

> Execute the approved one-game-at-a-time benchmark in this session, with independent cleanup and layout checks.

**Goal:** Make Jack Attack a responsive Rizzquake orbital arcade round, eliminate cross-round leftovers, and fit the shared session screens on laptop and tablet viewports.

**Architecture:** Keep the existing PlayCanvas renderer, arm raise/reload rules, waves and score economy. Render a real skinned Rizzquake and breakable drones in an original orbital arena. Give each round a closed cleanup lifetime; compact briefing/results with explicit optional dialogs.

**Tech Stack:** TypeScript, React, PlayCanvas, Vite, Node assertions, Playwright.

### 1. Round lifetime
- Reproduce late cleanup/resource registrations and viewport overflow before fixes.
- Add src/round-lifetime.ts and its test. Scope Stage/engine callbacks and fitted resources to their originating round.
- Verify actual Slice cuts followed by Goalie and Shape Up, plus all six game transitions.

### 2. Shared screens
- Compact briefing, camera setup and results through src/main.tsx and src/session-screens.css.
- Preserve every setting, hand selection, rewards and accessible actions; optional settings/details use dialogs.
- Verify 90 screen cases, including two players and short landscape viewports.

### 3. Jack Attack
- Add src/jack-input.ts + tests for fresh input, pause reset and deliberate arm rearm before implementation.
- Add src/jack-pilot.ts, src/jack-arena.ts and src/jack-hud.ts/css. Keep one Rizzquake identity, direct articulated motion, one per player when paired.
- Replace src/games/jacks.ts with real 3D drones, visible destruction, honest arm aiming and existing waves, shields, boss and paired modes.
- Save original built-in image generation prompt/credit alongside public/assets/moon/jacks/orbit-v1.png.
- Add deterministic snapshot/advance and a local proof route; update full-app game telemetry and browser tests.

### 4. Verification and delivery
- Run unit/type checks and production build; inspect local standard-client screenshots and text state.
- Verify actual hits/misses, rearm, stale input, pause/resume, boss damage, wave bonus, shield loss, pairing, results and reduced motion.
- Independently review code and fix material findings; rerun affected checks.
- Copy only reviewed files to managed worktree, commit on codex/moon-jack-session-polish, push and open a draft PR based on codex/moon-shapeup-club.
- Verify Vercel preview READY at exact SHA and give user preview. No production merge/promotion.
