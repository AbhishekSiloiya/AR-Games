# MOON character motion implementation plan

**Goal:** Turn original supplied mascots into responsive participants and remove gameplay clutter/occlusion.
**Architecture:** Round-owned SVG articulated puppets sample transparent raster part atlases. Pure pose mapping normalizes MediaPipe joints. Existing collisions and scoring stay in game modules; overlays only consume movement/events. Background art stays at stage edges for camera games.
**Tech stack:** TypeScript, SVG, PlayCanvas, React and existing Web Audio/MediaPipe.

1. Generate/inspect Moodi, Fuzzbyte and Rizzquake 2×2 transparent part atlases from original local concepts; deploy WebP without altering original files. Extract original Momo & Bloop as transparent art for earned tower progression.
2. src/mascot-motion.ts/test: test mirrored camera orientation, shoulders/elbows/wrists/hips/knees/feet mapping, invalid/stale joint fallback, independent limb updates and domain animation poses. Implement pure mapping after RED.
3. src/mascot-puppet.ts/css: SVG multipart character with separate head, torso, upper/lower arms and legs, game-clock secondary expression/recoil. Each round owns cleanup. Replace src/space-ranger.ts image with tracked puppet; keep shot origin and input unchanged.
4. Refine freeze-party.ts/css and moon-freeze.css: camera-clear art aperture, no full-screen tint/beam overlay, small tracked Fuzzbyte partner, compact top phase cue. Verify zero overlay in player centre and freeze/pause hold.
5. Replace shapeup-overlay.ts/css with one target puppet, match/hold signal, eight earned tower stops and short result/rest cue per seat. Reuse existing state, preserve necessary test diagnostics. Simplify name/instruction once, no competing scores/progress cards.
6. Jab: replace decorative sport corner host with active Rizzquake pad coach, hands driven by live targets, real-hit recoil and combo reward; clear duck cue. Keep pads/collisions/speed thresholds and end scoring.
7. Update credits/catalogue where source identity changed, test actual paths at desktop/tablet and two-player, run check/build and game client, inspect frames. Independent review per requesting-code-review skill; resolve material findings. Commit/push existing preview branch; confirm exact-SHA Vercel READY, return new link and honest limitations.
