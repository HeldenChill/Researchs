export const ROCKS = [
  { x: -60, z: 200, radius: 4, height: 2 },
  { x: 70, z: 320, radius: 4, height: 2 },
  { x: -90, z: 430, radius: 4, height: 2 },
  { x: 40, z: 520, radius: 4, height: 2 }
];

export const LANDMARK = { x: 0, z: 4000, height: 900 };

const ss = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const SLIDE = [[0, 320], [12, 320], [612, 0]];
const APPR = [[0, 320], [12, 320], [75, 288], [81, 274], [84, 273.5], [90, 260], [600, 0]];

function lin(t, r) {
  if (r <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    if (r <= t[i][0]) {
      const [a, ha] = t[i - 1], [b, hb] = t[i];
      return ha + (hb - ha) * (r - a) / (b - a);
    }
  }
  return t[t.length - 1][1];
}

function profile(t, r, b) {
  let s = 0;
  for (let k = -4; k <= 4; k++) {
    s += lin(t, Math.max(0, r + b * k / 4));
  }
  return s / 9;
}

function hash(i, j, s) {
  const h = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
}

function vnoise(x, z, sp, s) {
  const fx = x / sp, fz = z / sp;
  const i = Math.floor(fx), j = Math.floor(fz);
  const u = fx - i, v = fz - j;
  const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
  const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s);
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}

function baseHeight(x, z) {
  const r = Math.hypot(x, z);
  const w = r < 1e-6 ? 1 : ss(-0.3, 0.3, z / r);
  const wave = 4 * Math.sin(2 * Math.PI * (r - 12) / 150) * ss(12, 40, r) * (1 - ss(560, 612, r));
  const slide = profile(SLIDE, r, 1) + wave + 0.6 * vnoise(x, z, 25, 2) * ss(14, 30, r) * (1 - ss(580, 612, r));
  const cliffMask = 1 - ss(66, 70, r) * (1 - ss(94, 98, r));
  const appr = profile(APPR, r, 1) + 1.5 * vnoise(x, z, 40, 1) * ss(14, 30, r) * (1 - ss(560, 600, r)) * cliffMask;
  return w * slide + (1 - w) * appr;
}

export function heightAt(x, z) {
  let h = baseHeight(x, z);
  for (const rock of ROCKS) {
    const d = Math.hypot(x - rock.x, z - rock.z);
    h += rock.height * ss(rock.radius, 0, d);
  }
  return h;
}

const EPS = 0.05;

export function gradientAt(x, z) {
  const gx = (heightAt(x + EPS, z) - heightAt(x - EPS, z)) / (2 * EPS);
  const gz = (heightAt(x, z + EPS) - heightAt(x, z - EPS)) / (2 * EPS);
  return { gx, gz };
}

export function slopeDegAt(x, z) {
  const { gx, gz } = gradientAt(x, z);
  return Math.atan(Math.hypot(gx, gz)) * 180 / Math.PI;
}

export function zoneAt(x, z) {
  for (const rock of ROCKS) {
    if (Math.hypot(x - rock.x, z - rock.z) <= rock.radius) {
      return 'rock';
    }
  }
  const r = Math.hypot(x, z);
  if (r < 12) return 'summit';
  if (slopeDegAt(x, z) > 50) return 'cliff';

  const w = r < 1e-6 ? 1 : ss(-0.3, 0.3, z / r);
  if (w >= 0.5) {
    return r <= 612 ? 'slide' : 'runout';
  } else {
    return r <= 600 ? 'approach' : 'base';
  }
}

export function fieldAt(x, z, heading = 0) {
  const h = heightAt(x, z);
  const { gx, gz } = gradientAt(x, z);
  const gLen = Math.hypot(gx, gz);
  const slopeDeg = Math.atan(gLen) * 180 / Math.PI;
  const slopeAlongDeg = Math.atan(gx * Math.sin(heading) + gz * Math.cos(heading)) * 180 / Math.PI;
  const slopeAcrossDeg = Math.atan(gx * Math.cos(heading) - gz * Math.sin(heading)) * 180 / Math.PI;
  const zone = zoneAt(x, z);

  let grip = 0.35;
  let softness = 0.6;
  if (zone === 'slide') {
    grip = 0.12;
    softness = 0.2;
  } else if (zone === 'approach') {
    grip = 0.18; // owner 2026-11-12: was 0.35, too slow to slide on the climb side
    softness = 0.6;
  } else if (zone === 'base' || zone === 'runout') {
    grip = 0.35;
    softness = 0.6;
  } else if (zone === 'cliff' || zone === 'rock') {
    grip = 0.8;
    softness = 0;
  } else if (zone === 'summit') {
    grip = 0.35;
    softness = 0.2;
  }

  const bumpNorm = (vnoise(x, z, 25, 2) + 1) / 2;
  const aheadX = x + 0.6 * Math.sin(heading);
  const aheadZ = z + 0.6 * Math.cos(heading);
  const aheadSlopeDeg = slopeDegAt(aheadX, aheadZ);
  const uphill = gLen < 1e-6 ? { x: 0, z: 0 } : { x: gx / gLen, z: gz / gLen };

  return {
    height: h,
    slopeDeg,
    slopeAlongDeg,
    slopeAcrossDeg,
    grip,
    softness,
    zone,
    bumpNorm,
    aheadSlopeDeg,
    uphill
  };
}
