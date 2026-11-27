export function smoothing(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function stepsForFrame(
  accumulator: number,
  frameDt: number,
  fixedDt = 1 / 60,
  maxSteps = 5,
): { steps: number; accumulator: number } {
  const dt = !Number.isFinite(frameDt) || frameDt < 0 ? 0 : frameDt;
  const acc = accumulator + dt;
  const steps = Math.floor((acc + 1e-9) / fixedDt);
  if (steps > maxSteps) {
    return { steps: maxSteps, accumulator: 0 };
  }
  return { steps, accumulator: Math.max(0, acc - steps * fixedDt) };
}
