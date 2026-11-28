# Session 2026-11-28: Sandworm prey worm, long level, storm phases

Owner used English, caveman mode. Demo: `prototypes/sandworm-driver-demo/`, `npm run dev -- --port 5173`.

## Resume here

- **Branch:** `feat/sandworm-prey` (from `main` at `6045e1c`). All work committed, not pushed, not merged.
- **Gates at end:** `npm test` 104/104 (14 files), `npm run typecheck` 0, `npm run build` ok. Nothing playtested by owner yet; Task 6 runtime checklist in the plan still PENDING.
- **Open owner pick:** aggressive prey cannot catch a worm cruising at about 30 m/s (smoke run: 149 stalk frames, 0 latches in 30 s). Options offered: (1) intercept aim, lead our body (Claude pick), (2) start hunts with full momentum, (3) larger `stalkRadius`. Owner said "ok" without choosing.
- **Other open:** latch wiggle barely steers us (about ±0.02 rad heading); lunge lasts about 0.23 s (no visible wind-up, a coil pause was proposed); chain feel constants (`LATCH_SWING`, `LATCH_WAVE_LAG`, `LATCH_CHAIN_STIFF`) not in F3 yet; interior minimap parked.

## Commits on `feat/sandworm-prey`

| Commit | What |
|---|---|
| `86d50d9` | spec, Gemini plan v2, memory |
| `e859aee`..`cf9a483` | Gemini Tasks 1 to 5: trail, prey state, chase/lunge/bite, latch, render/sonar/HUD |
| `cabe032` | latch only at our segment 2 or later, snap on latch (segment 1 was inside head bite reach) |
| `9b4c871` | goal 6000 m, 600 m content block tiled 10 times; storm 9 / 13.5 / 19 m/s at 40% and 75% |
| `954f9d3` | aggressive prey (every 2nd): stalk our tail, flee when our nose within 0.45 rad |
| `c92722e` | latched body laid outward (first visual fix, too rigid) |
| `b954e9e` | latched body is a chain: distance constraint plus wave lag; `releaseChain` hands back to trail |
| `60611fc` | latched prey head buried: no whole eat while stuck; only body bite |
| `f68a7ea` | prey on our physics: `stepWormMotion`, `collideObstacles`, `PreyWorm extends WormState`, AI outputs throttle/steer/boost; wander brakes and holds `homeY` |

## Owner decisions

- PW-1 chase where driver works to land a clean bite. PW-2 head bite eats whole, body bite 1 section. PW-3 slam on our body latches and wiggles. PW-4 path-history bodies (approach A).
- PW-5 level x10, storm in phases (slow start, fast near end).
- PW-6 prey can be aggressive and try to slam our body.
- PW-7 latched prey body must move like a chain, not a rigid stick.
- PW-8 latched prey head is inside our body: cannot be head-bitten.
- PW-9 prey has everything we have: steering, air jumps, rock collision.

## Key files

`src/sim/trail.ts`, `src/sim/prey.ts` (AI, bite, latch, chain), `src/sim/motion.ts` (`stepWormMotion`), `src/sim/bite.ts` (`collideObstacles`), `src/sim/state.ts` (`createWorm`, `tile`), `src/sim/tick.ts` (`apocalypseSpeedAt`), `src/render/preyMesh.ts`.
Spec `.cursor/plans/design/2026-11-28-sandworm-prey-worm.md`; plan v2, brief, Gemini report in `.cursor/plans/implement/2026-11-28-sandworm-prey-worm*.md` (brief and report untracked).

## Lessons (also in playbook v3.6 section 4)

See playbook rows tagged "Sandworm con mồi 2026-11-28".
