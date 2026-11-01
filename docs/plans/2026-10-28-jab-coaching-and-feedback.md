# Jab coaching and feedback pass

User approved all five proposed upgrades: punch feel, guided practice, stage-specific combinations, reach settings, and response/accuracy results. Preserve the additional 30% mitt size and 32% outward spacing in Full stretch. Work remains on the isolated Jab preview branch.

1. Add pure rules/tests before implementation for distinct stage action sequences, comfort target reach, score-free practice hit/duck/timeout progression, and resolved-pad accuracy/active-clock cue-to-hit timing.
2. Add persistent Full stretch/Comfortable reach and optional 15-second practice controls to the Jab briefing. Full remains default; first use offers practice, which can be skipped. Small existing React/CSS components only, no dependencies.
3. Run left/right/cross/duck practice with the same tracking, actual mitt contacts and fixed-limb actor. Per-seat practice progress, no score or stats, pause/dropout handling, then clean states and a new normal countdown.
4. Route stage patterns through one authoritative action sequence for cues and collision. Keep existing scoring/round length/finale; enrich physical compression, recoil and local two-layer punch audio without camera shake or input delay.
5. Results show successful/resolved pad targets and average cue-to-hit time, excluding practice/duck challenges and paused time. Reach choice is labelled. Browser verification covers first-use controls, persistence, practice/skip/reset, both reach presets, new stage sequences, real hits/metrics, pause, two players and cleanup. Verify type/unit/build, inspect captures, read-only review, then publish to existing PR #3/preview only.

Accuracy is target completion, not a claim of biometric precision. Cue-to-hit uses active game time, not a laboratory reaction measurement. Physical-camera comfort/latency remains hands-on acceptance.

## Verification

- Full unit/type checks and production build pass. Existing PlayCanvas worker externalization and bundle-size notices remain.
- Focused browser flow passes optional practice contacts and duck, pause, skip/timeout and fresh countdown, saved reach controls, correct-hand contacts, scoring, final-ten bonus, all five scenery/music/drill cues, metrics, responsive layouts and cleanup; no browser errors.
- Dedicated paired-practice coverage verifies each player's progress and score isolation before and after skip.
- Character proof verifies actual GPU joint deformation, wider outer reach, fixed feet during reach/crouch, impact and celebration. Standard web-game client renders the proof scene with finite state and no errors. Captures inspected for practice, briefing, results and two-player framing.
- Read-only review found a mid-combination cue mismatch at the warm-up boundary. Actions and dots now share a frozen per-combination selection timestamp, covered by a regression test; reviewer verified the fix and reported no other material issues.
- Hands-on camera comfort, perceived punch feel, audio balance and tablet frame rate still require device play. Preview only; no production promotion.
