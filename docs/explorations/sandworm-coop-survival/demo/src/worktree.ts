// Work graph: goal, branch titles, tasks, and as last leaf the part of the logical space each task builds.
// Ticks are a personal sketch kept in this browser; they do not edit the plan file.
import {LEAVES, PARTS, PLAN, RECORDED, type Part, type PlanBranch, type PlanTask} from './plan';

const KEY = 'sandworm-rung01-graph';
const SVG = 'http://www.w3.org/2000/svg';
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector(sel) as unknown as T;
const el = (tag: string, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};
const svg = (tag: string, attrs: Record<string, string | number> = {}, text = '') => {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text) n.textContent = text;
  return n;
};

const flatten = (branches: PlanBranch[], mine = false): (PlanTask & {mine: boolean})[] =>
  branches.flatMap(b => [
    ...(b.tasks ?? []).map(t => ({...t, mine: mine || !!b.mine})),
    ...flatten(b.branches ?? [], mine || !!b.mine),
  ]);
const TASKS = flatten(PLAN);
const BY_ID = new Map(TASKS.map(t => [t.id, t]));

// Storage can be blocked for local files; the graph still works without it.
function load(): Set<string> {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return new Set((JSON.parse(saved) as string[]).filter(id => BY_ID.has(id)));
  } catch {
    /* fall through to the recorded progress */
  }
  return new Set(RECORDED);
}
let done = load();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    /* ticks last until reload */
  }
}

const FIRST = 'G3';
let selected = FIRST;
let view: 'all' | 'mine' | 'ready' = 'all';
let part: Part | 'Y' | '' = '';
const closed = new Set<string>();

const waiting = (t: PlanTask) => t.after.filter(id => !done.has(id));
const status = (t: PlanTask) => (done.has(t.id) ? 'done' : waiting(t).length ? 'blocked' : 'ready');
const WORD = {done: 'done', ready: 'can start', blocked: 'waiting'} as const;

// Removing a tick also removes ticks that depended on it.
function untick(id: string) {
  done.delete(id);
  TASKS.filter(t => done.has(t.id) && t.after.includes(id)).forEach(t => untick(t.id));
}

const visible = (t: PlanTask) =>
  view === 'mine' ? BY_ID.get(t.id)!.mine : view === 'ready' ? status(t) === 'ready' : true;
const hasVisible = (b: PlanBranch): boolean => (b.tasks ?? []).some(visible) || (b.branches ?? []).some(hasVisible);

// ---------- layout: columns left to right, one row per end node ----------
const COL = {root: {x: 8, w: 112}, branch: {x: 150, w: 168}, sub: {x: 348, w: 150}, task: {x: 546, w: 296}, leaf: {x: 872, w: 222}};
const WIDTH = 1102;
const ROW = 46;
const H = 36;
const GROUP_GAP = 14;

type Box = {x: number; w: number; y: number};
let cursor = 0;
let edges: SVGElement[] = [];
let nodes: SVGElement[] = [];
const placed = new Map<string, Box>();

const link = (from: Box, to: Box, cls = '') => {
  const x1 = from.x + from.w;
  const mid = x1 + Math.min(30, (to.x - x1) / 2);
  edges.push(svg('path', {class: `edge ${cls}`, d: `M${x1} ${from.y} C${mid} ${from.y} ${x1} ${to.y} ${mid} ${to.y} L${to.x} ${to.y}`}));
};

function box(at: Box, cls: string, lines: string[], key: string, label: string, onPick: () => void) {
  const g = svg('g', {class: `node ${cls}`, tabindex: 0, role: 'button', 'aria-label': label, 'data-key': key});
  g.append(svg('rect', {x: at.x, y: at.y - H / 2, width: at.w, height: H, rx: 7}));
  lines.forEach((text, i) =>
    g.append(svg('text', {x: at.x + 10, y: at.y + (lines.length === 1 ? 4.5 : -3 + i * 15), class: i ? 'sub' : ''}, text)),
  );
  g.addEventListener('click', onPick);
  g.addEventListener('keydown', e => {
    const event = e as KeyboardEvent;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onPick();
  });
  nodes.push(g);
  return g;
}

