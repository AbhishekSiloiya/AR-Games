# Right-hand menu selection implementation plan

**Goal:** Implement the user's requested right-hand-only, less sensitive three-second menu selection, with visible progress and no instant fist activation.

**Architecture:** A small pure hold state machine handles stable dwell, cancellation, tracking loss and deliberate release after a selection. A React cursor maps only player one's right wrist (hand index1) to screen coordinates, smooths menu motion without modifying gameplay tracking, resolves enabled buttons/checkboxes and displays an SVG progress ring. It also works in the player dialog through a portal. Existing mouse, touch and keyboard controls remain available.

**Tech stack:** Existing React/TypeScript/CSS; no dependencies or art assets.

Design: calm ivory/teal pointer and a filling ring with a short right-hand/hold label. Hold for3 seconds over the same option, allowing small tremor. Meaningful movement/switching cancels the timer; lost/stale tracking resets it. Selection fires once and remains locked until the pointer deliberately moves away. No fist override, even for saved legacy fist preferences. Compared with keeping fist confirmation (fast but still accidental) or adding a confirmation dialog (another step), deliberate dwell matches the user's requested interaction.

1. Write a failing pure-rule test for right-hand filtering, fresh samples, hold threshold, tremor, motion/target changes, lost tracking and one-shot release. Then implement `src/menu-selection.ts` and add it to the existing check script.
2. Extract/replace `HandCursor` from `src/main.tsx` into `src/hand-cursor.tsx` plus scoped CSS. Remove higher-hand switching/prediction/fist activation. Support enabled buttons and labelled checkboxes, modal-only targets and ordinary menu/setup/pause options. Show ring progress, confirmation and release hint; honour reduced motion. Update old Tracking help that advertises fist presses.
3. Browser-test actual game selection, no left-hand takeover, three-second hold, cancellation/loss, no chained selections on a new screen, options/checkbox, disabled targets, modal choices, pause controls and standard pointer use. Inspect captures and text state. Run unit/type/build and relevant Jab regression; read-only review and publish to the existing isolated preview branch only.

Next game proposal, not implementation scope: Goalie, using Jab's response and polish benchmark. First prove reliable save detection and comfortable reach; build one readable stadium with original rigged coach/striker, tactile gloves/ball/net response and short practice; then five distinct shot patterns, progression and clear save-rate/results. Keep one character family; don't rebuild other games simultaneously.

## Verification

Pure rule tests, full unit/type checks and production build pass. Focused menu browser checks pass game/options/checkbox/modal selection, left-hand rejection, three-second hold, legacy fist bypass prevention, switch/move/stale cancellation, no repeat/chaining, disabled stages, typing, mouse, edge captions and reduced motion, without browser errors. Focused Jab regression passes practice, reach, stage cues, results, glove travel, pause, two-player isolation and cleanup. Standard web-game client menu screenshot/state inspected. Read-only review verified capture-phase typing cancellation, current-clock freshness and portal cleanup; no unresolved material findings. Physical camera stability/comfort still needs hands-on play. Existing build notices remain.
