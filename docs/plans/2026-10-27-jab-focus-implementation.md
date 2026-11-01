# MOON Jab Production Implementation Plan

> For implementation: use superpowers:executing-plans to execute the tasks with verification at each gate.

**Goal:** Deliver one polished Jab round with original Rizzquake and a clean sports presentation, then evaluate it before extending the approach to other games.
**Architecture:** Keep existing PlayCanvas/MediaPipe and round ownership. Replace only Jab's raster coach with a rigged actor whose mitts and gameplay targets share coordinates. Separate gameplay contact/scoring from authored animation and camera presentation.
**Tech Stack:** TypeScript, PlayCanvas, MediaPipe, existing browser test harness, optimized GLB assets and a character-authoring tool.

Design: 2026-10-27-jab-focus-design.md.
Status: Tasks 1–5 implemented and verified for the first playable prototype; Task 6 preview publication follows. Hardware measurement and user visual acceptance are still open. The original mesh is reproducibly authored by tools/build-rizzquake.py. Runtime uses procedural IK and expressions; embedded clips are reference data, not played animations.

## Task 1 — Production character motion proof

Create:
- public/assets/moon/jab/rizzquake.glb
- public/assets/moon/jab/CREDITS.md
- src/jab-actor.ts
- tools/test-jab-actor.mjs

First author or obtain a faithful rigged model with ready, left/right present, contact/recovery and celebration clips. Preserve output/characters/rizzquake.png.
Inspect source licence, joint hierarchy, deformation and textures. Do not proceed with a mesh that only resembles a green generic mascot.
Create a minimal development-only motion proof before replacing gameplay. Make the proof show actual mesh/bone changes, not merely an advancing animation clock.
Verify mitt anchors and actual mesh deformation in at least ready, extended reach, recoil and celebration. Measure load, triangle/draw cost and frame rate on the selected tablet. If this fails, revise the asset rather than adding effects.

## Task 2 — Shared mitt/pattern rules

Create:
- src/jab-pattern.ts
- src/jab-pattern.test.ts
Modify:
- src/games/jab.ts

Write failing pure tests first for current-target hand, plausible reach, pattern advance once per contact, recovery delay and consistent combo credit.
Use one authoritative mitt pose/target per hand. Suppress punch instructions during a duck challenge. Schedule the next action after recovery rather than allowing arbitrary concurrent targets.
Keep stage difficulty and existing two-seat ownership explicit. Track actual contact and rearm; do not award a held glove repeatedly.
Run node src/jab-pattern.test.ts, then existing checks from the local dependency copy. Commit only after tests pass.

## Task 3 — Connect actor to actual gameplay

Modify:
- src/jab-coach.ts
- src/jab-coach.css
- src/games/jab.ts
- src/jab-actor.ts

Replace Jab's mascotPuppet import only after Task 1 passes. Share target coordinates with the actor's mitt anchors.
Have round events trigger presentation/contact/recovery/celebration states. Make pause, tracking loss, unload and restart stop/reset the actor correctly.
Use a Jab-specific glove coordinate map suited to the lower centered coach; preserve fresh tracking with no additional smoothing queue.
Leave shared mascot code and the other five games untouched.

## Task 4 — Arena, cue and sound

Create:
- src/jab-arena.ts
- src/jab-session.css
Modify:
- src/jab-coach.css
- src/games/jab.ts
- the Jab entry in src/moon-catalog.ts if final instructions change

Use real scene geometry/lighting for foreground action and shadows; the concept frame is reference only. The first prototype uses a separately generated empty pavilion backplate for distant architecture, plus a real shadow-catching mat, dynamic lighting and rigged character. This is a deliberate hybrid, not a fully modelled venue. Establish a lightweight light/shadow approach from measured tablet performance.
Show one action headline, a compact upcoming pattern and clear contact feedback. Keep camera inset unobstructed.
Use original/current licensed sound sources, synchronize contact transient and recoil, and leave headroom above the music.
Avoid changing global fonts, lobby, other game music or shared effects as part of this focused pass.

## Task 5 — Actual-input and layout verification

Create:
- tools/test-jab-focus.mjs
Update:
- Jab assertions in tools/test-motion-feedback.mjs and tools/test-playable-worlds.mjs only if the old implementation selector is removed

Exercise actual glove travel into the mitt, repeated hold, wrong hand, missed target, cross, duck, combo completion, tracking loss/recovery, pause/resume/restart, exit during model load and two-player ownership.
Capture ready, presentation, contact, recoil, duck and results at laptop and Android landscape sizes; inspect the images, not only state fields. Test reduced motion and low-effects mode.
Run the standard develop-web-game action client and inspect screenshot/text output and console errors.
Run npm run check and npm run build on a source-identical local temporary copy; Google Drive dependency reads have previously stalled.

## Task 6 — Focused preview and learning

Publish a separate preview only after the implementation/test gates pass. Do not merge/promote production as part of a visual-direction decision.
Run the physical MacBook/Android playtest from the design brief. Record latency, frame rate, understood actions, misses, replay choice and user feedback.
Document what worked and what needs changing before choosing the second game. Do not start simultaneous redesign of all six.


## Implementation evidence and limits

- Original skinned GLB: 33,920 vertices / 61,628 triangles / 22 nodes / 11 material groups, approximately 2.6 MB. Generated neutral wool texture and empty pavilion WebP are credited with prompts.
- Pure rules/IK tests and binary rig validation cover current-hand gating, wrong-hand rejection, speed/rearm, four-hit combo credit, duck precedence, absent-seat grace, fixed limb reach and planted crouch feet.
- Browser tests exercise actual GPU skin changes, target-aligned hand travel, earned hit/combo/duck scores, pause, tracking recovery, full round/results, two-player ownership and tablet/small-landscape layouts. Pixel assertions check arena UVs/orientation.
- Initial shared six-game regression revealed a pre-existing Goalie fixture timing dependency. Isolated Rapier reproduction showed the speed-8 shot could rebound and lose its manifold before a multi-substep frame was sampled. The smoke fixture now uses a real speed-3 shot, which retains physical contact across all four permitted substeps. No Goalie game source changed; brief-contact sampling at low fps remains an existing limitation.
- Not yet measured: physical camera latency, selected tablet frame rate, comfort and voluntary replay. Not a launch-ready or target-fidelity claim.
