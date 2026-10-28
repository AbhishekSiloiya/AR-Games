# MOON Jab — focused design direction

Date: 2026-10-27
Status: first playable rigged Jab prototype implemented; hardware and visual acceptance remain open.
User decision: Switch Sports is the preferred reference. Use one character and upgrade one game at a time, carrying validated learning to later games.
First game: Jab. Working character choice: original Rizzquake, already Jab's pad coach. This choice is J's recommendation, not an explicit user selection of Rizzquake.

## Scope and sequence

Build one polished solo 60-second Jab experience before expanding the new direction to the other five shortlisted games. Use the existing Rizzquake source non-destructively. One original cast identity throughout this focused experience; no new cast, character picker or extra mascot. Retain the real player's live camera inset and tracked gloves.
Do not remove or redesign the other five games during this pass. Two-player compatibility must remain functional, but it is not a second design project.

## Visual direction

Original premium stylized sports pavilion: daylight, restrained teal/coral accents, warm ivory architecture, clean mat boundaries, coherent materials and contact shadows.
Reference principles are Switch Sports' clear arena, readable action and consistent player identity. Do not reproduce Nintendo characters, layouts or proprietary assets.
The character is an active coach, not an unrelated decoration. Preserve Rizzquake's green silhouette, dark hair, purple shorts and yellow lightning belt. Aim for expressive, athletic and broad appeal; reduce babyish posing and excessive furry detail.
One readable cue at a time: LEFT JAB, RIGHT JAB, CROSS or DUCK. Left/right are identified by words/icons as well as colour. Keep score, timer and compact upcoming combo subordinate.

Visual target: ../design/jab-rizzquake-visual-target-v1.png
Generation prompt: 2026-10-27-jab-visual-target-prompt.txt
Created with the built-in image-generation tool, using output/characters/rizzquake.png as the identity reference. The source was inspected and preserved untouched.
The target is an illustration, not proof of runtime fidelity. Its detailed hair, light transport and soft shadows are not a promise of browser rendering. Production should simplify materials and lighting while preserving composition, silhouette and readability. Do not install this entire frame as a game background or fake character animation by distorting it.

## Character and interaction

Rizzquake holds actual target mitts. Target position and mitt position share the same game data. Reach is constrained to a plausible coaching range, avoiding limb stretching and detached target pads.
Motion set: ready/idle, left presentation, right presentation, cross presentation, left/right contact recoil, duck cue, reset, combo celebration and finish.
Use a rigged model with controlled IK/aim. The current prototype uses procedural poses; its six embedded clips are reference data, not runtime playback. Add a controlled IK/aim layer for mitt placement and limited gaze, not raw noisy pose landmarks on every coach bone.
The player's foreground gloves should follow fresh tracked hand input immediately. The coach performs the coaching action; it is not supposed to mirror every player movement. This distinction must be clear in briefing.
A successful hit produces synchronized mitt compression/recoil, brief local impact feedback and a punch sound. The coach braces and recovers before presenting the next pattern.
Optional secondary idle motion respects reduced motion, pause and tracking loss. Essential target and glove motion remains visible.
One character type can be instantiated per seat for existing two-player mode; no second cast identity.

## Round and feedback

Keep a 60-second initial-stage round. Begin with clear single jabs, move into short combinations, then mix learned actions and existing duck challenges. Validate that cue timing permits natural recovery; do not implement an arbitrary faster spawn rate as the whole progression.
The reward is completing a readable movement sequence and seeing the coach respond. Use one consistent combo definition across scoring, dots, cue, sound and results; the prototype now awards the same four-hit combination shown by the cue.
Misses should permit quick recovery. Avoid overlapping pad instructions and duck warnings. Loss of tracking pauses the challenge rather than silently penalizing absent input.
Music should be one coherent original or properly licensed rhythmic bed with room for punch transients; no new music streaming service or commercial track assumptions.

## Asset production gate

The initial assets were PNG/WebP reference art and articulated raster atlases. No Blender executable or dedicated 3D-generation connector was available. A reproducible Python authoring script now creates an original skinned Rizzquake GLB, with blended limbs, face joints and six reference clips. Runtime poses and mitt contacts use procedural IK, rather than clip playback. This is a first mesh prototype, not the finished cinematic character.
Next art deliverable: refine silhouette, topology/materials and expressive motion against the approved target. A manually authored mesh or external specialist is a legitimate path; do not substitute generic stock characters or claim an automatically generated mesh is ready without inspecting topology, deformation and identity.
Use an optimized GLB delivery pipeline into existing PlayCanvas. Preserve source authoring assets separately. Verify actual bone deformation, planted feet, joint reach and frame cost before rebuilding the full round.

## Acceptance gates

1. Inspect a short real-time ready → present → punch → recoil → reset → celebrate motion proof. No bitmap stretch, detached mitt, visible limb break or foot sliding.
2. Real MacBook and Android tablet: comfortable framing, reliably distinguish left/right actions, no additional perceptible smoothing lag, and no game stalls during a full round. Record actual camera-to-display latency and frame rate; target stable 30 fps minimum on the selected tablet, prefer 60 fps where feasible.
3. Users understand the first action without an explanation from the developer. Observe misses and recovery, then ask whether they voluntarily want another round. A small formative playtest is not a retention study or a 10/10 claim.
4. Automated tests cover actual hand contact, one impact per punch, score/combo agreement, duck precedence, tracking-loss grace, pause/resume, cleanup and existing two-player ownership.
5. Review actual gameplay captures alongside the target. Only then transfer the character/runtime/design conventions to the next game.

## Evidence reviewed

src/games/jab.ts — pads/collisions/round/scoring.
src/jab-coach.ts and src/jab-coach.css — current SVG coach and cue.
src/mascot-puppet.ts — raster-part stretching; unsuitable as the final animation pipeline.
src/moon-profile.ts — profile choice is not a complete in-game character system.
docs/plans/2026-10-26-moon-motion-plan.md and progress.md — previous implementation and limitations.

The focused implementation changes Jab game sources and publishes a separate preview. Original character files and production remain untouched. The arena uses an AI-generated empty pavilion backplate plus a real-time shadow-catching floor, lights and skinned actor; distant architecture is baked for economy, not fully modelled geometry. Automated rendering checks confirm actual UVs, live bone deformation, planted feet, target contact, scoring and cleanup. Physical camera comfort/performance and final art fidelity remain acceptance gates.
