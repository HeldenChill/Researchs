import type { DriverInput } from '../sim/types.ts';

export type MonitorId = 'overview' | 'drive' | 'interior' | 'cctv';
export type CctvRoom = 'mouth' | 'acid' | 'hull';

export interface CockpitState {
  activeMonitor: MonitorId;
  hoveredMonitor: MonitorId | null;
  cctvRoom: CctvRoom;
}

const NEUTRAL_INPUT: DriverInput = {
  throttle: 0,
  steer: 0,
  boost: false,
  ping: false,
  preset: null,
};

export function createCockpitState(): CockpitState {
  return {
    activeMonitor: 'overview',
    hoveredMonitor: null,
    cctvRoom: 'mouth',
  };
}

export function focusMonitor(state: CockpitState, monitor: MonitorId): void {
  state.activeMonitor = monitor;
}

export function selectCctvRoom(state: CockpitState, room: CctvRoom): void {
  state.cctvRoom = room;
}

export function gateDriverInput(state: CockpitState, raw: DriverInput): DriverInput {
  return state.activeMonitor === 'drive' ? raw : { ...NEUTRAL_INPUT };
}
