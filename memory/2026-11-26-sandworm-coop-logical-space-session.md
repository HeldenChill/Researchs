# Session 2026-11-26: Co-op Sandworm Survival — research, logical space, HTML demo

Substantive summary, not a transcript. Owner discussed in English this session.

## Read first next session

| File | Holds |
|---|---|
| [`logical-space.md`](../docs/explorations/sandworm-coop-survival/logical-space.md) | **Current** vocabulary, state, actions, 25 operators, tick order, split rules (6.7), open questions (11) |
| [`README.md`](../docs/explorations/sandworm-coop-survival/README.md) | Research: design summary, prior art, P0, loops, findings F-1 to F-11, feelings, Y, ladder, risks. Section 5 is **replaced** by `logical-space.md` |
| [`logical-space-demo.html`](../docs/explorations/sandworm-coop-survival/logical-space-demo.html) | Explainer page for people who already know the game design |
| `docs/explorations/sandworm-coop-survival/demo/` | Demo source; rebuild with `node build.mjs` |

## Timeline

1. Recall of project memory and core theory v0.3.1.
2. New idea from owner's file `C:\Users\Hung\Downloads\system_design_portable.html` (Vietnamese SDD, outside the repo): co-op 4 to 5 players, one Driver steers a sandworm, 3 to 4 Crew work inside it, race from A to B before an apocalypse.
3. Research document, then a focused basis, operator and logical-space document.
4. Decisions SW-1 to SW-3 (below).
5. Reading guide for the logical-space document.
6. HTML demo with embedded Motion Canvas scenes.
7. This memory and playbook update.

## Owner decisions

| ID | Decision |
|---|---|
| SW-1 | A split item becomes several separate piece instances (not one item with a counter) |
| SW-2 | "Only have 1 slot, but it have max capacity to digest in 1 time": one acid pit with a maximum capacity. What fits digests together (assistant reading) |
| SW-3 | Each piece's allergy hunger loss follows its proportion; all pieces add up to the original's loss |

**Deferred by owner** ("all you ask is not affect to our logical space. It will be decide later"): allergy slowdown, acid flood and tumor scaling; pit capacity unit (size assumed; if object count is chosen, drop the `size` property).

**Still proposals, not agreed:** pieces keep the whole's neglect age; break once into equal shares; breach damage scales with mass; first-in-first-out acid queue and capacity at least the largest whole; pieces yield sums to the whole's; "organic" is derived from currency yield; I7 primary and I4 secondary targets with thresholds (the owner never answered).

## Key content results

| Item | Result |
|---|---|
| Strongest design idea | Cargo and dungeon are the same thing: what the Driver bites is the Crew's work, and the Crew's work becomes the Driver's speed, bite and survival |
| Loops (L19) | Driver and Crew outputs return to each other as system state: one coupled system with two player loops |
| Basis sorting | Rooms are config; heart allocation is state; digest, trip, shake, bite are operators; tyre, engine, tools are config rows; operators read properties, never names |
| Split | Closure: Break maps items to items in the same set, so all operators apply with no piece rules. State added: `share` (replaced `form` after SW-3), `break_progress`, `acid_order`, next id |
| Pieces digest faster than their share | Large whole 10 to 12 s, each third 3 s (source); with capacity 3, about 3 to 4 times pit throughput. Hammer time, hauling and clutter must be the cost |
| Pair carry (source speeds) | Two solo carriers 90 speed units against 85 for a pair, if each has a separate item |
| Source file checks (ran its code, 20,000 seeds) | Interior generator gives only 3 connection layouts; always 1 cycle, so not a spanning tree; rear exit missing; brain is a dead end behind the heart |
| Source mismatches | Header says 6 tools, list has 7; bite level listed 1 to 4 but heart demo allows 0; Driver periscope and mini-anatomy conflict with the asymmetry pillar |
| Evidence level | Paper only except the two demo-code checks. No simulation, no playtest. Prior art is search summaries; pages not read |

## HTML demo

- Single self-contained file, 229 KB. Three real Motion Canvas 3.17.2 scenes (one engine with a synced save-file ledger, pit capacity, shake loop) through core `Player` and `Stage`; plus sorter, allergy-share widget, value-to-rule lookup (16 of 25 rules), open items.
- `demo/build.mjs` copies source to a temp folder, junctions `D:/Projects/MotionCanvas/my-animation/node_modules`, replaces the Motion Canvas plugin's Rollup input with one entry, builds IIFE, inlines into the HTML, removes the junction first.
- Checked in headless Chrome: no console errors captured, hero autoplay advances, one allergy case 70 to 50, no horizontal scroll at 390 px. **Not checked:** smoothness in motion, reduced motion, Firefox, Safari, real phone. Canvas text is small on phones. Fonts are Windows fonts (Bahnschrift, Sitka).
- Demo text is a hand copy of `logical-space.md`; it does not sync.
- Not published as an Artifact. A Vietnamese version was offered.

## MotionCanvas project

- VideoZero skills: `git fetch` on `references/videozero-skills` showed no new commits; the three `.claude/skills` copies were identical; all three reloaded.
- Another session was building its own `sandworm-video` there at the same time (branch `sandworm-video`, commits during our work, dev server on port 9000). This session edited nothing there. That video is separate from our demo and was not reviewed.

## Open next

1. Owner: accept or change targets I7 and I4.
2. Missing numbers (hunger drain, food value, breach damage, neglect limit, capacity values).
3. Basis questions: momentum derived or stored (Q-1), what counts as neglect (Q-16).
4. Rung 0 and 1: numbers sheet, then headless intake, carry, acid, breach loop. Rung 2 predictions are written in `logical-space.md` section 9.
5. Not committed: the whole `docs/explorations/sandworm-coop-survival/` folder and these memory and playbook edits. Core theory section 10 case table does not list this case yet.

## Stale records found during recall

| Record | Reality on 2026-11-26 |
|---|---|
| Airplane memory: "not committed", "not merged, not pushed" | `main`, `origin/main`, `theory/v0.3.1-core-loop-feeling` all at `79902d6`, tree was clean at session start |
| Core section 5: no type has a detector | Forest_Bloom slice built and ran a detector |
| Core section 10: Forest_Bloom waits for adoption | Omits the slice result |
| Theory-freeze memory path `G:\Projects\Researchs` | Workspace is `D:\Projects\Research` |

## Working-style notes

- Owner states rules in their own words and asks "right?"; answer yes or no directly with a small table, and separate what is decided from what is one option.
- Owner asked for a concrete example before deciding (Q-30). Examples with clearly labelled made-up numbers worked.
- Questions that do not change the logical space get deferred. Do not keep ending replies with them.
- Caveman mode (full) active; Sonnet 5.5.
