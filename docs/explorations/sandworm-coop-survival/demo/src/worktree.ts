// Work graph: Unity GraphView-style interactive canvas + inspector for goal, branches, tasks, and theory leaves.
// Ticks are a personal sketch kept in this browser; they do not edit the plan file.
import {GRAPHS, PARTS, type Leaf, type Part, type PlanBranch, type PlanTask} from './plan';

let activeGraph = GRAPHS.crew1;
let PLAN = activeGraph.plan;
let LEAVES: Record<string, Leaf> = activeGraph.leaves;
let RECORDED = activeGraph.recorded;
let KEY = activeGraph.storageKey;

const flatten = (branches: PlanBranch[], mine = false): (PlanTask & {mine: boolean})[] =>
  branches.flatMap(b => [
    ...(b.tasks ?? []).map(t => ({...t, mine: mine || !!b.mine})),
    ...flatten(b.branches ?? [], mine || !!b.mine),
  ]);
let TASKS = flatten(PLAN);
let BY_ID = new Map(TASKS.map(t => [t.id, t]));

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

let selected = activeGraph.first;
let viewMode: 'all' | 'mine' | 'ready' = 'all';
let part: Part | 'Y' | '' = '';

function switchGraph(id: string) {
  activeGraph = GRAPHS[id] ?? GRAPHS.crew1;
  PLAN = activeGraph.plan;
  LEAVES = activeGraph.leaves;
  RECORDED = activeGraph.recorded;
  KEY = activeGraph.storageKey;
  TASKS = flatten(PLAN);
  BY_ID = new Map(TASKS.map(t => [t.id, t]));
  done = load();
  selected = activeGraph.first;
  part = '';
  customPos.clear();
  render();
  frameAll();
}
const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector(sel) as unknown as T;
const el = (tag: string, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};
const svgEl = (tag: string, attrs: Record<string, string | number> = {}, text = '') => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text) n.textContent = text;
  return n;
};

const waiting = (t: PlanTask) => t.after.filter(id => !done.has(id));
const status = (t: PlanTask) => (done.has(t.id) ? 'done' : waiting(t).length ? 'blocked' : 'ready');
const WORD = {done: 'done', ready: 'can start', blocked: 'waiting'} as const;

function untick(id: string) {
  done.delete(id);
  TASKS.filter(t => done.has(t.id) && t.after.includes(id)).forEach(t => untick(t.id));
}

const visible = (t: PlanTask) =>
  viewMode === 'mine' ? BY_ID.get(t.id)!.mine : viewMode === 'ready' ? status(t) === 'ready' : true;
const hasVisible = (b: PlanBranch): boolean => (b.tasks ?? []).some(visible) || (b.branches ?? []).some(hasVisible);

// ---------- GraphView model + vertical top-down layout ----------
const NW = 178;
const NH = 68;
const GX = 22;
const GY = 112;
const GROUP_GAP = 24;

type WNode = {
  key: string;
  kind: 'root' | 'branch' | 'task' | 'leaf';
  cat: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  cls: string;
  aria: string;
  hasIn: boolean;
  hasOut: boolean;
  taskId?: string;
  onPick?: () => void;
};
type WEdge = {from: string; to: string; cls: string};

const customPos = new Map<string, {x: number; y: number}>();
let gNodes: WNode[] = [];
let gEdges: WEdge[] = [];
let byKey = new Map<string, WNode>();
const taskNodes = new Map<string, WNode>();
const nodeEls = new Map<string, HTMLElement>();

let suppressClickUntil = 0;
let cam = {x: 24, y: 24, s: 0.82};
let drag:
  | {mode: 'pan'; sx: number; sy: number; vx: number; vy: number}
  | {mode: 'node'; node: WNode; sx: number; sy: number; nx: number; ny: number; moved: boolean}
  | null = null;

