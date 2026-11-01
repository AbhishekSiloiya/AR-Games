# MOON original graphics

- `prism-visor.png`: generated for this project using the built-in image generation tool on 25 October 2026. Transparent original retained; no third-party brand or logo requested.
- Prompt: "Create one production game accessory asset: a front-facing pair of premium futuristic wraparound sunglasses, symmetric, horizontally centred, transparent background. It will overlay a real webcam player's face. No human, no head, no skin, no eyes, no mannequin, no text, no logos, no scene, no shadow outside the object. Fashion editorial product-render quality, a sculptural slim polished silver/chrome upper frame, a single connected rose-pink iridescent shield lens, clean nose notch, subtle cyan highlights, narrow visible side temples. Lens must be a curved angular shield, not an oval disc. Full glasses silhouette visible with comfortable transparent padding. Camera straight-on at eye level, no tilt, no perspective yaw. High-quality 3D product render, crisp edges and controlled glossy highlights. Render just this single pair of eyewear on genuinely transparent alpha."
- `chrome-preview.svg`, `minimal-preview.svg`, and the MOON app icon: original code-native vector artwork for this project.

## Six world illustrations — 25 October 2026
Original MOON key art generated with OpenAI image generation for this project. These are illustrative game-world posters, not gameplay captures. No external character/IP reference was used. Original PNGs retained in the task's generated_images folder; deployment copies encoded as WebP without compositional edits (1536×1024, quality 85).

Shared direction: premium stylised 3D animation, expressive young adult humans, tactile materials, dynamic foreshortening, cinematic joyful movement; no text, logos, existing licensed characters, UI, stick figures or cutouts.
- `worlds/slice.webp`: empty open-hand swipe through citrus/watermelon/dragonfruit, orange and acid yellow, no held blade.
- `worlds/goalie.webp`: cobalt/white goalkeeper gloves, approaching football, illuminated stadium.
- `worlds/freeze.webp`: dancer in reflective streetwear and sunglasses, mirror ball, pink/violet club.
- `worlds/shapeup.webp`: two adults coordinating poses amid lime/teal geometric sculpture.
- `worlds/jacks.webp`: original orange/lavender space pilot raising hands toward chrome alien drones, no guns.
- `worlds/jab.webp`: coral boxing gloves, dynamic punch and warm athletic studio lighting.

## Typography
Self-hosted Barlow Condensed (700/800) and Space Grotesk (400/500/600/700), downloaded from Google Fonts. Both distributed under the SIL Open Font License; full licenses in `public/fonts/moon/*-OFL.txt`.


## Playable worlds and crew — 26 October 2026
Original assets generated with OpenAI image generation for MOON. Deployment copies are WebP (preserving alpha for sprites); original PNGs are retained in the task's generated_images folder. These assets are used inside the actual rounds and reused for matching menu compositions.

Shared environment prompt: "Production game background, wide 16:9, premium bright stylised animation, rich tactile materials and clean game readability. Detailed atmosphere at the sides/top; calm open central play space. No text, UI, logos or existing licensed characters."
- `play/club.webp`: magenta/violet social dance club, giant mirrored disco ball overhead, perspective checkerboard dance floor, coloured stage lights, joyful crowd at edges.
- `play/galaxy.webp`: deep blue/violet nebula, luminous stars, ringed planets and asteroids framing a clear central shooting area.
- `play/stadium.webp`: cobalt floodlit football stadium at night, energetic audience and clear central pitch.
- `play/boxing.webp`: warm coral/charcoal boxing arena, dramatic practical spotlights, crowd at edges and unobstructed centre.
- `play/juice.webp`: transparent orange/coral fruit-juice impact burst, isolated without hands or held equipment, for actual slice contacts.

Mascot prompts use the user's local original concept images as visual references, with the direction: "One high-quality full-body production game sprite on transparent background, complete readable silhouette, tactile fur/knit materials, consistent character identity and outfit, playful all-ages appeal, expressive face, no text or logos."
- `play/moodi-idle.webp`, `play/moodi-action.webp`: Moodi, cream/brown furry panda in lavender vest and coral boots, with yellow duck Quack. Idle: comic unimpressed face, relaxed stance. Action: raised paws, delighted surprised expression.
- `play/fuzzbyte-idle.webp`, `play/fuzzbyte-cheer.webp`: Fuzzbyte, coral/lavender knitted floppy-eared companion with green feet. Idle: friendly attentive stance. Cheer: open smile, raised arms/foot and joyful energy.
- Source concepts (preserved untouched in `output/characters/`): `moodi-and-quack.png`, `fuzzbyte.png`, `momo-and-bloop.png`, `rizzquake.png`. Deployment thumbnails in `crew/` are proportional WebP encodes of those supplied concepts; no ownership claim beyond user-supplied provenance.
- `play/nova-idle.webp`, `play/ren-idle.webp`: original clearly adult anime arcade hosts, relaxed full-body stance, simple vibrant fashion and transparent background. Available as secondary profile identities; mascots lead game scenes.

## Audio
`MOON Afterglow` is an original code-synthesised house arrangement in `src/audio.ts` / `src/club-groove.ts`: 126 BPM, layered drums, bass, chord stabs, melodic hook and phrase variations. Sport/space/pose themes are also original procedural arrangements. No third-party music recording was generated or downloaded in this update. Existing optional CC0 recordings and their original attribution/source links remain available in the music picker and `public/assets/music/CREDITS.md`.


## Articulated original-character pass — 26 October 2026
The user's four source designs in `output/characters/` are the visual identity references, preserved untouched. New production art was derived through the built-in OpenAI image-generation tool; no external licensed character or outfit was introduced. Original PNG outputs remain in the task generated_images folder. `rig/*.webp` are alpha-preserving proportional format encodes; the renderer samples source rectangles without changing original source files.

- `rig/moodi.webp`: four separate textured parts derived from `moodi-and-quack.png`: complete panda/duck head, cream X-patched torso, brown furry arm/paw, brown leg/foot. Original bare mascot retained; no vest or boots.
- `rig/fuzzbyte.webp`: four separate parts derived from `fuzzbyte.png`: original floppy-eared coral/lavender knitted head, knitted torso, knitted arm, lime-footed leg.
- `rig/rizzquake.webp`: four separate parts derived from `rizzquake.png`: green felt head/yarn hair, green torso with original yellow lightning utility belt/purple shorts, green arm/fist, green leg/foot.
- `rig/momo.webp`: Momo & Bloop duo derived from `momo-and-bloop.png`, without the name label. Used for the earned Shape Up tower; a second extraction pass removed the background as far as the built-in generator produced.

Atlas prompt set: "Preserve the exact original mascot identity/materials/colours/accessories, front-facing orthographic production puppet texture atlas on transparent alpha. Four separated unassembled parts: head, torso without limbs, straight down arm with paw/fist, straight down leg with original foot. No new clothing, no labels, text, scenery or shadows. Parts will be independently articulated in code."
Momo prompt: "Remove the entire background/floor/text and retain the exact joyful yellow/coral M-shaped friend and cyan furry friend with violet antenna pom, uncropped, on transparent alpha."

Animation is code-driven articulation of these raster parts: latest tracked joint rotations/positions for the pilot/companions, demonstrated target poses for Shape Up, pad-following and actual-hit recoil for Jab. It is not full 3D skeletal animation or automatic photo-to-character generation. Missing optional hips/feet use a neutral display stance while input/scoring remain tied to actual tracking.
