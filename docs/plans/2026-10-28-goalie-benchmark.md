# Goalie benchmark implementation plan

**Goal:** Deliver one polished 60-second Goalie round matching the response, character quality and clarity of the user-approved Jab benchmark. Preserve Jab and the deliberate right-hand menus. Preview only.

**Approved direction:** User accepted Goalie next: reliable gloves/saves, Rizzquake actively taking shots, polished stadium, ball/net reactions and sound, practice and comfortable reach. First prove one round before bespoke five-stage expansion. Existing stage choices retain the same first-pass environment with paced difficulty; do not claim five finished scenes.

**Visual thesis:** Bright premium sports-club stadium, tactile cream/teal equipment, uncluttered pitch and large readable cues, with the same original skinned Rizzquake character as an active striker. Distant architecture is a generated backplate; foreground goal, turf, ball, gloves, character, shadows and reactions render in real time.

**Content plan:** Briefing: three moves, reach/practice; play: one shot at a time, direction cue, score/time and earned save streak; results: save rate, best streak and reach. Keep the actual player's live inset.

**Interaction thesis:** Character anticipates and kicks; ball accelerates toward a shrinking aim ring; a glove produces immediate compression, visible fieldward deflection and a restrained save confirmation. Misses hit a visibly deforming net. No camera shake or extra hand smoothing queue. Reduced motion removes secondary flourishes.

## Tasks

1. Add failing pure-rule tests for moving-sphere contact over the full frame, fast crossings, missed/wrong lane/absent gloves, once-only save/miss scoring, replays, practice isolation and target reach. Implement deterministic arcade ball flight with continuous relative glove/ball sweep rather than sampling a Rapier contact only after multiple substeps. Keep the visual and hit-test coordinates identical. The ball's visible deflection is an explicit arcade response, not a claim of full rigid-body simulation.
2. Build the stadium backplate plus real-time turf/goal/net; animate the existing original GLB via leg/arm/spine joints for wind-up/kick/reaction. Build keeper gloves and a panelled spinning ball. Use only original/user-provided assets; record the generated backdrop prompt/provenance.
3. Integrate one authoritative per-seat shot state with optional score-free practice (up to12 seconds) and a fresh countdown, comfortable/full reach, pause/loss handling, readable directional cues, save streak rewards and results metrics. No automatic points for a post/net rebound or missing player. Preserve two-player isolation and scene cleanup. Existing stage selection controls pace only in this initial pass.
4. Browser-test actual glove/block/swat contacts, visible kick/deflection/net response, missed shots, fresh tracking, practice reset, pause, results/replay and two players. Inspect gameplay captures, GPU skin animation and text state; run unit/type/build plus menu/Jab regression as affected. Read-only review and publish a dedicated preview/draft PR. Do not merge/promote production.

## Acceptance limits

Synthetic pose tests establish behavior and rendering, not physical camera comfort or device performance. User judges whether the first round reaches the Jab benchmark before bespoke stage scenarios. No unearned 10/10/launch-ready claim.

## Verification and review

The pure sweep tests reproduced the old fast-contact failure mode before implementation. Focused browser checks cover held/moving glove saves, skinned kick/GPU palette changes, practice reset/skip, missed-shot net response, save-rate metrics, pause and no credit for paused hand travel, both reach presets, independent two-player scoring, responsive layouts and cleanup. The six-game smoke passes all existing scenes/outcomes and paired/tablet layouts; no browser errors. Standard web-game client scene/state and captured gameplay/results inspected. Full unit/type/build pass with existing worker/bundle notices.

Review caught stale pre-pause glove history and unreachable higher-stage star targets. Both are fixed with browser/rule regressions; all20 stage/player/reach combinations can reach three stars. Jab progression remains unchanged. The compatibility fixture uses actual glove contacts rather than removed rigid-body internals. Initial image/material colour mismatch was fixed and protected by a daylight pixel assertion.

The first-round scene is ready for hands-on comparison with Jab. Physical comfort, camera lag, tablet performance and subjective punch/save sound balance cannot be established by synthetic landmarks.
