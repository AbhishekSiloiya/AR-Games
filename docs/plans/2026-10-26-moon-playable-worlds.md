# MOON playable worlds implementation plan

**Goal:** Close the gap between illustrated posters and actual play across all six shortlisted games; compress the home screen and make player identity quick and expressive.

**Architecture:** Preserve the existing camera, calibrated hands, game clocks, scoring and round lifecycle. Add round-owned raster scenery, animated image characters and earned feedback with deterministic game-clock updates. Keep the real player visible in AR games. Existing React shell owns a persistent identity picker; original scene modules continue to own collisions. Assets are original/generated and compressed for deployment.

**Tech stack:** React, TypeScript, PlayCanvas, DOM layers tied to game clocks, Web Audio, existing MediaPipe tracker.

## 1. Identity and compact playroom
- Create src/moon-profile.ts + test for avatar validation, profile metadata persistence, nickname validation and collision handling. Keep romp.v1 sessions compatible.
- Create src/player-picker.tsx/css: accessible dialog, character choices, optional nickname, guest/default, save/cancel, keyboard focus and local errors. No browser prompt.
- Modify main.tsx and moon.css: remove large returning-playroom hero, combine mode/profile strip, keep six launchers immediately discoverable. Existing slots/turns retained.

## 2. Art assets
- Inspect user workspace characters and supplied references. Reuse original workspace concepts non-destructively where suitable, derive clean transparent playable sprites and expressions via image generation.
- Create original galaxy, club, stadium and boxing raster world assets. Use meaningful animated layers; never present a new poster as the playable upgrade.
- Save generated assets in public/assets/moon/play; maintain prompts/provenance and verify alpha. Do not change untracked user output/ sources.

## 3. Independent game domains
- Freeze/audio: upgrade freeze-party.ts/css, moon-freeze.ts/css, games/freeze.ts, audio.ts/dance-music.ts. Animated host and strong club floor/light treatment above live camera; phase stillness and earned hold reactions preserved; new original layered club score, pause/gating/cleanup tests.
- Goalie/Jab: upgrade games/goalie.ts, games/jab.ts and supporting sport-world module. Stadium/arena atmosphere, readable telegraphs, reactions to actual saves/punches, stronger glove and pad presentation; no decorative score or changed collision mapping.
- Jack Attack: upgrade games/jacks.ts, space-ranger.ts and supporting galaxy module. Replace toy astronaut appearance with animated original character; moving nebula/planets/depth, distinct enemies, recoil/projectiles, wave/boss escalation; tracking freshness and aim/rearm unchanged.
- Root integration: Shape Up builds a visible constellation/portal from actual pose awards, animated host reactions and milestones while retaining match meter/reference/result/rest. Slice improves fruit/juice/earned combo visuals without added held gear or input lag.

## 4. Verification and preview
- Red/green pure tests for new state transitions and profile handling; appropriate full check/build in source-identical /private/tmp/moon-game-dev (Drive tsc is unreliable).
- No shared development-server source updates while browser suites run. Integrate independent domains before browser QE.
- Standard web-game action client plus synthetic camera tests: compact hub/profile save/reload/two players; all six actual starts, scoring/earned reactions, pause/loss/recovery and cleanup; Freeze audio gating; Shape lock/result/reset and independent players; Jack arm rearm and waves.
- Inspect actual in-game frames at laptop/tablet sizes, low effects and reduced motion. Fix visual/collision regressions. Independently review before push.
- Update existing preview branch and draft PR #2; confirm READY exact commit, no production merge.
