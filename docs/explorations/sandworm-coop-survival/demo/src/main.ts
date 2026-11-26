import {Player, Stage, Vector2} from '@motion-canvas/core';
import engine from './projects/engine?project';
import pit from './projects/pit?project';
import shake from './projects/shake?project';
import circle from './projects/circle?project';
import {startExplorers} from './explore';
import {startWorkTree} from './worktree';
import {STEP} from './timing';
import {LEDGER, OPERATORS, SORT, VALUES} from './content';

const FPS = 60;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const el = (tag: string, cls = '', text = '') => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Motion Canvas embed ----------
function mount(host: HTMLElement, project: any, autoplay: boolean, onFrame?: (frame: number) => void) {
  const size = new Vector2(1280, 720);
  const resolutionScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const player = new Player(project, {size, fps: FPS, resolutionScale, range: [0, Infinity], audioOffset: 0}, {loop: true});
  const stage = new Stage();
  stage.configure({size, resolutionScale, background: null});
  host.prepend(stage.finalBuffer);
  stage.finalBuffer.setAttribute('role', 'img');
  stage.finalBuffer.setAttribute('aria-label', host.dataset.label ?? 'Animation');
  player.onRender.subscribe(async () => {
    await stage.render(player.playback.currentScene, player.playback.previousScene);
  });
  project.logger.onLogged.subscribe((m: any) => {
    if (m.level === 'error') console.error('motion-canvas:', m.message, m.stack ?? '');
  });

  const button = $<HTMLButtonElement>('[data-play]', host);
  const scrub = $<HTMLInputElement>('[data-scrub]', host);
  let wanted = autoplay && !calm;
  let visible = false;
  const apply = () => player.togglePlayback(wanted && visible);
  const setWanted = (value: boolean) => {
    wanted = value;
    button.textContent = wanted ? 'Pause' : 'Play';
    apply();
  };
  button.addEventListener('click', () => setWanted(!wanted));
  player.onDurationChanged.subscribe((d: number) => (scrub.max = String(Math.max(1, d - 1))));
  player.onFrameChanged.subscribe((f: number) => {
    scrub.value = String(f);
    onFrame?.(f);
  });
  scrub.addEventListener('input', () => {
    setWanted(false);
    player.requestSeek(Number(scrub.value));
  });
  new IntersectionObserver(
    entries => {
      visible = entries[0].isIntersecting;
      apply();
    },
    {threshold: 0.25},
  ).observe(host);
  setWanted(wanted);
  return {
    seek(seconds: number) {
      setWanted(false);
      player.requestSeek(Math.round(seconds * FPS));
      player.requestRender();
    },
    play: () => setWanted(true),
  };
}

// ---------- Engine scene and its save-file ledger ----------
const steps = [...document.querySelectorAll<HTMLButtonElement>('[data-step]')];
let shown = '';
function ledger(frame: number) {
  const seconds = frame / FPS;
  const index = Math.min(LEDGER.length - 1, Math.floor(seconds / STEP));
  const settled = seconds - index * STEP >= STEP * 0.62;
  const key = `${index}:${settled}`;
  if (key === shown) return;
  shown = key;
  const entry = LEDGER[index];
  const rows = settled ? entry.after : index > 0 ? LEDGER[index - 1].after : [];
  const before = new Map((index > 0 ? LEDGER[index - 1].after : []).map(r => [r[0], r[1]]));
  $('#op-name').textContent = entry.op;
  $('#op-reads').textContent = entry.reads;
  $('#op-writes').textContent = entry.writes;
  const body = $('#save-rows');
  body.replaceChildren(
    ...rows.map(([name, value]) => {
      const row = el('tr', settled && before.get(name) !== value ? 'changed' : '');
      row.append(el('th', '', name), el('td', '', value));
      return row;
    }),
  );
  if (!rows.length) {
    const row = el('tr');
    const cell = el('td', '', 'No engine saved yet.');
    row.append(cell);
    body.append(row);
  }
  steps.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
}
const hero = mount($('#scene-engine'), engine, true, ledger);
steps.forEach((b, i) =>
  b.addEventListener('click', () => {
    // Show the finished state of the chosen step.
    hero.seek(i * STEP + STEP * 0.9);
  }),
);
$('#run-from-start').addEventListener('click', () => {
  hero.seek(0);
  hero.play();
});
ledger(0);
mount($('#scene-pit'), pit, false);
mount($('#scene-circle'), circle, false);
startExplorers();
startWorkTree();
mount($('#scene-shake'), shake, false);

// ---------- Sorter ----------
const sortList = $('#sort-list');
const verdict = $('#sort-verdict');
function pick(i: number) {
  const item = SORT[i];
  [...sortList.children].forEach((c, j) => c.setAttribute('aria-pressed', String(i === j)));
  verdict.replaceChildren(el('p', 'verdict-kind kind-' + item.kind, item.kindText), el('h3', '', item.name), el('p', '', item.why));
  document.querySelectorAll('[data-bin]').forEach(b => b.classList.toggle('lit', (b as HTMLElement).dataset.bin === item.kind));
}
SORT.forEach((item, i) => {
  const b = el('button', '', item.name) as HTMLButtonElement;
  b.type = 'button';
  b.addEventListener('click', () => pick(i));
  sortList.append(b);
});
pick(0);

// ---------- SW-3 allergy by proportion ----------
const fed = [true, false, false];
const shares = [...document.querySelectorAll<HTMLButtonElement>('[data-share]')];
function allergy() {
  const penalty = 30;
  const start = 70;
  const count = fed.filter(Boolean).length;
  const loss = (penalty * count) / 3;
  const left = Math.max(0, start - loss);
  shares.forEach((b, i) => {
    b.setAttribute('aria-pressed', String(fed[i]));
    $('span', b).textContent = fed[i] ? 'in the acid' : 'ejected';
  });
  $('#hunger-fill').style.width = `${left}%`;
  $('#hunger-lost').style.left = `${left}%`;
  $('#hunger-lost').style.width = `${start - left}%`;
  $('#hunger-readout').textContent = `Hunger ${start} becomes ${left}`;
  $('#hunger-sum').textContent = count ? `${Array(count).fill('30 × 1/3').join('  +  ')}  =  ${loss} lost` : 'Nothing entered the acid, so nothing is lost.';
}
shares.forEach((b, i) =>
  b.addEventListener('click', () => {
    fed[i] = !fed[i];
    allergy();
  }),
);
allergy();

// ---------- Who touches this value ----------
const valueSelect = $<HTMLSelectElement>('#value-select');
VALUES.forEach(v => {
  const o = el('option', '', v.name) as HTMLOptionElement;
  o.value = v.id;
  valueSelect.append(o);
});
function touches() {
  const id = valueSelect.value;
  for (const [target, key] of [['#writers', 'writes'], ['#readers', 'reads']] as const) {
    const list = $(target);
    const found = OPERATORS.filter(o => o[key].includes(id));
    list.replaceChildren(
      ...found.map(o => {
        const li = el('li');
        li.append(el('b', '', `${o.id} ${o.name}`), el('span', '', o.plain));
        return li;
      }),
    );
    if (!found.length) list.append(el('li', '', 'No rule in this table.'));
  }
}
valueSelect.value = 'hunger';
valueSelect.addEventListener('change', touches);
touches();
