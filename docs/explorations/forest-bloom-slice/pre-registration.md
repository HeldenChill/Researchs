# Pre-registration — Forest_Bloom slice (L14)

Written 2026-11-12, **before** any code or detector run. After this file is committed, thresholds change only by a dated amendment line that states the reason; old values stay visible. The assistant chose all values below, and they are untested starting guesses.

## Detector for I6

Computed on the start state of level 01 over every legal first action, horizon 12 ticks.

| ID | Condition | Threshold |
|---|---|---|
| D1 | Skill gap: best cascade size divided by mean cascade size | at least 3.0 |
| D2 | Best cascade size as a share of non-rock cells | at least 0.25 |
| D3 | Share of legal actions whose size is at least 0.8 of the best | at most 0.15 |
| D4 | Depth of the best cascade: ticks in which it still grew. Separates an iterated wave from a hand-written radius rule, AG-7 | at least 6 |

## Viability

Checked on the greedy playthrough of level 01 over the last 8 ticks (W = 8).

| ID | Condition |
|---|---|
| V1 | No species holds 90% or more of trees while total trees exceed 12 |
| V2 | At least 2 species alive (k = 2 for a 3-species slice) |

q is not used: the slice is deterministic with one level.

## Detector validity (L11)

The detector must **fail** on both negative controls or it is not a detector.

| Control | Definition |
|---|---|
| N1 uniform field | 12 by 12, no rock, all soil 1, same inventory |
| N2 no iteration | Level 01 with every species' `matureAge` set to 999 |

## Player gate P7

5 players (minimum 3).

| ID | Condition |
|---|---|
| PT1 | At least 60% of players keep playing 5 minutes or more after being told they may stop |
| PT2 | At least 60% of players name a correct cause in the retell: soil getting richer, shade, or the species order |

## Hypotheses

| ID | Statement for this slice | Status |
|---|---|---|
| HY-1 proxy | The slice passes the detector with at most 30 config values in total | Tested |
| HY-2 | Emergence measure correlates with player surprise | Not tested: one slice |
| HY-3 | Events listed in the perceivability table are the ones players retell | Tested in P7 |
| HY-4 | State, config and derived split reduces sync bugs | Not tested: one slice |

## Predicted outcomes (ID-1), written before running

Reasoning: most of level 01 is soil 0. A mature pioneer raises its neighbours to soil 1 in phase 3 and seeds them in phase 4 of the same tick. So a pioneer planted almost anywhere on soil 1 should flood the open area, and position should matter little.

| Item | Predicted | Why |
|---|---|---|
| D1 | Fail | Pioneers flood from most starting cells, so best and mean are close |
| D2 | Pass | One pioneer wave should cover a quarter of the open cells within 12 ticks |
| D3 | Fail | Many first actions reach near the best size |
| D4 | Pass | Spread is one cell per tick, so the best wave grows for 6 or more ticks |
| V1 | Fail | Pioneers dominate early; shrub and canopy need soil 3 and 4 |
| V2 | Pass | Greedy plays all three species; some shrub survives on rich patches |
| N1 rejected by detector | Yes | Uniform field gives equal cascades |
| N2 rejected by detector | Yes | No seeding means every cascade is 1 |
| PT1 | Fail | No progression, one level |
| PT2 | Pass | Soil darkening ahead of the wave is visible |
| HY-1 proxy | Fail | Expect rung 0 to fail and need changes |
| HY-3 | Unknown | No basis to guess |

## Amendments

None.
