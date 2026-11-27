export interface Pose {
  x: number;
  y: number;
  heading: number;
}

/** Pose between the previous and current fixed sim step. alpha is 0..1. */
export function interpolatePose(prev: Pose, curr: Pose, alpha: number): Pose {
  const turn = Math.atan2(Math.sin(curr.heading - prev.heading), Math.cos(curr.heading - prev.heading));
  return {
    x: prev.x + (curr.x - prev.x) * alpha,
    y: prev.y + (curr.y - prev.y) * alpha,
    heading: prev.heading + turn * alpha,
  };
}
