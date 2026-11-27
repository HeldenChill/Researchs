# Sandworm 3D Driver Cockpit Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the fixed-seat 3D point-and-click driver cockpit with 3 interactive monitors (Center: live Drive `WebGLRenderTarget`, Left: Interior Minimap stub, Right: Room CCTV stub) and focus-gated input.

**Architecture:** Single `THREE.WebGLRenderer` dual-pass rendering: `WorldRenderer` renders the sandworm world into a `WebGLRenderTarget` mapped onto the Center 3D monitor mesh, while `CockpitRenderer` renders the 3D cabin, desk, 3 monitors, and raycasted focus camera. Pure `cockpitState` manages active monitor, CCTV room selection, and `InputController` gating.

**Tech Stack:** TypeScript, Three.js (`0.186.0`), Vite (`5.4.11`), Vitest (`2.1.8`).

---

### Task 1: Pure Cockpit State & Input Gating (`src/cockpit/cockpitState.ts`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/cockpit/cockpitState.ts`
- Test: `prototypes/sandworm-driver-demo/test/cockpit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  createCockpitState,
  focusMonitor,
  gateDriverInput,
  selectCctvRoom,
} from '../src/cockpit/cockpitState.ts';

describe('cockpit state', () => {
  it('starts in overview and switches monitors', () => {
    const s = createCockpitState();
    expect(s.activeMonitor).toBe('overview');
    focusMonitor(s, 'drive');
    expect(s.activeMonitor).toBe('drive');
    focusMonitor(s, 'cctv');
    expect(s.activeMonitor).toBe('cctv');
    focusMonitor(s, 'overview');
    expect(s.activeMonitor).toBe('overview');
  });

  it('cycles or selects CCTV rooms', () => {
    const s = createCockpitState();
    expect(s.cctvRoom).toBe('mouth');
    selectCctvRoom(s, 'acid');
    expect(s.cctvRoom).toBe('acid');
  });

  it('gates drive inputs unless activeMonitor is drive', () => {
    const raw = { throttle: 1, steer: -1, boost: true, ping: true, preset: 'bite' as const };
    const overview = createCockpitState();
    expect(gateDriverInput(overview, raw)).toEqual({
      throttle: 0,
      steer: 0,
      boost: false,
      ping: false,
      preset: null,
    });
    focusMonitor(overview, 'drive');
    expect(gateDriverInput(overview, raw)).toEqual(raw);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototypes/sandworm-driver-demo; npx vitest run test/cockpit.test.ts`
Expected: FAIL with module not found `../src/cockpit/cockpitState.ts`.

- [ ] **Step 3: Implement `src/cockpit/cockpitState.ts`**

```ts
import type { DriverInput } from '../sim/types.ts';

export type MonitorId = 'overview' | 'drive' | 'interior' | 'cctv';
export type CctvRoom = 'mouth' | 'acid' | 'hull';

export interface CockpitState {
  activeMonitor: MonitorId;
  hoveredMonitor: MonitorId | null;
  cctvRoom: CctvRoom;
}

const NEUTRAL_INPUT: DriverInput = {
  throttle: 0,
  steer: 0,
  boost: false,
  ping: false,
  preset: null,
};

export function createCockpitState(): CockpitState {
  return {
    activeMonitor: 'overview',
    hoveredMonitor: null,
    cctvRoom: 'mouth',
  };
}

export function focusMonitor(state: CockpitState, monitor: MonitorId): void {
  state.activeMonitor = monitor;
}

export function selectCctvRoom(state: CockpitState, room: CctvRoom): void {
  state.cctvRoom = room;
}

export function gateDriverInput(state: CockpitState, raw: DriverInput): DriverInput {
  return state.activeMonitor === 'drive' ? raw : { ...NEUTRAL_INPUT };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototypes/sandworm-driver-demo; npx vitest run test/cockpit.test.ts`
Expected: PASS (3/3).

---

### Task 2: WorldRenderer RenderTarget Support (`src/render/world.ts`)

**Files:**
- Modify: `prototypes/sandworm-driver-demo/src/render/world.ts:45-151`

- [ ] **Step 1: Add `renderToTarget`, `getRenderer()`, `getShake()`, and `resize(w, h)` to `WorldRenderer`**

Update `WorldRenderer` in `prototypes/sandworm-driver-demo/src/render/world.ts`:
- Add `getRenderer(): THREE.WebGLRenderer { return this.renderer; }`
- Add `getShake(): number { return this.shake * VIEW_CONFIG.cameraShake; }`
- Extract `private updateScene(state: SimState, pose: Pose, dt: number): void` from `render(...)`.
- Keep `render(state, pose, dt)` calling `this.updateScene(state, pose, dt)` and `this.renderer.render(this.scene, this.camera)`.
- Add `renderToTarget(state: SimState, pose: Pose, dt: number, target: THREE.WebGLRenderTarget): void` which updates camera aspect to `target.width / target.height`, calls `this.updateScene`, sets `this.renderer.setRenderTarget(target)`, renders `this.scene` with `this.camera`, and resets `this.renderer.setRenderTarget(null)`.

- [ ] **Step 2: Run typecheck & existing render tests**

