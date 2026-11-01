# Goalie difficulty implementation plan

**Approved design:** Chill (85% ball speed/circles on), Sport (100%/on), Pro (115%/off); independent75–125% speed (5% steps) and target-circle switch. Preserve direction cues, glove response,60-second round, contact geometry, authored stages and score-free practice. Preview only.

**Visual thesis:** The same clear sports UI adds one compact difficulty section and a small honest setup label; the shot stays the focus.
**Content:** Briefing presets and two overrides; play direction cue with optional circles; results exact setup and comparable personal best.
**Architecture:** Normalized versioned local settings and pure variant encoding feed shell progression, rules and UI. Freeze selected settings at round creation via the mode key. Preserve legacy Sport/100%/circles/comfortable records as the default empty variant. Personal bests/stars displayed per exact configuration; stage access carries across Goalie configurations and total collected stars count highest per stage once. Goal thresholds scale gently with shot cadence and are tested for attainability across all speeds/stages/reach/layouts.

1. Add failing settings/variant/history/flight tests. Implement bounded migration/presets, frozen flight-speed multiplier, fair star goals and history helpers. Practice remains2.2s; tracker unchanged.
2. Add compact presets/range/checkbox, same-setup label, truthful no-circle instructions and conditional visual rings. Shell captures mode before setup and uses recorded mode for replays/results/turns/bests; Goalie stage access shared. Add browser assertions for options/persistence/off-circle gameplay/time/valid saves/mode isolation.
3. Full rules/type/build checks, focused browser and standard game client screenshots/state, Jab/menu regression as affected. Review read-only. Update PR4 and preview after checks; no production merge.

Freeze follows in a separate preview branch after Goalie settings ship. Its accepted direction is bright prominent actual player, the existing skinned Rizzquake as an active dance partner, unmistakable music-stop cues and earned freeze/streak rewards, with later stages adding simple poses. Keep one game in focus at a time.
