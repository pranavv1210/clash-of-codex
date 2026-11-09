# Phase 2C visual review

## Evidence sets

- Before: `docs/screenshots/phase2c/before/`
- Iteration 1: `docs/screenshots/phase2c/iteration-1/`
- Iteration 2: `docs/screenshots/phase2c/iteration-2/`
- Final iteration: `docs/screenshots/phase2c/after/`

## Review loop

1. Iteration 1 introduced real podiums, instanced windows, stepped volumes, roof equipment, a central elevated HQ, wider island spacing and the navy/indigo sky. It exposed the legacy circular rim/path, overly tan paved tops and a 320-call High far view.
2. Iteration 2 removed the ring, changed paved tops to neutral concrete, limited High micro-crystals to the HQ and reached 299 calls. Mobile review exposed a white unthemed collapsed-sheet handle.
3. Final fixed the design-system Button class merge and verified the collapsed bottom sheet plus expanded panel at 390px. Overflow assertions pass at 390, 768 and 1440.

## Checklist

- Architecture: HQ has a tapered crown and dominant vertical silhouette; Dev is stepped; Comms has a mast/dish; Data and Grid are low/wide with cyan energy; Test uses a status beacon; Library has a glass dome; Control uses rooftop machinery; Studio has saw-tooth glazing; Workshop has heavy podium/mechanical massing; Home has a pitched roof and chimney. All use podiums, entrances, upper-volume setbacks, instanced amber windows and roof detail. They are now architecture, though close geometry remains procedural rather than authored hero assets.
- Sky: deep navy zenith, indigo mid, narrow amber-peach band and violet haze. The previous full salmon field is gone. Clouds keep warm/cool shading and fade into haze.
- Composition: HQ is central, largest and four units higher. Orbit islands are separated into foreground, middle and background layers; the two primary bridges attach toward the hero island. Some links remain visually thin at the farthest camera.
- Bounds: generated building footprints pass the three-unit rim-clearance and 65% pad-share test. No obvious overhang was found in final fixed-camera frames.
- Surfaces: the wood-like circular path is gone and paved islands use concrete. Theme variation exists, but purposeful entrance-to-anchor path meshes and entrance planters remain less developed than the buildings.
- Panel: fixed 320px desktop rail; equal three-column preset grid; full-width select; mobile collapsed bottom sheet with 44px handle. No measured overflow at 390/768/1440.
- Rendering: Low far/mid/close uses 53/29/22 calls. High uses 299/211/190. Headless FPS is not treated as a real-GPU result.

## Honest verdict

This is a clear architectural and composition upgrade and no longer reads as a field of anonymous dark boxes. It is still a procedural strategy-game kit, not premium authored city art. Weakest parts are simple side/rear facades, limited entrance landscaping, thin long-distance transit, sparse cloud volume and repeated roof-equipment primitives. Character rigs were intentionally not touched.
