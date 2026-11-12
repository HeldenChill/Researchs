# Forest_Bloom Slice — Reference Case

Smallest Forest_Bloom slice used as the first full reference case for the Logical Space method (theory frozen at `2026-11-03-logical-space-v0.3-draft`). Plan: [2026-11-12-forest-bloom-slice-reference-case.md](../../../.cursor/plans/implement/2026-11-12-forest-bloom-slice-reference-case.md). Code: [prototypes/forest-bloom-slice/](../../../prototypes/forest-bloom-slice/).

## P0 (approved 2026-11-03, critique record section 2.3)

| P0 item | Content |
|---|---|
| Target interestingness | **I6 chain reaction**: a seed in the right place starts a spreading wave of recovery and succession |
| Skill expression | "Right place" must matter: the cascade from the best cell is much longer than from a random cell (M6: best versus random) |
| Viability condition (L16) | Several species coexist; no species takes the whole map |
| Player loop | Look at the map, pick seed and cell, watch the wave, understand why it spread or stopped, plant again |
| Perceivability (L13) | Causes of spread (soil, shade) and effects (new species) are visible |
| Progression (L15) | Out of scope for this slice: one level only |

## Basis table, rung 0

| Entry | Class | Notes |
|---|---|---|
| Species type: pioneer 1, shrub 2, canopy 3 | Vocabulary, config | Parameters in the species table |
| Rock mask, initial soil, seed inventory, ticks per turn | Level config | Progression structure, L15 |
| `soil` per cell, integer 0 to 5 | State | |
| `species` per cell, 0 for empty | State | |
| `age` per cell | State | |
| `inventory` per species, `tick` | State | |
| Shade, counts, coverage, Hill number, trend | Derived | Never stored |

## Species table, rung 0

| Field | pioneer | shrub | canopy | Meaning |
|---|---|---|---|---|
| `minSoil` | 1 | 3 | 4, **3 from rung 2** | Soil needed to germinate and to stay alive |
| `soilSelf` | 0 | 0 | -1 | Soil change on own cell per tick |
| `soilNear` | 1 | 1 | 0 | Soil change on each 4-neighbour per tick |
| `enrichCap` | 3, **0 from rung 1** | 5 | 5 | A positive `soilNear` never lifts a cell above this |
| `matureAge` | 1 | 2 | 3 | Age from which the plant seeds neighbours |
| `lifespan` | 6 | 10, **7 from rung 3** | 16 | Dies when age exceeds this |
| `shadeLimit` | 1 | 3 | 5 | Dies when canopy 4-neighbours reach this count |
| `rank` | 1 | 2 | 3 | Higher rank wins a contested empty cell |

## Operator table, one tick

Each phase reads the result of the phase before it and writes synchronously.

| Order | Operator | Reads | Writes |
|---|---|---|---|
| 1 | `agePhase` | species | age plus 1 for every plant |
| 2 | `mortalityPhase` | age, soil, species, config | removes a plant when age exceeds `lifespan`, or soil is below `minSoil`, or canopy neighbours reach `shadeLimit` |
| 3 | `soilPhase` | surviving plants, config | soil, clamped 0 to 5; positive `soilNear` respects `enrichCap` |
| 4 | `germinatePhase` | snapshot after phase 3 | each empty non-rock cell takes the highest-rank species among mature 4-neighbours whose `minSoil` the cell meets; new plant age 0 |

## Data flow

```mermaid
flowchart LR
    Cfg["config.js species table"] --> Tick
    Lvl["level-01.txt"] --> St["state: soil, species, age, inventory, tick"]
    Act["action: species and cell"] --> St
    St --> Tick["tick: age, mortality, soil, germinate"]
    Tick --> St
    St --> Der["derived: counts, hill, shade, coverage"]
    Der --> Bnd["boundary: viability, outcome"]
    Der --> Obs["observe: Y map for the view"]
    St --> Det["detector: cascade profile"]
```

## Perceivability table (L13, written before any view code)

| Target event | Cause the player sees | Effect the player sees |
|---|---|---|
| Wave spreads | Ground gets darker and richer ahead of the wave: soil 0 pale sand to soil 5 dark brown | New plants appear cell by cell, one tick at a time |
| Wave stops | Rock; pale soil that the species cannot use | Front line stops |
| Succession | Rich soil ring behind pioneers | Shrub then canopy colours replace pioneer colour |
| Shade kill | Dark overlay on cells next to canopy | Pioneer fades out |
| Monoculture risk | Whole map loses colour saturation; trend arrow points down; border of the dominant species pulses | Player plants a different species |

Note after rung 1: pioneers no longer enrich bare soil (`enrichCap` 0), so the "rich soil ring behind pioneers" cause in the Succession row is now produced by shrubs, not pioneers. The row stays as written (L14); the playtest checks whether players read it anyway.

## View checks (Task 8 step 5)

| Check | Status | Evidence |
|---|---|---|
| Served at `http://localhost:8000/web/`: page, module scripts and level file load | **Observed 2026-11-12** | HTTP 200 for `web/`, `web/main.js`, `src/observe.js`, `levels/level-01.txt` (port 8011 used for the probe) |
| `file://` fallback message visible | **Pending**: not opened in a browser. By construction the message is in static HTML and only `main.js` removes it; browsers block module scripts on `file://`, so it should stay | `web/index.html` |
| Each perceivability row visible in play | **Pending**: needs a person at a browser. The executor had no browser session. Owner checks before Task 9 | — |

Run: `python -m http.server 8000` in `prototypes/forest-bloom-slice`, open `http://localhost:8000/web/`.
