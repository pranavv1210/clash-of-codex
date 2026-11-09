# Phase 2 asset ledger

No external visual assets are committed in Phase 2. The islands, rocks, crystals, waterfalls, buildings, bridges, monorail, sky-lift, airship, cargo drones, trees, props, sky and clouds are deterministic procedural geometry authored for Clash of Codex.

The crew figures are clearly marked procedural stand-ins, not finished rigged humanoids. No legal redistributable rigged character with verified commercial-use animation redistribution terms was selected. Phase 2 art approval should decide between commissioning an original rig, purchasing a pack whose license permits repository redistribution, or keeping character binaries outside the public repository with a documented build-time acquisition step.

No Supercell, Claude City, Mixamo or unlicensed assets are used.

## Phase 2B CC0 texture sets

Downloaded 2026-11-08 from Poly Haven. Poly Haven publishes these assets under CC0. Each set is stored as 1K Basis Universal KTX2 with generated mipmaps; diffuse, OpenGL normal, roughness and AO maps are included.

| Asset              | Author(s)                                        | Source                                     | Used for                      |
| ------------------ | ------------------------------------------------ | ------------------------------------------ | ----------------------------- |
| Dark Rock          | Amal Kumar                                       | https://polyhaven.com/a/dark_rock          | primary cliff triplanar layer |
| Quarry Wall 02     | Dimitrios Savva                                  | https://polyhaven.com/a/quarry_wall_02     | horizontal strata blend       |
| Brown Mud 02       | Rob Tuytel                                       | https://polyhaven.com/a/brown_mud_02       | soil rim and garden surface   |
| Leafy Grass        | Charlotte Baglioni                               | https://polyhaven.com/a/leafy_grass        | grass island surface          |
| Concrete Pavement  | Charlotte Baglioni                               | https://polyhaven.com/a/concrete_pavement  | paved buildable pads          |
| Concrete Wall 007  | Dario Barresi, Rico Cilliers, Charlotte Baglioni | https://polyhaven.com/a/concrete_wall_007  | concrete/stone surface        |
| Metal Plate        | Rob Tuytel                                       | https://polyhaven.com/a/metal_plate        | tech deck surface             |
| Medieval Red Brick | Rob Tuytel                                       | https://polyhaven.com/a/medieval_red_brick | retained building-kit source  |
| Weathered Planks   | Dario Barresi, Dimitrios Savva                   | https://polyhaven.com/a/weathered_planks   | retained wood/bridge source   |

The committed KTX2 payload is 5,399,679 bytes. Estimated decoded GPU memory for all 36 1K RGBA mipmapped maps would be about 192 MiB if all were resident simultaneously, so the showroom intentionally loads only the seven diffuse maps it uses (about 37.3 MiB decoded with mipmaps). This stays below the 64 MiB mobile-low texture budget; unused source sets remain available for later material passes but are not loaded.
