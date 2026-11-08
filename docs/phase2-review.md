# Phase 2 visual review

## Evidence reviewed

The ten fixed views for each pass are in `docs/screenshots/phase2/iteration-{1,2,3}`. Iteration 1 is the first valid render after a readiness assertion replaced the original invalid loading-state captures. Views are far, mid, close, top and night at 1440×900 and 390×844.

## Iteration 1 — functional prototype

- The archipelago read clearly, but the screen was almost entirely orange and the high camera hid the rock undersides.
- Buildings had recognizable window rhythm but mostly box silhouettes. The airship was visibly a capsule.
- Cloud spheres read as blobs. Crystals, waterfalls and links established the vocabulary, but did not yet create convincing depth.
- Performance samples initially included shader warm-up and were not reliable.

## Iteration 2 — silhouette and depth

- Lowered the far/mid/close cameras, narrowed the warm horizon, exposed tapered multi-mass undersides and added strata.
- Added building plinths, fixed overlapping data-core cooling units, and added airship ribs, fins and a nose cone.
- The separate islands now read at far zoom and cyan crystals create a consistent energy system.
- Weaknesses: the cloud sea was still polygonal and tinted; the desktop airship sometimes crossed the HQ; mobile controls covered the close view.

## Iteration 3 — atmosphere and mobile composition

- Flattened, softened and reduced the cloud layer; moved the airship route higher and farther out.
- Rebuilt mobile controls as a bottom tray, hid the performance overlay by default, and widened mobile camera framing.
- No horizontal overflow was observed in the captured sizes. The night view has stronger window/crystal hierarchy without excessive bloom.

## Honest final assessment

This is a coherent, original procedural art-kit showroom, but it is not yet a premium production asset set. The strongest parts are the archipelago composition, deterministic island silhouettes, energy language, responsive controls, and distinct archetype rooftop cues. The weakest parts are low-poly cliff surfaces, flat/no-texture materials, simplified bridge/monorail geometry, sparse façade detail, and stand-in crew. There is no texture tiling because there are no texture maps yet; triplanar PBR and KTX2 texture work remains absent. Characters are not rigged and have no animation clips. The browser’s software-rendered/headless FPS is evidence only for test conditions, not a desktop-GPU performance claim.

## Art-director decision

The showroom provides Crystal Cyan and Warm Amber variants. Approval should cover: energy color, dusk balance, island silhouette, and whether the next art pass should prioritize cliff/material fidelity or architectural/character fidelity.

## Verification notes

- Production `/showroom` returns HTTP 404 as required; the route is a development review tool only.
- Lighthouse on `/`: desktop Performance 100 / Accessibility 100; mobile Performance 67 / Accessibility 100. Mobile missed the 90 target because Total Blocking Time was 1,400 ms in the throttled local run. This is a failed gate, not presented as a pass.
- `/repos` Lighthouse was not measured because the production-like local run had no authenticated GitHub session.
- The headless Chromium samples shown by the overlay are variable software-renderer measurements (approximately 30–50 fps in reviewed frames) and are not a valid mid-GPU benchmark.
