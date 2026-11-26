// Loop L-C: the one chain that crosses both roles. A candidate, not an observed result.
import {Circle, Line, makeScene2D, Node, Rect} from '@motion-canvas/2d';
import {all, createRef, createSignal, easeInCubic, easeInOutCubic, easeOutCubic, linear, waitFor} from '@motion-canvas/core';
import {C, crew, label, piece, pit} from './kit';

export default makeScene2D(function* (view) {
  view.fill(C.gut);
  // Outside: side view.
  view.add(<Rect y={-250} width={1280} height={220} fill={'#2E2A2B'} />);
  view.add(<Line points={[[-640, -250], [640, -250]]} stroke={C.sand} lineWidth={5} />);
  view.add(label('Outside, seen by the Driver', 430, -330, 28, C.sand));
  view.add(label('Inside, seen by the Crew', -445, -105, 28, C.dim));

  const op = label('', 0, 305, 38);
  view.add(op);

  const body = createSignal(0);
  // Rise out of the sand, arc, and land at t = 1. Kept low so it stays inside the frame.
  const at = (t: number): [number, number] => {
    const x = -520 + 740 * t;
    const y = t < 0.2 ? -190 - (t / 0.2) * 60 : -250 - Math.sin(((t - 0.2) / 0.8) * Math.PI) * 60;
    return [x, y];
  };
  for (let i = 7; i >= 0; i--) {
    view.add(<Circle size={50 - i * 4} fill={C.sand} stroke={C.gut} lineWidth={3} position={() => at(Math.max(0, body() - i * 0.035))} />);
  }

  const inside = createRef<Node>();
  const p3 = crew('P3');
  const rolling = piece(false);
  const other = piece(false);
  const hole = pit(430, 90, 3);
  view.add(
    <Node ref={inside}>
      <Rect y={100} width={1200} height={300} radius={60} fill={C.room} stroke={C.wall} lineWidth={4} />
    </Node>,
  );
  inside().add(hole.node);
  hole.node.scale(0.8);
  p3.position([-470, 120]);
  rolling.position([-40, 120]);
  other.position([-470, 55]);
  inside().add(rolling);
  inside().add(p3);
  inside().add(other);

  op.text('// O2  The Driver leaps.');
  yield* body(1, 2, linear);

  op.text('// O3  A belly landing makes a shake impulse.');
  const wave = createRef<Circle>();
  view.add(<Circle ref={wave} x={220} y={-250} size={20} stroke={C.alarm} lineWidth={8} />);
  yield* all(wave().size(520, 0.55, easeOutCubic), wave().opacity(0, 0.55));
  for (const dx of [26, -22, 16, -10, 0]) yield* inside().x(dx, 0.08);
  yield* waitFor(0.9);

  op.text('// O7  Loose things slide. This one rolls into the path.');
  yield* all(rolling.x(-170, 1.2, easeOutCubic), rolling.rotation(-300, 1.2, easeOutCubic));
  yield* waitFor(0.7);

  op.text('// O8  A sprinting carrier trips and drops what they hold.');
  yield* all(p3.x(-215, 0.6, easeInCubic), other.x(-215, 0.6, easeInCubic));
  yield* all(p3.rotation(95, 0.25), p3.y(155, 0.25), other.position([-60, 190], 0.45, easeOutCubic), other.rotation(200, 0.45));
  yield* waitFor(1.2);

  op.text('// O14  Food that never reaches the acid pays no hunger.');
  const empty = label('acid is empty', 430, 215, 30, C.alarm);
  inside().add(empty);
  yield* empty.scale(1.15, 0.35).to(1, 0.35);
  yield* waitFor(1.4);

  op.text('// O2  Less hunger changes how the Driver can move.');
  yield* all(p3.rotation(0, 0.5, easeInOutCubic), p3.y(120, 0.5));
  yield* waitFor(2);
});
