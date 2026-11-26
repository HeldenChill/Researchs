// SW-2: one pit, one capacity. Same engine fed two ways. 1 animation second = 2 game seconds.
import {makeScene2D, Node, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, createSignal, easeOutCubic, linear, waitFor} from '@motion-canvas/core';
import {C, engine, FONT, label, piece, pit} from './kit';

export default makeScene2D(function* (view) {
  view.fill(C.gut);
  const top = pit(-120, -190, 3);
  const low = pit(-120, 150, 3);
  view.add(top.node);
  view.add(low.node);
  view.add(label('Fed whole', -480, -190, 40));
  view.add(label('Fed as 3 pieces', -480, 150, 40));

  const whole = engine();
  whole.position([-120, -380]);
  whole.scale(1.45);
  view.add(whole);
  const parts = [piece(), piece(), piece()];
  parts.forEach((p, i) => {
    p.position([-230 + i * 110, -20]);
    view.add(p);
  });

  const clock = createSignal(0);
  const clockText = () => `game time ${clock().toFixed(1)} s`;
  view.add(<Txt text={clockText} y={-325} x={390} fontFamily={FONT} fontSize={38} fill={C.dim} />);

  const track = (y: number) => {
    const bar = createRef<Rect>();
    view.add(<Rect x={160} y={y} offsetX={-1} width={440} height={22} radius={11} stroke={C.dim} lineWidth={2} />);
    view.add(<Rect ref={bar} x={160} y={y} offsetX={-1} width={0} height={22} radius={11} fill={C.bile} />);
    return bar;
  };
  const topBar = track(-190);
  const lowBar = track(150);

  yield* waitFor(0.8);
  yield* all(
    whole.y(-185, 0.6, easeOutCubic),
    ...parts.map((p, i) => all(p.position([-230 + i * 110, 150], 0.6, easeOutCubic))),
  );
  yield* all(top.occupy(3, 0.1), low.occupy(3, 0.1));

  const done = (y: number, text: string) => {
    const node = <Node x={380} y={y} opacity={0}>{label(text, 0, 0, 36, C.bile)}</Node> as Node;
    view.add(node);
    return node;
  };
  const lowDone = done(205, 'done at 3 s, pit free again');
  const topDone = done(-135, 'done at about 11 s');

  // 11 game seconds in 5.5 animation seconds, linear so the bars compare honestly.
  yield* all(
    clock(11, 5.5, linear),
    topBar().width(440, 5.5, linear),
    whole.scale(0, 5.5, linear),
    (function* () {
      yield* all(lowBar().width(440, 1.5, linear), ...parts.map(p => p.scale(0, 1.5, linear)));
      yield* low.occupy(0, 0);
      yield* lowDone.opacity(1, 0.3);
    })(),
  );
  yield* top.occupy(0, 0);
  yield* topDone.opacity(1, 0.3);
  yield* waitFor(2.5);
});
