// Diagrams D7 and D8 as motion: each rule reads a saved value and writes the next one.
import {Circle, Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, easeInOutCubic, easeOutCubic, waitFor} from '@motion-canvas/core';
import {C, FONT, label} from './kit';

type Spot = {x: number; y: number; text: string; rule: boolean};

const N: Record<string, Spot> = {
  items: {x: -440, y: -90, text: 'Items and places', rule: false},
  digest: {x: -150, y: -235, text: 'O14 Digest', rule: true},
  hunger: {x: 160, y: -235, text: 'Hunger', rule: false},
  move: {x: 440, y: -90, text: 'O2 Move worm', rule: true},
  motion: {x: 440, y: 95, text: 'Worm motion', rule: false},
  impact: {x: 160, y: 205, text: 'O3 Impact', rule: true},
  shake: {x: -150, y: 205, text: 'Shake impulse', rule: false},
  physics: {x: -440, y: 95, text: 'O7 Physics', rule: true},
  bite: {x: 60, y: -115, text: 'O4 Bite', rule: true},
  neglect: {x: -150, y: -10, text: 'O16 Neglect', rule: true},
  hazards: {x: -150, y: 90, text: 'Hazards', rule: false},
  tick: {x: 140, y: 90, text: 'O17 Hazard tick', rule: true},
};

const W = 232;
const H = 62;

/** Trim a connector so it starts and ends on the box edges instead of the centres. */
function ends(a: Spot, b: Spot): [[number, number], [number, number]] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const k = Math.min(dx ? (W / 2 + 6) / Math.abs(dx) : Infinity, dy ? (H / 2 + 6) / Math.abs(dy) : Infinity);
  return [
    [a.x + dx * k, a.y + dy * k],
    [b.x - dx * k, b.y - dy * k],
  ];
}

export default makeScene2D(function* (view) {
  view.fill(C.gut);
  const links: [string, string][] = [
    ['items', 'digest'], ['digest', 'hunger'], ['hunger', 'move'], ['move', 'motion'],
    ['motion', 'impact'], ['impact', 'shake'], ['shake', 'physics'], ['physics', 'items'],
    ['motion', 'bite'], ['bite', 'items'], ['items', 'neglect'], ['neglect', 'hazards'], ['hazards', 'tick'],
  ];
  const lines = new Map<string, Line>();
  for (const [a, b] of links) {
    const line = <Line points={ends(N[a], N[b])} stroke={C.wall} lineWidth={4} endArrow arrowSize={14} /> as Line;
    lines.set(`${a}>${b}`, line);
    view.add(line);
  }

  const boxes = new Map<string, Rect>();
  for (const [id, s] of Object.entries(N)) {
    const box = (
      <Rect x={s.x} y={s.y} width={W} height={H} radius={s.rule ? 8 : 31} fill={s.rule ? C.room : C.gut} stroke={s.rule ? C.rule : C.sand} lineWidth={3}>
        <Txt text={s.text} fontFamily={FONT} fontSize={22} fill={C.ink} />
      </Rect>
    ) as Rect;
    boxes.set(id, box);
    view.add(box);
  }

  const title = label('', 0, -320, 40);
  const key = label('Square box: rule.  Round box: saved value or signal.', 0, 315, 28, C.dim);
  view.add(title);
  view.add(key);

  const dot = <Circle size={24} fill={C.bile} opacity={0} /> as Circle;
  view.add(dot);

  function* light(id: string, color: string) {
    const box = boxes.get(id)!;
    yield* all(box.stroke(color, 0.2), box.lineWidth(7, 0.2), box.scale(1.07, 0.15, easeOutCubic).to(1, 0.2));
  }
  function* travel(a: string, b: string, color: string = C.bile) {
    const [from, to] = ends(N[a], N[b]);
    const line = lines.get(`${a}>${b}`)!;
    dot.fill(color);
    dot.position(from);
    dot.opacity(1);
    yield* line.stroke(color, 0.15);
    yield* dot.position(to, 0.6, easeInOutCubic);
    dot.opacity(0);
    yield* light(b, color);
  }
  function* step(text: string, a: string, b: string, color?: string) {
    title.text(`// ${text}`);
    yield* travel(a, b, color);
    yield* waitFor(0.9);
  }

  title.text('// Start with food and rubbish lying inside the body.');
  yield* light('items', C.bile);
  yield* waitFor(1);
  yield* step('Digest reads items in the acid.', 'items', 'digest');
  yield* step('It writes hunger.', 'digest', 'hunger');
  yield* step('Moving the worm reads hunger.', 'hunger', 'move');
  yield* step('It writes how the worm moves.', 'move', 'motion');
  yield* step('Impact reads the landing.', 'motion', 'impact', C.sand);
  yield* step('It writes a shake.', 'impact', 'shake', C.sand);
  yield* step('Physics reads the shake.', 'shake', 'physics', C.sand);
  yield* step('It writes where items are now. The circle is closed.', 'physics', 'items', C.sand);
  yield* step('A second way back: the bite reads the worm’s movement.', 'motion', 'bite');
  yield* step('It writes new items inside.', 'bite', 'items');
  yield* step('A side path: items left too long are read by Neglect.', 'items', 'neglect', C.alarm);
  yield* step('It writes a hazard.', 'neglect', 'hazards', C.alarm);
  yield* step('The hazard then hurts the worm over time.', 'hazards', 'tick', C.alarm);
  yield* waitFor(2);
});
