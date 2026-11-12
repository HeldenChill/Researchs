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
| L11 | | | | |
| L12 | | | | |
| L13 | | | | |
| L14 | | | | |
| L15 | | | | |
| L16 | | | | |
| L17 | | | | |
| M1 | | | | |
| M2 | | | | |
| M3 | | | | |
| M4 | | | | |
| M5 | | | | |
| M6 | | | | |
| P0 | | | | |
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| P4 | 4 | Partly. The read/write table fixed phase order, but it did **not** specify how overlapping `soilNear` contributions with different `enrichCap` combine; the result was order-dependent. Found by test-first implementation, not by the P4 table | [operators.js soilPhase](../../../prototypes/forest-bloom-slice/src/operators.js) | |
| P5 | | | | |
| P6 | | | | |
| P7 | | | | |
| I1 | | | | |
| I2 | | | | |
| I3 | | | | |
| I4 | | | | |
| I5 | | | | |
| I6 | | | | |

## Parked ideas

None yet.
