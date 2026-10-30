# Jack Attack: energy gauntlets and Overdrive implementation plan

**Goal:** Make firing readable and satisfying, add an earned motion-triggered barrage, and address the reported flare without masking it by disabling effects.

**Architecture:** Retain the accepted 3D Rizzquake/orbital court and round economy. Larger pilot wears modelled gauntlets; bounded travelling projectiles resolve real swept collisions. Sparse mixed-shape waves enter visibly from different directions. Each player charges an independent ability through normal hits, then deliberately triggers it with a small jump or a one-second both-hands-high hold. Power cannot charge itself. Keep existing time, shields, boss health and team/versus ownership.

**Tech stack:** TypeScript, PlayCanvas, React, Node assertions, Playwright.

## Tasks

1. Write failing pure tests for swept projectile contact, sparse formations and earned power: no passive charge, no stale/absent/pause activation, neutral arming, once-only trigger, alternate gesture, no feedback recharge.
2. Implement jack-combat.ts and jack-power.ts. Add a modelled wrist gauntlet with a real local muzzle, independently pulsed firing feedback and a larger pilot. No full-screen flash.
3. Update jacks.ts to use visible projectiles, distinct drone geometries, staggered side/top entries and per-player charge/barrage. Score only actual contacts, consume power once, preserve sector isolation, clear all pools on teardown.
4. Update the concise HUD/three-step briefing and local synthetic proof. Add focused browser coverage for actual muzzle/projectile movement, collisions, entry gaps, earned barrage, pause/dropout, pairing and reduced motion.
5. Independently investigate the screenshot flare with CameraFrame/bloom forced active in the test; compare fresh Goalie and Slice→Goalie/Freeze. Fix only evidenced unsupported material/render state, preserve bloom and goal-net animation, and verify shader warnings/pixels.
6. Replace the obstructive recovery modal with a compact framing strip and accurate missing-joint hint. Retain every loss/pause/recovery gate; use a small live framing thumbnail where the paused GPU scene cannot show current positioning.
7. Integrate and run unit/type/build checks, focused gameplay and bright-render regressions, shared transition/layout checks, standard client screenshots and independent review. Publish a separate preview/draft PR based on cce7f333c41d83224b27a983535fe9a178d050bb. No production promotion.

## Acceptance limits

Browser fixtures can establish real game state and rendered effects, not the subjective 10/10 score or physical camera comfort. Report whether the hardware-sized flare itself is reproduced, separately from confirmed shader warnings/material fixes.
