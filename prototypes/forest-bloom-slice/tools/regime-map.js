// Usage: node tools/regime-map.js --x <speciesId>.<field>=<from>..<to> --y <speciesId>.<field>=<from>..<to> [--override ...]
// Writes results/regime-<x>-<y>.csv. Integer steps.
import { writeFileSync, mkdirSync } from 'node:fs';
import { CONFIG, withOverrides } from '../src/config.js';
import { playthrough, greedyAgent } from '../src/agents.js';
import { cascadeProfile } from '../src/detector.js';
import { windowViability, loadLevel01, parseOverrides } from './run-detector.js';

function parseAxis(arg) {
  const m = /^(\d+)\.(\w+)=(-?\d+)\.\.(-?\d+)$/.exec(arg ?? '');
  if (!m) throw new Error(`bad axis '${arg}', expected <speciesId>.<field>=<from>..<to>`);
  const [, id, field, a, b] = m, values = [];
  for (let v = Number(a); v <= Number(b); v++) values.push(v);
  return { id, field, values, name: `${id}.${field}` };
}

const argv = process.argv.slice(2);
let xa, ya; const ov = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--x') xa = parseAxis(argv[++i]);
  else if (argv[i] === '--y') ya = parseAxis(argv[++i]);
  else if (argv[i] === '--override') ov.push(argv[++i]);
  else throw new Error(`unknown argument '${argv[i]}'`);
}
if (!xa || !ya) throw new Error('--x and --y are required');
const base = withOverrides(CONFIG, parseOverrides(ov));
const level = loadLevel01();
const rows = ['x,y,skillGap,bestShare,nearBestShare,depth,viable,pass'];
for (const x of xa.values) for (const y of ya.values) {
  const cfg = withOverrides(base, { [xa.id]: { [xa.field]: x } });
  Object.assign(cfg.species[ya.id], { [ya.field]: y });
  const p = cascadeProfile(level, cfg);
  const v = windowViability(playthrough(level, cfg, greedyAgent()).history, level);
  const viable = v.V1 && v.V2;
  rows.push([x, y, p.skillGap.toFixed(3), p.bestShare.toFixed(3), p.nearBestShare.toFixed(3), p.depth, viable, p.pass && viable].join(','));
}
mkdirSync(new URL('../results/', import.meta.url), { recursive: true });
const out = new URL(`../results/regime-${xa.name}-${ya.name}.csv`, import.meta.url);
writeFileSync(out, rows.join('\n') + '\n');
console.log(`${rows.length - 1} rows -> ${out.pathname}`);
