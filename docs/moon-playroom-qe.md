# MOON playroom — preview validation

Scope: Slice, Goalie, Freeze, Shape Up, Jack Attack, Jab. Existing session IDs, local storage and legacy game modules retained. This is a preview branch.

## Automated checks
- `npm run check`: tracking/calibration, game rules and progression suites, plus the curated catalogue contract.
- `npm run build`: production build succeeds. Existing PlayCanvas worker externalization and large-chunk notices remain.
- `tools/test-moon-playroom.mjs`: six exact game launchers; downloaded fonts actually loaded; all six art assets resolve; layout checks at 320/375/414/768/1024/1440px; three-step briefings; all six setup and gameplay routes; complete Slice round, results and return home; mobile badge and stats views; no browser errors.
- `tools/test-player-setup.mjs`: six setup routes, missing essentials, quick natural positioning, manual start, full-body feet requirement, live-camera modes, tracking loss/recovery, pause/resume, two-player readiness and taking turns.
- `tools/test-moon-experience.mjs`: actual Slice collision and slash/streak feedback, bomb reset, Freeze customization without auto-start, rendered gear, phase cues, frozen club motion, earned hold chain, paused clock, independent player-two power feedback, tablet and cleanup.
- Standard web-game action client: welcome screenshot inspected, then gameplay screenshots inspected in the journey suite.

## Review corrections
- Six games provide 90 standard stars. Galaxy uses an attainable 75-star goal with its stable legacy ID.
- The badge denominator uses the displayed collection. Earned legacy badges remain visible.
- Daily game quests are constrained to the same six-game catalogue. Tests cover a full year of challenge dates.
- An existing test fixture used 24-hour subtraction across the autumn DST boundary. It now constructs calendar-day noon timestamps.

## Visual inspection
Welcome, desktop/tablet/phone playroom, every game briefing, setup, live game views, results, badges and stats. Typography is self-hosted Barlow Condensed / Space Grotesk; world artwork is original illustrative key art and is labelled as such in briefings.

## Practical limit
Browser gameplay uses a synthetic camera feed and landmark fixture. Real movement feel, lighting tolerance, accessory fit and tablet thermal performance require hands-on playtesting. This pass redesigns the product shell and shared HUD; existing game mechanics and playable scene models remain in place.
