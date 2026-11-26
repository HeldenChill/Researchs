// Follow one engine. Each step lasts exactly STEP seconds so the page can sync the save-file ledger.
import {Line, makeScene2D, Rect} from '@motion-canvas/2d';
import {all, createRef, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, waitFor} from '@motion-canvas/core';
import {STEP} from '../timing';
import {C, crew, engine, label, piece, pit, room} from './kit';

export default makeScene2D(function* (view) {
  view.fill(C.gut);
  const acid = pit(430, -20, 3);
  view.add(room(-450, -40, 300, 360, 'Mouth'));
  view.add(room(-60, -40, 400, 360, 'Chamber 1'));
  view.add(label('Acid pit, capacity 3', 430, -190, 28, C.dim));
  view.add(acid.node);

  const title = label('', 0, -300, 46);
  view.add(title);
  const whole = engine();
  whole.position([-760, 0]).opacity(0);
  const p3 = crew('P3');
  p3.position([-60, 190]);
  view.add(whole);
  view.add(p3);

  // 1. Bite: a new item instance appears at the mouth.
  title.text('The worm bites a truck. One engine drops in.');
  yield* all(whole.opacity(1, 0.3), whole.position([-450, 20], 0.8, easeOutCubic));
  yield* waitFor(STEP - 0.8);

  // 2. Handle: only its place changes.
  title.text('A crew member carries it. Only its place changes.');
  yield* p3.position([-450, 100], 0.7, easeInOutCubic);
  yield* all(p3.position([-130, 110], 1.4, easeInOutCubic), whole.position([-130, 25], 1.4, easeInOutCubic));
  yield* whole.position([-80, 30], 0.35, easeOutCubic);
  yield* waitFor(STEP - 2.45);

  // 3. Break: one instance is removed, three are created in the same set.
  title.text('Hammer work fills a bar. Then one item becomes three.');
  const hammer = createRef<Rect>();
  const bar = createRef<Rect>();
  view.add(<Rect ref={hammer} x={-170} y={-70} width={90} height={34} fill={C.sand} radius={7} offset={[-0.6, 0]} />);
  const frame = createRef<Rect>();
  view.add(<Rect ref={frame} x={-80} y={-95} width={150} height={14} radius={7} stroke={C.dim} lineWidth={2} />);
  view.add(<Rect ref={bar} x={-155} y={-95} width={0} offsetX={-1} height={14} radius={7} fill={C.sand} />);
  for (let hit = 1; hit <= 3; hit++) {
    yield* hammer().rotation(-70, 0.28, easeOutCubic);
    yield* hammer().rotation(15, 0.14, easeInCubic);
    yield* all(bar().width(50 * hit, 0.12), whole.scale([1.12, 0.86], 0.07).to([1, 1], 0.1));
  }
  const parts = [piece(), piece(), piece()];
  parts.forEach(p => {
    p.position([-80, 30]).scale(0.3);
    view.add(p);
  });
  whole.opacity(0);
  hammer().remove();
  bar().remove();
  frame().remove();
  const spots: [number, number][] = [[-195, 5], [-65, -25], [45, 55]];
  yield* all(...parts.map((p, i) => all(p.position(spots[i], 0.45, easeOutBack), p.scale(1, 0.45, easeOutBack))));
  yield* waitFor(STEP - 3 * 0.61 - 0.45);

  // 4. Two pieces go into the acid and digest together.
  title.text('Two pieces go in. They fit, so they digest together.');
  yield* all(p3.position([170, 40], 0.6, easeInOutCubic), parts[1].position([350, -30], 0.8, easeInOutCubic));
  yield* acid.occupy(1, 0.1);
  yield* parts[2].position([505, -30], 0.7, easeInOutCubic);
  yield* acid.occupy(2, 0.3);
  yield* all(
    parts[1].scale(0, 1.8, easeInCubic),
    parts[2].scale(0, 1.8, easeInCubic),
    parts[1].y(35, 1.8),
    parts[2].y(35, 1.8),
  );
  yield* acid.occupy(0, 0.1);
  const paid = label('hunger and currency paid twice', 400, 190, 30, C.bile);
  paid.opacity(0);
  view.add(paid);
  yield* all(paid.opacity(1, 0.3), paid.y(175, 0.3, easeOutCubic));
  yield* waitFor(STEP - 4.1);

  // 5. The third piece is forgotten: it ages and opens a breach.
  title.text('The third piece is forgotten. It ages, then the wall breaks.');
  yield* all(paid.opacity(0, 0.25), p3.position([430, 250], 0.5, easeInOutCubic), parts[0].position([-150, 20], 0.4));
  const ring = createRef<Rect>();
  view.add(<Rect ref={ring} x={-150} y={18} width={84} height={84} radius={42} stroke={C.sand} lineWidth={7} opacity={0} />);
  yield* ring().opacity(1, 0.2);
  yield* all(ring().scale(1.12, 0.7).to(1, 0.6), ring().stroke(C.alarm, 1.3));
  const crack = createRef<Line>();
  view.add(
    <Line ref={crack} points={[[-250, 120], [-205, 140], [-215, 168], [-150, 128], [-105, 166], [-85, 125], [-40, 140]]} stroke={C.alarm} lineWidth={9} lineJoin={'round'} end={0} />,
  );
  yield* crack().end(1, 0.6, easeOutCubic);
  yield* waitFor(STEP - 2.65);
});
