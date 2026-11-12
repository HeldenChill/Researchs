# Theory ledger — Forest_Bloom slice

An item counts as "did work" only with an evidence link.

| Item | Used in task | Changed a decision or caught an error | Evidence link | Verdict |
|---|---|---|---|---|
| L1 | 4 | No. Followed as a standing rule: shade, counts and Hill number kept out of state. No decision went differently | [operators.js](../../../prototypes/forest-bloom-slice/src/operators.js) || **Cut candidate** as a separate rule; see note |
| L2 | — | No. Applicable (ablation of one species or operator), but the plan never ran it. One ablation would have asked whether canopy earns its place, given 0 canopy at the end | — | **Cut candidate**, or keep only if an ablation run is added to the method |
| L3 | 2 | No. The 3-species basis came straight from P0; no choice between rival bases came up | — | **Cut candidate** |
| L4 | 2 | No. Integer soil 0 to 5 was chosen without the rule; nothing went differently | — | **Cut candidate** |
| L5 | 4 | No. Same as L1: derived values computed, not stored. Rule already obeyed by design | [state.js](../../../prototypes/forest-bloom-slice/src/state.js) || **Merge** with L1 into one ontology rule |
| L6 | 6 | Yes. Became control N2 (no iteration) and check D4 (depth). N2 rejected at every rung: the wave is iterated, not a hand-written radius | [rung-log](rung-log.md), [detector.js](../../../prototypes/forest-bloom-slice/src/detector.js) | **Keep** |
| L7 | — | No. Never invoked | — | **Cut candidate** |
| L8 | 2 | Only through P0, which picked I6 | [pre-registration](pre-registration.md) | **Merge** into P0 |
| L9 | 6 | Only through V1: the dominant outcome (monoculture) was filtered by the viability check | [rung-log](rung-log.md) | **Merge** into L16 |
| L10 | 7 | Yes. Regime maps changed every rung choice: showed enrichCap 1 to 5 is flat (rung 1), minSoil 3 has one safe side (rung 2), shrub lifespan viable only at 6 and 7 (rung 3). Also exposed that the pass is fragile | [rung-log](rung-log.md), `results/regime-*.csv` || **Keep** |
| L11 | 6 | Yes. Negative controls run before trusting the detector; both rejected, and N1 showed level 01 fails on the same checks as a uniform field | [rung-log](rung-log.md), [detector.test.js](../../../prototypes/forest-bloom-slice/test/detector.test.js) || **Keep** |
| L12 | 6, 7 | Yes. Rung 0 is the smallest basis; the ladder could finally run because a detector exists | [rung-log](rung-log.md) || **Keep** |
| L13 | 8 | Partly. The perceivability table was written before view code and drove what the view draws (soil colour, shade overlay, pulse). It also caught a stale row: after rung 1 the Succession cause is shrub enrichment, not pioneers. Player check still pending | [README perceivability](README.md) || **Keep** |
| L14 | 2, 6 | Yes. Predictions written before the run; one miss (V2) exposed a wrong mental model of the fill dynamics | [pre-registration](pre-registration.md), [rung-log](rung-log.md) || **Keep** |
| L15 | — | One level, by design | — | **Keep, untested** |
| L16 | 6 | Yes. Viability failed separately from the target: D2 and D4 passed while V1 and V2 failed. Without the split, "big wave" would look like success | [rung-log](rung-log.md) || **Keep** |
| L17 | 8 | Yes. Viability compressed to one saturation level plus a trend arrow; no numbers but seed counts. Whether it works is a P7 question | [main.js](../../../prototypes/forest-bloom-slice/web/main.js) || **Keep, untested** (needs P7) |
| M1 | — | No. Honest check: in Tasks 6 and 7 every decision came from the regime map and the detector checks. Sobol shares or Boolean Fourier would only have said "interactions exist", which N2 already shows | — | **Cut candidate** |
| M2 | — | No as a measure. The nearest thing was the ID-1 prediction miss (V2), which belongs to L14 | — | **Merge** into L14 (prediction gap) |
| M3 | — | Needs several strong agents; the slice has one greedy agent | — | **Keep, untested** |
| M4 | — | No. Honest check: no decision in Tasks 6 and 7 needed decay, cycle or runaway modes; the rung failures were read directly from counts | — | **Cut candidate** |
| M5 | — | No affordance shift in this slice | — | **Keep, untested** |
| M6 | 6 | Yes. Best-versus-random skill gap (D1 1.59) is the measure that shows position does not matter | [rung-log](rung-log.md) || **Keep** |
| P0 | 2 | Yes. Fixed the target (I6), the skill measure (M6) and the separate viability list before any code | [README](README.md), [pre-registration](pre-registration.md) | **Keep** |
| P1 | 2 | Partly. The basis and operator tables were written, and Task 3 to 5 code mirrors them; no decision changed | [README](README.md) | **Merge** into P0 (one sheet: P0 plus basis and operator tables) |
| P2 | — | No. Derivation, save-game and category tests were never run | — | **Cut candidate** |
| P3 | — | No. No coverage matrix written | — | **Cut candidate** |
| P4 | 4 | Partly. The read/write table fixed phase order, but it did **not** specify how overlapping `soilNear` contributions with different `enrichCap` combine; the result was order-dependent. Found by test-first implementation, not by the P4 table | [operators.js soilPhase](../../../prototypes/forest-bloom-slice/src/operators.js) || **Keep**, needs a combination-rule line |
| P5 | 6 | Yes. P5 run as M6 only | [rung-log](rung-log.md) || **Merge** into M6 (P5 was M6 only) |
| P6 | 6 | Yes. Viability invariant failed: pioneer monoculture covers the map | [rung-log](rung-log.md) || **Keep** |
| P7 | 8, 9 | Partly. The perceivability half did work: the owner view check found that shade kill cannot be seen because no canopy survives. The playtest half was **not run** (deferred by owner 2026-11-13) | [README](README.md) view checks | **Keep**; playtest half untested |
| I1 | — | Not a target | — | **Keep, untested** |
| I2 | 6 | Used as a viability condition (L16), not a target | [pre-registration](pre-registration.md) | **Keep, untested** as target |
| I3 | — | Not a target | — | **Keep, untested** |
| I4 | — | Not a target; needs player reports | — | **Keep, untested** |
| I5 | — | Not a target | — | **Keep, untested** |
| I6 | 2, 6, 7 | Yes. The whole run was built on it; the detector for I6 is the first working detector of the project | [rung-log](rung-log.md) | **Keep** |

## Note on L1 and L5

By the mechanical rule they are cut candidates: nothing went differently with them in this slice. That is weak evidence against them, because the plan author already knew the rules, so their value would be preventive and cannot show up in one case built by someone who follows them. Proposal: keep them as one ontology rule, test them on a case built by someone else (HY-4).

## Parked ideas

| Idea | Source |
|---|---|
| P4 read/write tables should state how simultaneous contributions to one cell combine (order, caps) | Task 4 ruling |
| Ablation run per species or operator as a cheap L2 check | Ledger L2, 0 canopy |
| Regime map should report robustness: distance from the pass point to the nearest flip | Rung 3 band 6 to 7 |
| Result files must name the exact code revision, marked dirty if uncommitted | Final review |
