# Session memory — theory freeze and Forest_Bloom slice reference case (2026-11-12 to 2026-11-13)

**Workspace:** `G:\Projects\Researchs` (plan text still says `D:\Projects\Research`; repo moved). Continues [project review and plan session](2026-11-12-project-review-and-reference-case-plan-session.md). Substantive summary, not a transcript.

## Read first in the next session

| File | What |
|---|---|
| [v0.4 prune proposal](../.cursor/plans/design/2026-11-12-logical-space-v0.4-prune-proposal.md) | Vietnamese, **awaiting owner approval**. Next AG decided here |
| [theory ledger](../docs/explorations/forest-bloom-slice/theory-ledger.md) | Verdict per item L1–L17, M1–M6, P0–P7, I1–I6 plus parked ideas |
| [rung log](../docs/explorations/forest-bloom-slice/rung-log.md) | Rungs 0–3, predictions vs actual, caveats, provenance note |
| [pre-registration](../docs/explorations/forest-bloom-slice/pre-registration.md) | Thresholds and predictions, committed before any run |
| [README](../docs/explorations/forest-bloom-slice/README.md) | P0, basis, species and operator tables, perceivability table, view checks |
| [plan](../.cursor/plans/implement/2026-11-12-forest-bloom-slice-reference-case.md) | The executed 10-task plan |
| Ledger (git-ignored) | `.superpowers/sdd/2026-11-12-forest-bloom-slice-reference-case/progress.md`: every task line and every Ruling |

## How the session went

1. Owner recalled the plan; asked whether it was written for Gemini or Opus. Answer: written by Claude (likely Sonnet 5.5) for **inline Claude execution** (`superpowers:executing-plans`); not Gemini-shaped (no Task 0, no stop-on-anchor rules).
2. Owner invoked `superpowers:executing-plans`. Read as approval of the plan, the reversal of the 2026-11-03 deferral, the untested pre-registered values, and local commits (ledger rulings).
3. Tasks 1–8 executed inline, TDD, on branch `study/forest-bloom-slice`.
4. Executor stopped at Task 9 (owner playtest). Owner allowed the whole-branch reviewer subagent (opus). Fixes applied.
5. Owner played the demo: seed buttons needed 3–4 clicks; fixed (`93e70cd`). Owner confirmed demo good.
6. Owner proposed adding a rules guide; assistant warned it would invalidate PT2; owner first chose "full rules", then cancelled: **no guide**.
7. Owner ran view checks: 4 of 5 perceivability rows seen, **shade kill not seen** (no canopy alive); file:// message OK.
8. Owner **deferred the P7 playtest**, then asked for Task 10 without it. Written.
9. Owner asked to fold the session into memory and playbook. Playbook v3.2 got 12 lesson rows (section 4 only; 13-step process unchanged, waiting for v0.4 approval). This was an owner-requested exception to the plan rule "do not edit playbook before approval".

## Results

| Item | Result |
|---|---|
| Ladder | Pass at rung 3 of budget 0–4. Rung 1 pioneer `enrichCap` 3→0; rung 2 canopy `minSoil` 4→3; rung 3 shrub `lifespan` 10→7 |
| Detector rung 3 | D1 4.25, D2 0.28, D3 0.129, D4 11; V1, V2 pass; N1, N2 rejected at every rung |
| Predictions | 8 of 10 hit; misses V2 (rung 0) and HY-1 (passed with 28 config values) |
| Caveats | Viable band shrub `lifespan` 6–7 only; shrub 85% of trees; **0 canopy alive**; shade kill not perceivable |
| Method lesson | V2 "k = 2 of 3 species" let an extinct species pass; P6 should name which components must survive |
| Ledger verdicts | Keep 13, Keep untested 9, Merge 6, Cut candidate 9 (L1, L2, L3, L4, L7, M1, M4, P2, P3). L1 and L5 proposed as one ontology rule instead of cut |
| Proposed v0.4 | About 10 principles, 3 measures (M3, M5, M6), 4 gates; M1, M4 to maths appendix; P0+P1 one sheet; P6 fixed |
| Tests | 38 reported by `node --test` (37 real; `test/helpers.js` counts as one file) |
| Final review | 0 Critical. Fixed: result files named the wrong revision (now `-dirty` marker, rung 3 re-run clean); bad level headers gave NaN (now throws with line). Deferred minors: D1 shown 4.26 vs 4.2549; missing-header error has no line; only one trailing blank line tolerated |

## Rulings made on the owner's behalf (full list in ledger)

| Ruling | Cost if wrong |
|---|---|
| Overlapping soil contributions: negatives first, positives by ascending `enrichCap`, never lowering | Border soil differs; rerun detector |
| Viability must hold on every one of the last 8 ticks | Stricter than final-tick only |
| Rung 0 mechanics tests use frozen `RUNG0` fixture | None |
| D3 fixed before V1 | Different rung order, same end config |
| Re-graded reviewer's NaN-header Minor to Important | One small fix |
| Task 10 written without P7; L13, L17, P7 verdicts may change | Revise after playtest |

## Open for the owner

| Item | Detail |
|---|---|
| v0.4 proposal | Approve, change, reject. If approved: record next AG, then edit core, playbook steps, Designer Guide |
| P7 playtest | Deferred. Kit: `docs/explorations/forest-bloom-slice/playtest-protocol.md`, `playtest-results.md`. Serve `python -m http.server 8000` in `prototypes/forest-bloom-slice`, open `http://localhost:8000/web/` |
| Canopy | Next rung only after P6 is fixed to require canopy alive |
| Branch | `study/forest-bloom-slice`, local commits, not pushed or merged. Older branch `theory/v0.3-critique-and-study` also still unmerged (carried over) |

## Working-style notes

- Owner gives short go/defer commands ("defer it now", "write task 10 without playtest") and expects execution, not re-asking.
- Owner tests the demo personally and reports feel problems ("need to click 3–4 times"); fix root cause, ask for a recheck.
- Owner allowed a reviewer subagent when asked; still ask first (project rule `no-unrequested-subagents.md`).
- Caveman mode (full) active; Opus 5.5 this session.
