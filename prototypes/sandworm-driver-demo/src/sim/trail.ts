export interface Point {
  x: number;
  y: number;
}

/** Samples newest first. arc[i] = path distance from sample 0 to sample i. */
export interface PathTrail {
  pts: Point[];
  arc: number[];
}

export function createStraightTrail(
  x: number,
  y: number,
  heading: number,
  length: number,
  spacing: number,
): PathTrail {
  const pts: Point[] = [];
  const arc: number[] = [];
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  const step = Math.max(1e-6, spacing);
  for (let d = 0; d <= length; d += step) {
    pts.push({ x: x - cos * d, y: y - sin * d });
    arc.push(d);
  }
  if (pts.length === 0) {
    pts.push({ x, y });
    arc.push(0);
  }
  return { pts, arc };
}

export function pushTrail(
  t: PathTrail,
  x: number,
  y: number,
  spacing: number,
  maxLength: number,
): void {
  if (t.pts.length > 0) {
    const first = t.pts[0]!;
    if (Math.hypot(x - first.x, y - first.y) < spacing) return;
  }
  t.pts.unshift({ x, y });
  t.arc.length = t.pts.length;
  t.arc[0] = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const prev = t.pts[i - 1]!;
    const curr = t.pts[i]!;
    t.arc[i] = t.arc[i - 1]! + Math.hypot(curr.x - prev.x, curr.y - prev.y);
  }
  const limit = maxLength + spacing;
  while (t.arc.length > 1 && t.arc[t.arc.length - 1]! > limit) {
    t.pts.pop();
    t.arc.pop();
  }
}

export function pointAtArc(
  t: PathTrail,
  headX: number,
  headY: number,
  dist: number,
): Point {
  if (dist <= 0 || t.pts.length === 0) {
    return { x: headX, y: headY };
  }
  const first = t.pts[0]!;
  const headLeg = Math.hypot(first.x - headX, first.y - headY);
  if (dist <= headLeg) {
    if (headLeg === 0) return { x: headX, y: headY };
    const a = dist / headLeg;
    return {
      x: headX + (first.x - headX) * a,
      y: headY + (first.y - headY) * a,
    };
  }
  let rem = dist - headLeg;
  for (let i = 0; i < t.pts.length - 1; i++) {
    const p0 = t.pts[i]!;
    const p1 = t.pts[i + 1]!;
    const leg = t.arc[i + 1]! - t.arc[i]!;
    if (rem <= leg) {
      if (leg === 0) return { x: p0.x, y: p0.y };
      const a = rem / leg;
      return {
        x: p0.x + (p1.x - p0.x) * a,
        y: p0.y + (p1.y - p0.y) * a,
      };
    }
    rem -= leg;
  }
  const last = t.pts[t.pts.length - 1]!;
  return { x: last.x, y: last.y };
}

export function segmentPositions(
  t: PathTrail,
  headX: number,
  headY: number,
  count: number,
  spacing: number,
): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pointAtArc(t, headX, headY, i * spacing));
  }
  return out;
}
