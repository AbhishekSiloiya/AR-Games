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

User feedback revision: make positioning quick and forgiving.
- Removed the movement demonstration, target silhouette, and exact return-to-start pose.
- About 900 ms of usable natural-standing tracking auto-starts; 350 ms dropout grace prevents flicker from restarting setup. A manual Start game button is available when essential tracking is usable.
- Wider framing and lower landmark-confidence threshold; head/elbows are advisory rather than blocking. Recovery checks torso stability for one second.
- Live Slice uses conservative shoulder-based reach estimates; finale targets also follow each player's position.
- Original Google Drive dependency reads stalled; verification ran on an identical temporary source copy at /tmp/ar-games-quick-test with freshly installed locked dependencies.
- npm run check and npm run build passed. Updated browser suite passed all 17 routes, relaxed off-centre auto-start, manual start, missing-essential and full-body foot blocking, pilot views, recovery and two-player readiness with no console errors. Screenshots inspected. Independent review has no P1/P2 findings.

User feedback revision: game-specific identity and player styles.
- Approved: live camera + disco gear for Freeze; full animated space ranger for Jack Attack. Slice gets ninja gauntlets; Goalie gets keeper gloves/panelled football/stadium; Wipe gets foamy cleaning sponges and a spaceship window.
- Slice and Freeze use fitted live mirror views. Goalie/Wipe retain their perspective/body-relative controls with a live player inset. Jack Attack uses a rounded articulated astronaut with compact visual proportions; exercise detection retains original landmarks.
- Removed cut-out controls and normalized legacy camera cut-out preferences. Classic choices remain for live-view games. Freeze's live HUD moves down to leave the face clear; gameplay diagnostic stick figure is hidden.
- Pure helper tests cover gear motion/camera alignment/head loss and ranger articulation/proportion isolation. npm run check and npm run build pass on source-identical /tmp/ar-games-quick-test; existing bundle-size and PlayCanvas worker warnings remain.
- tools/test-game-identity.mjs passes five themed scenes, active football rendering, live insets, lost-head/recovery, ranger movement and two-player ranger/disco scenes with no console errors. Screenshots visually inspected. A reserved GLSL identifier caught in the first run was corrected and active-ball rendering verified.
- Full 17-route setup regression passed after the visual pass. Final compatibility rerun also passed: seeded a legacy cut-out preference and verified migration alongside setup/loss/recovery/turn routing.
- Independent final review found no P1/P2 findings. Standard web-game client ran; its state output shows the home screen. The focused fake-camera suites supply gameplay coverage using controlled landmarks.
- Hardware acceptance remains: real camera accessory fit during fast motion, two-player readability and Android/iPad frame rate. Browser fixtures use synthetic camera/landmarks and cannot establish physical accuracy.
- Smash demolition/gear and bespoke difficulty-stage design are later phases; current scoring/difficulty rules are unchanged.

Playability refresh from hands-on user feedback:
- Slice removed gauntlets; restored lightweight glowing hand highlights/trails. Jab now has rounded boxing gloves.
- Leaks uses a suited diver and Forge a smith character. Original contact coordinates remain unchanged. Sprint uses a single-draw scenic mountain/river trail with looping trees, flying birds and original synthesized birdsong; the shadow runner is hidden and the actual player appears in a live tracking panel.
- All non-camera games now have an optional live camera/tracked-joint panel (15 fps paint cap); mirrored Slice/Keepy/Freeze keep full camera views.
- Jack Attack uses per-hand raise/lower/rearm and aimed shots without jumping or foot visibility requirements. Helper tests cover no hold-repeat, independent hands, dropout, aim and ray targeting.
- Shape Up removed the approaching wall; per-pose timer/progress, top-right live pose figures, compact simultaneous two-player layout and independent scores/streaks added. Freshness/absence scoring guarded and pure helper tested.
- Keepy starts with more balloons and introduces bouncier striped beach balls. Visual review caught recursive tint overriding stripes; corrected with separate round-owned sphere surface and single-draw striped ball material. Jack beam colour now uses the correct glow shader uniform.
- Freeze accessories updated to angular chrome shades, slim luminous headset and crystal earrings. Two locally hosted CC0 recordings selectable in setup (Fupi and wipics; credits/source URLs in public/assets/music/CREDITS.md). Synth fallback retained. Pulse/Beat timing music unchanged; Beat gains disco floor, moving beams and mirror ball.
- npm run check and npm run build PASS on source-identical local temp copy. Browser setup regression PASS all 17 routes, quick/manual start, tracking loss/recovery, two-player readiness and turn routing. tools/test-playability.mjs PASS ten revised game scenes, feet-free arm shot, guided insets and two-player Shape Up with no console errors. Screenshots inspected including corrected ball stripes, solo/two-player pose layout and scenic track.
- tools/test-dance-audio.mjs PASS both recordings' decode, silence/resume gating, pause/resume clock and stop cleanup. Initial timeout was an instrumentation issue caused by Vite-versioned module contexts; prototype-level spy verified the actual recording context.
- Standard web-game client ran and screenshot/state inspected; focused controlled-landmark suites cover gameplay. Pure checks include arm-shot and shapeup rules. React review and independent code review complete; actionable material/beam findings resolved.
- Real MacBook/tablet acceptance still needed for tracking lag, accessory style/fit, ambient sound balance and comfortable two-player framing; fake camera tests cannot validate those.
- Smash awaits concept choice; recommended robot demolition pitch documented below. Branding suggestion VYRA (Virtual You. Real Action.), alternatives MOVA and KIRA; no app rename until selected.

