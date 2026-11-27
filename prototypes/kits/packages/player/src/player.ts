/* Shared Quarry Nine movement kit. Game-specific speed effects go through MoveStats.speedMul. Used by FishingGame (and Airplane next).
   Player movement: one fixed tick of walk / sprint / slide / jump / mantle / gravity / lean. Ported from
   js/player/movement.js + the movement part of js/core/loop.js update(), with the globals (P, keys) replaced by explicit
   state + input so the server, client prediction and solo play all run the exact same code.
   Every field is a number and is rounded to float32 after each tick, so a client that resets to a server snapshot and
   replays its inputs lands on bit-identical results.
   The gun (fire rate, recoil, spread, reload timing) stays in the client's weapon code; the server validates the shots
   it reports (room.ts). Movement only needs to know from the gun how fast it lets you move (MoveStats). */
import { DT } from './constants.ts';

/** What movement needs from the map (World): solid shapes in a square between two heights, walkable top under a point. */
export interface MoveWorld {
  blocked(x: number, z: number, r: number, yLo: number, yHi: number): boolean;
  support(x: number, z: number, yTop: number): number;
}
/** Handling of the gun in hand (weaponStats in the client: spd, sprint speed / build-up, ADS speed multiplier). */
export interface MoveStats { spd: number; sprSpd: number; sprIn: number; adsSpd: number; speedMul?: (s: PlayerState, wx: number, wz: number) => number }
export const DEFAULT_MOVE: MoveStats = { spd: 1, sprSpd: 3, sprIn: 0.55, adsSpd: 1 };

export const Btn = {
  Fwd: 1, Back: 2, Left: 4, Right: 8, Jump: 16, Sprint: 32, Crouch: 64, CrouchToggle: 128,
  Ads: 256, Fire: 512, Reloading: 1024,
  /** stand up out of a crouch for this tick (the client's ADS auto-adjust when the gun is blocked) */
  Stand: 2048,
  LeanL: 4096, LeanR: 8192,
  /** tap: go prone / get up (Z) */
  Prone: 16384,
  /** held while the client has its bipod deployed: the body pivots around the bipod's feet (Battlefield style) */
  Bipod: 32768,
  /** tap: melee strike (knife / rifle butt), zombie co-op: the server hits the zombies in front */
  Melee: 65536,
} as const;

export interface Input {
  seq: number;
  buttons: number;
  yaw: number;
  pitch: number;
  /** Server tick the client was rendering other players at when it sampled this input (lag compensation). */
  viewTick: number;
}

const STEP_H = 0.26, GRAV = 15, JUMP_V = 4.7, MANTLE_MAX = 1.75, RADIUS = 0.35;
const SLIDE = { minSpd: 4.8, boost: 1.12, max: 7.2, fric: 7.5, dur: 0.55, cd: 1.0, end: 2.6 };
const JUMP_CD = 0.85;  // s from takeoff before the next jump (no bunny hopping)
const WALK = 4.0, SPRINT_K = 0.75;  // walk speed (m/s) and scale on the gun's sprint bonus
const BUFFER = 0.15;   // jump / slide press buffer (s)
export const LEAN_OFF = 0.55;   // m sideways at full lean
/** eye height above the feet: standing / crouched / sliding / prone */
export const EYE = { stand: 1.6, crouch: 1.0, slide: 0.85, prone: 0.42 } as const;
/** bipod: the feet sit BIP_R ahead of the eye; the body swings round them up to BIP_ARC rad either side of where it was set */
export const BIP_R = 0.7, BIP_ARC = 0.7;
/** Prone amount of an avatar from its eye height above the feet (0 crouched or higher, 1 flat). */
export const proneOf = (stance: number) => Math.max(0, Math.min(1, (EYE.crouch - stance) / (EYE.crouch - EYE.prone)));

/** Every simulated field. Order matters: it is the wire order of the owner's state in snapshots. */
export const STATE_KEYS = [
  'x', 'z', 'py', 'vx', 'vz', 'vy', 'gy', 'yaw', 'pitch', 'stance', 'lean',
  'crouch', 'crouchToggle', 'slideT', 'slideCd', 'slideQ', 'jumpQ', 'coyote', 'sprRamp', 'prevButtons', 'ads', 'sprint',
  'mt', 'mdur', 'mx0', 'mz0', 'my0', 'mx1', 'mz1', 'my1',
  'prone', 'bipod', 'bx', 'bz', 'byaw', 'jumpCd',
] as const;
export type StateKey = (typeof STATE_KEYS)[number];
export type PlayerState = Record<StateKey, number>;

