# Sandworm Driver Playmode HTML Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable single-player Driver-only 3D HTML demo for Co-op Sandworm Survival in `prototypes/sandworm-driver-demo/` using `@hk/loop` and Three.js.

**Architecture:** Separate deterministic TypeScript simulation (`src/sim/`) from Three.js rendering (`src/render/`) and DOM HUD/input (`src/ui/`). The Driver steers a segmented sandworm across a 2.5D desert plane from Start (`x = 0`) to Safe Pocket (`x = 600`), biting food spawners and smashing Tier 1/2 gate obstacles while outrunning the Apocalypse wall; a lightweight coupled interior model simulates Crew processing, Acid digestion, and Breaches so Driver speed, impact shake, and hunger/health form a closed loop.

**Tech Stack:** TypeScript 5.6.3, Vite 5.4.11, Three.js 0.186.0, `@hk/loop` (`file:../kits/packages/loop`), Vitest 2.1.8.

---

### File Structure

| File | Responsibility |
|---|---|
| `prototypes/sandworm-driver-demo/package.json` | Package manifest, scripts, `@hk/loop` + `three` deps |
| `prototypes/sandworm-driver-demo/tsconfig.json` | Strict TS config |
| `prototypes/sandworm-driver-demo/vite.config.ts` | Vite config allowing `../kits` and deduping `three` |
| `prototypes/sandworm-driver-demo/index.html` | Canvas mount + minimal HUD overlay markup |
| `prototypes/sandworm-driver-demo/src/sim/types.ts` | State, config, input, entity, and outcome types |
| `prototypes/sandworm-driver-demo/src/sim/config.ts` | Constants, obstacle/spawner layout, heart presets |
| `prototypes/sandworm-driver-demo/src/sim/state.ts` | `createInitialState()` deterministic world generator |
| `prototypes/sandworm-driver-demo/src/sim/motion.ts` | `O2` worm steering/dive/boost + `O3` ground impact shake |
| `prototypes/sandworm-driver-demo/src/sim/bite.ts` | `O4` obstacle bite gate + spawner consumption |
| `prototypes/sandworm-driver-demo/src/sim/interior.ts` | Coupled interior: Crew queue, Acid digest, Neglect breaches, `O19` metabolism, `O25` apocalypse |
| `prototypes/sandworm-driver-demo/src/sim/tick.ts` | `stepSim()` fixed-timestep tick + `checkOutcome()` boundary `Ω` |
| `prototypes/sandworm-driver-demo/src/render/wormMesh.ts` | Segmented 3D worm head + body + jaw/ping visual |
| `prototypes/sandworm-driver-demo/src/render/world.ts` | Three.js scene, dunes, obstacles, spawners, apocalypse wall, camera |
| `prototypes/sandworm-driver-demo/src/ui/input.ts` | Keyboard input (`WASD`/Arrows, `Space` boost, `E` ping, `1/2/3` heart preset, `R` restart) |
| `prototypes/sandworm-driver-demo/src/ui/hud.ts` | Read-only `Y` HUD (bars, distance, heart points, interior ticker, end screen) |
| `prototypes/sandworm-driver-demo/src/main.ts` | `@hk/loop` `stepsForFrame` fixed-dt loop wiring sim, render, input, HUD |
| `prototypes/sandworm-driver-demo/test/*.test.ts` | Vitest unit tests for state, motion, bite, tick/boundary |

---

### Task 1: Scaffold `prototypes/sandworm-driver-demo/`

**Files:**
- Create: `prototypes/sandworm-driver-demo/package.json`
- Create: `prototypes/sandworm-driver-demo/tsconfig.json`
- Create: `prototypes/sandworm-driver-demo/vite.config.ts`
- Create: `prototypes/sandworm-driver-demo/index.html`
- Create: `prototypes/sandworm-driver-demo/.gitignore`

- [ ] **Step 1: Create `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`**

Write `prototypes/sandworm-driver-demo/package.json`:
```json
{
  "name": "sandworm-driver-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@hk/loop": "file:../kits/packages/loop",
    "three": "0.186.0"
  },
  "devDependencies": {
    "@types/three": "0.186.0",
    "typescript": "5.6.3",
    "vite": "5.4.11",
    "vitest": "2.1.8"
  }
}
```

Write `prototypes/sandworm-driver-demo/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src", "test"]
}
```

