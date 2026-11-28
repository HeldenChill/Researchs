# Session 2026-11-28: Sandworm prey worm design and Gemini plan

Owner used English, caveman mode.

## Resume here

- Interior minimap brainstorm started, then **parked by owner** (finding: interior is counters only, no rooms or crew positions).
- New feature: **prey worm**. Spec approved: `.cursor/plans/design/2026-11-28-sandworm-prey-worm.md`.
- Plan v2 (Gemini-ready) approved: `.cursor/plans/implement/2026-11-28-sandworm-prey-worm.md`. Tasks 0 to 6, expected test counts 65 then 69, 70, 78, 85, 86.
- Executor: Gemini, run by owner. Owner must create branch `feat/sandworm-prey` first (Task 0 stops on `main`).
- Next: owner runs Gemini, then Claude reviews from artifacts per `.claude/rules/gemini-executor-workflow.md`.

## Owner decisions

- PW-1: core feel is a chase where the driver works to land a clean bite.
- PW-2: head bite eats the prey whole; body bite cuts and eats 1 section.
- PW-3: prey slamming our body latches and wiggles, disturbing heading and momentum.
- PW-4: approach A, path-history bodies (no spring chain).

## Claude calls in spec (owner approved with spec)

Lunge only side-on; tail latch steers more, head latch drains more momentum; escape by timer, hard brake, rock slam or bite; whole catch enters mouth queue as N items; prey never damages health; one latch at a time; prey sections digest at `preyYieldPerSection` 15 via `interior.preySections` counter.

## Lessons

- Existing `test/tuning.test.ts` requires a settings row for every config key: config and tuning rows must land in the same task.
- Hooks inside `stepMotion` are skipped by the recoil early return; put new per-tick steps in `tick.ts`.
