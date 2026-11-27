# Session 2026-11-27: Sandworm Driver HTML demo (build, then movement iteration)

Substantive summary, not a transcript. Owner used English, caveman mode (`full`).

## Resume here

- **Branch:** `feat/sandworm-driver-demo` (from `main`), **nothing committed**.
- **Demo:** `prototypes/sandworm-driver-demo/`, `npm.cmd run dev`, `http://localhost:5173/`. A dev server was started in the session; do not assume it is still running.
- **Gates at end of session:** `npm.cmd run typecheck` exit 0, `npx.cmd vitest run` 60/60 in 10 files, `npm.cmd run build` ok (chunk size warning only).
- **Not verified:** how it feels (owner playtest), frame rate on a real GPU, the popup's copy and paste buttons. Claude in Chrome was not connected; browser checks used headless Chrome/Edge driven over CDP. The only console error seen was a missing `favicon.ico`.
- **Previous blocker unchanged:** gate G3 in `prototypes/sandworm-coop/thresholds.json` (`approvedBy`, `approvedOn` still `null`).

## Files

| Path | Holds |
|---|---|
| `prototypes/kits/` | Copy of `D:\Projects\SleepWithTheFish\HtmlDemo\kits` (typecheck 0, 94/94; Vitest exited 1 only on a sandbox `EPERM` cache write) |
| `docs/superpowers/plans/2026-11-27-sandworm-driver-html-demo.md` | Original 8-task plan |
| `.cursor/plans/design/2026-11-27-sandworm-driver-head-steering.md` | Approved design for the current controls |
| `src/sim/` | `config.ts` (all tunables, mutable `SIM_CONFIG`), `motion.ts`, `bite.ts`, `impact.ts` (sim-to-renderer events), `interior.ts`, `tick.ts`, `state.ts`, `types.ts` |
| `src/render/` | `wormMesh.ts` (body by distance along trail, impact squash), `pose.ts` (interpolation), `camera.ts`, `underground.ts` (cutaway shader), `dust.ts`, `world.ts`, `viewConfig.ts` |
| `src/tune/`, `src/ui/tuning.ts` | Settings rows (pure data), debug flags, `lil-gui` popup |

## Current game rules (end of session)

| Area | Rule |
|---|---|
| Controls | `A`/`D` turn the head counterclockwise/clockwise and the travel direction turns with it, free. `W` push, `S` brake, no keys keeps heading. Arrows work too. In air the turn is slower (`airTurnRate` 1.4, builder call) |
| Momentum | **Stored state** 0..100. Sets speed (cruise to top) and break power (threshold 70) |
| Gain | `W` underground (snowball build, rate 31); height dropped (`momentumDigGain` 3 per m underground, `momentumDiveGain` 3 in air); without `W`/`S`, below 35 rises to 35 |
| Loss | `S` (`momentumReverseDrain` 60/s); height climbed (2 per m underground, 1 in air); hard hit keeps 25%; pushing a rock 60/s. **Releasing keys never loses** |
| Gravity in sand | `slopeGravity` 0.5 changes speed on slopes |
| Map | Dig limit 28 m (was 14). Near the bottom the dive is limited to what can still level out (pull-out at 2x turn rate) |
| Too-hard rock | Pushed out along the contact normal; hit faster than 12 into the rock: one recoil, shake, momentum loss; slower: rest or slide |
| Grinding (bite ok, momentum low) | Head sinks in, faster with more momentum, burst out; `S` lets go; switching to a weak heart lets go |
| Popup | `F3`, backquote or button. 62 rows for 63 config keys (`heartPoints` is unused); saved changes only, `localStorage` key `sandworm-driver.tuning.v1`; saved values override new defaults |

## Timeline

1. Recalled the 2026-11-26 sandworm sessions, inspected `HtmlDemo`, cloned `kits`, planned and built the first Driver-only demo (9/9 tests; the owner then playtested).
2. **Owner report:** body jitters, momentum and movement feel bad, weak collision reaction bad. Also asked to load the video-zero skills in `D:\Projects\MotionCanvas` (`animation-basics`, `motion-canvas`, `motion-canvas-agent`, read from its `.claude/skills/`). Investigated with a headless probe before any fix.
3. Owner approved the three fixes plus a tuning popup "like FishingGame". `FishingGame` has only an `F3` label overlay; the tuning pattern (`lil-gui`, hover help) is in `HtmlDemo/Airplane` and `DriveCar`.
4. Owner: digging down gives no momentum. Added gravity underground.
5. Owner asked for 2x depth, an underground shader, and how to lose less momentum climbing.
6. Owner stated the momentum rule: not lost on release; loss depends on how opposed the input is.
7. Owner: let the worm move freely; `W` cannot go up. Built point-to-direction steering.
8. Owner: "use steering to turn worm head and its momentum direction". Asked one question with two sketches; owner picked **A** (head steering). This is the current model.
9. Owner asked whether the popup was updated. Audited (below).

