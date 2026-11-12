# Endless Walker: Design Decision Record

Started 2026-11-12. Living record. Notes: [`docs/explorations/endless-walker/README.md`](../../../docs/explorations/endless-walker/README.md)

## Agreed with owner

| ID | Decision |
|---|---|
| EW-1 | Storage layout: exploration folder, this design record, and a session memory file. Isolated from other case studies. |
| EW-2 | Indie scope. Death Stranding inspiration, endless procedural world, focus on human walking and climbing. Vehicles are fuel-limited. |
| EW-3 | Objective = pathfinder plus surveyor (B + D). |
| EW-4 | Goal is forward only. Built infrastructure behind the player does not help at the frontier. |
| EW-5 | Health like Death Stranding: stamina plus balance. No food or deep survival. |
| EW-6 | Player desire = speed and stability across vast distance. |
| EW-7 | Progression = skill plus body growth plus gear growth. A fully grown walker stays slower than a vehicle. |
| EW-8 | Outstanding scenery is needed only sometimes. Handled by landmarks, so not a blocker. |
| EW-9 | Obstacle set from the obstacle table is enough: slopes, cliffs, gaps, water, ridges, soft or slippery ground, boulders, vegetation, wind, fog, night. |
| EW-10 | Core verbs: walk, run, climb, jump, slide, rappel, wade, brace. |
| EW-11 | Signature moment: vast space, climb the mountain, slide down from the peak. |
| EW-12 | Temperature has no effect on health for now. Removed from the biome table. |
| EW-13 | Fog, storm and night are planned for the future, not now. Visibility is deferred with them. |
| EW-14 | Vehicles are cut for now. The EW-2 and EW-7 vehicle clauses are parked. |
| EW-15 | Slide works on any slope. Grip and softness set the feel. |
| EW-16 | Current aim is a prototype. Cost of slowness, charting and growth currency are decided later. |
| EW-17 | Logical space core approved (GDD section 9.3): state and actions are the spaces, terrain field and config are parameters, rules are functions. The eight verbs are player-facing names for an action in a contact mode. Action count (4, 5 or 6) is resolved later. |
| EW-18 | Design order: feel of each main action first. Movement must have weight and good feedback like Death Stranding. Balance-loss behaviour is decided after. |
| EW-19 | Reference feel moment: too much weight on the back while climbing a slope. The prototype must get this right first. |
| EW-20 | Load affects stamina only, like Peak. No effect on balance. |
| EW-21 | The snow-peak slide, as in Death Stranding, is in the prototype. |
| EW-22 | Slide target: feels very good, good scenery during it, feels like the player is the one sliding. |
| EW-23 | Slide risk grows only when the player pushes speed. A relaxed slide is safe; a fast slide is a skill test. Replaces "high fall risk". |
| EW-24 | Prototype shape: one snow mountain. Climb under load, peak, slide down. |
| EW-25 | Prototype is built in HTML first. |
| EW-26 | Climbing in the prototype feels like Peak. |
| EW-27 | Prototype pass test: walking, climbing and sliding feel good. |

| EW-28 | Prototype design document approved (sections 1 to 11). Section 12, builder handoff with starting numbers, was added by Claude after approval and is not an owner decision. |
| EW-29 | After first playtest: feel pass and grappling hook test design approved ([design](2026-11-12-endless-walker-feel-pass-and-hook-spike.md)). Camera, screen effects, world VFX and sound for walk, climb, slide, hook, fall. All new numbers on the panel. |
| EW-30 | Grappling hook (Attack on Titan style: yank up, fly, keep momentum) is a **test only**, not in the GDD. Defaults: on, range 120 m, launch 9 m/s up, lift 4 m, gravity 50 percent while hooked. Keep or drop decided later. |
| EW-31 | Approach snow grip 0.35 to 0.18 so sliding down the climb side is fast. Speed effects start at 6 m/s. |
| EW-32 | Owner accepts the prototype state at end of 2026-11-12 ("let it like that"). Open: keep hook as a GDD idea or drop; real slide speed on the slide face. |

Prototype design document: [`2026-11-12-endless-walker-prototype.md`](2026-11-12-endless-walker-prototype.md)

## Proposals by Claude, not yet confirmed

- Slide is easy to enjoy and hard to go fastest; risk grows only with pushed speed. Launch point faces the next landmark. Low close camera, strong wind and snow feedback, little interface.

- Load takes up part of the stamina bar (Peak style). Locomotion does not read load. Feedback still shows load through lean, rhythm, breath and sound.
- Prototype shape: one snow mountain. Climb under load, peak, slide down.
- Slide first sketch in GDD section 9A.

- Slope is read two ways, along and across the heading, so zig-zag emerges. Load enters the prototype as a weight slider.

- Movement feel (GDD section 9A): feedback layer reads state and never changes it. Ten sources of weight. Capsule controller plus procedural lean and foot placement.

- Height as currency: earn it climbing, spend it sliding. Route planning is height planning.
- Rhythm: climb, peak vista, slide, valley walk.
- Obstacles are terrain property combos, not new mechanics.
- Core tension: speed vs stability.
- Biome consistency: fixed rules, biome = terrain property values.
- Scenery: rule-placed landmarks, landmark-first shaping, vista scoring.
- Unity, solo or small team, 3D (guess).

## Open

Logical space map (space by space), cost of slowness, growth currency, charting action, gear source, settlements or people, shared traces, trace decay, endgame, engine, team, view.
