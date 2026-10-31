# Jack Attack compact pilot and aligned aiming

**Goal:** Correct the oversized pilot and camera-forward hand occlusion/mapping without changing other games.
**Architecture:** Retain the 2D MediaPipe rig; it contains no depth. Use one observed shoulder-relative wrist-to-court aim mapping for visible target markers, gauntlet orientation and projectile direction. Keep lower-to-reload; allow chest-height/forward reaches to aim, then fire after a 140ms steady hold. Reduce pilot height about half, leave fleet space above, retain real travelling contacts and earned Starfall.
**Tech stack:** TypeScript, PlayCanvas, Node assertions and Playwright.

1. Reproduce forward/collapsed arm mapping with visible real model; record old size and hidden-gauntlet case. Write failing observed-aim and forward-ready input tests.
2. Add jack-aim.ts with finite/confidence guards, bounded own-sector targets and a stable fallback for foreshortened segments. Shrink solo/pair pilots; attach controllers in front of the mesh and point at the shared court target.
3. Use the same target for aim markers and actual muzzle-origin shots. Jack-only lower/chest-height firing threshold; preserve independent rearm, stale/pause rules, no automatic repeats. Update instructions.
4. Verify forward/cross-body/left/right/high and missing-landmark cases, compact pixel bounds, controller visibility and real contact along the visible aim. Re-run existing Starfall/team/pause regression and build/rule checks. Independently review then update existing PR9 preview; production unchanged.

Camera-forward depth cannot be inferred from the existing 2D rig. The chosen mapping makes it usable as a screen controller rather than claiming depth reconstruction. Physical MacBook comfort remains an acceptance check.