function choose(id: string, key: string) {
  selected = id;
  render(key);
  // The panel keeps its own scroll: start each task at the top.
  $('#task-detail').scrollTop = 0;
  // On one-column layouts the detail is tall: bring it into view after a choice.
  if (matchMedia('(max-width: 900px)').matches) $('#task-detail').scrollIntoView({block: 'nearest'});
}

function taskRow(t: PlanTask): Box {
  const y = cursor + ROW / 2;
  cursor += ROW;
  const state = status(t);
  const theory = LEAVES[t.id];
  const current = BY_ID.get(selected)!;
  const task: Box = {...COL.task, y};
  const leaf: Box = {...COL.leaf, y};
  const cls = [
    'task', `is-${state}`,
    t.id === selected ? 'selected' : '',
    current.after.includes(t.id) ? 'needed' : '',
    part && theory.part !== part ? 'faded' : '',
  ].join(' ');
  box(task, cls, [`${t.id}  ${t.title}`, state === 'done' ? '✓ done' : WORD[state]], t.id,
    `${t.id} ${t.title}, ${WORD[state]}`, () => choose(t.id, t.id));
  link(task, leaf, `to-leaf part-${theory.part}` + (part && theory.part !== part ? ' faded' : ''));
  box(leaf, `leaf part-${theory.part}` + (part && theory.part !== part ? ' faded' : '') + (part === theory.part ? ' lit' : ''),
    [theory.text], `leaf-${t.id}`, `Theory leaf for ${t.id}: ${theory.text}`, () => choose(t.id, `leaf-${t.id}`));
  placed.set(t.id, task);
  return task;
}

function branchNode(b: PlanBranch, path: string, col: {x: number; w: number}): Box {
  const open = !closed.has(path);
  const children: Box[] = [];
  if (open) {
    for (const t of (b.tasks ?? []).filter(visible)) children.push(taskRow(t));
    for (const child of (b.branches ?? []).filter(hasVisible)) children.push(branchNode(child, `${path}/${child.name}`, COL.sub));
  }
  let y: number;
  if (children.length) y = (children[0].y + children[children.length - 1].y) / 2;
  else {
    y = cursor + ROW / 2;
    cursor += ROW;
  }
  const at: Box = {...col, y};
  const all = flatten([b]);
  const count = `${all.filter(t => done.has(t.id)).length}/${all.length} done`;
  box(at, `branch${b.mine ? ' mine' : ''}`, [b.name, `${open ? '▾' : '▸'} ${count}`], path,
    `Branch ${b.name}, ${count}, ${open ? 'open' : 'closed'}`, () => {
      if (open) closed.add(path);
      else closed.delete(path);
      render(path);
    }).setAttribute('aria-expanded', String(open));
  children.forEach(child => link(at, child));
  return at;
}

// Dashed arrows from what the chosen task needs, drawn in the gap left of the task column.
function dependencyArrows() {
  const to = placed.get(selected);
  if (!to) return [];
  return BY_ID.get(selected)!.after.flatMap((id, i) => {
    const from = placed.get(id);
    if (!from) return [];
    const bend = to.x - 22 - (i % 4) * 6;
    return [svg('path', {class: 'need', 'marker-end': 'url(#need-head)',
      d: `M${from.x} ${from.y} C${bend} ${from.y} ${bend} ${to.y} ${to.x - 2} ${to.y}`})];
  });
}

function graph() {
  cursor = 6;
  edges = [];
  nodes = [];
  placed.clear();
  const tops: Box[] = [];
  for (const b of PLAN.filter(hasVisible)) {
    tops.push(branchNode(b, b.name, COL.branch));
    cursor += GROUP_GAP;
  }
  const height = Math.max(cursor, ROW);
  if (tops.length) {
    const root: Box = {...COL.root, y: (tops[0].y + tops[tops.length - 1].y) / 2};
    const g = svg('g', {class: 'node root'});
    g.append(svg('rect', {x: root.x, y: root.y - H / 2, width: root.w, height: H, rx: 18}),
      svg('text', {x: root.x + 12, y: root.y - 3}, 'Rung 1 runs'),
      svg('text', {x: root.x + 12, y: root.y + 12, class: 'sub'}, 'the goal'));
    nodes.push(g);
    tops.forEach(t => link(root, t));
  }
  const defs = svg('defs');
  const marker = svg('marker', {id: 'need-head', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 8, markerHeight: 8,
    orient: 'auto', markerUnits: 'userSpaceOnUse'});
  marker.append(svg('path', {d: 'M0 0 L8 4 L0 8 Z'}));
  defs.append(marker);
  const chart = $<SVGSVGElement>('#work-graph');
  chart.setAttribute('viewBox', `0 0 ${WIDTH} ${height}`);
  chart.replaceChildren(defs, ...edges, ...dependencyArrows(), ...nodes);
  $('#work-empty').textContent = tops.length ? '' : 'Nothing is waiting to start in this view.';
}