Smash robot demolition selected and implemented:
- Replaced crate/Rapier arena with a scrapyard robot, six detachable armour plates, damage cracks, moving weak-spot guide and protected pulsing core. Marked plates take double damage; any intact plate accepts a deliberate punch for forgiving contact.
- A 45-second round supports one or two independent robots/scores, demolition bonus, short celebration and tougher rebuild. Five stages increase durability. Lightweight hand glows and live tracked-camera inset retained.
- Pure demolition tests pass: locked core, weak-spot damage, no repeated score, defeat, stage scaling and punch rearm. Review caught early swing consumption; swing now remains available during travel and is consumed only at actual contact, with a multi-frame regression assertion.
- npm run check/build pass on source-identical /tmp/ar-games-quick-test. tools/test-smash-boss.mjs passes protected core, maintained-speed travel-to-contact, one impact per swing, all six plates, core defeat, tougher rebuild, two-player score isolation and live inset, with no console errors. Final gameplay screenshots inspected. Standard web-game client also ran and screenshot/state inspected.
- Independent review confirms no remaining P1/P2 findings after contact fix. Existing bundle/worker warnings unchanged. Physical punch sensitivity and tablet frame rate still require user hardware feedback.

Clearer player feedback and visible action (22 October):
- Sprint now shows the authored animated robot from Run: real knee lifts drive running animation, cadence and distance; slow ambient scenery movement keeps the trail alive without awarding idle score.
- Forge replaces the primitive smith with an authored robot blacksmith. Squat depth samples its sitting animation; successful forging plays a punch. Feet framing corrected after screenshot inspection.
- Every Beat note now carries its action and timing; a persistent five-move legend and per-player next/now cues clarify the white timing line. Chart/scoring unchanged.
- Shape Up defaults to full live mirror camera with compact target-pose cards, match feedback and circular per-pose countdowns. Actual-player stick figures removed; solo/two-player scoring and Classic fallback retained.
- Smash plates split into shards and associated body sections visibly fly off, tumble and land as scrap. Core defeat adds embers/shockwave and fully dismantles the body; rubble remains before the tougher rebuild. Rotated piece extents respect the scaled floor. Celebration text separated after visual review.
- Model-loader cancellation guards prevent attaching characters or registering materials after leaving a scene. New UI overlays clean up on exit.
- npm run check/build PASS on source-identical /tmp/ar-games-quick-test; new pure wreckage tests include large rotated torso floor support. Existing PlayCanvas worker/bundle warnings remain.
- tools/test-player-feedback.mjs PASS: cold-load cancellation, authored runner, idle drift without score, knee-driven run/metres, Forge squat, every-note Beat labels/legend, full-camera Shape Up, circular timers, two-player cameras/cues and cleanup; no browser errors.
- tools/test-player-setup.mjs PASS all 17 routes, quick/manual start, missing joints/feet, tracking recovery and player modes. Full Smash boss browser suite PASS complete disassembly/core embers, contact/scoring, rebuild and two-player isolation. Gameplay screenshots inspected. Standard web-game client ran and home screenshot/state inspected; controlled-landmark fixtures supply gameplay coverage.
- Final independent reviews found no material issues after loader/floor fixes. Real camera fit, physical responsiveness, two-player comfort and Android/iPad performance remain hardware acceptance work.

