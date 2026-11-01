# Jack Attack and session polish — verification

30 October 2026. Base: `d869d9b6869ef5dfdc5ae3c04767e1d0ca949ace` (`codex/moon-shapeup-club`). Delivery branch: `codex/moon-jack-session-polish`. Preview only.

## Behavior

- Jack Attack uses the same skinned 3D Rizzquake identity as the accepted games. Its real arm/leg bones follow current tracking with no added animation queue. Missing lower-body input uses a planted stance.
- Raise either arm to fire in its direction, lower it to reload. A held, stale, absent or pause-resumed high hand cannot generate another shot. Beams originate from the visible hand.
- Smooth 3D drones visibly separate into nine parts on an earned kill. Existing wave clears, three shields, eight-hit commanders every third wave, five difficulty stages, shared team scores and independent versus sectors remain. Commander health appears beside each player’s own shields. Five stages still use the existing speed scaling; this pass does not claim five distinct authored worlds.
- Original orbital-court image is a backdrop. Character, drones, projectiles, parts, lighting and input are rendered separately. The exact built-in image-tool prompt and provenance are saved beside the asset.
- Round teardown closes cleanup registration, captures fitted-resource ownership before loading, cancels HUD animations/timers, resets transient frame/hit-stop state and rejects stale scene changes. Late assets cannot join another round.
- Briefing, setup, handoff and results fit laptop/tablet main screens. Game settings and full round notes/rewards remain available in explicit dialogs. Optional dialogs can scroll internally on very short screens; phone portrait below 600px retains readable scrolling.

## Evidence

- `npm run check` — PASS, including new Jack input and round-lifetime tests; full TypeScript passes.
- `npm run build` — PASS. Existing PlayCanvas browser-externalized worker and bundle-size notices remain.
- `tools/test-jack-focus.mjs` — PASS on development and separately on the locally served production build: actual GPU skin movement, earned hit/visible destruction, held/rearm, off-axis miss, stale sample, pause/resume, three normal/boss wave clears, two players, reduced motion, shared shield breach, results and teardown. No page errors captured. Unchanged instruction text is not rewritten/re-announced each frame.
- `tools/test-round-engine-lifetime.mjs` — PASS: closed cleanup registration, a real delayed apple model, immediate old-template disposal, stale ambient/fog and scene-specific end. The late-cleanup assertion failed against the prior engine before the fix.
- `tools/test-round-transitions.mjs` — PASS: actual Slice cuts while juice/score effects are active, then Goalie; repeat Slice then Shape Up; all six game starts/leaves. One current scene/handle while playing, none at home; old HUD animations cancelled.
- `tools/test-session-screens.mjs` with `AR_PAIR=1` — PASS: 120 screen checks across all six games at 1366×768, 1280×720, 1024×768, 768×1024 and 640×360, including long player names, mixed stars, editable settings, retained details and actions at least 44px high. Baseline overflow reproduced before the changes.
- `tools/test-playable-worlds.mjs` — PASS: six real scenes, Freeze earned holds/music stop, Jack hits/kills, Goalie save/miss, Jab combination, Shape Up earned pose, Slice cuts, paired tablet layouts, identity persistence and cleanup. No page errors captured.
- Standard web-game action client — PASS and screenshots/text state inspected in `test-results/jack-client-final`. Production and integrated layout/gameplay screenshots also inspected.
- Independent read-only review found no material gameplay, lifetime or integrated screen issues.

The user's exact ordinary-play overlap was not reproduced on the baseline. The reproducible baseline bug was late lifetime registration/ownership; the reported transitions pass with the fixes.

## Existing design alerts

The earlier `galaxy-stage.css` side-accent and `freeze-party.css` rounded-border alerts were reviewed against current source: the referenced galaxy sector has a uniform 1px border; the referenced Freeze world has no border. Both are legacy presentation modules, no longer used by these current games. No suppression was added, and those legacy styles were left unchanged. Current Jack uses its own scoped HUD.

## Remaining hands-on checks

Browser camera tests use Chromium's synthetic green video feed and injected landmarks. The green shapes/digits in screenshots are the fixture, not game overlays. Real movement latency, lighting tolerance, tablet thermal performance and subjective fun require playtesting on the MacBook and Android tablet.

The locked dependency install reports two existing high-severity development-tool advisories (`vite` and transitive `source-map-js`); package versions and lockfile were not changed in this gameplay pass. Address them in a separate development-tool update before wider release.
