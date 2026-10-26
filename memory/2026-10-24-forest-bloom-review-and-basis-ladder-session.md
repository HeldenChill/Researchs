# Session memory — Forest_Bloom review and basis ladder (AG-6)

**Session date:** 2026-10-24, second session that day. **Workspace:** `G:\Projects\Researchs`. Substantive summary and continuation guide, not a verbatim transcript. Continues [the base theory v0.2 session](2026-10-24-logical-space-base-theory-session.md).

## Read first in the next session

- Core theory, now **v0.2.1**: [Logical-Space-Base-Theory.md](../docs/theory/Logical-Space-Base-Theory.md). New principle L12, new section 4.1 Basis Ladder.
- Playbook, now **v2.1**: [playbook](../.cursor/playbooks/playbook-decompose-game-to-logical-space.md). New section 2A ladder, 7 ontology traps, Forest_Bloom audit lessons.
- Discussion record: [design record](../.cursor/plans/design/2026-10-24-logical-space-base-theory.md), AG-6 and open questions 7 and 8.

## What happened

1. Owner asked to recall base theory memory, then started a brainstorming discussion on Forest_Bloom's current system against v0.2.
2. Assistant read Forest_Bloom **read-only**: `G:\Unity\Project\Forest_Bloom\docs\ForestBloom-System-Spaces-And-Operators.md` (snapshot 2026-10-12, revision `59232096`), git log (head `7fad353`) and its framework-adoption handoff (wave 1 complete 2026-10-22, awaiting owner for next wave). No Forest_Bloom files edited; nothing run.
3. Assistant review, owner confirmed the core diagnosis ("your guess is right"):

| Verdict | Finding |
|---|---|
| Strength | P4-grade engineering: fixed 22-stage step order, frozen snapshots, deliberate one-step delays, checkpoint defines persistent state, ledger, ablation and `SimClosure` tools |
| Problem | No action space: zero-player sandbox; owner's "interesting" is parameter tuning, but genome/parameter UI is absent |
| Problem | I2 dynamic balance not reached: saved acceptance 10/10 seeds fail; siege groves survive with or without sharing |
| Problem | Internal state (A, V, C, W, D, Ex) drives everything; view shows only DRY/WET, species color, 3 stages; violates L4 perceivability |
| Problem | Likely over-resolved: 100+ coupled parameters, three C-recovery roads, 4 operators per edge, 12 gene groups |
| Problem | Six internal axes carried over from Project Anima psychology, not derived from plant-game needs |
| Problem | Its "spaces" table mixes state with observation, presentation, AI tooling and per-tick derived values |

Owner-confirmed summary: **too many dials, none exposed to the player.** Built bottom-up from atoms with no P0 at the top.

4. Owner said they want to build "from bottom to top." Assistant pushed back: bottom-up without a top target produced the current state. Owner then **parked Forest_Bloom during its migration** and asked to focus on theory only.
5. Assistant raised theory gaps T1 to T4 from the review. Recommended T1 first.
6. Owner's practice: climb from the smallest basis until ecological balance appears, testing repeatedly; but if interesting can be defined first, define it first and adjust the basis. Assistant formalized this as two modes with detector versus spec. **Owner approved → AG-6.**
7. Owner deferred the I2 detector discussion to later.

## Decision agreed

| ID | Decision |
|---|---|
| AG-6 | **Basis ladder.** Grow from the smallest basis, one element or operator per rung, until target interestingness appears. Mode A climbs with a **detector** (recognizes target in logs). Mode B derives the basis from a **spec** (names producing interaction terms). Rung history upgrades detector to spec. Climbing requires a detector, or there is no stopping rule. Owner prefers Mode B when possible |

## Raised, not agreed

| Gap | Content |
|---|---|
| T2 | Config versus action: in sandboxes, tuning parameters is the player's action; model has no slot for this meta-action |
| T3 | No observation map Y in the model; L4 perceivability untestable |
| T4 | Minimality needs a usefulness test; ablation proposed |

Playbook includes T2 to T4 as **marked proposals**, not agreed rules.

## Files changed this session

| File | Change |
|---|---|
| `docs/theory/Logical-Space-Base-Theory.md` | v0.2.1: L12, section 4.1 Basis Ladder, "no detector yet" note in catalog, version row |
| `.cursor/plans/design/2026-10-24-logical-space-base-theory.md` | AG-6; open questions 7 (I2 detector) and 8 (T2 to T4); change log row |
| `.cursor/playbooks/playbook-decompose-game-to-logical-space.md` | v2.1: section 2A ladder; Step 0 detector and hand-action declaration; Step 4 parameter-tuning actions and empty-action check; Step 8 ablation; Step 10 perceivability table; traps 6 and 7; two lessons rows; `ladder` output folder |
| `memory/2026-10-24-logical-space-base-theory-session.md` | Item 6 pointer to this file |
| `CLAUDE.md`, `AGENTS.md` | Latest-session pointer updated |

Nothing committed.

## Next steps

1. **Define a detector for I2 dynamic balance.** Open question to owner: when a Forest_Bloom run looked like balance, what was actually visible: steady population counts, species taking turns, map pattern, or something else?
2. Discuss T2 to T4.
3. Forest_Bloom rebuild via ladder waits until its migration finishes. The old engine becomes a parts bin, not something to trim.
4. Earlier deferrals still stand: Bump_Hero M6 spike after its package adoption; validate M1 to M6.