## Root causes found

| Symptom | Cause (measured unless noted) |
|---|---|
| Body jitter | Segments placed by trail point index, trail point added only after 0.35 m: body frozen 89/179 frames (60 Hz, idle), 252/431 (144 Hz). No interpolation between sim steps |
| No momentum feel | `momentum = hypot(vx, vy)`, just current speed; linear ramp, full in 0.83 s; balanced top 25 below HIGH threshold 26 |
| Surface porpoising | Hard switch of forces at `y = 0`: 20 crossings in 5 s |
| Nose snap | Depth clamp zeroed `vy`, 34 degree jump |
| Weak bite | Teleport plus velocity flip, throttle drove back: 6 hits in 4 s |
| Low momentum | Dead stop 1.25 s, no feedback (code reading plus probe) |
| Digging down gave nothing | Gravity and height reward existed only in the air branch; steering down also paid turn drain (52 momentum vs 73 flat after 1 s) |
| `W` could not go up | `maxPitchAngle` 0.6 (34 degrees) and four clamps forcing rightward travel |
| Steering at a rock jumped -31 to -90 degrees | Collision left only a tangential velocity sliver and steering read it as travel direction; now the head decides while blocked |
| Worm lost off screen when deep | Camera floor of `y = -4` |

## Owner decisions (chronological; later replaces earlier)

| Decision | Status |
|---|---|
| Momentum becomes stored state with dive reward | Current |
| Turn drain, brake drain, coast decay | Replaced by the rule below |
| No loss on release; loss by how much input opposes travel | Still true in principle; under head steering only `S` opposes travel |
| Point-to-direction steering | Replaced by head steering |
| Head steering (approach A) | **Current** |

## Mistakes in this session (keep)

- First tests covered only the air dive, so the missing underground gravity passed 38/38.
- Said turn drain 22 was enough from a probe starting at momentum 40; the test started at 60 and still failed. Raised to 30 (later removed).
- A zigzag test was really a stair-step descent; found only when gravity changed.
- Introduced two bugs, caught by self-review or new tests: weak-heart switch mid-grind still broke the rock; recoil leftover velocity caused a self U-turn.
- An audit probe reported all 62 rows unused because the shell dropped a backslash in `\b`; rerun with a positive control.
- Several edit scripts stopped midway or never ran (shell quoting, anchors); checking what had applied was needed each time.

## Open

1. Owner playtest of head steering; then branch disposition (commit, merge, PR, keep, discard).
2. **Offered, unanswered:** add to the popup the values still hardcoded. Recommended: heart presets, crew shake (stun, breach threshold, max 3, landing damage scale), momentum details (snowball 0.5, free roll rate 0.3), plus the food fix. Also hardcoded: nose swing limit, pull-out boost, gnaw back-out speed, push-out limit, wave constants, segment count, ping time.
3. **Bug, seen in code, not fixed:** `interior.ts` gives every food 20 hunger in 2.6 s and ignores each spawner's `yieldHunger` and `digestTime`.
4. Not answered: a weak bite hitting a rock off-center slid around it (measured before the steering changes, not rechecked); brake and reverse needs; whether digging should reward more than jumping.
5. Rocks and food were not moved; none are placed in the new deep zone. Small stones in the shader are decoration.
6. The storm still comes only from the left, so turning back runs into it.
7. Balance has only scripted evidence: holding `W`, bite wins in 23.8 s, fast 18.5 s (hp 86, 2 breaches), balanced 25.8 s.
8. Existing rung 0/1: approve or edit `thresholds.json` (gate G3) on `feat/sandworm-rung01`.

Method lessons are in the [playbook](../.cursor/playbooks/playbook-decompose-game-to-logical-space.md), sections 2D and 4 (v3.5). This demo is not a rung of the logical-space case: no detector, no preregistered thresholds, and its rules were not checked back against the 2026-11-26 sandworm logical-space documents.
