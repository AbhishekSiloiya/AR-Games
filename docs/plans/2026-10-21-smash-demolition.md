# Smash robot demolition prototype

User selected Robot demolition boss. Implement on feature/player-camera-calibration and publish preview only.

- Replace physics crates with a recognizable toy scrapyard robot, six detachable armour plates and a protected glowing core.
- Deliberate hand swings damage armour. A highlighted weak spot takes double damage; other intact plates remain hittable for forgiving controls. Cracks show damage, parts tumble away, core becomes vulnerable after all armour is gone.
- Separate 45-second solo/two-player arenas with independent scores; defeated robot awards a bonus and rebuilds after a short celebration. Five stages increase armour/core durability, later bosses toughen moderately.
- Reuse lightweight hand glow and universal live tracking inset. Preserve camera setup, tracking pause and profile progression. No Rapier world or crate models in Smash.
- Pure tests verify protected core, damage, defeat, no repeat scoring and swing rearming; controlled-camera browser tests verify complete boss cycle, two players, rendering and no console errors. Hardware punch sensitivity remains to tune from user testing.
