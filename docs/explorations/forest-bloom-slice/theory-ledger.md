# Theory ledger — Forest_Bloom slice

An item counts as "did work" only with an evidence link.

| Item | Used in task | Changed a decision or caught an error | Evidence link | Verdict |
|---|---|---|---|---|
| L1 | 4 | No. Followed as a standing rule: shade, counts and Hill number kept out of state. No decision went differently | [operators.js](../../../prototypes/forest-bloom-slice/src/operators.js) | |
| L2 | | | | |
| L3 | | | | |
| L4 | | | | |
| L5 | 4 | No. Same as L1: derived values computed, not stored. Rule already obeyed by design | [state.js](../../../prototypes/forest-bloom-slice/src/state.js) | |
| L6 | | | | |
| L7 | | | | |
| L8 | | | | |
| L9 | | | | |
| L10 | | | | |
| L11 | 6 | Yes. Negative controls run before trusting the detector; both rejected, and N1 showed level 01 fails on the same checks as a uniform field | [rung-log](rung-log.md), [detector.test.js](../../../prototypes/forest-bloom-slice/test/detector.test.js) | |
| L12 | 6, 7 | Yes. Rung 0 is the smallest basis; the ladder could finally run because a detector exists | [rung-log](rung-log.md) | |
| L13 | | | | |
| L14 | 2, 6 | Yes. Predictions written before the run; one miss (V2) exposed a wrong mental model of the fill dynamics | [pre-registration](pre-registration.md), [rung-log](rung-log.md) | |
| L15 | | | | |
| L16 | 6 | Yes. Viability failed separately from the target: D2 and D4 passed while V1 and V2 failed. Without the split, "big wave" would look like success | [rung-log](rung-log.md) | |
| L17 | | | | |
| M1 | | | | |
| M2 | | | | |
| M3 | | | | |
| M4 | | | | |
| M5 | | | | |
| M6 | 6 | Yes. Best-versus-random skill gap (D1 1.59) is the measure that shows position does not matter | [rung-log](rung-log.md) | |
| P0 | | | | |
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| P4 | 4 | Partly. The read/write table fixed phase order, but it did **not** specify how overlapping `soilNear` contributions with different `enrichCap` combine; the result was order-dependent. Found by test-first implementation, not by the P4 table | [operators.js soilPhase](../../../prototypes/forest-bloom-slice/src/operators.js) | |
| P5 | 6 | Yes. P5 run as M6 only | [rung-log](rung-log.md) | |
| P6 | 6 | Yes. Viability invariant failed: pioneer monoculture covers the map | [rung-log](rung-log.md) | |
| P7 | | | | |
| I1 | | | | |
| I2 | | | | |
| I3 | | | | |
| I4 | | | | |
| I5 | | | | |
| I6 | | | | |

## Parked ideas

None yet.
