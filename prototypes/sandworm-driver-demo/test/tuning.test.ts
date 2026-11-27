import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SIM_CONFIG, SIM_CONFIG } from '../src/sim/config.ts';
import { VIEW_CONFIG } from '../src/render/viewConfig.ts';
import {
  SETTINGS, applyValues, changedValues, exportValues, loadValues, resetValues, saveValues, valueOf,
  type KeyValueStore,
} from '../src/tune/settings.ts';
import { DEBUG_FLAGS, applyDebugFlags } from '../src/tune/debugFlags.ts';
import { createInitialState } from '../src/sim/state.ts';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

beforeEach(() => resetValues());

describe('tuning settings', () => {
  it('has one row for every tunable value, with help and a range holding the default', () => {
    const notTunable = ['heartPoints'];
    const expected = [...Object.keys(DEFAULT_SIM_CONFIG), ...Object.keys(VIEW_CONFIG)].filter((k) => !notTunable.includes(k));
    expect(SETTINGS.map((s) => s.key).sort()).toEqual(expected.sort());
    for (const row of SETTINGS) {
      expect(row.help.length, row.key).toBeGreaterThan(10);
      expect(valueOf(row.key), row.key).toBeGreaterThanOrEqual(row.min);
      expect(valueOf(row.key), row.key).toBeLessThanOrEqual(row.max);
    }
  });

  it('applies numbers, clamps to range, and ignores junk', () => {
    applyValues({ gravity: 30, segmentGap: 999, turnRate: 'fast', nope: 4, airDrag: NaN });
    expect(SIM_CONFIG.gravity).toBe(30);
    expect(VIEW_CONFIG.segmentGap).toBe(SETTINGS.find((s) => s.key === 'segmentGap')!.max);
    expect(SIM_CONFIG.turnRate).toBe(DEFAULT_SIM_CONFIG.turnRate);
    expect(SIM_CONFIG.airDrag).toBe(DEFAULT_SIM_CONFIG.airDrag);
    expect('nope' in SIM_CONFIG).toBe(false);
  });

  it('saves only changed values and loads them back', () => {
    const store = memoryStore();
    SIM_CONFIG.gravity = 30;
    saveValues(store);
    expect(changedValues()).toEqual({ gravity: 30 });
    resetValues();
    expect(SIM_CONFIG.gravity).toBe(DEFAULT_SIM_CONFIG.gravity);
    loadValues(store);
    expect(SIM_CONFIG.gravity).toBe(30);
    expect(JSON.parse(exportValues())).toEqual({ gravity: 30 });
  });

  it('survives a broken or missing store', () => {
    const store = memoryStore();
    store.data.set('sandworm-driver.tuning.v1', '{not json');
    expect(() => loadValues(store)).not.toThrow();
    expect(() => loadValues(null)).not.toThrow();
  });
});

describe('debug flags', () => {
  it('keeps the worm alive and holds the storm when switched on', () => {
    const s = createInitialState();
    s.worm.health = 5;
    s.worm.hunger = 5;
    s.interior.breaches = 3;
    s.apocalypseX = 10;
    Object.assign(DEBUG_FLAGS, { invincible: true, freezeStorm: true });
    applyDebugFlags(s, -65);
    expect(s.worm.health).toBe(SIM_CONFIG.maxHealth);
    expect(s.worm.hunger).toBe(SIM_CONFIG.maxHunger);
    expect(s.interior.breaches).toBe(0);
    expect(s.apocalypseX).toBe(-65);
    Object.assign(DEBUG_FLAGS, { invincible: false, freezeStorm: false });
  });
});
