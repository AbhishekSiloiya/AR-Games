# Freeze live-camera feedback — 1 November 2026

## Behavior and scope

Small transparent rings now follow the actual player's wrists (15/16) and ankles (27/28) inside the unfiltered live-camera rectangle. The existing pose body coordinates are already mirrored; the mapping uses them directly, without a second flip, and respects the video's actual aspect/rectangle. White-backed amber rings show movement or a pose that still needs adjustment. A green ring/check needs fresh camera receipt (within 200 ms), visible/confident joints, player presence, earned dance eligibility, correct actual named pose, no game wobble and at least 0.2 seconds of observed joint stability. Missing or stale joints hide. Wrong named poses cannot show a fully green/frozen player. No skeleton, full-screen tint or camera shader change.

Fresh real dancing earns a small hand-positioned confetti burst inside the camera view, independently per player. This separate layer does not relax the partner effects' original camera-exclusion invariant. Freeze clears live dance charge/particles; pause leaves the current transparent feedback still with the existing game clock; reduced motion/effects-off preserve essential static status but disable decorative hand confetti. Round cleanup removes the SVG. No score, eligibility, match or hold state is written by this presentation layer.

## Tests

- `node src/freeze-live-feedback-rules.test.ts` — PASS. Missing-module RED observed before implementation, then GREEN. Covers direct mirrored rectangle mapping; observed stable/correct pose; wrong pose, stale and missing joints; independent dance rewards; essential reduced-motion status.
- `node --check tools/test-freeze-live-feedback.mjs` — PASS.
- `./node_modules/.bin/tsc --noEmit` — PASS.
- `tools/test-freeze-live-feedback.mjs` — PASS against isolated local Vite 5221 at 640×360. Verified actual pose-energy inputs earn live-camera hand confetti before Freeze, old partner camera exclusion stays true, amber-to-green actual pose/joint stability, wrong named pose, missing ankles, stale receipt, pause snapshot equality, round cleanup and independent paired reduced-motion status. Screenshots `dance-hands.png`, `wrong-pose.png`, `steady-hands-feet.png`, `missing-feet.png`, `paired-reduced-steady.png` saved under `test-results/freeze-live-feedback/`; dance/steady/paired images opened and inspected. Paired foot text shortened to player number after visual inspection to avoid adjacent label overlap (copy-only).
- Browser and isolated server were closed after the suite. Camera source was the browser fake-camera green pattern, not real human footage. No image generation or new assets.

## Diagnostics

`window.__freeze.snapshot().camera.liveFeedback` reports independent `seats[].earned`, each ring's actual camera-normalized `x`, `y`, `status`, and active `particles`. Existing partner `camera.dance.cameraExcluded` and scoring diagnostics are preserved.

## Manifest

- Modified `src/games/freeze.ts`
- Added `src/freeze-live-feedback.ts`
- Added `src/freeze-live-feedback-rules.ts`
- Added `src/freeze-live-feedback-rules.test.ts`
- Added `tools/test-freeze-live-feedback.mjs`
- Added `docs/qa/2026-11-01-freeze-live-feedback.md`

No assets, shared engine, main menu, catalog, package scripts or scoring rules changed. No commits/deployments. Physical-camera visual alignment remains a real-device acceptance check after deterministic mapping and injected-camera-input tests.
