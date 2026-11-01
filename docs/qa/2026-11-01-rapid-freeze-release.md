# Immediate Jack fire and Freeze live feedback — 1 November 2026

## Controls and behavior
Normal fire is one immediate shot on the first observed low-to-raised hand sample. Lower and raise again for another shot, with no normal dwell/cooldown. Held normal hands do not repeat. The purple ship with gold ring/bolt grants its actual hitter five active seconds of held-hand automatic fire, bounded to about eight shots per second per hand. The pickup refreshes rather than stacks duration, is awarded only on real destruction, and never leaks to a rival player/sector. Existing earned Starfall is separate. Pause/stale/hidden/reacquired controls retain deliberate lowering before another shot.

Top attack countdown derives from the actual first live ship's remaining arrival and descent to its dive line. Descent and prediction use the same speed helper. Diving shows ATTACKING; empty waves show their actual rest countdown. It freezes with gameplay.

Freeze adds movement-earned confetti and observed wrist/ankle status directly inside the existing bright live-camera view. Green requires the actual named match, eligibility, no global wobble and fresh observed joint stability. Wrong/missing/stale poses cannot earn false green. No score or difficulty rules changed. See companion Freeze report for mapping and evidence.

## Verification
- RED then GREEN: original input delayed first-frame shot; new input tests pass at15/30/60/120fps, independent raises, rapid physical movements, held boost/expiry and loss/rearm. New missing rapid helper RED, then capped duration/formation/countdown GREEN.
- `npm run check` — PASS all rules and TypeScript, including both new suites. `npm run build` — PASS; final copy changes rebuilt. Existing engine chunk-size advisory remains.
- `tools/test-jack-immediate-rapid.mjs` — PASS with actual app/injected tracking. First-frame projectile near the visible muzzle, no launch score, actual impact and marked-ship pickup, bounded held rapid, five-second expiry, normal held behavior, actual countdown, paused snapshot equality, versus ownership, 1024/640 paired layouts and teardown. A first fixture run tried to advance immediately during the existing150ms resume guard; fixture now waits for that real safety guard, with no runtime relaxation.
- `tools/test-jack-aiming.mjs` — PASS compact pilot (26.54% of playing height), forward/side/high controllers, shared visible marker/muzzle direction, missing wrists, first-frame real contact and compact layout. Obsolete settle-before-shot assertion deliberately replaced to match the user's correction.
- Installed standard game Playwright client — two real lower/raise bursts, two shots without pickup, state/screenshots inspected, no errors.
- Freeze focused browser/rules suite — PASS dance rewards inside video, amber-to-green, wrong named pose, missing ankles, stale receipts, pause equality, paired/reduced-effects essential status and cleanup. See `2026-11-01-freeze-live-feedback.md`.
- Independent read-only review — no blocking P1/P2 findings in immediate input, pickup ownership, countdown, pause/expiry and Freeze mapping/freshness/status.

Evidence remains local under `test-results/jack-immediate-rapid`, `test-results/jack-aiming`, `test-results/rapid-standard-client`, `test-results/freeze-live-feedback`; relevant screenshots were opened and inspected. Browser tests use deterministic pose injection and the fake camera. They verify game logic and actual rendered contacts, not real-camera latency or physical comfort. No other games, artwork or dependencies changed.

## Integration
Based on master769ecdcd95031fabe1aa60b6a94fe03f90825524, branch `codex/moon-rapid-freeze-ar`. User authorized merging when checked. Preserve the personal checkout and character assets; only the explicit code/test/docs manifest is copied into the attached worktree.
