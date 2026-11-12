import { modeTransitions, land } from './mode.js';
import { locomotion } from './locomotion.js';
import { stamina } from './stamina.js';
import { climb } from './climb.js';
import { slide } from './slide.js';
import { balance } from './balance.js';
import { hook } from './hook.js';

export function stepWalker(state, actions, config, dt, terrain, feel) {
  const currentField = terrain.fieldAt(state.pos.x, state.pos.z, state.heading);

  const h = feel ? hook(state, actions, feel, dt, terrain, config) : null;

  let s;
  if (h !== null) {
    s = h;
  } else {
    s = modeTransitions(state, actions, currentField, config, terrain);
    const modeChanged = s.mode !== state.mode;

    if (modeChanged) {
      s = { ...s, modeTime: 0 };
    } else {
      s = { ...s, modeTime: state.modeTime + dt };

      // Move by mode
      if (s.mode === 'OnFoot') {
        s = locomotion(s, actions, currentField, config, dt, terrain);
      } else if (s.mode === 'OnWall') {
        s = climb(s, actions, currentField, config, dt, terrain);
      } else if (s.mode === 'Sliding' || s.mode === 'Fallen') {
        s = slide(s, actions, currentField, config, dt, terrain);
      } else if (s.mode === 'InAir') {
        const vy = s.vel.y - config.gravity * dt;
        const px = s.pos.x + s.vel.x * dt;
        const py = s.pos.y + vy * dt;
        const pz = s.pos.z + s.vel.z * dt;
        const groundH = terrain.heightAt(px, pz);

        if (py <= groundH) {
          const stateBeforeLand = {
            ...s,
            pos: { x: px, y: py, z: pz },
            vel: { x: s.vel.x, y: vy, z: s.vel.z }
          };
          const landField = terrain.fieldAt(px, pz, s.heading);
          s = land(stateBeforeLand, landField, config);
        } else {
          s = {
            ...s,
            pos: { x: px, y: py, z: pz },
            vel: { x: s.vel.x, y: vy, z: s.vel.z }
          };
        }
      }
    }
  }

  // Stamina rule
  s = stamina(s, actions, currentField, config, dt);

  // Balance rule
  s = balance(s, actions, currentField, config, dt);

  return s;
}
