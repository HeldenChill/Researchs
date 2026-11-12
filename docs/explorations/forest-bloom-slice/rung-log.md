# Rung log — Forest_Bloom slice

One row per rung, one change per rung (L12). Budget: 5 rungs (0 to 4).

| Rung | One change | D1 | D2 | D3 | D4 | V1 | V2 | N1 fails | N2 fails | Verdict | What was missing |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Baseline species table | 1.59 fail | 1.00 pass | 0.19 fail | 12 pass | fail | fail | yes | yes | **Fail** | Pioneer wave floods all 126 open cells within 12 ticks from almost any start (mean 79 of best 126), so position barely matters (D1, D3). Greedy plays 2 seeds, then the map is full: shrub and canopy are never planted (V1, V2). Evidence: [rung-0.json](../../../prototypes/forest-bloom-slice/results/rung-0.json) |
| 1 | Pioneer `enrichCap` 3 to 0: pioneers no longer lift bare soil | 3.64 pass | 0.28 pass | 0.154 fail | 11 pass | fail | pass | yes | yes | **Fail** | Before: D1 and D3 failed because the pioneer wave crossed soil 0 everywhere. Regime map [enrichCap x lifespan](../../../prototypes/forest-bloom-slice/results/regime-1.enrichCap-1.lifespan.csv): only cap 0 changes anything, so the change sits on the flip edge (cap 1 flips back), L10 cannot be satisfied for a 0/1 switch. After: position matters (best is a shrub at cell 111), D3 misses by one action (4 of 26 near-best). New failure: shrub takes 106 of 116 trees (91%), V1. Evidence: [rung-1.json](../../../prototypes/forest-bloom-slice/results/rung-1.json) |
| 2 | Canopy `minSoil` 4 to 3 | 4.26 pass | 0.28 pass | 0.129 pass | 11 pass | fail | pass | yes | yes | **Fail (detector passes)** | Before: D3 missed by one action and V1 failed. Regime map [canopy minSoil x shrub lifespan](../../../prototypes/forest-bloom-slice/results/regime-3.minSoil-2.lifespan.csv): minSoil 2 and 3 give the same detector values, 4 flips, so 3 has one safe side. After: D1 to D4 all pass. V1 still fails: greedy ends with 106 shrubs of 116 trees and no canopy alive. Evidence: [rung-2.json](../../../prototypes/forest-bloom-slice/results/rung-2.json) |
| 3 | Shrub `lifespan` 10 to 7 | 4.26 pass | 0.28 pass | 0.129 pass | 11 pass | pass | pass | yes | yes | **Pass** | Before: shrub monoculture (V1). Regime map [shrub lifespan at canopy minSoil 3](../../../prototypes/forest-bloom-slice/results/regime-2.lifespan-3.minSoil.csv): viable only at 6 and 7; 5 and 8 fail. Both choices sit next to a flip, so L10 is only half met. After: greedy ends with 16 pioneers, 88 shrubs (85%, just under the 90% limit), **0 canopy**. Evidence: [rung-3.json](../../../prototypes/forest-bloom-slice/results/rung-3.json) |

## Rung 0 against predictions (ID-1)

| Item | Predicted | Actual | Hit |
|---|---|---|---|
| D1 | Fail | Fail, 1.59 | Yes |
| D2 | Pass | Pass, 1.00 | Yes |
| D3 | Fail | Fail, 0.19 | Yes |
| D4 | Pass | Pass, 12 | Yes |
| V1 | Fail | Fail | Yes |
| V2 | Pass | **Fail**: only pioneers alive | **Miss**. I expected shrub to survive on rich patches; in fact the map fills before a shrub can be planted, so the inventory goes unspent |
| N1 rejected | Yes | Yes, D1 1.16 | Yes |
| N2 rejected | Yes | Yes, best 1 | Yes |

Note: N1 and level 01 fail on the same checks (D1, D3). At rung 0 the detector cannot yet tell level 01 apart from a uniform field; that is the finding, not a detector defect.

## Result: detector and viability reached at rung 3

Passed with 4 rungs of the 5-rung budget (rung 0 to rung 3), three single-value changes.

Honest caveats, carried into the playtest and the theory ledger:

| Caveat | Why it matters |
|---|---|
| Viable band is narrow: shrub `lifespan` 6 or 7 only | The pass sits between two flips (L10). A small balance change can lose it |
| Shrub holds 85% of trees, limit 90% | V1 passes by 5 points. Visually the map is still mostly one colour |
| No canopy alive at the end of greedy or random play | Third species does no work at the end state; V2 passes on pioneer plus shrub. Succession to canopy is not happening |
| The best first action is a shrub at cell 111, cascade 35 cells | The I6 wave is a shrub wave, not a pioneer-to-canopy succession |
| HY-1 proxy count | 24 species values plus 4 level scalars (`ticksPerTurn`, 3 inventory) = 28, at most 30: **pass**, if grid cells are counted as level data, not config. Prediction was fail: **miss** |
