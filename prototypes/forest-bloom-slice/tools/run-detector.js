// Usage: node tools/run-detector.js --rung <n> [--override <speciesId>.<field>=<value>]...
// Writes results/rung-<n>.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { CONFIG, withOverrides } from '../src/config.js';
import { parseLevel } from '../src/level.js';
import { viability } from '../src/boundary.js';
import { speciesCounts, hillNumber, coverage } from '../src/derived.js';
import { playthrough, greedyAgent, randomAgent, mulberry32 } from '../src/agents.js';
import { cascadeProfile, uniformLevel, noIterationConfig, THRESHOLDS } from '../src/detector.js';

export const WINDOW = 8;

export function parseOverrides(list) {
  const out = {};
  for (const item of list) {
    const m = /^(\d+)\.(\w+)=(-?\d+(?:\.\d+)?)$/.exec(item);
    if (!m) throw new Error(`bad --override '${item}', expected <speciesId>.<field>=<number>`);
    (out[m[1]] ??= {})[m[2]] = Number(m[3]);
  }
  return out;
}

// V1 and V2 must hold in every one of the last WINDOW ticks.
export function windowViability(history, level) {
  const last = history.slice(-WINDOW);
  const per = last.map(viability);
  const final = history.at(-1);
  return {
    V1: last.length > 0 && per.every(v => !v.monoculture),
    V2: last.length > 0 && per.every(v => v.diverse),
    ticks: history.length,
    final: final ? { counts: speciesCounts(final), hill: hillNumber(final), coverage: coverage(final, level) } : null,
  };
}

export function loadLevel01() {
  return parseLevel(readFileSync(new URL('../levels/level-01.txt', import.meta.url), 'utf8'));
}

function main(argv) {
  let rung = null; const ov = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--rung') rung = Number(argv[++i]);
    else if (argv[i] === '--override') ov.push(argv[++i]);
    else throw new Error(`unknown argument '${argv[i]}'`);
  }
  if (!Number.isInteger(rung)) throw new Error('--rung <n> is required');
  const overrides = parseOverrides(ov);
  const config = withOverrides(CONFIG, overrides);
  const level = loadLevel01();
  const profile = cascadeProfile(level, config);
  const greedy = windowViability(playthrough(level, config, greedyAgent()).history, level);
  const random = windowViability(playthrough(level, config, randomAgent(mulberry32(1))).history, level);
  const n1 = cascadeProfile(uniformLevel(), config);
  const n2 = cascadeProfile(level, noIterationConfig(config));
  let revision = 'unknown';
  try { revision = execSync('git rev-parse --short HEAD').toString().trim(); } catch {}
  const result = {
    rung, overrides, revision, thresholds: THRESHOLDS, profile,
    viability: { greedy, random },
    controls: { N1: { pass: n1.pass, checks: n1.checks, skillGap: n1.skillGap }, N2: { pass: n2.pass, checks: n2.checks, best: n2.best } },
    config,
  };
  mkdirSync(new URL('../results/', import.meta.url), { recursive: true });
  writeFileSync(new URL(`../results/rung-${rung}.json`, import.meta.url), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ rung, profile, greedy, random, N1: result.controls.N1, N2: result.controls.N2 }, null, 2));
}

if (import.meta.url === new URL(process.argv[1], 'file:').href || process.argv[1]?.endsWith('run-detector.js')) main(process.argv.slice(2));