export function newPlayerState(x = 0, z = 0, yaw = 0): PlayerState {
  const s = Object.fromEntries(STATE_KEYS.map(k => [k, 0])) as PlayerState;
  s.x = x; s.z = z; s.yaw = yaw; s.stance = 1.6; s.mt = -1;
  return quantize(s);
}
export function copyState(dst: PlayerState, src: PlayerState): PlayerState {
  for (const k of STATE_KEYS) dst[k] = src[k];
  return dst;
}
export function quantize(s: PlayerState): PlayerState {
  for (const k of STATE_KEYS) s[k] = Math.fround(s[k]);
  return s;
}

/** What happened during a tick, for sounds and camera bounce on the client. */
export interface TickEvents { jumped: boolean; landed: number; slid: boolean; mantled: number; mantleEnd: boolean }
export const noEvents = (): TickEvents => ({ jumped: false, landed: 0, slid: false, mantled: 0, mantleEnd: false });

export const isSliding = (s: PlayerState) => s.slideT > 0;
export const isMantling = (s: PlayerState) => s.mt >= 0;
export const airborne = (s: PlayerState) => isMantling(s) || s.py > s.gy + 0.02 || s.vy > 0.05;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ---- collision against the map ----
   The body is a square of RADIUS from a step above the feet up to the top of the head, and the head follows the
   stance: crouched, sliding or prone you fit through vents and low gaps that block you standing. */
/** top of the head above the eye */
export const HEAD_PAD = 0.25;
/** body height for an eye height above the feet */
export const bodyH = (stance: number) => stance + HEAD_PAD;
export function collides(w: MoveWorld, x: number, z: number, r: number, y: number, h = EYE.stand + HEAD_PAD) {
  return w.blocked(x, z, r, y + STEP_H, y + h);
}
/** Overlapping geometry (end of a climb, a stance change under a lip): step out to the nearest free spot. */
export function unstick(w: MoveWorld, s: PlayerState) {
  const h = bodyH(s.stance);
  if (!collides(w, s.x, s.z, RADIUS, s.py, h)) return false;
  for (let d = 0.04; d <= 0.6; d += 0.04) for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8, x = s.x + Math.cos(a) * d, z = s.z + Math.sin(a) * d;
    if (!collides(w, x, z, RADIUS, s.py, h)) { s.x = x; s.z = z; return true; }
  }
  return false;
}
export function moveBy(w: MoveWorld, s: PlayerState, dx: number, dz: number) {
  const h = bodyH(s.stance);
  if (!collides(w, s.x + dx, s.z, RADIUS, s.py, h)) s.x += dx;
  if (!collides(w, s.x, s.z + dz, RADIUS, s.py, h)) s.z += dz;
}
const FOOT = [[0, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]] as const;
/** highest walkable top under the feet that is no more than a step above y */
export function groundAt(w: MoveWorld, x: number, z: number, y: number, r = 0.22) {
  let g = -Infinity;
  for (const [ox, oz] of FOOT) {
    const t = w.support(x + ox * r, z + oz * r, y + STEP_H);
    if (t > g) g = t;
  }
  return g;
}
/** room to stand at eye height `eye` where the player is */
const roomFor = (w: MoveWorld, s: PlayerState, eye: number) => !collides(w, s.x, s.z, RADIUS, s.py, eye + HEAD_PAD);
/** Eye position with lean, pulled back in if the lean would put the head inside a wall (eyeAt in combat.js). */
export function eyePos(w: MoveWorld, s: PlayerState): { x: number; y: number; z: number } {
  const rx = Math.cos(s.yaw), rz = -Math.sin(s.yaw);
  let off = s.lean * LEAN_OFF;
  while (Math.abs(off) > 0.01 && collides(w, s.x + rx * off, s.z + rz * off, 0.15, s.py, bodyH(s.stance))) off *= 0.8;
  return { x: s.x + rx * off, y: s.py + s.stance, z: s.z + rz * off };
}

/* ---- slide / mantle ---- */
function endSlide(s: PlayerState) { if (s.slideT > 0) { s.slideT = 0; s.slideCd = SLIDE.cd; } }

