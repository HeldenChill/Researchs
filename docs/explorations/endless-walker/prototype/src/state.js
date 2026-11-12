import { heightAt } from './terrain.js';

export function createState(config) {
  const x = 0;
  const z = -680;
  const y = heightAt(x, z);
  const staminaMax = config?.staminaMax ?? 100;
  const balanceMax = config?.balanceMax ?? 100;

  return {
    pos: { x, y, z },
    vel: { x: 0, y: 0, z: 0 },
    heading: 0,
    speed: 0,
    stamina: staminaMax,
    balance: balanceMax,
    load: 0,
    mode: 'OnFoot',
    modeTime: 0,
    sinceDrain: 0,
    fallTimer: 0,
    bumpDist: 0,
    lungeTimer: 0,
    lungeDir: { x: 0, z: 0 },
    lungeStarted: false,
    steps: 0,
    hookAnchor: null
  };
}

export function peakState(config) {
  const x = 0;
  const z = 2;
  const y = heightAt(x, z);
  const staminaMax = config?.staminaMax ?? 100;
  const balanceMax = config?.balanceMax ?? 100;

  return {
    pos: { x, y, z },
    vel: { x: 0, y: 0, z: 0 },
    heading: 0,
    speed: 0,
    stamina: staminaMax,
    balance: balanceMax,
    load: 0,
    mode: 'OnFoot',
    modeTime: 0,
    sinceDrain: 0,
    fallTimer: 0,
    bumpDist: 0,
    lungeTimer: 0,
    lungeDir: { x: 0, z: 0 },
    lungeStarted: false,
    steps: 0,
    hookAnchor: null
  };
}