Run: `cd prototypes/sandworm-driver-demo; npm run typecheck; npx vitest run test/render.test.ts`
Expected: PASS.

---

### Task 3: Stub CanvasTextures for Interior & Room CCTV Monitors (`src/render/monitorTextures.ts`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/render/monitorTextures.ts`

- [ ] **Step 1: Create `InteriorMonitorScreen` and `CctvMonitorScreen`**

Implement two lightweight `512x384` `HTMLCanvasElement` + `THREE.CanvasTexture` classes:
- `InteriorMonitorScreen`: draws dark CRT background, segmented worm schematic (Mouth -> Gut -> Acid Pit -> Hull), live `mouthQueue`, `acidSlots`, `breaches` count, `crewStunTimer` alert, and `"INTERIOR MINIMAP · NEXT MODULE"` label.
- `CctvMonitorScreen`: draws CRT scanlines, room header (`CAM 01: MOUTH` / `CAM 02: ACID PIT` / `CAM 03: HULL`), live room telemetry stub (queue count, acid fill, breach count), and `"ROOM CCTV · PRESS 1/2/3 OR CLICK BAR"` hint.
- Throttle redraws to ~15 Hz (`accum >= 1/15`) so GPU texture uploads stay minimal.

- [ ] **Step 2: Run typecheck**

Run: `cd prototypes/sandworm-driver-demo; npm run typecheck`
Expected: PASS.

---

### Task 4: 3D Driver Cockpit Scene & Raycasting (`src/render/cockpit.ts`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/render/cockpit.ts`

- [ ] **Step 1: Implement `CockpitRenderer`**

Build the fixed-seat 3D cockpit in `THREE.Scene`:
- `PerspectiveCamera(52, aspect, 0.1, 50)` starting at overview pose `(0, 1.45, 2.75)` looking at `(0, 1.05, 0)`.
- Curved console desk (`BoxGeometry` / angled wings), 3 rugged monitor housings:
  - **Center (`drive`)**: width `1.6`, height `1.0`, `MeshBasicMaterial({ map: driveTarget.texture })`, focus camera `(0, 1.15, 1.18)` looking at `(0, 1.12, -0.3)`.
  - **Left (`interior`)**: width `1.15`, height `0.86`, angled `+0.48 rad`, `CanvasTexture` from `InteriorMonitorScreen`, focus camera `(-0.98, 1.12, 0.92)` looking at `(-1.45, 1.08, -0.02)`.
  - **Right (`cctv`)**: width `1.15`, height `0.86`, angled `-0.48 rad`, `CanvasTexture` from `CctvMonitorScreen`, focus camera `(0.98, 1.12, 0.92)` looking at `(1.45, 1.08, -0.02)`.
- Status LEDs on each monitor bezel (glowing amber/crimson on breach/hard-rock/stun).
- `THREE.Raycaster` on `pointermove` (updates `cockpitState.hoveredMonitor` and `canvas.style.cursor`) and `pointerdown` (calls `onSelectMonitor(hitMonitor ?? 'overview')`).
- Smooth exponential camera interpolation (`1 - Math.exp(-8 * dt)`) between poses + subtle cabin shake from `worldRenderer.getShake()`.
- Handle `window` resize.

- [ ] **Step 2: Run typecheck**

Run: `cd prototypes/sandworm-driver-demo; npm run typecheck`
Expected: PASS.

---

### Task 5: Wire Cockpit into `index.html`, `src/ui/hud.ts`, and `src/main.ts`

**Files:**
- Modify: `prototypes/sandworm-driver-demo/index.html`
- Modify: `prototypes/sandworm-driver-demo/src/ui/hud.ts`
- Modify: `prototypes/sandworm-driver-demo/src/main.ts`

- [ ] **Step 1: Add `#cockpit-bar` to `index.html` and CSS for `.hud-drive-only` / `#cockpit-bar`**
- [ ] **Step 2: Update `HudView` (`src/ui/hud.ts`) to accept `CockpitState` & callbacks (`onSelectMonitor`, `onSelectRoom`)**
  - Toggle Drive HUD visibility (`activeMonitor === 'drive'`).
  - Update `#cockpit-bar` active pill (`Overview (Esc)` / `Drive` / `Interior` / `CCTV`) and show CCTV room switcher pills (`Mouth` / `Acid Pit` / `Hull`) when `activeMonitor === 'cctv'`.
- [ ] **Step 3: Update `src/main.ts`**
  - Create `cockpitState = createCockpitState()` and `cockpit = new CockpitRenderer(world.getRenderer(), ...)`.
  - Listen for `Escape` key to return to `'overview'`, and `1/2/3` when `activeMonitor === 'cctv'` to switch CCTV room.
  - Gate `input.sample()` via `gateDriverInput(cockpitState, input.sample())`.
  - Render `world.renderToTarget(state, pose, gameDt, cockpit.driveTarget)` then `cockpit.render(state, cockpitState, frameDt, world.getShake())`.

- [ ] **Step 4: Run full verification**

Run: `cd prototypes/sandworm-driver-demo; npm test; npm run typecheck; npm run build`
Expected: All tests pass, `tsc --noEmit` exits 0, `vite build` succeeds.
