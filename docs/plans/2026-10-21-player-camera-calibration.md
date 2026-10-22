# Player camera and positioning implementation plan

**Goal:** Add game-specific preflight positioning to all games and pilot live-player visuals in Slice, Keepy-Uppy and Run on an isolated branch.

**Architecture:** A pure calibration module evaluates fresh landmarks, framing and required movement. A shared React setup screen displays a mirrored camera, joint checks, a target outline and a stable-ready gate. The shell routes every round, replay and player handover through setup and freezes gameplay after sustained tracking loss. Existing PlayCanvas camera rendering is reused for Slice and Keepy-Uppy; Run uses a small live preview.

**Tech stack:** React, TypeScript, MediaPipe, PlayCanvas, Vite, Node assertions and Playwright.

## Approved design

- Universal setup, with upper-body requirements for Slice/Smash/Goalie/Wipe and game-specific full-body or squat requirements elsewhere.
- Show the real player, indicate missing joints and framing corrections, demonstrate reach or the required movement, return to neutral, hold for two seconds, then use the existing game countdown.
- Calibration stores the neutral standing baseline, not a fixed pose. Brief occlusions get a grace period; sustained loss pauses the game and requires stable recovery. Pause and resume never silently discard a round.
- Pilot live Mirror as the default for Slice and Keepy-Uppy, with a classic-view choice; Run retains its avatar and gains a live inset. Keep existing camera cut-out functionality available.
- Both simultaneous players must pass; turn handovers and replays recalibrate. Simulator remains explicit and does not pretend to validate a camera.
- Visual thesis: a bright camera workspace, cyan joint readiness, minimal large prompts. Content: game heading, camera and target, movement cue, readiness progress, back button. Motion: joint feedback, stable-hold fill, transition into the existing countdown.

## Execution

1. Add failing Node tests for per-game joint requirements, stale readings, framing, motion and readiness/loss timing. Implement the pure evaluator and gate; run tests.
2. Add tracker freshness and neutral-baseline capture. Build a reusable camera canvas and setup screen with movement and neutral phases. Wire all round entry paths and recovery into the shell.
3. Reuse camera rendering for the two flat-stage pilots, align Slice hit positions with the displayed wrists, add Run's live inset, and preserve a classic-view option.
4. Run existing checks, production build, simulator browser scenarios and synthetic-landmark setup/recovery scenarios. Inspect desktop and tablet screenshots and console output.
5. Commit and publish only the feature branch, open a draft PR against master and create a branch-specific Vercel preview. Leave master and the current live deployment untouched.

## Hardware acceptance

On MacBook and Android: camera permission, different camera aspect ratios, near/far positioning, full-body versus hands-only gates, reach/squat action, countdown, brief occlusion versus leaving frame, two players, turn handover, replay, camera/classic choice, and ten-minute tracking performance. Automated synthetic landmarks verify logic; they do not establish actual tracking accuracy.

## Automated browser check

Install Playwright locally for development (`npm install --no-save --package-lock=false playwright` and `npx playwright install chromium`), start `npm run dev`, then run `node tools/test-player-setup.mjs`. Alternatively set `AR_PLAYWRIGHT_MODULE` to an installed Playwright module. The script uses a fake camera, stops inference after startup and injects controlled landmark samples into the existing diagnostic handle. No real camera footage is recorded. Screenshots go to `test-results/player-setup` by default. Actual pose accuracy, segmentation quality and tablet performance require hardware acceptance.

The browser check also exposed inaccessible bottom-row games on shorter screens; the library now scrolls so all 17 games can be selected.

## Simplification after user testing

The first preview required too much precision. Replace movement demonstration and exact return-pose matching with a single natural-standing check. Accept broader framing and modest landmark confidence, treat head/elbows as advisory, and tolerate up to 350 ms of tracking flicker without restarting progress. About 900 ms of usable tracking triggers the existing countdown; a Start game button allows intentional earlier entry when essential tracking is valid. Remove the target silhouette so the user does not try to match it. Estimate conservative reach from shoulder width for live Slice. Recovery uses the torso rather than every moving limb and resumes after a one-second steady check.
