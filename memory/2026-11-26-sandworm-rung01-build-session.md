# Session 2026-11-26 (later): Sandworm rung 0 and rung 1, from logical space to code

Substantive summary, not a transcript. Owner wrote short English. Follows [the research and demo session](2026-11-26-sandworm-coop-logical-space-session.md). Model: Sonnet 5.5, caveman full. No subagents.

## Resume here

**Waiting on the owner: gate G3.** `approvedBy` and `approvedOn` in `prototypes/sandworm-coop/thresholds.json` are `null`. Only the owner fills them. Then T15 (sweep) and T16 (checklist, README), then the final review that `executing-plans` requires.

| File | Holds |
|---|---|
| [spec](../.cursor/plans/design/2026-11-26-sandworm-rung01.md) | Assumptions A-1 to A-7, gaps G1 to G20, model, rung 0, thresholds (section 7), bots, R1-D1 |
| [plan](../.cursor/plans/implement/2026-11-26-sandworm-rung01.md) | Owner gates G1 to G4, tasks T0 to T16; T0 to T14 ticked |
| `prototypes/sandworm-coop/` | TypeScript on Node 24, no dependencies. Test: `node --test "test/*.test.ts"` |
| `prototypes/sandworm-coop/results/rung0.md` | Numbers sheet |
| `.superpowers/sdd/2026-11-26-sandworm-rung01/progress.md` | Ledger with all rulings. Git-ignored scratch; `git clean -x` would remove it |
| `docs/explorations/sandworm-coop-survival/demo/src/plan.ts`, `worktree.ts` | Work graph in the HTML demo (data is a hand copy of the plan) |

**State on disk:** branch `feat/sandworm-rung01`, HEAD `2c29d28`, **nothing committed**. The branch also carries the earlier uncommitted demo, `logical-space.md` and memory changes. `main` was not touched.

## Timeline

1. Owner pasted a brief: turn the logical space into dev tasks, spec and plan only. Two `<...>` fields (builder, tech) were left blank.
2. First reply: goal, tree draft, 18 gaps, 7 blocking questions.
3. Owner added: "build task like a tree, with branch for me", "base on the theory we are already build".
4. Owner: "you build this plan" and put an interactive work tree in the HTML demo. Questions unanswered, so recommendations became labelled assumptions A-1 to A-7. Spec, plan and clickable tree written.
5. Owner ran `/superpowers:executing-plans`. Read as G1 accepted. T0 to T2 built; stopped at G2.
6. Before G3 the assistant flagged a flaw in its own idle rule. Owner replied "a". Read as that choice plus G2 accepted with no placeholder change.
7. T3 to T14 built. Stopped before T15.
8. Owner: show the work tree as a graph, branch nodes with titles, last leaf the logical-space theory. Built.
9. Owner asked "you build a demo?". Answer: explainer page yes, playable or watchable game demo no.
10. This memory and playbook v3.4.

## Decisions and their status

| Item | Status |
|---|---|
| A-1 builder is Claude later, A-2 TypeScript and folder, A-4 full pit refuses food, A-5 expired item becomes the breach, A-6 bare-hand sealing, A-7 two spots | **Accepted indirectly** by running the plan. Never restated by the owner |
| A-3 "branch for me" = owner decision branch | Assumed, never confirmed |
| R1-D1: the walk back to the mouth is work, idle = standing at the mouth with no job | **Owner chose** ("a"), before any run. No threshold number changed |
| Rung 0 sheet, placeholders unchanged | Owner accepted indirectly ("a") |
| Thresholds | **Proposed, not approved** |
| Work graph reading: one theory leaf per task path (not one shared final node) | Assumed; owner has not answered |
| Replay viewer for the sim | Offered, not decided. Assistant recommends after G3 |

A-4 **replaces** the earlier first-in-first-out acid queue proposal for rung 1, so there is no `acid_order`. `logical-space.md` section 9 was **not** updated.

## Results

| Result | Value |
|---|---|
| Rung 0, 162 settings | ok 84, starve 36, overload 42, incapable 0. Pass |
| Base point | 3 crew, capacity 2, walk 40 ticks: arrival gap 34 to 80 ticks is ok. At 80 supply equals demand, no margin |
| Capacity 1 | Walk length changes no verdict; the pit always limits |
| Rung 1 tests | 104 pass, 0 fail (fresh run at memory time) |
| Fuzz | 20 seeds, up to 2000 random steps: no invariant broken, all 8 event kinds occurred |
| Tick order teeth | Moving damage before sealing broke 2 tests. Other order pairs not mutated |
| Sweep, predictions R1-P1, P2, P3, V1 | **Not run.** No run metrics from placeholder settings were printed or read |
| TypeScript | Never type-checked |
| P5 emergence, P7 player, I7 | Not run; rung 1 has one role and cannot test I7 |

## Biggest findings about the logical space

1. `logical-space.md` section 9 was not runnable as written: with O7 and throw cut, **nothing could put food in the acid**.
2. Two proposals together (only non-acid items age + unlimited waiting queue) made food in the acid safe forever, so capacity never caused a breach.
3. Section 9 listed a crew slot and also place `held`: duplicated state; the slot is derived.
4. Y has **zero** leaves in the work graph: nothing built here tests what a player sees. 10 of 21 leaves are gates or principles.

## Rulings the assistant made while building

- G1 and G2 taken from indirect replies (above).
- Branch created instead of building on `main`; no commits.
- Test glob `test/*.test.ts` because bare `node --test` counted `fixtures.ts` as a passing test.
- Idle rule is stateless: a return after sealing or a vanished job also counts as work.
- Bots: with two holders and one pit space, the second waits as `blocked`.
- Boundary cases tested through `outcome()`, since `step` throws on an ended run.
- T4 to T10 tests written together, watched failing, then implemented.
- A test the assistant added expected idle share 0.5; a trace showed 0.6 was right (the bot walks back during digestion). Code, plan values and thresholds unchanged.
- Task 3's completion command ended in `; true` and could not fail; the log showed 23 pass.

## Work graph in the demo

Root → branch title → (sub-branch) → task → theory leaf. 21 tasks, 7 branch nodes. Theory chips light matching leaves; dashed arrows show direct dependencies; branches fold; recorded progress is preloaded (17 of 21) and ticks stay in the browser (`localStorage`). Headless Chrome: no console errors, no node overlap, no text past a node's right edge in three layouts, no page sideways scroll at 390 px. Screenshots caught a sticky detail panel **covering the whole graph** that the first checks missed; fixed. Not checked: real phone, other browsers. Mermaid diagrams in the new spec and plan were never rendered.

## Open next

1. Owner: approve or change thresholds (G3).
2. T15, T16, final review.
3. Owner may answer: one leaf per task or one shared final node; replay viewer; A-3.
4. Follow-ups: update `logical-space.md` section 9 with G1 to G20; add the case to core theory section 10; rung 2 (pieces, SW-1, SW-3); optional `tsc` (needs a dependency).
5. Commit only when the owner asks.

## Working-style notes

- Owner gives short directive messages, sometimes mid-turn, and short choices ("a").
- "You build this plan" meant: stop asking, use recommendations, deliver.
- Owner wants work shown visually: a tree, then a graph, tied back to the theory.
