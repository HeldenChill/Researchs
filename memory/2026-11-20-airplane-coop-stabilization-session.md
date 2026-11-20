# Session 2026-11-20: theory v0.3.1 and airplane co-op stabilization idea

## Part 1: theory v0.3.1
- Owner lifted the v0.3 freeze (AG-12). Adopted provisionally: L18 core loop first, L19 two-loop rule, L20 feeling layer, L21 decoupling detector (AG-13 to AG-16), catalog type I7 loop coupling (AG-17). Evidence: A Fishing Night and PEAK, 0 playtests.
- Owner chose the name v0.3.1, not v0.4 (v0.4 name kept for the prune proposal, still awaiting decision).
- Recorded in core, playbook, design record `.cursor/plans/design/2026-11-03-logical-space-critique-and-study.md`, memory, CLAUDE.md.
- Committed `2e2e8a6` on branch `theory/v0.3.1-core-loop-feeling` (not merged, not pushed).
- Fishing Night draft plan lives in the game repo: `D:\Projects\SleepWithTheFish\.cursor\plans\design\2026-11-19-fishing-gameplay-plan.md`. Phase 0 decision 5 (I7) now answered; the other five stay open.

## Part 2: MAYDAY demo review
- Owner's file `C:\Users\Hung\Downloads\MAYDAY! Chuyến Bay Hỗn Loạn.html`: third-person Three.js co-op chaos demo, safe (only three.js cdnjs and Google Fonts).
- Findings: scripted landing removes stakes; panic has no fail effect; passenger near fire stands up every frame; default climb makes dumping cargo rarely needed; labels drawn before font loads; keyboard only; passengers wander to the hatch.
- Theory read: center-of-mass tilt is the core; plane self-levels, so the core is too calm.

## Part 3: airplane co-op idea (new isolated case)
- Hub: `docs/explorations/airplane-coop-stabilization/README.md`. Scope: stabilization core loop only.
- Owner decisions OD-1 to OD-14: FPS; shouting and running together; tilt read by seeing the cabin tilt; move bodies, follow captain, lock crates in shelves; plane unstable from several causes (list pending); one flight, cargo only removed (thrown out cargo door) or moved between shelves; danger zone then crash; tilt rate = offset × amplifier; no tilt cap (big tilts become chaos moments, tools later); free throwing rejected (dominant strategy); rails B and captain counter-steer C approved; deferred: carried crate moves center of mass, door cycle T1, heavy crates need two people T3 (approved for later).
- Theory draft: P0 (targets I2 dynamic balance and I7 with proposed thresholds), basis, 9 operators, core loop with fix vs threat feedback, three loops, 7 feeling beats, viability V1 to V6, Y table, 6-rung ladder.
- Next: owner lists instability causes; decide where a carried crate's mass counts in v1; crew size and captain role.
- Playbook lessons added (section 4, rows dated 2026-11-20).
- Not committed yet.

## Part 4: core loop critique (same day)
- OD-15 rate model kept; captain counter-steer levels the plane once offset is near zero (crew fixes cause, captain fixes angle).
- OD-16 crates much heavier than players (proposal 3 to 5 ×); new viability V7, V8.
- OD-17 thin choices tuned in demo. OD-18 crew-only information later.
