import { describe, expect, it } from 'vitest';
import {
  createCockpitState,
  focusMonitor,
  gateDriverInput,
  selectCctvRoom,
} from '../src/cockpit/cockpitState.ts';

describe('cockpit state', () => {
  it('starts in overview and switches monitors', () => {
    const s = createCockpitState();
    expect(s.activeMonitor).toBe('overview');
    focusMonitor(s, 'drive');
    expect(s.activeMonitor).toBe('drive');
    focusMonitor(s, 'cctv');
    expect(s.activeMonitor).toBe('cctv');
    focusMonitor(s, 'overview');
    expect(s.activeMonitor).toBe('overview');
  });

  it('cycles or selects CCTV rooms', () => {
    const s = createCockpitState();
    expect(s.cctvRoom).toBe('mouth');
    selectCctvRoom(s, 'acid');
    expect(s.cctvRoom).toBe('acid');
  });

  it('gates drive inputs unless activeMonitor is drive', () => {
    const raw = { throttle: 1, steer: -1, boost: true, ping: true, preset: 'bite' as const };
    const overview = createCockpitState();
    expect(gateDriverInput(overview, raw)).toEqual({
      throttle: 0,
      steer: 0,
      boost: false,
      ping: false,
      preset: null,
    });
    focusMonitor(overview, 'drive');
    expect(gateDriverInput(overview, raw)).toEqual(raw);
  });
});
