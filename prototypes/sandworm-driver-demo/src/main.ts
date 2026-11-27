import { stepsForFrame } from '@hk/loop';
import { createInitialState } from './sim/state.ts';
import { stepSim } from './sim/tick.ts';
import { SIM_CONFIG } from './sim/config.ts';
import { WorldRenderer } from './render/world.ts';
import { CockpitRenderer } from './render/cockpit.ts';
import { interpolatePose, type Pose } from './render/pose.ts';
import {
  createCockpitState,
  focusMonitor,
  gateDriverInput,
  selectCctvRoom,
} from './cockpit/cockpitState.ts';
import { InputController } from './ui/input.ts';
import { HudView } from './ui/hud.ts';
import { createTuning } from './ui/tuning.ts';
import { loadValues, type KeyValueStore } from './tune/settings.ts';
import { DEBUG_FLAGS, applyDebugFlags } from './tune/debugFlags.ts';

function browserStore(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const store = browserStore();
loadValues(store); // before the first state, so tuned start values apply

const app = document.getElementById('app')!;
let state = createInitialState();
const cockpitState = createCockpitState();
const renderer = new WorldRenderer(app, state);
const cockpit = new CockpitRenderer(renderer.getRenderer(), {
  onSelectMonitor: (id) => focusMonitor(cockpitState, id),
  onHoverMonitor: (id) => {
    cockpitState.hoveredMonitor = id;
  },
});
const input = new InputController();

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    focusMonitor(cockpitState, 'overview');
  } else if (cockpitState.activeMonitor === 'cctv') {
    if (e.code === 'Digit1') selectCctvRoom(cockpitState, 'mouth');
    if (e.code === 'Digit2') selectCctvRoom(cockpitState, 'acid');
    if (e.code === 'Digit3') selectCctvRoom(cockpitState, 'hull');
  }
});

let lastMs = performance.now();
let accumulator = 0;
const FIXED_DT = 1 / 60;

const poseOf = (): Pose => ({ x: state.worm.x, y: state.worm.y, heading: state.worm.heading });
let prevPose = poseOf();

/** Forget interpolation and trails after the worm is moved by something other than the sim. */
function snapVisuals(): void {
  prevPose = poseOf();
  accumulator = 0;
  renderer.reset(state);
}

function resetRun(): void {
  state = createInitialState();
  snapVisuals();
}

function jumpToNextRock(): void {
  const rock = state.obstacles.find((o) => !o.broken && o.x - state.worm.x > 45) ?? state.obstacles.find((o) => !o.broken);
  if (!rock) return;
  const w = state.worm;
  Object.assign(w, { x: rock.x - 40, y: -1, vx: 18, vy: 0, heading: 0, recoilTimer: 0, activeObstacleId: null, gnawTimer: 0, gnawProgress: 0 });
  state.apocalypseX = w.x + SIM_CONFIG.apocalypseStartX;
  snapVisuals();
}

const hud = new HudView(
  resetRun,
  (id) => focusMonitor(cockpitState, id),
  (room) => selectCctvRoom(cockpitState, room),
);
const tuning = createTuning({ getState: () => state, restart: resetRun, jumpToNextRock }, store);

function frame(nowMs: number): void {
  const frameDt = Math.min(0.1, (nowMs - lastMs) / 1000);
  lastMs = nowMs;

  if (input.consumeRestart()) {
    resetRun();
  }

  const gameDt = frameDt * DEBUG_FLAGS.timeScale;
  const stepped = stepsForFrame(accumulator, gameDt, FIXED_DT, 12);
  accumulator = stepped.accumulator;

  const driverInput = gateDriverInput(cockpitState, input.sample());
  for (let i = 0; i < stepped.steps; i++) {
    prevPose = poseOf();
    const stormBefore = state.apocalypseX;
    stepSim(state, driverInput, FIXED_DT);
    applyDebugFlags(state, stormBefore);
  }

  // Draw between the last two sim steps, so motion stays even at any refresh rate.
  const alpha = state.outcome === 'playing' ? accumulator / FIXED_DT : 1;
  renderer.renderToTarget(state, interpolatePose(prevPose, poseOf(), alpha), gameDt, cockpit.driveTarget);
  cockpit.render(state, cockpitState, frameDt, renderer.getShake());
  hud.update(state, cockpitState);
  tuning.update();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
