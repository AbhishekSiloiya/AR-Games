# Playability refresh implementation plan

User-approved directions from hands-on feedback: remove Slice gear; improve Leaks/Forge player visuals; scenic Sprint with a real player view; arm-directed Jack Attack; gloves for Jab; fashionable Freeze accessories; pose timer + mini player and two-player Shape Up; universal tracked live inset in non-camera games; more Keepy balloons/balls; Beat disco floor/lights. Smash awaits concept selection. Branding options should be proposed without renaming yet.

Architecture: retain original camera/pose pipeline and existing feature branch. Add small game-owned visuals/helpers; preserve contact coordinates. Rate-limit live preview painting. Pure helpers cover new gestures and Shape Up judging; browser fixture covers rendering, two players and routing. Music licenses remain documented; rhythm charts keep timing authority.

Tasks:
1. Root: Slice fallback glow, Jab boxing meshes, cartoon diver/smith costumes using unmodified contact pads, new Freeze fashion gear, Beat light/floor. Universal tracked inset and catalog/setup updates.
2. Shape Up agent: remove wall, per-pose timer, small pose preview and independent two-player scoring; test freshness/score behavior.
3. Motion agent: arm-shot detector and directional targeting for Jack Attack; more balloons and differentiated balls for Keepy. Test deliberate movement/rearm.
4. Sprint agent: single-draw scenic trail driven by run distance plus bird ambience; preserve heat/hurdle behavior.
5. Integrate helper checks, inspect local browser screenshots for all touched games and two-player Shape Up, run complete setup regression, check/build and independent review. Publish preview only through draft PR1.
6. Document music source/license options and offer short brand/acronym shortlist. Do not claim trademark availability.

## Smash concept for review
Recommended: a robot demolition boss. A 45-second round presents a large toy robot with armour zones. Deliberate punches crack and remove plates; the exposed core ends the round with a clear demolition reward. Motion is answered immediately by a hand flash and impact burst. Difficulty comes from smaller/moving weak spots, tougher armour and timed combinations. Keep the player's live tracking panel; avoid a tower of dozens of free physics crates. Alternatives: break through a sequence of walls/obstacles, or leave Smash outside the first launch lineup. User selected this direction; implemented in the subsequent Smash demolition pass.

## Working name shortlist
- VYRA — Virtual You. Real Action. Recommended: short and directly explains embodied play.
- MOVA — Motion-Operated Virtual Adventures.
- KIRA — Kinetic Interactive Reality Arcade.
These are creative directions, not checked brand-availability claims. App name stays unchanged pending selection.