/** Knock the player prone and slide them along unit direction (dx, dz) at `speed` m/s. */
export function knockDown(s: PlayerState, dx: number, dz: number, speed: number): void {
  endSlide(s);
  s.prone = 1;
  s.crouchToggle = 0;
  s.slideQ = 0;
  s.jumpQ = 0;
  s.vx = dx * speed;
  s.vz = dz * speed;
}
function tryMantle(w: MoveWorld, s: PlayerState, ev: TickEvents) {
  const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw), y = s.py;
  for (const d of [0.5, 0.7, 0.9, 1.1]) {
    const x = s.x + fx * d, z = s.z + fz * d;
    const t = w.support(x, z, y + MANTLE_MAX);
    if (t <= y + STEP_H || t > y + MANTLE_MAX) continue;
    if (collides(w, x, z, RADIUS + 0.02, t)) continue;   // a taller box, a wall or a lintel where we'd stand (full body width)
    if (w.blocked(s.x, s.z, 0.25, y + EYE.stand + HEAD_PAD, t + EYE.stand + HEAD_PAD)) continue;   // no room to climb up here
    const h = t - y;
    s.mt = 0; s.mdur = 0.26 + h * 0.2; s.mx0 = s.x; s.mz0 = s.z; s.my0 = y; s.mx1 = x; s.mz1 = z; s.my1 = t;
    s.vx = 0; s.vz = 0; s.vy = 0; endSlide(s); s.crouchToggle = 0;
    ev.mantled = h;
    return true;
  }
  return false;
}
function stepMantle(s: PlayerState, ev: TickEvents) {
  s.mt += DT;
  const k = Math.min(1, s.mt / s.mdur), sm = (v: number) => v * v * (3 - 2 * v);
  const up = sm(clamp(k / 0.65, 0, 1)), fw = sm(clamp((k - 0.3) / 0.7, 0, 1));
  s.py = s.my0 + (s.my1 - s.my0) * up;
  s.x = s.mx0 + (s.mx1 - s.mx0) * fw; s.z = s.mz0 + (s.mz1 - s.mz0) * fw;
  if (k >= 1) {
    s.mt = -1; s.py = s.gy = s.my1; s.vy = 0;
    s.vx = (s.mx1 - s.mx0) * 2; s.vz = (s.mz1 - s.mz0) * 2;   // carry a little forward speed out of the climb
    ev.mantleEnd = true;
  }
  return k >= 1;
}