Responsive motion, large cues and incoming targets (22 October):
- Sprint's first knee lift previously returned zero cadence; a second speed smoother and unrelated running loop added delay. The avatar now copies current knee heights into cached authored thigh/shin/arm joints each frame. Distance pays once per lift edge; a held knee cannot coast for points, and motion stops within 160 ms after the tracking input stops changing. Existing jump/squat poses, heats, hurdles and player modes retained. Hurdle credit now requires fresh presence plus visible jump legs or raised hands.
- Beat instructions moved from each falling shape to a large fixed headline at the top for each player. Shapes are unobstructed and spawn below the instruction area; timing line, chart/audio timing and scoring retained. Immediate hit/miss feedback and compact move key remain.
- Shape Up locks a >=80% pose held for 300 ms, shows an explicit matched/partial/missing result for 1.2 seconds, then a 1.5-second Relax & reset countdown before the next pose. The live camera remains primary. Independent seats, one-time scoring and final results tested. Missing/off-frame/unreliable required limbs cannot lock or score; keyboard simulator remains supported.
- Smash robots approach from the background before becoming hittable, with idle motion and impact recoil. Pooled crates and drones warn, approach and become reachable side targets, then split into chunks for bonus points. Detached robot debris lives independently in world space; subsequent recoil does not drag rubble. Rebuild restores all parents/scales/pool state and brings in the next robot.
- Fresh npm run check/build PASS on source-identical /tmp/ar-games-quick-test, including new sprint-motion and smash-wave tests and expanded Shape Up phase/visibility tests. Existing worker/bundle warnings unchanged.
- tools/test-feedback-round2.mjs PASS large top Beat instructions, unobstructed shapes, tablet/two-player layout, rendered left/right knee changes on the first lift, fast stop/no held-knee score, Shape Up lock/limb-loss/result/rest/next transition, no repeated score, independent player feedback and cleanup. No browser errors. Final gameplay frames inspected.
- tools/test-smash-boss.mjs PASS actual hand contact during protected robot/cargo arrival, ready-target points/splitting, protected core, sustained-speed travel contact, one swing/impact, six armour plates, independent rubble, core blast, tougher rebuild with restored pool parents/scales, two-player scores and live inset. No browser errors; crate/drone and destruction frames inspected. The first cargo assertion was corrected to inspect cargo hit state because a swept hand can legitimately hit robot armour along the path.
- All 17 setup routes, tracking loss/recovery and player modes PASS. Standard web-game client ran and introduction screenshot/state inspected; focused fake-camera fixtures provide gameplay coverage. Cross reviews resolved limb-visibility and rubble-transform findings. No remaining material findings.
- Hardware acceptance remains: actual camera/inference latency and tablet frame rate cannot be established from injected landmarks. User should compare Sprint responsiveness on the new preview. Branch remains separate from master/production.

Scenic race, Pose Quest and camera-visible disco (22 October):
- User rejected Sprint's static-feeling precision control and requested stronger gamification/fun. Baseline reproduction showed Idle when no knee threshold fired; injected high knees did change the render skin, so the physical complaint was not proven to be a GPU failure. Replaced that design with a 45-second scenic star race and a visible authored Running loop. Fresh modest knee lifts, alternating arm pumps or body bounce earn distance; ambient jogging earns nothing. Stars fill turbo, checkpoints mark progress, and finish notes award a medal. Turbo expires rather than refreshing from its own extra stars. Updated game instructions and stage-1 score goals (40/80/120).
- Shape Up now has an eight-pose quest path, up to 24 collectible stars, independent player combos, bonuses at chains3/5/8, animated star rewards and a final medal/rank summary. Existing 300ms lock, result/reset pauses, live camera and required-limb guards remain. Tablet review found coach/progress overlap; moved two-player reference cards below the quest bar.
- Freeze now renders a transparent party layer ABOVE the camera: tiled disco ball, sweeping coloured beams, neon floor edge and success confetti. Ball/lights freeze with the music, turn cool blue and resume from the held position. Still players celebrate separately on resume. Existing audio gating unchanged. Decorative confetti and reward panels start hidden.
- Results count-up progress now clamps to0..1 after an initial-frame screenshot exposed a transient negative number caused by a frame timestamp preceding the effect's start time.
- Final npm run check/build PASS on source-identical /tmp/ar-games-quick-test. Pure additions cover forgiving jog sources/noise/duplicates/absence, movement-only race rewards, non-refreshing turbo, pose-star thresholds/combos/duplicate verdict/full24star quest, party motion hold/resume and separate once-only celebrations. Existing bundle/worker warnings remain. An accidental check in the Google Drive checkout was killed at tsc; the final complete check/build ran in the working local dependency copy.
- tools/test-party-quest.mjs PASS: actual renderer skin palette changes plus visibly different running frames, no idle score, knee and arm acceleration, stars/turbo, full race/medal, pose stars/once-only reward, three-pose combo bonus, full eight-pose Gold/24star results, live-camera ball/lights, frozen party motion, successful confetti, two-player/tablet views and cleanup. No browser errors; gameplay screenshots inspected.
- Focused final polish browser check PASS turbo expiry/re-earning, non-overlapping two-player quest/reference cards, initially hidden confetti, two independent Freeze celebrations and cleanup. All17 setup routes/tracking recovery/player modes PASS. Standard web-game client ran; introduction screenshot/state inspected. Main source and temp code/test parity verified before publication.
- Hardware acceptance remains necessary for actual tracking comfort, relaxed jogging sensitivity and tablet performance. Automated fixtures use injected landmarks and a synthetic camera. Keep preview isolated; no master merge or production promotion.
