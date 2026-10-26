# MOON movement-first character pass

User-directed refinement: use the four original output/characters designs, make them act rather than decorate, keep Dance's real player clear, simplify Shape Match, make Arms Up mimic actual body motion and give Jab a rewarding character-led loop. Existing preview branch and six-game scope remain; no production merge.

Use original-character articulated raster parts (head, body, arm, leg) rather than outfit redesigns or whole-image wobble. Input joints drive body parts without smoothing added to gameplay; optional secondary motion respects effects/reduced motion. Characters hide on absent/invalid tracking. Moodi pilots Jack; Fuzzbyte mirrors Dance and coaches Shape; Rizzquake holds Jab pads; Momo & Bloop become earned tower residents.

Dance: remove full-area art tint/lights, opaque floor over the player and large central cue. Keep actual camera bright and unchanged; club art confined to top/sides and a thin floor rim. Small Fuzzbyte partner copies the dancer and holds still during Freeze. Only successful holds trigger celebration.

Shape: replace competing quest cards, portal, coach, verdict and reward panels with one target character pose per player, one match/hold indicator and a small eight-stop tower. Live player remains visible. Clear single result banner and rest countdown. Existing scoring, locked-pose guard and two independent seats remain.

Jack: preserve calibrated arm aiming/reload and stage positions, render every limb from the latest valid rig. Display clean motion diagnostics for browser tests. Character is the pilot, not a sticker placed over the firing rig. Tracking loss hides the rig; pause holds the scene.

Jab: Rizzquake's hands carry the active pads; body and face recoil on real hits and duck during the bar. Keep collision thresholds and stage progression. An earned combo burst and short feedback replace decorative corner host and verbose panels.

Verification: pure pose mapping/visibility/movement tests; screenshot and injected-landmark tests for different limb positions, tracking loss, phase stops, earned progression, real punch/shot contacts, two-player and small layouts. Build/check plus existing audio/setup regressions. Real-device camera feel remains a hands-on test; no 10/10 claim based on automation.
