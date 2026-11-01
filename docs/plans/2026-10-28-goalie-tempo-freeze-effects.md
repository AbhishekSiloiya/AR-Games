# Goalie tempo and Freeze atmosphere implementation plan

**Goal:** Apply the user's approved final adjustments: Goalie100% ball travel50% faster; Freeze lights/smoke with the player bright and visible.
**Architecture:** Multiply competitive Goalie ball speed by1.5 (duration /1.5) after the existing stage/speed calculation; practice stays slow and score-free. Keep the existing slider/presets and stage drills. Add one lightweight procedural scene layer for slow moving edge spotlights and floor haze, explicitly masking the whole live-camera rectangle. Use Freeze's music-gated visual clock and effects/reduced-motion setting; no rapid flashing, external assets or dark overlay.
**Tech stack:** Existing TypeScript, PlayCanvas shader materials, Vite, Playwright.

1. Add an actual rules regression to goalie-settings.test.ts for the exact1.5 travel ratio across stages/speeds; run RED, update goalie-rules.ts, run GREEN and all220 attainable-star combinations.
2. Add freeze-studio-atmosphere.ts; integrate with freeze-studio-scene.ts, expose clock/enabled diagnostics. Procedural soft beams and drifting low haze around the stage edges/floor; camera rectangle stays completely transparent. Freeze and pause share the existing stopped visual clock. Effects off/reduced motion removes the new layer.
3. Extend focused Freeze browser checks for actual atmosphere movement/stop, effects off, reduced motion and preserved camera; inspect dance/stop/tablet screenshots. Run Goalie difficulty and focused gameplay checks sequentially, full unit/type/build and standard game-client capture.
4. Read-only focused review, fix material findings. Sync reviewed exact files to codex/moon-freeze-studio, update draftPR5 and its preview; no production promotion.
