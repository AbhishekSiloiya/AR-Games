# MOON six-game release polish

**Goal:** Apply the user’s complete playtest feedback, verify the six-game experience, then merge the verified release into the default main branch. Slice mechanics stay unchanged.
**Base:** f3bca5e. Working copy /private/tmp/moon-release-dev; managed branch codex/moon-release-polish.
**Architecture:** Keep the shared camera pipeline and accepted authored scenes. Independently strengthen Goalie patterns, dance-triggered Freeze effects, staged Shape Quest content and Jack response/damage. Root owns shared menus, result actions, six game-specific character thumbnails, integration and release.
**Tech stack:** TypeScript/React, PlayCanvas, Node rule tests, browser gameplay/visual tests and Vercel Git deployment.

## Independent work
1. Goalie + Jack: author upper corner endpoints and later-stage curves within reachable bounds; preserve true ring endpoints. Reduce Jack shot response without firing during gradual aiming, make incoming ships actually contact/damage the pilot with a visible shield consequence instead of vanishing above it. Retain earned Starfall and sector ownership.
2. Freeze: smaller partner; motion-earned rotating disco ball, sparkles/confetti and a dedicated partner spotlight. No tint/occlusion over the live player, freeze/pause/reduced-motion cleanup preserved.
3. Shape Up: distinct authored stage pose schedules, safe increasing complexity and faster between-pose cadence. Visible earned chains/bonus/progression, honest match feedback and independent paired awards. No animal-pose feature yet.
4. Root: right-hand selection about1.5 seconds, keep jitter tolerance and move-away latch. Increase Play again/Next stage/Home/Ready targets with legible game-like labels and viewport fit. Six original Rizzquake game-specific pose/gear images that match actual themes; no unrelated characters or poster promises.

## Verification and delivery
Each domain uses failing regressions before behavior changes and returns exact files/tests. Root reviews and integrates; all rules/type/build checks, game-specific actual-input outcomes, shared switching/recovery/layout tests, screenshots and an independent review must pass. Browser software GPU can run only one test process at a time; agents request the slot. Preserve user checkout/assets. Publish a preview, then merge the tested release into origin/master (the repository’s default/main branch) using GitHub, with exact HEAD/SHA checks. Verify production deployment READY; report remaining physical-camera acceptance limits.
