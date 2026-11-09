# Phase 2B terrain and performance review

## Review sets

- Before: `docs/screenshots/phase2b/before/` (Phase 2 main, ten available fixed views).
- Iterations: `iteration-1`, `iteration-2`, `iteration-3`.
- Final matrix: `after/{high,low}/` with eight presets at 1440x900 and 390x844 (32 frames).

## Iteration findings

1. The first KTX2/triplanar pass removed stretched flat cliff color, but the rock response was crushed nearly black and special cameras were obstructed by HQ buildings.
2. The second pass raised dry-rock response and added cool fill. Texture layers became visible, but review presets still collided with architecture.
3. A building-free terrain review island isolated the cliff, rim, waterfall and crystal assets. This exposed an excessively thick top slab and a wire-like waterfall.
4. The final pass reduced the top slab to a thin grass/soil seam, widened the waterfall, reduced mist particle size and retained the displaced cliff silhouette.

## Checklist

- Rock layers/cracks/depth: texture layers and macro variation are visible at close range; the displaced silhouette has ledges and chips. Some ring transitions remain angular and the source photo's broad light patches can read as baked lighting.
- Stretching/tiling: triplanar projection removes steep-face UV stretching. No obvious small-scale tile grid appears in reviewed far/mid frames, though repetition can still be found on the largest hero face.
- Grass/soil/rock: the final rim is materially thinner and a soil seam is visible. The procedural top-to-cliff boundary is still sharper than a sculpted AAA terrain asset.
- Lighting: warm key/cool fill is consistent and cliff cavities remain legible. Shadows did not show visible acne in fixed frames; camera-motion shimmer was not measured.
- Clouds/haze: depth separation works at far view, but cloud silhouettes remain visibly procedural polygons.
- Crystals/waterfalls: crystals have stronger clusters and halos without point lights. The waterfall shader flows and fades, but remains graphically simple rather than physically volumetric.
- Gaps/z-fighting: no obvious z-fighting in fixed frames. Some roots intersect cliff geometry and several floating debris pieces feel compositionally random.

## Honest verdict

The terrain is a substantial upgrade and now reads as a textured game art kit rather than flat placeholder cones. It still does **not** reach a premium shipped-game bar. The weakest parts are the angular ring transitions, procedural cloud sea, simple waterfall, coarse roots/debris placement, and the absence of authored curvature/AO data. Building and character quality was intentionally not changed in this phase.

## Performance and bundle evidence

- Production build: `/` 103 kB First Load JS, `/repos` 147 kB, `/showroom` shell 143 kB plus a lazy world chunk. These route figures are unchanged from Phase 2.
- Browser network capture on `/`: 351,460 raw JS bytes; zero `WebGLRenderer`, `react-three`, `ShowroomScene`, or `worldPalette` matches.
- Mobile Lighthouse `/`: 98, 99, 99 Performance (median 99); Accessibility 100, 100, 100. TBT: 100 ms, 70 ms, 70 ms. The earlier 67 was not reproducible and coincided with a 1,400 ms local TBT under concurrent work; no public bundle regression was found.
- Committed KTX2 payload: 5,399,679 bytes. Seven resident 1K diffuse maps estimate to ~37.3 MiB decoded RGBA mip memory. WebGL renderer info reports texture object count, not exact GPU allocation, so this is a format/dimension calculation rather than a driver-reported byte count.
- Color, normal, roughness and AO maps are legally sourced and compressed, but this pass wires the color maps into the custom shader; the remaining PBR channels are prepared assets, not yet sampled by the runtime material.
- Headless FPS is not accepted as a real-GPU result. A stable Low-tier sample reported 775 draw calls, 79,608 triangles, 13 resident texture objects and roughly 806 geometry objects. This fails the requested sub-150 draw-call budget. High-tier postprocessing resets `renderer.info` per composer pass, so an honest aggregate High draw/triangle figure was not obtained; the monitor exposes that limitation rather than inventing a number.
- Strict leak gate: **failed**. Ten remounts kept textures at 30 and materials at 883, but the final assertion observed geometry count 809 then 807 rather than one exact baseline. No unbounded increase was proven, but the requested exact-baseline assertion remains red.
- Focused Playwright checks passed for a nonblank WebGL scene with no console errors and zero serious/critical axe violations. The production build returns 404 for `/showroom` as required.

## Measuring on a real GPU

Run `npm run dev`, open `/showroom`, choose High at 1440x900 or Low at 390x844, enable Perf, wait 20 seconds without moving the camera, then orbit continuously for 30 seconds. Record the median FPS, maximum draw calls/triangles, browser GPU model from `chrome://gpu`, and repeat once after ten Mount/Unmount cycles.

## Phase 2B-Fix review

- Before: `docs/screenshots/phase2b-fix/before/`; iterations: `iteration-1`, `iteration-2`; accepted capture: `after/`.
- Iteration 1 exposed a shader compile failure and absent cliff bodies. The console-error test correctly failed; those frames are retained as evidence and were not accepted.
- Iteration 2 restored the full cliff and PBR response. Review found flat cloud ellipses and edge-on waterfalls.
- Final added view-softened, lit cloud shading and crossed waterfall layers. Cliffs use 64-point silhouette rings, smooth vertex normals and vertex cavity color.
- Packed PBR is active: triplanar color/normal/ORM on cliffs and color/normal/ORM on grass, soil, paving, concrete and metal surfaces.

| Tier | Preset | Calls | Triangles | Texture objects | Targets |
| ---- | ------ | ----: | --------: | --------------: | ------: |
| Low | Far | 52 | 18,184 | 24 | 3 |
| Low | Mid | 45 | 17,016 | 24 | 3 |
| Low | Close | 52 | 18,184 | 24 | 3 |
| High | Far | 219 | 49,089 | 43 | 27 |
| High | Mid | 185 | 38,153 | 43 | 27 |
| High | Close | 215 | 46,905 | 43 | 27 |

Low removes micro-props, roots, debris, nature, transit and extra lighting passes. High retains bridges, vehicles, crystals, waterfalls, shadows, environment and post effects; Ultra retains the expensive micro-detail and contact-shadow pass.

### Final verdict

The failed gates from Phase 2B are closed: Low is below 150 calls, High is below 300, and ten exact remount cycles are stable for geometry, texture, material, program and framebuffer counts. The close cliff now has materially visible normal/specular variation. It remains stylized procedural terrain rather than authored AAA rock: broad source-photo variation is visible, the cloud sea is intentionally sparse, mist is sprite-like, and Ultra roots/debris still use deterministic procedural placement rather than surface-conforming splines.

The leak test performs one named cache warm-up for Three/Drei's shader, KTX2 and PMREM caches, then requires exact equality across ten measured mount/unmount cycles. Final measured resources were stable; the assertion was not relaxed.

Public-page verification after the fix: `/` remains 103 kB First Load JS. Three mobile Lighthouse runs scored 99/100, 99/100 and 99/100 Performance/Accessibility (median 99/100). Production client scripts contained zero matches for `WebGLRenderer`, `react-three`, `ShowroomScene` or `worldPalette`; production `/showroom` returned 404.
