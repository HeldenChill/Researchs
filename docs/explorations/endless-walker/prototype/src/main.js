import * as THREE from 'three';
import { config, CONFIG_SPEC } from './config.js';
import { feel, FEEL_SPEC } from './feel-config.js';
import { createState, peakState } from './state.js';
import { createInput } from './input.js';
import { stepsForFrame } from './loop.js';
import { createScene } from './feedback/scene.js';
import { createCameraRig } from './feedback/camera.js';
import { createHud } from './feedback/hud.js';
import { createBody } from './feedback/body.js';
import { createAudio } from './feedback/audio.js';
import { createRumble } from './feedback/rumble.js';
import { createParticles } from './feedback/particles.js';
import { createFootprints } from './feedback/footprints.js';
import { createRope } from './feedback/rope.js';
import { createPostFx } from './feedback/postfx.js';
import { createAim, AIM_NDC_Y } from './feedback/aim.js';
import { raycastTerrain } from './rules/hook.js';
import { createTuning } from './tuning.js';
import { stepWalker } from './rules/step.js';
import * as terrain from './terrain.js';

const appEl = document.getElementById('app');
const hudEl = document.getElementById('hud');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
appEl.appendChild(renderer.domElement);

const sceneApi = createScene(renderer);
const { scene, sun } = sceneApi;
const cameraRig = createCameraRig(window.innerWidth / window.innerHeight);
const input = createInput(renderer.domElement);
const hud = createHud(hudEl);
const body = createBody(scene);
const audio = createAudio();
const rumble = createRumble();
const particles = createParticles(scene);
const footprints = createFootprints(scene);
const rope = createRope(scene);
const tuning = createTuning(config, CONFIG_SPEC, feel, FEEL_SPEC);
const postFx = createPostFx(renderer, scene, cameraRig.camera);
const aimUi = createAim(appEl);
const aimRay = new THREE.Raycaster();
const aimNdc = new THREE.Vector2(0, AIM_NDC_Y);
let prevHookFire = false;

let state = createState(config);
let accumulator = 0;
let lastTime = performance.now();
const FIXED_STEP = 1 / 60;

function animate(now) {
  requestAnimationFrame(animate);

  const frameDt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const actions = input.read(cameraRig.yaw);

  if (actions.hookToggle) {
    feel.hookEnabled = 1 - feel.hookEnabled;
  }

  // Hook aim: ray from the camera through the crosshair (above screen centre, not the walker's back).
  aimRay.setFromCamera(aimNdc, cameraRig.camera);
  const ro = aimRay.ray.origin;
  const rd = aimRay.ray.direction;
  actions.aim = { ox: ro.x, oy: ro.y, oz: ro.z, dx: rd.x, dy: rd.y, dz: rd.z };
  const aimOrigin = { x: ro.x, y: ro.y, z: ro.z };
  const aimDir = { x: rd.x, y: rd.y, z: rd.z };
  const aimHit = feel.hookEnabled ? raycastTerrain(aimOrigin, aimDir, feel.hookRange, terrain) : null;
  aimUi.update(!!feel.hookEnabled, !!aimHit);

  const fireEdge = actions.hookFire && !prevHookFire && !!feel.hookEnabled && state.mode !== 'Hooked';
  prevHookFire = actions.hookFire;
  const fireShot = fireEdge ? { origin: aimOrigin, dir: aimDir, hit: aimHit, range: feel.hookRange } : null;
  if (fireEdge && !aimHit) audio.playHookMiss(feel);

  if (actions.reset) {
    state = createState(config);
  } else if (actions.toPeak) {
    state = peakState(config);
  }

  const { steps, acc } = stepsForFrame(accumulator, frameDt, FIXED_STEP, 5);
  accumulator = acc;

  for (let i = 0; i < steps; i++) {
    state = stepWalker(state, actions, config, FIXED_STEP, terrain, feel);
  }

  // Sun follows walker
  sun.position.set(state.pos.x + 500, state.pos.y + 160, state.pos.z + 100);
  sun.target.position.set(state.pos.x, state.pos.y, state.pos.z);
  sceneApi.update(feel);

  // Update feedback systems (read state only)
  body.update(state, config, frameDt);
  audio.update(state, config, frameDt, feel);
  rumble.update(state, config, frameDt);
  particles.update(state, config, frameDt, feel);
  footprints.update(state, feel, frameDt);
  rope.update(state, feel, frameDt, fireShot);
  cameraRig.update(state, config, frameDt, actions.lookDX, actions.lookDY, feel);
  hud.update(state, config);

  postFx.render(state, config, feel, frameDt);
}

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  postFx.setSize(w, h);
  cameraRig.camera.aspect = w / h;
  cameraRig.camera.updateProjectionMatrix();
});

requestAnimationFrame(animate);