function buildGraphData() {
  gNodes = [];
  gEdges = [];
  taskNodes.clear();

  let cursorX = 20;
  const topY = 20;
  const current = BY_ID.get(selected)!;

  function addTaskCol(t: PlanTask, depth: number): WNode {
    const x = cursorX;
    cursorX += NW + GX;
    const y = topY + depth * GY;
    const state = status(t);
    const theory = LEAVES[t.id];
    const faded = !!(part && theory.part !== part);
    const taskKey = t.id;
    const leafKey = `leaf-${t.id}`;

    const taskCls = [
      'task',
      `is-${state}`,
      t.id === selected ? 'sel' : '',
      current.after.includes(t.id) ? 'needed' : '',
      faded ? 'faded' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const tNode: WNode = {
      key: taskKey,
      kind: 'task',
      cat: 'Task',
      name: `${t.id}  ${t.title}`,
      sub: state === 'done' ? '✓ done' : WORD[state],
      x,
      y,
      w: NW,
      cls: taskCls,
      aria: `${t.id} ${t.title}, ${WORD[state]}`,
      hasIn: true,
      hasOut: true,
      taskId: t.id,
      onPick: () => choose(t.id, taskKey),
    };

    const lNode: WNode = {
      key: leafKey,
      kind: 'leaf',
      cat: `Leaf · ${theory.part}`,
      name: theory.text,
      sub: PARTS.find(p => p.part === theory.part)!.name,
      x,
      y: topY + (depth + 1) * GY,
      w: NW,
      cls: [`leaf`, `part-${theory.part}`, faded ? 'faded' : '', part === theory.part ? 'lit' : '']
        .filter(Boolean)
        .join(' '),
      aria: `Theory leaf for ${t.id}: ${theory.text}`,
      hasIn: true,
      hasOut: false,
      taskId: t.id,
      onPick: () => choose(t.id, leafKey),
    };

    gNodes.push(tNode, lNode);
    taskNodes.set(t.id, tNode);
    gEdges.push({
      from: taskKey,
      to: leafKey,
      cls: `to-leaf part-${theory.part}${faded ? ' faded' : ''}`,
    });
    return tNode;
  }

  function addBranch(b: PlanBranch, path: string, depth: number): WNode {
    const children: WNode[] = [];
    for (const t of (b.tasks ?? []).filter(visible)) children.push(addTaskCol(t, depth + 1));
    for (const child of (b.branches ?? []).filter(hasVisible)) {
      children.push(addBranch(child, `${path}/${child.name}`, depth + 1));
    }
    let x: number;
    if (children.length) x = (children[0].x + children[children.length - 1].x) / 2;
    else {
      x = cursorX;
      cursorX += NW + GX;
    }

    const all = flatten([b]);
    const count = `${all.filter(t => done.has(t.id)).length}/${all.length} done`;
    const bNode: WNode = {
      key: path,
      kind: 'branch',
      cat: b.mine ? 'My Branch' : 'Branch',
      name: b.name,
      sub: count,
      x,
      y: topY + depth * GY,
      w: NW,
      cls: `branch${b.mine ? ' mine' : ''}`,
      aria: `Branch ${b.name}, ${count}`,
      hasIn: true,
      hasOut: true,
    };
    gNodes.push(bNode);
    children.forEach(c => gEdges.push({from: path, to: c.key, cls: ''}));
    return bNode;
  }

  const tops: WNode[] = [];
  for (const b of PLAN.filter(hasVisible)) {
    tops.push(addBranch(b, b.name, 1));
    cursorX += GROUP_GAP;
  }

  if (tops.length) {
    const rootX = (tops[0].x + tops[tops.length - 1].x) / 2;
    const root: WNode = {
      key: '__root__',
      kind: 'root',
      cat: 'Goal',
      name: activeGraph.rootTitle,
      sub: activeGraph.rootSub,
      x: rootX,
      y: topY,
      w: NW,
      cls: 'root',
      aria: `Goal: ${activeGraph.rootTitle}`,
      hasIn: false,
      hasOut: true,
    };
    gNodes.unshift(root);
    tops.forEach(t => gEdges.push({from: '__root__', to: t.key, cls: ''}));
  }

  // Apply any user-dragged positions
  gNodes.forEach(n => {
    const saved = customPos.get(n.key);
    if (saved) {
      n.x = saved.x;
      n.y = saved.y;
    }
  });
  byKey = new Map(gNodes.map(n => [n.key, n]));
}

function renderEdges() {
  const svg = $<SVGSVGElement>('#work-edges');
  const defs = svgEl('defs');
  const marker = svgEl('marker', {
    id: 'need-head',
    viewBox: '0 0 8 8',
    refX: 7,
    refY: 4,
    markerWidth: 8,
    markerHeight: 8,
    orient: 'auto',
    markerUnits: 'userSpaceOnUse',
  });
  marker.append(svgEl('path', {d: 'M0 0 L8 4 L0 8 Z'}));
  defs.append(marker);

  const paths: SVGElement[] = [];
  for (const e of gEdges) {
    const a = byKey.get(e.from);
    const b = byKey.get(e.to);
    if (!a || !b) continue;
    const x1 = a.x + a.w / 2;
    const y1 = a.y + NH;
    const x2 = b.x + b.w / 2;
    const y2 = b.y;
    const my = (y1 + y2) / 2;
    const isActive = b.taskId === selected || a.taskId === selected;
    paths.push(
      svgEl('path', {
        class: `${e.cls}${isActive ? ' active' : ''}`.trim(),
        d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`,
      }),
    );
  }

  // Prerequisite arrows arcing above into selected task
  const to = taskNodes.get(selected);
  const selTask = BY_ID.get(selected);
  if (to && selTask) {
    selTask.after.forEach((id, i) => {
      const from = taskNodes.get(id);
      if (!from) return;
      const x1 = from.x + from.w / 2;
      const y1 = from.y;
      const x2 = to.x + to.w / 2;
      const y2 = to.y - 4;
      const arc = Math.min(y1, y2) - 34 - (i % 4) * 10;
      paths.push(
        svgEl('path', {
          class: 'need',
          'marker-end': 'url(#need-head)',
          d: `M${x1},${y1} C${x1},${arc} ${x2},${arc} ${x2},${y2}`,
        }),
      );
    });
  }

  const maxX = Math.max(1200, ...gNodes.map(n => n.x + n.w + 200));
  const maxY = Math.max(800, ...gNodes.map(n => n.y + NH + 200));
  svg.setAttribute('width', String(maxX));
  svg.setAttribute('height', String(maxY));
  svg.replaceChildren(defs, ...paths);
}

function renderNodes() {
  const world = $('#work-world');
  const keep = new Set(gNodes.map(n => n.key));
  for (const [k, nodeEl] of nodeEls.entries()) {
    if (!keep.has(k)) {
      nodeEl.remove();
      nodeEls.delete(k);
    }
  }

  for (const n of gNodes) {
    let card = nodeEls.get(n.key);
    if (!card) {
      card = document.createElement('div');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.dataset.key = n.key;
      card.innerHTML =
        `<div class="head"><span class="cat"></span><span class="st"></span></div>` +
        `<div class="name"></div><div class="sub"></div>`;
      if (n.hasIn) card.append(el('span', 'port in'));
      if (n.hasOut) card.append(el('span', 'port out'));

      card.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const cur = byKey.get(n.key);
        if (!cur) return;
        drag = {mode: 'node', node: cur, sx: e.clientX, sy: e.clientY, nx: cur.x, ny: cur.y, moved: false};
      });
      card.addEventListener('click', () => {
        if (Date.now() < suppressClickUntil) return;
        byKey.get(n.key)?.onPick?.();
      });
      card.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        byKey.get(n.key)?.onPick?.();
      });

      world.append(card);
      nodeEls.set(n.key, card);
    }
    card.className = `wnode ${n.cls}`;
    card.setAttribute('aria-label', n.aria);
    card.style.left = `${n.x}px`;
    card.style.top = `${n.y}px`;
    card.style.width = `${n.w}px`;
    card.querySelector('.cat')!.textContent = n.cat;
    card.querySelector('.name')!.textContent = n.name;
    card.querySelector('.sub')!.textContent = n.sub;
  }

  renderEdges();
  renderMini();
}

function applyView() {
  const world = $('#work-world');
  const vp = $('#work-vp');
  world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
  vp.style.backgroundPosition = `${cam.x}px ${cam.y}px`;
  $('#work-zoom').textContent = `${Math.round(cam.s * 100)}%`;
  renderMini();
}

function renderMini() {
  const c = $<HTMLCanvasElement>('#work-mini');
  const g = c.getContext('2d');
  if (!g) return;
  g.clearRect(0, 0, c.width, c.height);
  if (!gNodes.length) return;

  const cs = getComputedStyle(document.documentElement);
  const xs = gNodes.map(n => n.x);
  const ys = gNodes.map(n => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...gNodes.map(n => n.x + n.w));
  const maxY = Math.max(...ys) + NH;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const s = Math.min((c.width - 10) / w, (c.height - 10) / h);

  for (const n of gNodes) {
    let colorVar = '--muted';
    if (n.kind === 'task') {
      colorVar = n.cls.includes('is-ready') ? '--action' : n.cls.includes('is-done') ? '--derived' : '--muted';
    } else if (n.kind === 'root') {
      colorVar = '--rule';
    }
    g.fillStyle = cs.getPropertyValue(colorVar).trim() || '#9aa8bf';
    g.fillRect(5 + (n.x - minX) * s, 5 + (n.y - minY) * s, Math.max(2, n.w * s), Math.max(2, NH * s));
  }

  const vr = $('#work-vp').getBoundingClientRect();
  if (vr.width > 0 && vr.height > 0) {
    g.strokeStyle = cs.getPropertyValue('--rule').trim() || '#82aaff';
    g.lineWidth = 1.5;
    g.strokeRect(
      5 + (-cam.x / cam.s - minX) * s,
      5 + (-cam.y / cam.s - minY) * s,
      (vr.width / cam.s) * s,
      (vr.height / cam.s) * s,
    );
  }
}

function frameAll() {
  if (!gNodes.length) return;
  const vr = $('#work-vp').getBoundingClientRect();
  if (!vr.width || !vr.height) return;
  const xs = gNodes.map(n => n.x);
  const ys = gNodes.map(n => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...gNodes.map(n => n.x + n.w));
  const maxY = Math.max(...ys) + NH;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  cam.s = Math.min(1.05, Math.max(0.28, Math.min((vr.width - 48) / w, (vr.height - 64) / h)));
  cam.x = (vr.width - w * cam.s) / 2 - minX * cam.s;
  cam.y = (vr.height - h * cam.s) / 2 - minY * cam.s;
  applyView();
}

function choose(id: string, key: string) {
  selected = id;
  render(key);
  $('#task-detail-body').scrollTop = 0;
}

function detail() {
  const t = BY_ID.get(selected)!;
  const theory = LEAVES[t.id];
  const info = PARTS.find(p => p.part === theory.part)!;
  const state = status(t);

  const wrap = el('div');
  wrap.append(
    el('p', `task-state is-${state}`, WORD[state] + (t.mine ? ' · yours' : '')),
    el('h3', '', `${t.id}  ${t.title}`),
    el('p', '', t.goal),
  );
  if (t.checks) {
    const list = el('ul', 'task-checks');
    list.append(...t.checks.map(c => el('li', '', c)));
    wrap.append(list);
  }

  const leafNote = el('div', `theory-note part-${theory.part}`);
  leafNote.append(el('b', '', `Last leaf: ${theory.text}`), el('span', '', `${info.name}. ${theory.why}`));
  const facts = el('dl');
  const fact = (name: string, value: string) => value && facts.append(el('dt', '', name), el('dd', '', value));
  fact(
    'Needs first',
    t.after.length ? t.after.map(id => `${id} ${BY_ID.get(id)!.title}${done.has(id) ? ' (done)' : ''}`).join('; ') : 'Nothing',
  );
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

  wrap.append(leafNote, facts, tick);
  if (state === 'blocked') wrap.append(el('p', 'note', `Tick ${waiting(t).join(', ')} first.`));
  $('#task-detail-body').replaceChildren(wrap);
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
  buildGraphData();
  renderNodes();
  detail();
  partChips();
  $('#work-empty').textContent = gNodes.length ? '' : 'Nothing is waiting to start in this view.';
  const ready = TASKS.filter(t => status(t) === 'ready');
  $('#work-progress').textContent = `${done.size} of ${TASKS.length} ticked. Can start now: ${ready.map(t => t.id).join(', ') || 'none'}.`;
  document
    .querySelectorAll<HTMLButtonElement>('[data-view]')
    .forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === viewMode)));
  if (focusKey) document.querySelector<HTMLElement>(`#worktree [data-key="${CSS.escape(focusKey)}"]`)?.focus({preventScroll: true});
}

export function startWorkTree() {
  const vp = $('#work-vp');
  vp.addEventListener('pointerdown', e => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('.wnode,.work-minimap')) return;
    e.preventDefault();
    drag = {mode: 'pan', sx: e.clientX, sy: e.clientY, vx: cam.x, vy: cam.y};
    vp.classList.add('panning');
  });
  const endDrag = () => {
    if (drag?.mode === 'node' && drag.moved) suppressClickUntil = Date.now() + 80;
    drag = null;
    vp.classList.remove('panning');
  };
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.mode === 'pan') {
      cam.x = drag.vx + (e.clientX - drag.sx);
      cam.y = drag.vy + (e.clientY - drag.sy);
      applyView();
    } else {
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      drag.node.x = drag.nx + dx / cam.s;
      drag.node.y = drag.ny + dy / cam.s;
      customPos.set(drag.node.key, {x: drag.node.x, y: drag.node.y});
      const card = nodeEls.get(drag.node.key);
      if (card) {
        card.style.left = `${drag.node.x}px`;
        card.style.top = `${drag.node.y}px`;
      }
      renderEdges();
      renderMini();
    }
  });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', endDrag);

  vp.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const ns = Math.min(1.8, Math.max(0.28, cam.s * (e.deltaY < 0 ? 1.1 : 0.9)));
      cam.x = mx - ((mx - cam.x) * ns) / cam.s;
      cam.y = my - ((my - cam.y) * ns) / cam.s;
      cam.s = ns;
      applyView();
    },
    {passive: false},
  );

  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b =>
    b.addEventListener('click', () => {
      viewMode = b.dataset.view as typeof viewMode;
      render();
      frameAll();
    }),
  );
  $('#work-frame').addEventListener('click', frameAll);
  $('#work-layout').addEventListener('click', () => {
    customPos.clear();
    render();
    frameAll();
  });
  $('#work-graph-select').addEventListener('change', e => {
    switchGraph((e.target as HTMLSelectElement).value);
  });
  $('#work-reset').addEventListener('click', () => {
    done = new Set(RECORDED);
    save();
    selected = activeGraph.first;
    part = '';
    customPos.clear();
    render();
    frameAll();
  });

  document.addEventListener('keydown', e => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'f' || e.key === 'F') {
      const rect = vp.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) frameAll();
    }
  });
  window.addEventListener('resize', () => frameAll());

  render();
  frameAll();
}
