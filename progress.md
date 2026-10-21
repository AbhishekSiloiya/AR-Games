Original prompt: Apply the visible-player experience and guided game-specific positioning on a separate git branch for testing before merging.

- Branch: feature/player-camera-calibration, based on master a93c18b.
- Plan: docs/plans/2026-10-21-player-camera-calibration.md.
- Existing source has camera/mirror modes; Slice did not opt in to mirror and hands were mapped to body-relative zones.
- Current live Vercel project must remain unchanged; publish a preview from this branch.

Completed implementation:
- Shared setup routes for all 17 games, replays and turn handovers. Required joints depend on the game; movement check, neutral standing baseline and stable hold gate the countdown.
- Tracking receipt freshness, brief-loss grace, frozen gameplay/audio and steady recovery.
- Live mirror pilots for Slice and Keepy-Uppy; player cut-out option retained for solo Keepy-Uppy; live inset for Run; classic-view option retained.
- Slice camera input alignment, demonstrated-reach launch bounds and preserved body-relative swing sensitivity.
- Scrollable game library so all game cards remain reachable on shorter screens.

Verification:
- npm run check: existing math/exercise/rhythm assertions, new calibration assertions and TypeScript pass.
- npm run build: passes; existing PlayCanvas worker externalization and large-chunk warnings remain.
- tools/test-player-setup.mjs: passes all 17 setup routes, upper/full-body differences, movement + neutral hold, three live pilots, loss + steady recovery, manual pause/resume/home, two-player gate and turn-mode first setup. No console errors. Optional /report collector is stubbed; inference is stopped after fake-camera initialization and controlled landmarks are injected.
- Desktop/tablet setup and gameplay screenshots visually inspected under test-results/player-setup (ignored).
- Independent review: all actionable findings resolved; no remaining P1/P2 findings.

Remaining hardware acceptance: test real MacBook/Android tracking, segmentation quality, comfort and two-player performance. Full second-turn completion and results/replay timing are not accelerated by this browser fixture; routing is shared with the tested first-round setup.
