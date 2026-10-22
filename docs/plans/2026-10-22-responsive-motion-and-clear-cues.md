# Responsive motion and clear cues implementation plan

**Goal:** Apply the user's four hands-on corrections in the isolated preview branch.

**Architecture:** Keep the current tracking pipeline and game rules; remove avoidable avatar buffering, move Beat instructions to a dedicated top area, add an explicit Shape Up match/result/reset sequence and pool incoming Smash targets. All visual state belongs to its round and player.

**Tech stack:** TypeScript, PlayCanvas, React shell, DOM/SVG overlays and controlled-landmark Playwright checks.

Visual thesis: immediate motion, large readable cues and unmistakable impacts against the current colourful scenes. Content: one dominant action at a time. Motion: knee-synchronised runner, match celebration then breathing space, approaching targets that recoil and break.

1. Sprint: reproduce the first-step/cadence delay, test immediate lift/opposite lift/stop/absence, then drive avatar phase or bones from actual knees. Preserve exercise scoring and heats. Files: `src/games/sprint.ts`, focused new motion helper/test, optional model sampling API.
2. Beat: verify existing labels sit on moving shapes and current instruction sits near the line. Replace with large per-player top instructions and timing; leave shapes unobstructed. Keep chart/scoring/audio timing, move spawn point below instruction area, test position/type size/absence of note labels/cleanup/solo and two-player layout. Files: `src/beat-cues.ts`, `.css`, `src/games/beat.ts`, browser fixtures.
3. Shape Up: add stable match acquisition, explicit result feedback and a 1.5-second relax/reset phase between poses. Keep actual camera primary, independent scores and freshness guards. Test lock, loss, results once, reset and two-player independence. Files: `src/games/shapeup.ts`, overlay/rules files and tests.
4. Smash: animate robot arrival and collision gating; add pooled approaching destructible objects with visible hit/break animation, per-player scores and recycling. Keep boss demolition. Test first arrival, no early hit, hit once, debris, rebuild and two-player isolation. Files: `src/games/smash.ts`, focused wave helper/test and boss browser fixture.
5. Integrate: source-identical temp copy, check/build, focused controlled-landmark playthroughs, setup regression, standard web-game client and screenshot inspection. Review final diffs, fix material findings, update progress, commit/push same preview branch and confirm Vercel READY for the exact SHA. Do not merge or promote production.
