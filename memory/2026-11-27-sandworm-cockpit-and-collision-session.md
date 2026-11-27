# Session 2026-11-27 (later): Sandworm Cockpit 3D, Collision Slide-Reflect & UI Redesign

Substantive summary. Owner used English, caveman mode (`full`).

## Resume here

- **Branch:** `main` (merged `Temp` at `fc96b90` and `Temp_2` at `e137e35`; session edits uncommitted).
- **Demo:** `prototypes/sandworm-driver-demo/`, `npm run dev -- --port 5173`, `http://localhost:5173/`.
- **Gates at end of session:** `npm test` 65/65 in 11 files, `npm run typecheck` (`tsc --noEmit`) exit 0, `npm run build` (`vite build`) ok.
- **Installed skills:** `.agents/skills/{animation-basics,motion-canvas,motion-canvas-agent}` (from `VideoZero/skills`) and `.agents/skills/frontend-design` (from `anthropics/skills`), tracked in `skills-lock.json`.

## What was built

1. **Git merges (`Temp`, `Temp_2`):**
   - Resolved `CLAUDE.md` conflict in `Temp` merge (`fc96b90`, kept `HEAD` entries + `2026-11-13-endless-walker-into-painted-valley-session.md`).
   - Merged `Temp_2` (`4c93664 ~FIX: Html`) into `main` (`e137e35`), resolved `.cursor/playbooks/playbook-decompose-game-to-logical-space.md` keeping both `Temp_2` (2026-11-26) and `HEAD` (2026-11-27) rows.
2. **UI Redesign & Forward Sonar Minimap (`frontend-design` + `animation-basics`):**
   - Redesigned `index.html` and `src/ui/hud.ts`: basalt/amber cockpit palette, `Space Grotesk` + `Inter` (`tabular-nums`), active Heart preset pills, `BREAK READY` momentum threshold marker, top-center Race Horizon Strip, acid-pit slot pips, `easeOutBack` conditional action pill, `easeOutCubic` end-of-run overlay, themed `lil-gui`.
   - Added `src/ui/minimap.ts` (`MinimapView`): `-30 m` to `+140 m` forward sonar showing surface horizon, storm wall, Goal B, food, breakable vs hard rocks, worm heading vector, and live hazard callout.
3. **Physics: Momentum-scaled reflection, Bottom collision & Slide-Reflect:**
   - `src/sim/bite.ts`: `block()` scales restitution by stored momentum (`C.hitRestitution * (0.4 + momRatio * 0.6)`) before `hitMomentumKeep`.
   - `src/sim/motion.ts`: removed `limitDive` auto-turn so worm collides with `maxDepth` (`-28`); `integrate()` reflects fast bottom hits with momentum-scaled restitution; `stepRecoil()` performs angled **slide-reflect** (lighter damping, preserves tangential velocity, rotates `heading` capped by `MAX_NOSE_RATE * dt`) while keeping head-on hits (`>= 2.2 rad`) as straight backward recoil.
4. **3D Driver Cockpit Scene (Point-and-Click, 3 Monitors):**
   - Spec: `docs/superpowers/specs/2026-11-27-sandworm-cockpit-scene-design.md`
   - Plan: `docs/superpowers/plans/2026-11-27-sandworm-cockpit-scene.md`
   - `src/cockpit/cockpitState.ts`: `MonitorId` (`overview` | `drive` | `interior` | `cctv`), `CctvRoom` (`mouth` | `acid` | `hull`), `gateDriverInput()` (locks `WASD`/`Space`/`1-3` when away from `drive`; sim keeps running live).
   - `src/render/world.ts`: added `renderToTarget()`, `getRenderer()`, `getShake()`.
   - `src/render/monitorTextures.ts`: `InteriorMonitorScreen` (Left) and `CctvMonitorScreen` (Right) 15 Hz `CanvasTexture` stubs.
   - `src/render/cockpit.ts`: curved console with enlarged 3D monitors (`drive` `2.15x1.34`, `interior`/`cctv` `1.52x1.14`), `THREE.Raycaster` hover/click focus, `0.45s` `easeInOutCubic` + `sin(π·t)` arc camera transitions, status LEDs, cabin shake.
   - `src/main.ts`, `src/ui/hud.ts`, `index.html`: `#cockpit-bar` (`Overview (Esc)`, `Drive`, `Interior`, `Room CCTV`, `1/2/3` room switcher).

## Next

1. Build **Interior Minimap** editor/logic on Left monitor (show breached rooms, un-acidified food, crew positions).
2. Build **Room CCTV** camera views on Right monitor + **Auto-drive mode** when driver looks away from Drive monitor.
3. Decide git commit/push for `main` (`ahead of origin/main by 4 commits` + uncommitted session work).
