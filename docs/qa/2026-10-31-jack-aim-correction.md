# Jack-only compact pilot and aiming correction

Based on 9bee358. User clarified the pilot must be much smaller and camera-forward reaches must keep the weapons visible and aim predictably. Other games unchanged.

## Root causes and changes
- Measured prior visible body at 51.2% of playing height. Solo scale 1.08→0.56 and paired 0.88→0.46 reduce the observed neutral body to 26.5% solo, leaving fleet room.
- Existing rig stores only projected 2D joints. Short projected segments were normalized into arbitrary bone rotations; shoulder-to-model-wrist aim also differed from player intent. A Jack-only observed wrist-to-court mapping now drives target markers, foreground gauntlet direction and actual travelling shots. Short segments get a stable bend. Gauntlet depth is in front of all body meshes.
- Camera-forward/chest-height hands can aim and shoot; no overhead lift required. A 140ms steady aim commits once after loading low; hand movement resets the pending shot. Marker expansion shows that same hold progress. Stale/missing/pause/long-gap observations require a new load.
- Court marker range includes low approaching ships. Ship timing and campaign economy are unchanged. Inputs and targets remain per-hand/per-player; Starfall remains earned.

## Verification
- RED: old rendered body measured 51.2%, failing the under 28% limit. New actual rendered body 26.5% passes.
- RED: shoulder-height forward reach did not fire; gradual reach fired before the final aim. New input tests pass shoulder-height, deliberate settling, no held repeats, independent hands, confidence, missing/stale/pause/long-gap and gradual motion at 15/30/60/120fps.
- Browser aiming suite passes real skinned forward/left/right/high poses, weapon depth in front of the entire body, observed-controller visibility, marker/muzzle direction agreement, missing-hand hiding, compact 640px view and a gradual reach followed by an actual travelling hit.
- Commander regression uses a focused real encounter: actual eight-hit health must reach zero, distinguishing a kill from a shield-breach removal. Powers and multiplayer run their own normal-length rounds; no artificial hit/score values.
- Final Jack gameplay regression passes actual ship hits, eight-hit commander defeat, earned jump/no-jump powers, no self-recharge, frozen paused projectiles, independent paired power, rival-sector isolation, reduced motion, layouts and teardown.
- Full rule/type checks and production build pass. Existing bundle/worker warnings remain.
- Independent review found early firing during gradual raising; steady-aim commit resolved and re-reviewed with no further material findings.

## Limits
Browser fixtures prove the rendered input-to-marker-to-shot/contact path. They do not measure physical camera comfort. The 2D pose pipeline does not provide forward depth; this intentionally uses an explicit screen aim controller rather than claiming 3D motion capture. No other game update or production merge.
