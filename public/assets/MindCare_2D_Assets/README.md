# MindCare – Cozy 2D Sprite Asset Pack

This pack is a FRONTEND prototype asset set inspired by the MindCare emerald visual system.
It includes isolated transparent PNG sprite crops, 64x64 terrain tiles, and original AI-generated scene references.

## Quick usage in Google AI Studio Build / React

1. Unzip locally.
2. Copy folders `characters`, `companions`, `plants`, `outdoor`, `indoor`, `items`, `tiles`, and `backgrounds` into your project’s `public/mindcare-assets/` directory (or the equivalent public/static directory after checking the project structure).
3. Reference a sprite via `/mindcare-assets/characters/mochi_idle.png`.
4. Read `asset_manifest.json` for paths, dimensions, types, and suggested interactions.
5. Show reference images only for visual direction: the two `*_scene_reference.png` files are flattened illustrations, NOT modular game levels or sprites.
6. The file `backgrounds/garden_tilemap_base_480x840.png` is a starter tilemap and can be layered with sprites to build an interactive demo.

## Recommended scene layers

Base grass/paths/water background -> trees + house -> ground crops + furniture -> character/companions -> interaction effect -> MindCare React UI.

## Colors

Primary #289A75 | Secondary #145740 | Peach #F0C9AA | Neutral #51695E | Cream #FFF9F2.

## Production caveats

- Sprite crop transparency is automatically extracted from an AI-generated atlas; inspect borders and refine before production.
- This is an illustrative prototype pack, not a seamless pixel-perfect commercial tilemap: the terrain tile variants may require seam cleanup.
- Do not use full-screen reference art as an interactive layer or simply stretch it onto a canvas.
- Implement interactive behaviors, game state, and hit areas in the application; PNG assets have no built-in interactions.
- Text, fonts, and UI labels should be rendered by the app (Be Vietnam Pro), not baked into images.
- This pack does not include a backend or live AI service.