function detail() {
  const t = BY_ID.get(selected)!;
  const theory = LEAVES[t.id];
  const info = PARTS.find(p => p.part === theory.part)!;
  const state = status(t);

  const main = el('div');
  main.append(el('p', `task-state is-${state}`, WORD[state] + (t.mine ? ' · yours' : '')), el('h3', '', `${t.id}  ${t.title}`), el('p', '', t.goal));
  if (t.checks) {
    const list = el('ul', 'task-checks');
    list.append(...t.checks.map(c => el('li', '', c)));
    main.append(list);
  }

  const side = el('div');
  const leafNote = el('div', `theory-note part-${theory.part}`);
  leafNote.append(el('b', '', `Last leaf: ${theory.text}`), el('span', '', `${info.name}. ${theory.why}`));
  const facts = el('dl');
  const fact = (name: string, value: string) => value && facts.append(el('dt', '', name), el('dd', '', value));
  fact('Needs first', t.after.length ? t.after.map(id => `${id} ${BY_ID.get(id)!.title}${done.has(id) ? ' (done)' : ''}`).join('; ') : 'Nothing');
  fact('Unlocks', TASKS.filter(o => o.after.includes(t.id)).map(o => `${o.id} ${o.title}`).join('; ') || 'Nothing further in this plan');
  fact('Rules and checks covered', t.covers ?? '');
  fact('Relies on', t.relies ?? '');
  fact('Proof it is done', t.proof);

  const tick = el('button', 'tick', state === 'done' ? 'Remove my tick' : 'Tick as done') as HTMLButtonElement;
  tick.type = 'button';
  tick.dataset.key = 'tick';
  tick.disabled = state === 'blocked';
  tick.addEventListener('click', () => {
    if (done.has(t.id)) untick(t.id);
    else done.add(t.id);
    save();
    render('tick');
  });
  side.append(leafNote, facts, tick);
  if (state === 'blocked') side.append(el('p', 'note', `Tick ${waiting(t).join(', ')} first.`));
  $('#task-detail').replaceChildren(main, side);
}

function partChips() {
  $('#work-parts').replaceChildren(
    ...PARTS.map(p => {
      const count = Object.values(LEAVES).filter(l => l.part === p.part).length;
      const chip = el('button', `part-${p.part}`, `${p.symbol} ${p.name} · ${count}`) as HTMLButtonElement;
      chip.type = 'button';
      chip.dataset.key = `part-${p.part}`;
      chip.setAttribute('aria-pressed', String(part === p.part));
      chip.addEventListener('click', () => {
        part = part === p.part ? '' : p.part;
        render(`part-${p.part}`);
      });
      return chip;
    }),
  );
  $('#work-part-note').textContent =
    part === 'Y' ? 'Y has no leaf: this plan builds no observation. Nothing here tests what a player can see.' : '';
}

function render(focusKey?: string) {
  graph();
  detail();
  partChips();
  const ready = TASKS.filter(t => status(t) === 'ready');
  $('#work-progress').textContent =
    `${done.size} of ${TASKS.length} ticked. Can start now: ${ready.map(t => t.id).join(', ') || 'none'}.`;
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  // Nodes are redrawn, so put keyboard focus back where it was.
  if (focusKey) document.querySelector<HTMLElement>(`#worktree [data-key="${CSS.escape(focusKey)}"]`)?.focus({preventScroll: true});
}

export function startWorkTree() {
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b =>
    b.addEventListener('click', () => {
      view = b.dataset.view as typeof view;
      render();
    }),
  );
  $('#work-reset').addEventListener('click', () => {
    done = new Set(RECORDED);
    save();
    selected = FIRST;
    part = '';
    closed.clear();
    render();
  });
  render();
}