Write `prototypes/sandworm-driver-demo/vite.config.ts`:
```ts
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { fileURLToPath } from 'node:url';

const kits = fileURLToPath(new URL('../kits', import.meta.url));

export default defineConfig({
  resolve: {
    dedupe: ['three'],
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), kits],
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

Write `prototypes/sandworm-driver-demo/.gitignore`:
```gitignore
node_modules/
dist/
```

- [ ] **Step 2: Create `index.html`**

Write `prototypes/sandworm-driver-demo/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandworm Driver Playmode</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #14110f; color: #f4ead5; font-family: system-ui, -apple-system, sans-serif; }
      #app { position: relative; width: 100%; height: 100%; }
      canvas { display: block; width: 100%; height: 100%; }
      #hud { position: absolute; inset: 0; pointer-events: none; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; }
      .row { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; }
      .panel { background: rgba(20, 17, 15, 0.78); border: 1px solid rgba(244, 234, 213, 0.18); border-radius: 8px; padding: 10px 14px; font-size: 13px; line-height: 1.45; min-width: 220px; }
      .bar-wrap { width: 180px; height: 10px; background: rgba(255,255,255,0.12); border-radius: 99px; overflow: hidden; margin: 3px 0 6px; }
      .bar { height: 100%; transition: width 0.08s linear; }
      .bar-hp { background: #e05a47; }
      .bar-hunger { background: #e6a23c; }
      .bar-mom { background: #4ea8de; }
      .muted { color: #b8ab96; font-size: 12px; }
      #overlay { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(14, 11, 9, 0.72); pointer-events: auto; }
      #overlay.show { display: flex; }
      #overlay-card { background: #1e1916; border: 1px solid rgba(244, 234, 213, 0.3); border-radius: 12px; padding: 24px 28px; text-align: center; max-width: 380px; }
      #overlay-card h1 { font-size: 24px; margin-bottom: 8px; }
      #overlay-card p { color: #cbbda6; margin-bottom: 16px; font-size: 14px; }
      #restart-btn { pointer-events: auto; background: #e6a23c; color: #14110f; border: 0; border-radius: 6px; padding: 10px 18px; font-weight: 700; cursor: pointer; font-size: 14px; }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="hud">
        <div class="row">
          <div class="panel" id="hud-vitals"></div>
          <div class="panel" id="hud-progress"></div>
          <div class="panel" id="hud-interior"></div>
        </div>
        <div class="row">
          <div class="panel muted" id="hud-controls">
            W/S: Dive/Surface · A/D: Brake/Throttle · Space: Boost · E: Ping Crew · 1/2/3: Heart Preset (Fast/Balanced/Bite) · R: Restart
          </div>
        </div>
      </div>
      <div id="overlay">
        <div id="overlay-card">
          <h1 id="overlay-title"></h1>
          <p id="overlay-desc"></p>
          <button id="restart-btn" type="button">Restart Run (R)</button>
        </div>
      </div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Install dependencies**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npm.cmd install
```
Expected: `node_modules` created and `@hk/loop`, `three`, `vite`, `vitest`, `typescript` installed cleanly.

- [ ] **Step 4: Commit scaffold**

```bash
git add prototypes/sandworm-driver-demo/package.json prototypes/sandworm-driver-demo/tsconfig.json prototypes/sandworm-driver-demo/vite.config.ts prototypes/sandworm-driver-demo/index.html prototypes/sandworm-driver-demo/.gitignore
git commit -m "chore: scaffold sandworm-driver-demo"
```

---

### Task 2: Sim Types, Config, and Initial State

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/sim/types.ts`
- Create: `prototypes/sandworm-driver-demo/src/sim/config.ts`
- Create: `prototypes/sandworm-driver-demo/src/sim/state.ts`
- Test: `prototypes/sandworm-driver-demo/test/state.test.ts`

- [ ] **Step 1: Write the failing test**

Create `prototypes/sandworm-driver-demo/test/state.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { SIM_CONFIG } from '../src/sim/config.ts';

describe('createInitialState', () => {
  it('initializes worm, heart points, and world entities deterministically', () => {
    const s1 = createInitialState();
    const s2 = createInitialState();

    expect(s1).toEqual(s2);
    expect(s1.worm.x).toBe(0);
    expect(s1.worm.health).toBe(SIM_CONFIG.maxHealth);
    expect(s1.worm.hunger).toBe(SIM_CONFIG.maxHunger);
    expect(s1.worm.heart.s + s1.worm.heart.r + s1.worm.heart.b).toBe(SIM_CONFIG.heartPoints);
    expect(s1.obstacles.length).toBeGreaterThan(0);
    expect(s1.spawners.length).toBeGreaterThan(0);
    expect(s1.outcome).toBe('playing');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/state.test.ts
```
Expected: FAIL (cannot find `../src/sim/state.ts`).

- [ ] **Step 3: Write `types.ts`, `config.ts`, and `state.ts`**

Create `prototypes/sandworm-driver-demo/src/sim/types.ts`:
```ts
export type HeartPreset = 'fast' | 'balanced' | 'bite';

export interface HeartAllocation {
  s: number; // speed points
  r: number; // regen points
  b: number; // bite points
}

export interface WormState {
  x: number;
  y: number; // > 0 airborne/surface, <= 0 underground
  vx: number;
  vy: number;
  heading: number; // radians, 0 = +x
  health: number;
  hunger: number;
  momentum: number; // derived speed magnitude in forward direction
  heart: HeartAllocation;
  preset: HeartPreset;
  gnawTimer: number;
  activeObstacleId: number | null;
  pingTimer: number;
  shakeImpulse: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
  tier: 1 | 2;
  requiredBite: number;
  broken: boolean;
}

export interface Spawner {
  id: number;
  x: number;
  y: number;
  radius: number;
  kind: 'small_meat' | 'large_meat' | 'tyre';
  yieldHunger: number;
  digestTime: number;
  eaten: boolean;
}

export interface InteriorDigestItem {
  yieldHunger: number;
  remaining: number;
  total: number;
}

export interface InteriorState {
  mouthQueue: number; // items waiting for simulated crew
  acidSlots: InteriorDigestItem[];
  breaches: number;
  crewStunTimer: number;
  crewWorkTimer: number;
  sealProgress: number;
}

export type MatchOutcome = 'playing' | 'win' | 'loss_health' | 'loss_hunger' | 'loss_apocalypse';

export interface DriverInput {
  throttle: number; // -1..1
  pitch: number; // -1 (dive) .. 1 (surface)
  boost: boolean;
  ping: boolean;
  preset: HeartPreset | null;
}

export interface SimState {
  time: number;
  worm: WormState;
  obstacles: Obstacle[];
  spawners: Spawner[];
  interior: InteriorState;
  apocalypseX: number;
  outcome: MatchOutcome;
}
```

Create `prototypes/sandworm-driver-demo/src/sim/config.ts`:
```ts
import type { HeartAllocation, HeartPreset } from './types.ts';

export const SIM_CONFIG = {
  goalX: 600,
  maxHealth: 100,
  maxHunger: 100,
  heartPoints: 6,
  baseSpeed: 18,
  speedPerPoint: 3.5,
  boostMultiplier: 1.45,
  boostHungerCost: 2.8,
  gravity: 22,
  undergroundDrag: 1.6,
  airDrag: 0.25,
  maxDepth: -14,
  maxAltitude: 18,
  impactSpeedThreshold: 14,
  highMomentumThreshold: 26,
  gnawDuration: 1.25,
  acidCapacity: 2,
  breachDps: 4.5,
  crewCarryTime: 1.8,
  crewSealTime: 3.0,
  hungerBaseDrain: 1.2,
  hungerDrainPerSpeedPt: 0.25,
  regenPerPoint: 1.1,
  apocalypseStartX: -65,
  apocalypseSpeed: 13.5,
} as const;

export const HEART_PRESETS: Record<HeartPreset, HeartAllocation> = {
  fast: { s: 4, r: 1, b: 1 },
  balanced: { s: 2, r: 2, b: 2 },
  bite: { s: 1, r: 1, b: 4 },
};
```

Create `prototypes/sandworm-driver-demo/src/sim/state.ts`:
```ts
import { HEART_PRESETS, SIM_CONFIG } from './config.ts';
import type { Obstacle, SimState, Spawner } from './types.ts';

export function createInitialState(): SimState {
  const obstacles: Obstacle[] = [
    { id: 1, x: 95, y: 0, radius: 3.4, tier: 1, requiredBite: 2, broken: false },
    { id: 2, x: 215, y: -1, radius: 3.8, tier: 2, requiredBite: 4, broken: false },
    { id: 3, x: 345, y: 0, radius: 3.4, tier: 1, requiredBite: 2, broken: false },
    { id: 4, x: 470, y: -1, radius: 4.0, tier: 2, requiredBite: 4, broken: false },
  ];

  const spawners: Spawner[] = [
    { id: 101, x: 45, y: 1.5, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
    { id: 102, x: 140, y: -4.5, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 103, x: 185, y: 2.0, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
    { id: 104, x: 265, y: -5.0, radius: 2.4, kind: 'tyre', yieldHunger: 10, digestTime: 2.5, eaten: false },
    { id: 105, x: 310, y: 2.5, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 106, x: 410, y: -4.0, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 107, x: 520, y: 1.5, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
  ];

  return {
    time: 0,
    worm: {
      x: 0,
      y: -2,
      vx: 14,
      vy: 0,
      heading: 0,
      health: SIM_CONFIG.maxHealth,
      hunger: SIM_CONFIG.maxHunger,
      momentum: 14,
      heart: { ...HEART_PRESETS.balanced },
      preset: 'balanced',
      gnawTimer: 0,
      activeObstacleId: null,
      pingTimer: 0,
      shakeImpulse: 0,
    },
    obstacles,
    spawners,
    interior: {
      mouthQueue: 0,
      acidSlots: [],
      breaches: 0,
      crewStunTimer: 0,
      crewWorkTimer: 0,
      sealProgress: 0,
    },
    apocalypseX: SIM_CONFIG.apocalypseStartX,
    outcome: 'playing',
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/state.test.ts
```
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add prototypes/sandworm-driver-demo/src/sim/types.ts prototypes/sandworm-driver-demo/src/sim/config.ts prototypes/sandworm-driver-demo/src/sim/state.ts prototypes/sandworm-driver-demo/test/state.test.ts
git commit -m "feat(sandworm-driver): add sim types, config, and initial state"
```

---

### Task 3: Driver Motion (`O2`) and Ground Impact Shake (`O3`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/sim/motion.ts`
- Test: `prototypes/sandworm-driver-demo/test/motion.test.ts`

- [ ] **Step 1: Write the failing test**

Create `prototypes/sandworm-driver-demo/test/motion.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';

describe('stepMotion (O2 + O3)', () => {
  it('accelerates forward with throttle and updates momentum', () => {
    const s = createInitialState();
    s.worm.vx = 5;
    stepMotion(s, { throttle: 1, pitch: 0, boost: false, ping: false, preset: null }, 0.1);
    expect(s.worm.vx).toBeGreaterThan(5);
    expect(s.worm.x).toBeGreaterThan(0);
    expect(s.worm.momentum).toBeCloseTo(Math.hypot(s.worm.vx, s.worm.vy), 5);
  });

  it('triggers shakeImpulse (O3) when slamming into ground from above', () => {
    const s = createInitialState();
    s.worm.y = 0.2;
    s.worm.vy = -20;
    stepMotion(s, { throttle: 0, pitch: -1, boost: false, ping: false, preset: null }, 0.05);
    expect(s.worm.y).toBeLessThanOrEqual(0);
    expect(s.worm.shakeImpulse).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/motion.test.ts
```
Expected: FAIL (cannot find `../src/sim/motion.ts`).

- [ ] **Step 3: Implement `motion.ts`**

Create `prototypes/sandworm-driver-demo/src/sim/motion.ts`:
```ts
import { SIM_CONFIG } from './config.ts';
import type { DriverInput, SimState } from './types.ts';

export function stepMotion(state: SimState, input: DriverInput, dt: number): void {
  const w = state.worm;
  const prevY = w.y;
  w.shakeImpulse = 0;

  if (w.pingTimer > 0) {
    w.pingTimer = Math.max(0, w.pingTimer - dt);
  }
  if (input.ping) {
    w.pingTimer = 0.8;
  }

  const maxSpeed =
    (SIM_CONFIG.baseSpeed + w.heart.s * SIM_CONFIG.speedPerPoint) *
    (input.boost && w.hunger > 5 ? SIM_CONFIG.boostMultiplier : 1);

  const underground = w.y <= 0;
  if (underground) {
    const targetVx = Math.max(4, maxSpeed * (0.65 + 0.35 * input.throttle));
    const accel = 28;
    w.vx += Math.sign(targetVx - w.vx) * Math.min(Math.abs(targetVx - w.vx), accel * dt);
    w.vy += input.pitch * 34 * dt;
    w.vy -= w.vy * SIM_CONFIG.undergroundDrag * dt;
  } else {
    w.vy -= SIM_CONFIG.gravity * dt;
    w.vx -= w.vx * SIM_CONFIG.airDrag * dt;
    w.vx = Math.max(4, w.vx + input.throttle * 6 * dt);
  }

  w.x += w.vx * dt;
  w.y += w.vy * dt;

  if (w.y < SIM_CONFIG.maxDepth) {
    w.y = SIM_CONFIG.maxDepth;
    if (w.vy < 0) w.vy = 0;
  }
  if (w.y > SIM_CONFIG.maxAltitude) {
    w.y = SIM_CONFIG.maxAltitude;
    if (w.vy > 0) w.vy = 0;
  }

  // O3: Ground impact from airborne dive triggers interior shake impulse
  if (prevY > 0 && w.y <= 0 && w.vy < -SIM_CONFIG.impactSpeedThreshold) {
    w.shakeImpulse = Math.min(1, (-w.vy - SIM_CONFIG.impactSpeedThreshold) / 14 + 0.25);
  }

  w.heading = Math.atan2(w.vy, Math.max(0.01, w.vx));
  w.momentum = Math.hypot(w.vx, w.vy);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/motion.test.ts
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add prototypes/sandworm-driver-demo/src/sim/motion.ts prototypes/sandworm-driver-demo/test/motion.test.ts
git commit -m "feat(sandworm-driver): add worm motion (O2) and impact shake (O3)"
```

---

### Task 4: Bite Gate (`O4`) and Spawner Intake

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/sim/bite.ts`
- Test: `prototypes/sandworm-driver-demo/test/bite.test.ts`

- [ ] **Step 1: Write the failing test**

Create `prototypes/sandworm-driver-demo/test/bite.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepBite } from '../src/sim/bite.ts';

describe('stepBite (O4)', () => {
  it('bounces when bite points are below obstacle requiredBite', () => {
    const s = createInitialState();
    const t2 = s.obstacles.find((o) => o.tier === 2)!;
    s.worm.heart = { s: 4, r: 1, b: 1 };
    s.worm.x = t2.x - 1;
    s.worm.y = t2.y;
    s.worm.vx = 20;

    stepBite(s, 0.05);
    expect(t2.broken).toBe(false);
    expect(s.worm.vx).toBeLessThan(0);
    expect(s.worm.shakeImpulse).toBeGreaterThan(0);
  });

  it('breaks Tier 2 obstacle instantly when bite >= required and momentum is high', () => {
    const s = createInitialState();
    const t2 = s.obstacles.find((o) => o.tier === 2)!;
    s.worm.heart = { s: 1, r: 1, b: 4 };
    s.worm.x = t2.x - 1;
    s.worm.y = t2.y;
    s.worm.momentum = 30;

    stepBite(s, 0.05);
    expect(t2.broken).toBe(true);
  });

  it('consumes touched spawner and adds item to interior mouthQueue', () => {
    const s = createInitialState();
    const sp = s.spawners[0]!;
    s.worm.x = sp.x;
    s.worm.y = sp.y;

    stepBite(s, 0.05);
    expect(sp.eaten).toBe(true);
    expect(s.interior.mouthQueue).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/bite.test.ts
```
Expected: FAIL (cannot find `../src/sim/bite.ts`).

- [ ] **Step 3: Implement `bite.ts`**

Create `prototypes/sandworm-driver-demo/src/sim/bite.ts`:
```ts
import { SIM_CONFIG } from './config.ts';
import type { SimState } from './types.ts';

const WORM_HEAD_RADIUS = 2.0;

export function stepBite(state: SimState, dt: number): void {
  const w = state.worm;

  // Spawners: Driver bites food -> enters interior mouthQueue
  for (const sp of state.spawners) {
    if (sp.eaten) continue;
    const dist = Math.hypot(w.x - sp.x, w.y - sp.y);
    if (dist <= sp.radius + WORM_HEAD_RADIUS) {
      sp.eaten = true;
      state.interior.mouthQueue += 1;
    }
  }

  // Obstacles: Bite gate (O4)
  for (const obs of state.obstacles) {
    if (obs.broken) continue;
    const dist = Math.hypot(w.x - obs.x, w.y - obs.y);
    if (dist > obs.radius + WORM_HEAD_RADIUS) continue;

    if (w.heart.b < obs.requiredBite) {
      // Bounce back + interior shake
      w.x = obs.x - (obs.radius + WORM_HEAD_RADIUS + 0.5);
      w.vx = -Math.max(8, Math.abs(w.vx) * 0.6);
      w.shakeImpulse = Math.max(w.shakeImpulse, 0.5);
      w.activeObstacleId = null;
      w.gnawTimer = 0;
      return;
    }

    if (obs.tier === 1 || w.momentum >= SIM_CONFIG.highMomentumThreshold) {
      obs.broken = true;
      w.activeObstacleId = null;
      w.gnawTimer = 0;
      continue;
    }

    // Tier 2 with low momentum: gnaw for 1.25s
    if (w.activeObstacleId !== obs.id) {
      w.activeObstacleId = obs.id;
      w.gnawTimer = SIM_CONFIG.gnawDuration;
    }
    w.x = obs.x - (obs.radius + WORM_HEAD_RADIUS);
    w.vx = 0;
    w.gnawTimer = Math.max(0, w.gnawTimer - dt);
    if (w.gnawTimer <= 0) {
      obs.broken = true;
      w.activeObstacleId = null;
    }
    return;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/bite.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add prototypes/sandworm-driver-demo/src/sim/bite.ts prototypes/sandworm-driver-demo/test/bite.test.ts
git commit -m "feat(sandworm-driver): add bite gate (O4) and spawner intake"
```

---

### Task 5: Coupled Interior, Metabolism (`O19`), Apocalypse (`O25`), and Tick (`Ω`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/sim/interior.ts`
- Create: `prototypes/sandworm-driver-demo/src/sim/tick.ts`
- Test: `prototypes/sandworm-driver-demo/test/tick.test.ts`

- [ ] **Step 1: Write the failing test**

Create `prototypes/sandworm-driver-demo/test/tick.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepSim } from '../src/sim/tick.ts';
import { SIM_CONFIG } from '../src/sim/config.ts';

describe('stepSim & boundary (Ω)', () => {
  it('switches heart preset when requested', () => {
    const s = createInitialState();
    stepSim(s, { throttle: 0, pitch: 0, boost: false, ping: false, preset: 'bite' }, 0.05);
    expect(s.worm.preset).toBe('bite');
    expect(s.worm.heart.b).toBe(4);
  });

  it('creates interior breach on heavy shakeImpulse and drains health', () => {
    const s = createInitialState();
    s.worm.y = 0.1;
    s.worm.vy = -25;
    stepSim(s, { throttle: 0, pitch: -1, boost: false, ping: false, preset: null }, 0.05);
    expect(s.interior.breaches).toBeGreaterThanOrEqual(1);
    expect(s.worm.health).toBeLessThan(SIM_CONFIG.maxHealth);
  });

  it('wins when worm reaches goalX and loses when apocalypse catches up', () => {
    const winState = createInitialState();
    winState.worm.x = SIM_CONFIG.goalX;
    stepSim(winState, { throttle: 1, pitch: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(winState.outcome).toBe('win');

    const loseState = createInitialState();
    loseState.apocalypseX = loseState.worm.x + 1;
    stepSim(loseState, { throttle: 0, pitch: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(loseState.outcome).toBe('loss_apocalypse');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run test/tick.test.ts
```
Expected: FAIL (cannot find `../src/sim/tick.ts`).

- [ ] **Step 3: Implement `interior.ts` and `tick.ts`**

Create `prototypes/sandworm-driver-demo/src/sim/interior.ts`:
```ts
import { SIM_CONFIG } from './config.ts';
import type { DriverInput, SimState } from './types.ts';

export function stepInteriorAndBody(state: SimState, input: DriverInput, dt: number): void {
  const w = state.worm;
  const intr = state.interior;

  // Heavy Driver shake stuns simulated crew and can trigger a breach
  if (w.shakeImpulse > 0.35) {
    intr.crewStunTimer = Math.max(intr.crewStunTimer, 0.8 * w.shakeImpulse);
    if (w.shakeImpulse >= 0.45 && intr.breaches < 3) {
      intr.breaches += 1;
    }
  }

  if (intr.crewStunTimer > 0) {
    intr.crewStunTimer = Math.max(0, intr.crewStunTimer - dt);
  } else {
    // Crew prioritizes sealing breaches if any, else carries mouthQueue into acidSlots
    if (intr.breaches > 0) {
      intr.sealProgress += dt / SIM_CONFIG.crewSealTime;
      if (intr.sealProgress >= 1) {
        intr.sealProgress = 0;
        intr.breaches -= 1;
      }
    } else if (intr.mouthQueue > 0 && intr.acidSlots.length < SIM_CONFIG.acidCapacity) {
      intr.crewWorkTimer += dt / SIM_CONFIG.crewCarryTime;
      if (intr.crewWorkTimer >= 1) {
        intr.crewWorkTimer = 0;
        intr.mouthQueue -= 1;
        intr.acidSlots.push({ yieldHunger: 20, remaining: 2.6, total: 2.6 });
      }
    }
  }

  // O14 Digest: all admitted acidSlots digest concurrently
  const nextSlots = [];
  for (const item of intr.acidSlots) {
    item.remaining -= dt;
    if (item.remaining <= 0) {
      w.hunger = Math.min(SIM_CONFIG.maxHunger, w.hunger + item.yieldHunger);
    } else {
      nextSlots.push(item);
    }
  }
  intr.acidSlots = nextSlots;

  // O19 Metabolism + O17 Hazard tick
  const boostDrain = input.boost && w.hunger > 5 ? SIM_CONFIG.boostHungerCost : 0;
  const drain = SIM_CONFIG.hungerBaseDrain + w.heart.s * SIM_CONFIG.hungerDrainPerSpeedPt + boostDrain;
  w.hunger = Math.max(0, w.hunger - drain * dt);

  const regen = w.heart.r * SIM_CONFIG.regenPerPoint;
  const breachDmg = intr.breaches * SIM_CONFIG.breachDps;
  w.health = Math.max(0, Math.min(SIM_CONFIG.maxHealth, w.health + (regen - breachDmg) * dt));
}
```

Create `prototypes/sandworm-driver-demo/src/sim/tick.ts`:
```ts
import { HEART_PRESETS, SIM_CONFIG } from './config.ts';
import { stepMotion } from './motion.ts';
import { stepBite } from './bite.ts';
import { stepInteriorAndBody } from './interior.ts';
import type { DriverInput, MatchOutcome, SimState } from './types.ts';

export function checkOutcome(state: SimState): MatchOutcome {
  if (state.worm.x >= SIM_CONFIG.goalX) return 'win';
  if (state.worm.health <= 0) return 'loss_health';
  if (state.worm.hunger <= 0) return 'loss_hunger';
  if (state.apocalypseX >= state.worm.x) return 'loss_apocalypse';
  return 'playing';
}

export function stepSim(state: SimState, input: DriverInput, dt: number): void {
  if (state.outcome !== 'playing') return;

  if (input.preset && input.preset !== state.worm.preset) {
    state.worm.preset = input.preset;
    state.worm.heart = { ...HEART_PRESETS[input.preset] };
  }

  state.time += dt;
  stepMotion(state, input, dt);
  stepBite(state, dt);
  stepInteriorAndBody(state, input, dt);

  // O25 Apocalypse wall advances steadily
  state.apocalypseX += SIM_CONFIG.apocalypseSpeed * dt;

  state.outcome = checkOutcome(state);
}
```

- [ ] **Step 4: Run all sim tests**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npx vitest run
```
Expected: PASS (all 6 tests across `state.test.ts`, `motion.test.ts`, `bite.test.ts`, `tick.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add prototypes/sandworm-driver-demo/src/sim/interior.ts prototypes/sandworm-driver-demo/src/sim/tick.ts prototypes/sandworm-driver-demo/test/tick.test.ts
git commit -m "feat(sandworm-driver): add coupled interior, metabolism, apocalypse, and tick"
```

---

### Task 6: Three.js 3D Scene & Segmented Worm Renderer

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/render/wormMesh.ts`
- Create: `prototypes/sandworm-driver-demo/src/render/world.ts`

- [ ] **Step 1: Create `wormMesh.ts`**

Create `prototypes/sandworm-driver-demo/src/render/wormMesh.ts`:
```ts
import * as THREE from 'three';
import { lerp, smoothing } from '@hk/loop';
import type { WormState } from '../sim/types.ts';

const SEGMENT_COUNT = 12;
const SEGMENT_SPACING = 1.75;

export class WormVisual {
  readonly group = new THREE.Group();
  private readonly segments: THREE.Mesh[] = [];
  private readonly trail: Array<{ x: number; y: number }> = [];
  private readonly pingRing: THREE.Mesh;

  constructor() {
    const headGeo = new THREE.ConeGeometry(1.5, 3.2, 10);
    headGeo.rotateZ(-Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd99b52, roughness: 0.65 });
    const head = new THREE.Mesh(headGeo, headMat);
    this.group.add(head);
    this.segments.push(head);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9c6b3b, roughness: 0.8 });
    for (let i = 1; i < SEGMENT_COUNT; i++) {
      const r = Math.max(0.55, 1.35 - i * 0.065);
      const geo = new THREE.SphereGeometry(r, 10, 8);
      const seg = new THREE.Mesh(geo, bodyMat);
      this.group.add(seg);
      this.segments.push(seg);
    }

    const ringGeo = new THREE.RingGeometry(1.8, 2.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x64dfdf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.pingRing = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.pingRing);
  }

  update(worm: WormState, dt: number): void {
    const head = this.segments[0]!;
    const k = smoothing(18, dt);
    head.position.x = lerp(head.position.x, worm.x, k);
    head.position.y = lerp(head.position.y, worm.y, k);
    head.rotation.z = worm.heading;

    if (this.trail.length === 0) {
      for (let i = 0; i < SEGMENT_COUNT * 4; i++) {
        this.trail.push({ x: worm.x - i * 0.5, y: worm.y });
      }
    }

    const last = this.trail[0]!;
    if (Math.hypot(head.position.x - last.x, head.position.y - last.y) > 0.35) {
      this.trail.unshift({ x: head.position.x, y: head.position.y });
      if (this.trail.length > 96) this.trail.pop();
    }

    for (let i = 1; i < this.segments.length; i++) {
      const seg = this.segments[i]!;
      const idx = Math.min(this.trail.length - 1, Math.round(i * SEGMENT_SPACING * 2));
      const p = this.trail[idx]!;
      seg.position.x = p.x;
      seg.position.y = p.y;
    }

    const ringMat = this.pingRing.material as THREE.MeshBasicMaterial;
    if (worm.pingTimer > 0) {
      const t = 1 - worm.pingTimer / 0.8;
      this.pingRing.position.set(head.position.x, head.position.y, 0);
      this.pingRing.scale.setScalar(1 + t * 4);
      ringMat.opacity = (1 - t) * 0.85;
    } else {
      ringMat.opacity = 0;
    }
  }
}
```

- [ ] **Step 2: Create `world.ts`**

Create `prototypes/sandworm-driver-demo/src/render/world.ts`:
```ts
import * as THREE from 'three';
import { lerp, smoothing } from '@hk/loop';
import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';
import { WormVisual } from './wormMesh.ts';

export class WorldRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly wormVisual = new WormVisual();
  private readonly obstacleMeshes = new Map<number, THREE.Mesh>();
  private readonly spawnerMeshes = new Map<number, THREE.Mesh>();
  private readonly apocalypseMesh: THREE.Mesh;

  constructor(container: HTMLElement, initialState: SimState) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.prepend(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x1b1512);
    this.scene.fog = new THREE.Fog(0x1b1512, 45, 130);

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.5, 250);
    this.camera.position.set(0, 6, 36);

    const hemi = new THREE.HemisphereLight(0xffdfb0, 0x3b2618, 1.1);
    const dir = new THREE.DirectionalLight(0xfff0d4, 1.4);
    dir.position.set(20, 40, 25);
    this.scene.add(hemi, dir);

    // Desert surface plane (y = 0)
    const groundGeo = new THREE.PlaneGeometry(800, 40);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x6b4c30, roughness: 0.95, transparent: true, opacity: 0.65 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(300, 0, 0);
    this.scene.add(ground);

    // Safe pocket goal beacon
    const goalGeo = new THREE.CylinderGeometry(2.5, 2.5, 36, 16);
    const goalMat = new THREE.MeshBasicMaterial({ color: 0x52b788, transparent: true, opacity: 0.45 });
    const goal = new THREE.Mesh(goalGeo, goalMat);
    goal.position.set(SIM_CONFIG.goalX, 0, 0);
    this.scene.add(goal);

    // Apocalypse wall
    const apocGeo = new THREE.BoxGeometry(8, 50, 24);
    const apocMat = new THREE.MeshBasicMaterial({ color: 0xd62828, transparent: true, opacity: 0.75 });
    this.apocalypseMesh = new THREE.Mesh(apocGeo, apocMat);
    this.scene.add(this.apocalypseMesh);

    this.scene.add(this.wormVisual.group);
    this.syncEntities(initialState);

    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private syncEntities(state: SimState): void {
    for (const obs of state.obstacles) {
      if (!this.obstacleMeshes.has(obs.id)) {
        const geo = new THREE.DodecahedronGeometry(obs.radius);
        const mat = new THREE.MeshStandardMaterial({
          color: obs.tier === 2 ? 0x6c757d : 0x8d6e63,
          roughness: 0.85,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obs.x, obs.y, 0);
        this.scene.add(mesh);
        this.obstacleMeshes.set(obs.id, mesh);
      }
      this.obstacleMeshes.get(obs.id)!.visible = !obs.broken;
    }

    for (const sp of state.spawners) {
      if (!this.spawnerMeshes.has(sp.id)) {
        const geo = new THREE.BoxGeometry(sp.radius * 1.4, sp.radius * 1.4, sp.radius * 1.4);
        const color = sp.kind === 'tyre' ? 0x343a40 : sp.kind === 'large_meat' ? 0xe05a47 : 0xf4a261;
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(sp.x, sp.y, 0);
        this.scene.add(mesh);
        this.spawnerMeshes.set(sp.id, mesh);
      }
      this.spawnerMeshes.get(sp.id)!.visible = !sp.eaten;
    }
  }

  render(state: SimState, dt: number): void {
    this.syncEntities(state);
    this.wormVisual.update(state.worm, dt);
    this.apocalypseMesh.position.set(state.apocalypseX, 2, 0);

    const k = smoothing(8, dt);
    this.camera.position.x = lerp(this.camera.position.x, state.worm.x + 8, k);
    this.camera.position.y = lerp(this.camera.position.y, Math.max(-4, state.worm.y + 4), k);
    this.camera.lookAt(this.camera.position.x, this.camera.position.y - 2, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
```

- [ ] **Step 3: Typecheck renderers**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npm.cmd run typecheck
```
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add prototypes/sandworm-driver-demo/src/render/wormMesh.ts prototypes/sandworm-driver-demo/src/render/world.ts
git commit -m "feat(sandworm-driver): add Three.js worm mesh and desert world renderer"
```

---

### Task 7: Input, HUD (`Y`), and Main Loop (`@hk/loop`)

**Files:**
- Create: `prototypes/sandworm-driver-demo/src/ui/input.ts`
- Create: `prototypes/sandworm-driver-demo/src/ui/hud.ts`
- Create: `prototypes/sandworm-driver-demo/src/main.ts`

- [ ] **Step 1: Create `input.ts`, `hud.ts`, and `main.ts`**

Create `prototypes/sandworm-driver-demo/src/ui/input.ts`:
```ts
import type { DriverInput, HeartPreset } from '../sim/types.ts';

export class InputController {
  private readonly keys = new Set<string>();
  private pingQueued = false;
  private presetQueued: HeartPreset | null = null;
  private restartQueued = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      this.keys.add(code);
      if (code === 'KeyE') this.pingQueued = true;
      if (code === 'Digit1') this.presetQueued = 'fast';
      if (code === 'Digit2') this.presetQueued = 'balanced';
      if (code === 'Digit3') this.presetQueued = 'bite';
      if (code === 'KeyR') this.restartQueued = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  sample(): DriverInput {
    const up = this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0;
    const down = this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0;
    const fwd = this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0;
    const back = this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0;

    const ping = this.pingQueued;
    const preset = this.presetQueued;
    this.pingQueued = false;
    this.presetQueued = null;

    return {
      throttle: fwd - back,
      pitch: up - down,
      boost: this.keys.has('Space'),
      ping,
      preset,
    };
  }

  consumeRestart(): boolean {
    const r = this.restartQueued;
    this.restartQueued = false;
    return r;
  }
}
```

Create `prototypes/sandworm-driver-demo/src/ui/hud.ts`:
```ts
import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';

export class HudView {
  private readonly vitals = document.getElementById('hud-vitals')!;
  private readonly progress = document.getElementById('hud-progress')!;
  private readonly interior = document.getElementById('hud-interior')!;
  private readonly overlay = document.getElementById('overlay')!;
  private readonly overlayTitle = document.getElementById('overlay-title')!;
  private readonly overlayDesc = document.getElementById('overlay-desc')!;

  constructor(onRestart: () => void) {
    document.getElementById('restart-btn')!.addEventListener('click', onRestart);
  }

  update(state: SimState): void {
    const w = state.worm;
    const intr = state.interior;
    const hpPct = Math.round((w.health / SIM_CONFIG.maxHealth) * 100);
    const hgPct = Math.round((w.hunger / SIM_CONFIG.maxHunger) * 100);
    const momPct = Math.min(100, Math.round((w.momentum / 35) * 100));

    this.vitals.innerHTML = `
      <div><strong>Worm Vitals</strong> (${w.preset.toUpperCase()} · s:${w.heart.s} r:${w.heart.r} b:${w.heart.b})</div>
      <div>Health: ${Math.round(w.health)}</div>
      <div class="bar-wrap"><div class="bar bar-hp" style="width:${hpPct}%"></div></div>
      <div>Hunger: ${Math.round(w.hunger)}</div>
      <div class="bar-wrap"><div class="bar bar-hunger" style="width:${hgPct}%"></div></div>
      <div>Momentum: ${w.momentum.toFixed(1)} ${w.momentum >= SIM_CONFIG.highMomentumThreshold ? '(HIGH)' : ''}</div>
      <div class="bar-wrap"><div class="bar bar-mom" style="width:${momPct}%"></div></div>
    `;

    const distGoal = Math.max(0, Math.round(SIM_CONFIG.goalX - w.x));
    const distApoc = Math.round(w.x - state.apocalypseX);
    this.progress.innerHTML = `
      <div><strong>Race to Safe Pocket</strong></div>
      <div>To Goal B: <strong>${distGoal} m</strong></div>
      <div>Apocalypse Lead: <strong>${distApoc} m</strong></div>
      <div class="muted">${w.y > 0 ? 'AIRBORNE' : `DEPTH ${Math.abs(w.y).toFixed(1)}m`}</div>
    `;

    this.interior.innerHTML = `
      <div><strong>Interior (Simulated Crew)</strong></div>
      <div>Mouth Queue: ${intr.mouthQueue} · Acid: ${intr.acidSlots.length}/${SIM_CONFIG.acidCapacity}</div>
      <div>Breaches: <strong style="color:${intr.breaches > 0 ? '#e05a47' : '#52b788'}">${intr.breaches}</strong></div>
      <div class="muted">${intr.crewStunTimer > 0 ? 'CREW STUNNED BY SHAKE!' : intr.breaches > 0 ? 'Crew sealing breach...' : 'Crew working'}</div>
    `;

    if (state.outcome === 'playing') {
      this.overlay.classList.remove('show');
    } else {
      this.overlay.classList.add('show');
      const labels: Record<string, [string, string]> = {
        win: ['Safe Pocket Reached!', `Survived in ${state.time.toFixed(1)}s with ${Math.round(w.health)} HP.`],
        loss_health: ['Worm Died', 'Hull breaches and damage drained worm health to 0.'],
        loss_hunger: ['Starved', 'Hunger hit 0 before reaching the Safe Pocket.'],
        loss_apocalypse: ['Consumed by Apocalypse', 'The storm wall overtook the worm.'],
      };
      const [title, desc] = labels[state.outcome] ?? ['Run Ended', ''];
      this.overlayTitle.textContent = title;
      this.overlayDesc.textContent = desc;
    }
  }
}
```

Create `prototypes/sandworm-driver-demo/src/main.ts`:
```ts
import { stepsForFrame } from '@hk/loop';
import { createInitialState } from './sim/state.ts';
import { stepSim } from './sim/tick.ts';
import { WorldRenderer } from './render/world.ts';
import { InputController } from './ui/input.ts';
import { HudView } from './ui/hud.ts';

const app = document.getElementById('app')!;
let state = createInitialState();
const renderer = new WorldRenderer(app, state);
const input = new InputController();

function resetRun(): void {
  state = createInitialState();
}

const hud = new HudView(resetRun);

let lastMs = performance.now();
let accumulator = 0;
const FIXED_DT = 1 / 60;

function frame(nowMs: number): void {
  const frameDt = Math.min(0.1, (nowMs - lastMs) / 1000);
  lastMs = nowMs;

  if (input.consumeRestart()) {
    resetRun();
  }

  const stepped = stepsForFrame(accumulator, frameDt, FIXED_DT, 5);
  accumulator = stepped.accumulator;

  for (let i = 0; i < stepped.steps; i++) {
    stepSim(state, input.sample(), FIXED_DT);
  }

  renderer.render(state, frameDt);
  hud.update(state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

- [ ] **Step 2: Commit UI and main loop**

```bash
git add prototypes/sandworm-driver-demo/src/ui/input.ts prototypes/sandworm-driver-demo/src/ui/hud.ts prototypes/sandworm-driver-demo/src/main.ts
git commit -m "feat(sandworm-driver): add input, HUD, and @hk/loop main loop"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run typecheck, unit tests, and production build**

Run:
```powershell
Set-Location D:\Projects\Research\prototypes\sandworm-driver-demo; npm.cmd run typecheck; if ($LASTEXITCODE -eq 0) { npx vitest run }; if ($LASTEXITCODE -eq 0) { npm.cmd run build }
```
Expected:
- `tsc --noEmit` exits 0
- All Vitest tests pass (`state.test.ts`, `motion.test.ts`, `bite.test.ts`, `tick.test.ts`)
- `vite build` outputs `dist/index.html` and JS bundle with 0 errors
