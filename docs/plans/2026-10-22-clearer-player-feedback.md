# Clearer player feedback and action

User feedback: Sprint static/no player, Forge model poor, Beat unclear shapes, Shape Up needs actual camera not stickman plus better timer, Smash destruction hard to see.

Evidence: Sprint model was explicitly hidden and scene drive depended entirely on detected steps. Forge used disconnected primitive limb shapes. Beat labels existed only in a shared next-move hint. Shape Up represented player with a miniature skeleton over a synthetic backdrop. Smash detached armour briefly but left the whole robot standing after core defeat.

Implementation:
- Reuse authored animated robot.glb from Run for Sprint and Forge; keep exercise-derived scoring. Add slow ambient scenic movement independent of score, accelerate visuals from actual running.
- Label every Beat cue with a plain action and timing; persistent move legend, pooled UI and scene cleanup; do not change chart timing/scoring.
- Shape Up defaults to full mirror camera, target coach cards and circular per-pose timer/match feedback. Remove actual-player skeleton. Preserve durations and independent scores.
- Smash plate splits and associated robot sections eject; debris tumbles/lands as scrap, final core blast dismantles remaining body and adds shockwave. Keep contact rules and scoring.
- Pure projectile test + controlled-landmark browser checks demonstrate movement, per-note labels, live pose view and visible destruction through complete fight. Check build, resource cleanup, solo/two players and review before publishing preview.
