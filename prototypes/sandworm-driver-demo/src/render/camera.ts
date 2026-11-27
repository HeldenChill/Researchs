import { SIM_CONFIG } from '../sim/config.ts';
import { VIEW_CONFIG } from './viewConfig.ts';

/** The camera looks at a point this far below its own height. */
export const CAMERA_LOOK_DROP = 2;

/** Follow the worm, but near the depth limit stop early so the bedrock stays in frame. */
export function cameraTargetY(wormY: number): number {
  return Math.max(SIM_CONFIG.maxDepth + 10, wormY + 4);
}

/** Look ahead in the direction the worm faces. */
export function cameraTargetX(wormX: number, heading: number): number {
  return wormX + VIEW_CONFIG.cameraLead * Math.cos(heading);
}
