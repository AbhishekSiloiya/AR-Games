# Game identity visual pass

Approved direction: live camera with disco accessories for Freeze, complete animated space ranger for Jack Attack. Slice, Goalie and Wipe get representative equipment. Work on the existing preview branch; do not merge master. Smash demolition and bespoke difficulty stages remain later phases.

Implementation:
1. Add lightweight authored gear meshes (ninja gauntlets for Slice, goalkeeper gloves, cleaning sponges) at the same positions as gameplay collision tools. Preserve scoring, input, hit sensitivity and quick setup.
2. Goalie: visible gloves follow the actual assisted collider positions; add recognisable football panels and stadium details. Its perspective game uses a live inset rather than a misleading flat mirror.
3. Wipe: cleaning mitts, window frame, foamy grime and revealing clean glass. Keep its body-relative reach amplification and show the actual player in a live inset; a flat mirror with unaligned hand collisions would mislead.
4. Freeze: camera backdrop by default with tracked disco glasses/headphones and wrist cuffs. Remove the central activity orb from live view; classic view retains a stylised dance-stage alternative.
5. Jack Attack: friendly articulated space character with helmet/visor, substantial limbs, gloves and boots. Keep exercise detection and game rules.
6. Remove camera cut-out controls from the main experience. Each game's setup explains its player style; preserve live/classic selection where relevant. Reduce the little diagnostic stick figure during play when a richer representation is present.
7. Run pure math checks, TypeScript/build, browser visual checks for all five upgraded games, tracking loss/recovery and two players. Publish branch preview and update existing draft PR. Real camera alignment/performance need hardware feedback.

Art direction: bright, toy-like chunky equipment with clear silhouettes, a cohesive cyan/coral/cream palette, readable hit points and short reactive motion. Live player accessories should remain recognisable without hiding the face or game targets.
