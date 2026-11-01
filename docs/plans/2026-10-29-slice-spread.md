# Slice launch spread correction

**Goal:** Make fruit visibly originate and peak across the usable play area rather than converge on one central fountain. User accepted Slice and requested this correction before moving on.
**Approach:** Retain existing hand-written phrases, timing, scoring and modes. Use a Slice-only launch helper: allow fruit centres near the reachable hand bounds (rather than inset by a full collision radius), alternate compact/single phrase origins across left/right/centre, and calculate a small bounded drift at the apex instead of always converging inward. Existing paired lane boundaries and camera alignment stay authoritative. Alternatives of arbitrary full-screen launches or side-entry projectiles add unreachable targets or change the accepted mechanic; defer both.
**Files:** src/slice-launch.ts, src/slice-launch.test.ts, src/games/slice.ts, tools/test-slice-spread.mjs, package.json, progress.md.

1. Add a deterministic actual-game browser regression for natural paired launches at their apex. Confirm the current converging trajectory fails the spread requirement.
2. Add pure launch tests for left/right/centre sequences, camera/far/off-centre/paired bounds, low-gravity modes and apex retention. Implement the smallest Slice-local trajectory changes.
3. Run checks/build, actual-game spread captures in camera/court/paired modes, focused Slice regression and standard game client; inspect screenshots and errors.
4. Update the existing preview branch and PR6, verify Vercel READY at the pushed SHA. Shape Up is the next proposed benchmark, with live AR pose feedback, clear match confirmation and a short transition between poses; no Shape Up implementation in this correction.
