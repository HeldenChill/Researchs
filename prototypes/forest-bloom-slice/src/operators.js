// Pure phase operators: (state, level, config) -> new state. Each phase reads the
// result of the previous one and writes synchronously (reads a snapshot, writes a copy).
import { EMPTY, CANOPY, SOIL_MAX } from './config.js';
import { cloneState } from './state.js';

export function neighbours(level, i) {
  const { width: w, height: h } = level, x = i % w, y = (i - x) / w, out = [];
  if (x > 0) out.push(i - 1);
  if (x < w - 1) out.push(i + 1);
  if (y > 0) out.push(i - w);
  if (y < h - 1) out.push(i + w);
  return out;
}

export function agePhase(state) {
  const s = cloneState(state);
  for (let i = 0; i < s.species.length; i++) if (s.species[i] !== EMPTY) s.age[i] += 1;
  return s;
}

export function mortalityPhase(state, level, config) {
  const s = cloneState(state);
  for (let i = 0; i < s.species.length; i++) {
    const id = state.species[i];
    if (id === EMPTY) continue;
    const sp = config.species[id];
    const canopyNear = neighbours(level, i).filter(j => state.species[j] === CANOPY).length;
    if (state.age[i] > sp.lifespan || state.soil[i] < sp.minSoil || canopyNear >= sp.shadeLimit) {
      s.species[i] = EMPTY;
      s.age[i] = 0;
    }
  }
  return s;
}

// Per cell: negative contributions first, then positive ones in ascending enrichCap
// order. A positive contribution never lifts the cell above its own cap and never lowers it.
export function soilPhase(state, level, config) {
  const s = cloneState(state), n = state.soil.length;
  const contrib = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const id = state.species[i];
    if (id === EMPTY) continue;
    const sp = config.species[id];
    if (sp.soilSelf) contrib[i].push({ d: sp.soilSelf, cap: sp.enrichCap });
    if (sp.soilNear) for (const j of neighbours(level, i)) if (!level.rock[j]) contrib[j].push({ d: sp.soilNear, cap: sp.enrichCap });
  }
  for (let i = 0; i < n; i++) {
    if (!contrib[i].length) continue;
    let v = state.soil[i];
    const neg = contrib[i].filter(c => c.d < 0), pos = contrib[i].filter(c => c.d > 0).sort((a, b) => a.cap - b.cap);
    for (const c of neg) v += c.d;
    for (const c of pos) v = Math.max(v, Math.min(v + c.d, c.cap));
    s.soil[i] = Math.max(0, Math.min(SOIL_MAX, v));
  }
  return s;
}

export function germinatePhase(state, level, config) {
  const s = cloneState(state);
  for (let i = 0; i < state.species.length; i++) {
    if (level.rock[i] || state.species[i] !== EMPTY) continue;
    let best = EMPTY, bestRank = -Infinity;
    for (const j of neighbours(level, i)) {
      const id = state.species[j];
      if (id === EMPTY) continue;
      const sp = config.species[id];
      if (state.age[j] >= sp.matureAge && state.soil[i] >= sp.minSoil && sp.rank > bestRank) { best = id; bestRank = sp.rank; }
    }
    if (best !== EMPTY) { s.species[i] = best; s.age[i] = 0; }
  }
  return s;
}

export function tick(state, level, config) {
  let s = agePhase(state, level, config);
  s = mortalityPhase(s, level, config);
  s = soilPhase(s, level, config);
  s = germinatePhase(s, level, config);
  s.tick = state.tick + 1;
  return s;
}

export function run(state, level, config, ticks) {
  let s = state;
  for (let t = 0; t < ticks; t++) s = tick(s, level, config);
  return s;
}