/** One fixed tick for one player. Mutates `s`; reports what happened in the returned events. */
export function stepPlayer(s: PlayerState, inp: Input, wpn: MoveStats, w: MoveWorld, ev: TickEvents = noEvents()): TickEvents {
  const b = inp.buttons, pressed = b & ~s.prevButtons, held = (m: number) => (b & m) !== 0, wasProne = s.prone;
  s.prevButtons = b;
  s.yaw = inp.yaw;
  s.pitch = clamp(inp.pitch, -1.45, 1.45);
  const fwd = (held(Btn.Fwd) ? 1 : 0) - (held(Btn.Back) ? 1 : 0), str = (held(Btn.Right) ? 1 : 0) - (held(Btn.Left) ? 1 : 0);
  const wantSprint = held(Btn.Sprint), reloading = held(Btn.Reloading);
  // prone: crouch keys get up into a crouch, jump / sprint forward get all the way up
  if (s.prone) {
    if (pressed & (Btn.CrouchToggle | Btn.Crouch)) { s.prone = 0; s.crouchToggle = pressed & Btn.CrouchToggle ? 1 : s.crouchToggle; }
    else if (pressed & Btn.Jump || (pressed & Btn.Sprint && fwd > 0)) { s.prone = 0; s.crouchToggle = 0; }
    else if (pressed & Btn.Prone) s.prone = 0;
  } else {
    if (pressed & Btn.CrouchToggle) { s.crouchToggle = s.crouchToggle ? 0 : 1; s.slideQ = BUFFER; }
    if (pressed & Btn.Crouch) s.slideQ = BUFFER;
    if (pressed & Btn.Jump) s.jumpQ = BUFFER;
    // Z: drop prone (out of a slide too: a dive that keeps a little of the speed)
    if (pressed & Btn.Prone && !isMantling(s) && !airborne(s)) {
      s.prone = 1; s.crouchToggle = 0; s.slideQ = 0; s.jumpQ = 0;
      if (s.slideT > 0) { endSlide(s); s.vx *= 0.5; s.vz *= 0.5; }
    }
  }
  s.ads = held(Btn.Ads) ? 1 : 0;

  s.slideQ = Math.max(0, s.slideQ - DT); s.jumpQ = Math.max(0, s.jumpQ - DT); s.slideCd = Math.max(0, s.slideCd - DT); s.jumpCd = Math.max(0, s.jumpCd - DT);
  const grounded = !airborne(s);
  let sp = Math.hypot(s.vx, s.vz);
  // slide: crouch pressed while sprinting at speed (checked before sprint cancels a C toggle)
  if (!s.prone && s.slideQ > 0 && !(s.slideT > 0) && grounded && s.slideCd <= 0 && s.sprRamp > 0.5 && sp > SLIDE.minSpd) {
    const ns = Math.min(SLIDE.max, sp * SLIDE.boost);
    s.vx *= ns / sp; s.vz *= ns / sp; s.slideT = SLIDE.dur; s.slideQ = 0; ev.slid = true;
  }
  const sliding = s.slideT > 0;
  if (!sliding && wantSprint && fwd > 0 && s.crouchToggle) s.crouchToggle = 0;
  const wantCrouch = held(Btn.Crouch) || s.crouchToggle !== 0;
  // under something low (a vent, a gap): stay down until there is room to get up
  if (wasProne && !s.prone && !roomFor(w, s, EYE.crouch)) s.prone = 1;
  s.crouch = !s.prone && (sliding || (wantCrouch && !held(Btn.Stand))) ? 1 : 0;
  if (!s.prone && !s.crouch && !roomFor(w, s, EYE.stand)) s.crouch = 1;
  const sprint = !sliding && !isMantling(s) && wantSprint && fwd > 0 && !s.crouch && !s.prone && !s.ads;
  // bipod: set where the feet land on the first tick it is held; dropped with anything that lifts the gun off them
  const bip = held(Btn.Bipod) && grounded && !sliding && !isMantling(s);
  if (bip && !s.bipod) { s.byaw = s.yaw; s.bx = s.x - Math.sin(s.yaw) * BIP_R; s.bz = s.z - Math.cos(s.yaw) * BIP_R; }
  s.bipod = bip ? 1 : 0;
  s.sprint = sprint ? 1 : 0;
  // sprint builds up over sprIn (smoothstep) and bleeds off over ~0.25 s; a slide holds it so you come out still running
  if (!sliding) s.sprRamp = clamp(s.sprRamp + (sprint ? DT / wpn.sprIn : -DT / 0.25), 0, 1);
  const sprE = s.sprRamp * s.sprRamp * (3 - 2 * s.sprRamp);
  let maxS = (s.prone ? (s.ads ? 0.55 : 0.9) : (s.crouch ? 2.1 : s.ads ? 2.8 * wpn.adsSpd : WALK) + (s.crouch || s.ads ? 0 : SPRINT_K * wpn.sprSpd / wpn.spd * sprE * (reloading ? 0.4 : 1)))
    * wpn.spd * (reloading ? 0.88 : 1);
  const sy = Math.sin(s.yaw), cy = Math.cos(s.yaw);
  let wx = -sy * fwd + cy * str, wz = -cy * fwd - sy * str; const wl = Math.hypot(wx, wz);
  if (wl > 0) { wx /= wl; wz /= wl; }
  if (wpn.speedMul && wl > 0) maxS *= wpn.speedMul(s, wx, wz);

  let moved = false;
  if (isMantling(s)) { stepMantle(s, ev); moved = true; }
  // never stay wedged inside a wall: after a climb or any overlap, step out before moving
  if (!isMantling(s)) unstick(w, s);
  if (!moved) {
    // jump (buffered press + a short coyote window after walking off an edge); Space into cover = mantle
    s.coyote = grounded ? 0.1 : Math.max(0, s.coyote - DT);
    if (s.jumpQ > 0 && fwd > 0 && tryMantle(w, s, ev)) { s.jumpQ = 0; moved = true; }
    else if (s.jumpQ > 0 && s.coyote > 0 && s.jumpCd <= 0) {
      s.jumpQ = 0; s.coyote = 0; s.vy = JUMP_V; s.jumpCd = JUMP_CD; s.crouchToggle = 0; ev.jumped = true;
      if (sliding) { endSlide(s); s.vx *= 0.85; s.vz *= 0.85; }   // slide-jump keeps most of the slide's speed, full slide cooldown
    } else if (!grounded && held(Btn.Jump) && fwd > 0 && s.vy < 2.5 && tryMantle(w, s, ev)) moved = true;
  }
  if (!moved) {
    const air = airborne(s);
    if (s.slideT > 0) {
      // slide: no input speed, friction bleeds it off, a little steering toward the keys
      s.slideT -= DT;
      sp = Math.hypot(s.vx, s.vz);
      const ns = Math.max(0, sp - SLIDE.fric * DT);
      if (wl > 0 && sp > 0.01) {
        const st = Math.min(1, DT * 1.6), vx = s.vx / sp + (wx - s.vx / sp) * st, vz = s.vz / sp + (wz - s.vz / sp) * st, vl = Math.hypot(vx, vz) || 1;
        s.vx = vx / vl * ns; s.vz = vz / vl * ns;
      } else { const k = sp > 0 ? ns / sp : 0; s.vx *= k; s.vz *= k; }
      if (s.slideT <= 0 || ns < SLIDE.end) endSlide(s);
    } else if (!s.bipod) {
      // in the air: momentum is kept, only a little air control
      const acc = Math.min(1, DT * (air ? 1.8 : wl > 0 ? 9 : 11));
      s.vx += (wx * maxS - s.vx) * acc; s.vz += (wz * maxS - s.vz) * acc;
    }
    const x0 = s.x, z0 = s.z;
    if (s.bipod) {
      // on the bipod the feet stay put and the body swings round them as the view turns (inside the arc)
      const d = Math.atan2(Math.sin(s.yaw - s.byaw), Math.cos(s.yaw - s.byaw)), a = s.byaw + clamp(d, -BIP_ARC, BIP_ARC);
      s.vx = 0; s.vz = 0;
      moveBy(w, s, s.bx + Math.sin(a) * BIP_R - s.x, s.bz + Math.cos(a) * BIP_R - s.z);
    } else moveBy(w, s, s.vx * DT, s.vz * DT);
    // slid into something: stop the slide
    if (s.slideT > 0 && Math.hypot(s.x - x0, s.z - z0) < Math.hypot(s.vx, s.vz) * DT * 0.35) { endSlide(s); s.vx *= 0.3; s.vz *= 0.3; }
    // gravity + ground; the head stops at ceilings
    const py0 = s.py;
    s.vy -= GRAV * DT; s.py += s.vy * DT;
    if (s.vy > 0 && collides(w, s.x, s.z, RADIUS * 0.9, s.py, bodyH(s.stance))) { s.py = py0; s.vy = 0; }
    let g = groundAt(w, s.x, s.z, Math.max(s.py, s.gy - 0.01));
    if (!Number.isFinite(g)) g = s.gy;
    // walking down a ramp or off a low step: stay on the ground instead of floating off it
    if (grounded && s.vy <= 0 && s.py > g && py0 - g < 0.45) s.py = g;
    if (s.py <= g) {
      if (s.vy < -2.6) { ev.landed = -s.vy; s.vx *= 0.7; s.vz *= 0.7; }   // landing costs speed: no hop chains
      s.py = g; s.vy = 0;
    }
    s.gy = g;
    if (s.slideT > 0 && airborne(s)) endSlide(s);   // slid off an edge
  }
  // eye height and lean ease toward their targets (loop.js update)
  const slidingNow = s.slideT > 0;
  // going down to / getting up from prone is slower than a crouch
  const toProne = s.prone || s.stance < EYE.slide - 0.02;
  s.stance += ((s.prone ? EYE.prone : slidingNow ? EYE.slide : s.crouch ? EYE.crouch : EYE.stand) - s.stance) * Math.min(1, DT * (slidingNow ? 16 : toProne ? 5.5 : 12));
  const leanT = s.prone || s.bipod ? 0 : (held(Btn.LeanR) ? 1 : 0) - (held(Btn.LeanL) ? 1 : 0);
  s.lean += (leanT - s.lean) * Math.min(1, DT * 10);
  quantize(s);
  return ev;
}

/** View direction from yaw / pitch (yaw 0 looks down -z, like the original camera). */
export function viewDir(yaw: number, pitch: number): [number, number, number] {
  const cp = Math.cos(pitch);
  return [-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp];
}
