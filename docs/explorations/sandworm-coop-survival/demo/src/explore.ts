// Diagram D2 (sorting questions) and D15 (histories from one start) as things to click.
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector(sel) as unknown as T;
const el = (tag: string, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};
const button = (text: string, onClick: () => void) => {
  const b = el('button', '', text) as HTMLButtonElement;
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
};

// ---------- D2: four questions ----------
type Result = {bin: string; text: string};
type Ask = {q: string; yes: Ask | Result; no: Ask | Result; yesText?: string; noText?: string};

const TREE: Ask = {
  q: 'Does a player choose it?',
  yes: {bin: 'action', text: 'It is an action: a request. A rule decides what really happens.'},
  no: {
    q: 'Is it a process that changes saved values?',
    yes: {bin: 'operator', text: 'It is a rule. Write down what it reads and what it writes.'},
    no: {
      q: 'Can it differ between two moments of one match?',
      no: {bin: 'config', text: 'It is fixed setup: a data row, a property or a room. If it differs between matches and cannot be rebuilt from the seed, it must still be saved.'},
      yes: {
        q: 'Can it be calculated from other values?',
        yes: {bin: 'derived', text: 'It is calculated when needed. Do not save it.'},
        no: {bin: 'state', text: 'It is saved state. Add it to the save file and name the rules that change it.'},
      },
    },
  },
};

let node: Ask | Result = TREE;
let trail: string[] = [];
function renderQuiz() {
  const box = $('#quiz');
  const history = el('ol', 'trail');
  history.append(...trail.map(t => el('li', '', t)));
  const parts: HTMLElement[] = [history];
  const lit = 'bin' in node ? node.bin : '';
  document.querySelectorAll<HTMLElement>('[data-quizbin]').forEach(b => b.classList.toggle('lit', b.dataset.quizbin === lit));
  if ('q' in node) {
    const ask = node;
    const row = el('div', 'answers');
    for (const [name, next] of [['Yes', ask.yes], ['No', ask.no]] as const) {
      row.append(
        button(name, () => {
          trail.push(`${ask.q} ${name}.`);
          node = next;
          renderQuiz();
          // Keep keyboard users in the quiz after the buttons are replaced.
          $<HTMLButtonElement>('#quiz button')?.focus();
        }),
      );
    }
    parts.push(el('h3', '', ask.q), row);
  } else {
    parts.push(el('h3', '', node.text));
  }
  if (trail.length) {
    parts.push(
      button('Start again', () => {
        node = TREE;
        trail = [];
        renderQuiz();
      }),
    );
  }
  box.replaceChildren(...parts);
}

// ---------- D15: histories ----------
type Place = {x: number; y: number; lines: string[]; now: string; loss?: number};
const PLACES: Record<string, Place> = {
  start: {x: 500, y: 50, lines: ['Whole engine', 'on the floor'], now: 'One item, share 1, ageing.'},
  inAcid: {x: 140, y: 190, lines: ['Whole engine', 'in the acid'], now: 'The pit is full. Anything else has to wait.', loss: 30},
  pieces: {x: 500, y: 190, lines: ['Three pieces', 'on the floor'], now: 'The old item is gone. Three new items exist.'},
  rot: {x: 860, y: 190, lines: ['Breach beside', 'whole engine'], now: 'Nobody came. The worm is now losing health.'},
  slow: {x: 140, y: 340, lines: ['Paid at once,', 'after long wait'], now: 'One payment, after the long digest time.', loss: 30},
  two: {x: 320, y: 340, lines: ['Two paid,', 'one breach later'], now: 'Two pieces are gone. The forgotten one opens a breach.', loss: 20},
  path: {x: 680, y: 340, lines: ['A piece lies in', 'a walking path'], now: 'A landing moved it. Nobody planned where.'},
  fast: {x: 500, y: 480, lines: ['Paid after', 'short wait'], now: 'All three pieces are gone and the pit is free.', loss: 30},
  trip: {x: 860, y: 480, lines: ['Trip: another', 'item is dropped'], now: 'A new loose item exists. More paths start here.'},
};
const EDGES: [string, string, string][] = [
  ['start', 'inAcid', 'Feed it whole'],
  ['start', 'pieces', 'Hammer it'],
  ['start', 'rot', 'Leave it'],
  ['inAcid', 'slow', 'Wait'],
  ['pieces', 'two', 'Feed two, forget one'],
  ['pieces', 'fast', 'Feed all three'],
  ['pieces', 'path', 'A shake moves a piece'],
  ['path', 'fast', 'Someone picks it up, all three get fed'],
  ['path', 'trip', 'A carrier sprints into it'],
];

let walk = ['start'];
const seen = new Set<string>();
const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag: string, attrs: Record<string, string | number>, text = '') => {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text) n.textContent = text;
  return n;
};

function renderTree() {
  const here = walk[walk.length - 1];
  const next = EDGES.filter(e => e[0] === here);
  const onWalk = (a: string, b: string) => walk.some((id, i) => id === a && walk[i + 1] === b);
  const lines = EDGES.map(([a, b]) =>
    svg('path', {
      d: `M${PLACES[a].x} ${PLACES[a].y + 32} L${PLACES[b].x} ${PLACES[b].y - 32}`,
      class: onWalk(a, b) ? 'taken' : '',
    }),
  );
  const boxes = Object.entries(PLACES).map(([id, p]) => {
    const state = id === here ? 'here' : walk.includes(id) ? 'taken' : next.some(e => e[1] === id) ? 'next' : '';
    const g = svg('g', {class: state});
    g.append(svg('rect', {x: p.x - 82, y: p.y - 32, width: 164, height: 64, rx: 14}));
    p.lines.forEach((t, i) => g.append(svg('text', {x: p.x, y: p.y - 5 + i * 21, 'text-anchor': 'middle'}, t)));
    return g;
  });
  $('#tree').replaceChildren(...lines, ...boxes);
  // On narrow screens the tree scrolls sideways: keep the current step in view.
  const wrap = $<HTMLElement>('.tree-wrap');
  const drawn = $<SVGSVGElement>('#tree').getBoundingClientRect().width;
  wrap.scrollLeft = (PLACES[here].x / 1000) * drawn - wrap.clientWidth / 2;

  const allergen = $<HTMLInputElement>('#allergen').checked;
  $('#story-now').textContent = PLACES[here].now;
  const loss = Math.max(0, ...walk.map(id => PLACES[id].loss ?? 0));
  $('#story-cost').textContent = allergen
    ? loss
      ? `Allergen: this path has cost ${loss} hunger (example value 30 for the whole engine). Whether it also pays food is open.`
      : 'Allergen: nothing has entered the acid, so no hunger is lost yet.'
    : '';
  const choices = $('#story-choices');
  choices.replaceChildren(
    ...next.map(([, to, text]) =>
      button(text, () => {
        walk.push(to);
        renderTree();
        $<HTMLButtonElement>('#story-choices button, #story-reset')?.focus();
      }),
    ),
  );
  if (!next.length) {
    seen.add(walk.join('>'));
    choices.append(el('p', '', 'This path stops here in the drawing. In the game it would go on.'));
  }
  $('#story-count').textContent = `Paths you have walked to the end: ${seen.size} of 6 drawn`;
}

export function startExplorers() {
  renderQuiz();
  $('#allergen').addEventListener('change', renderTree);
  $('#story-reset').addEventListener('click', () => {
    walk = ['start'];
    renderTree();
  });
  renderTree();
}
