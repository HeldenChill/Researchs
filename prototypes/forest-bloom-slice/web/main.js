// View: draws only from observe() (L13). No numbers on screen except seed counts (L17).
import { CONFIG, SPECIES_IDS } from '../src/config.js';
import { parseLevel } from '../src/level.js';
import { createState } from '../src/state.js';
import { tick } from '../src/operators.js';
import { legalActions, applyAction } from '../src/actions.js';
import { viability } from '../src/boundary.js';
import { coverage } from '../src/derived.js';
import { observe } from '../src/observe.js';

document.getElementById('fallback').remove();

const SPECIES = { 1: { name: 'Pioneer', rgb: [222, 196, 90] }, 2: { name: 'Shrub', rgb: [96, 170, 80] }, 3: { name: 'Canopy', rgb: [30, 100, 70] } };
const SOIL = [[226, 208, 168], [196, 168, 120], [164, 128, 86], [128, 94, 60], [96, 68, 42], [66, 44, 28]];
const canvas = document.getElementById('map'), ctx = canvas.getContext('2d');
const seedsBar = document.getElementById('seeds'), trendEl = document.getElementById('trend'), msg = document.getElementById('msg');
const TICK_MS = 250;

const level = parseLevel(await (await fetch('../levels/level-01.txt')).text());
const cell = Math.floor(canvas.width / level.width);
let state, history, selected, busy;

// Saturation scales with richness: low diversity drains colour toward grey.
function tint(rgb, richness) {
  const sat = 0.25 + 0.75 * richness, g = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return `rgb(${rgb.map(c => Math.round(g + (c - g) * sat)).join(',')})`;
}

function draw(pulse = 0) {
  const o = observe(state, level, history);
  const legal = new Set(busy ? [] : legalActions(state, level, CONFIG).filter(a => a.species === selected).map(a => a.cell));
  o.cells.forEach((c, i) => {
    const x = (i % level.width) * cell, y = Math.floor(i / level.width) * cell;
    ctx.fillStyle = c.rock ? '#555a5e' : tint(SOIL[c.soil], o.richness);
    ctx.fillRect(x, y, cell, cell);
    if (c.species) {
      ctx.fillStyle = tint(SPECIES[c.species].rgb, o.richness);
      ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.36, 0, Math.PI * 2); ctx.fill();
      if (o.warning === c.species) { ctx.strokeStyle = `rgba(255,80,60,${0.3 + 0.5 * pulse})`; ctx.lineWidth = 2; ctx.stroke(); }
    }
    if (c.shaded && !c.rock) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x, y, cell, cell); }
    if (legal.has(i)) { ctx.strokeStyle = '#f3e7a1'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4); }
  });
  trendEl.textContent = { up: '↑', down: '↓', flat: '→' }[o.trend];
  trendEl.style.color = { up: '#8fd16a', down: '#e0705a', flat: '#a29f92' }[o.trend];
  renderSeeds();
}

function renderSeeds() {
  seedsBar.innerHTML = '';
  for (const id of SPECIES_IDS) {
    const b = document.createElement('button');
    b.innerHTML = `<span class="swatch" style="background:rgb(${SPECIES[id].rgb})"></span>${SPECIES[id].name} ${state.inventory[id]}`;
    b.className = id === selected ? 'sel' : '';
    b.disabled = busy || state.inventory[id] === 0;
    b.onclick = () => { selected = id; draw(); };
    seedsBar.append(b);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function plant(i) {
  if (busy || !legalActions(state, level, CONFIG).some(a => a.species === selected && a.cell === i)) return;
  busy = true;
  state = applyAction(state, level, CONFIG, { species: selected, cell: i });
  for (let t = 0; t < level.ticksPerTurn; t++) {
    draw(); await sleep(TICK_MS);
    state = tick(state, level, CONFIG); history.push(state);
  }
  busy = false;
  if (!legalActions(state, level, CONFIG).length) {
    const v = viability(state);
    msg.textContent = v.ok && coverage(state, level) >= 0.6 ? 'The forest is thriving.' : 'The forest is fading.';
  } else if (!state.inventory[selected]) selected = SPECIES_IDS.find(id => state.inventory[id] > 0);
  draw();
}

canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * level.width), y = Math.floor((e.clientY - r.top) / r.height * level.height);
  plant(y * level.width + x);
});

function restart() {
  state = createState(level); history = [state]; selected = 1; busy = false; msg.textContent = 'Plant seeds to bring this land back to life.';
  draw();
}
document.getElementById('restart').onclick = restart;
setInterval(() => { if (!busy) draw((Math.sin(Date.now() / 200) + 1) / 2); }, 120);
restart();
