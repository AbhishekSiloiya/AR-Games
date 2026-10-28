# Goalie Progression Implementation Plan

> Implement sequentially in the existing isolated Goalie preview worktree using superpowers:executing-plans. Source iteration and test artifacts use /private/tmp/moon-goalie-dev; sync only tracked deliverables after verification.

**Goal:** Give all five Goalie stages distinct movement challenges, an evolving stadium and earned replay feedback.
**Architecture:** Pure authored stage/shot selection and progress helpers feed the existing continuous contact rules. The game owns frozen per-shot state; briefing, coach and stadium consume the same stage metadata. Keep the shared shell/progression and other games unchanged except Goalie options/art/copy.
**Tech Stack:** TypeScript, React, PlayCanvas, Web Audio, Vite, Node assertions and Playwright.

### Task1: authored shots and fair progression
Files: src/goalie-stages.ts, src/goalie-stages.test.ts, src/goalie-rules.ts, src/goalie-rules.test.ts, package.json.
1. Add real rule tests for near/wide/high-low/mixed targets; compare stage patterns and inspect stage4 flight deviation/endpoints, frozen finale/duration, practice isolation and all20 attainable-star simulations.
2. Run node src/goalie-stages.test.ts and observe the missing-stage behavior fail; then implement stage metadata/selection, curve in the flight function and frozen preparation fields. Rerun both rule suites.
3. Keep existing nominal1.90/.11perstage/.002persecond flight timing and one-shot recovery.

### Task2: presentation and readable introduction
Files: src/goalie-arena.ts, goalie-striker.ts, goalie-audio.ts, audio.ts, goalie-coach.ts/css, goalie-options.tsx/css, games/goalie.ts, goalie-proof.ts, main.tsx, moon-catalog.ts, public/assets/moon/goalie.
1. Add browser expectations for all stage names/objectives, actual different scene/music, curve geometry, progress/reward and reduced motion. Run before implementing and confirm expected failures.
2. Create stage-matched environment assets, lighting and minimal stadium accents; preserve clear real-time foreground and daytime first round. Add5 original synth arrangements.
3. Integrate stage introductions and countdown ring demonstrations without scored actions, compact star progress, milestone celebrations, stage-named results and existing best-score reuse. Keep motion reduced and cleanup complete.
4. Update briefing preview to show the actual drill, environment and unchanged2-star unlock rule. Update local proof with stage query.

### Task3: verification and preview
1. Run rules, full npm run check and npm run build.
2. Run focused Goalie browser suite, stage suite and standard web-game client; inspect actual gameplay/screenshots at daylight/sunset/floodlit, small/tablet/paired and reduced motion.
3. Run maintained six-game smoke and relevant Jab/menu regressions. Request read-only review under requesting-code-review, fix material issues and rerun affected checks.
4. Sync only source/assets/docs from tmp into managed worktree, inspect diff, commit/push preview branch and update existing draft PR4. Confirm Vercel READY exactSHA through metadata; no production merge/promotion. Update progress.md with evidence and remaining hands-on acceptance.
