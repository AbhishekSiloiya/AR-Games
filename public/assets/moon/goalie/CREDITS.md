# MOON Goalie first-round artwork and sound

- `stadium-v1.png`: original empty stadium backplate generated with the built-in image-generation tool on 2026-10-28. Source file `exec-5adf4eac-26e8-415d-9dd0-32cb5526ba0d.png`; copied without semantic edits. Full generation prompt: [stadium-prompt.txt](stadium-prompt.txt). Stadium/crowd architecture is baked artwork; character, keeper gloves, ball, goal, shadows and responding net render in real time.
- Rizzquake reuses the original MOON skinned mesh and wool material from `../jab/`, based on the user's supplied character. Its procedural wind-up/kick/reaction uses the real skin joints, not a flat cutout or played reference clip. Original model provenance remains in `../jab/CREDITS.md`.
- Goal, net, gloves, rings and reaction geometry are authored in code. The existing panelled ball material is reused on a higher-resolution sphere.
- Crowd swell is original filtered procedural noise, not a recording of people. Existing stadium synth music and CC0 Kenney impact samples retain their original project credits. Sound runs through the shared pauseable audio clock.
- No Nintendo assets, logos or characters were used. The clear sporting presentation is an influence, not an affiliation.
