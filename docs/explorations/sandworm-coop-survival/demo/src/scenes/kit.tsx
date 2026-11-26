import {Circle, Line, Node, Rect, Txt} from '@motion-canvas/2d';
import {createRef, ThreadGenerator, waitFor} from '@motion-canvas/core';

export const C = {
  gut: '#2B1733',
  wall: '#6B3F6E',
  room: '#3B2144',
  ink: '#F2ECF3',
  dim: '#BBA6C0',
  bile: '#B7C73C',
  sand: '#D8A24A',
  alarm: '#E0533D',
  metal: '#A9B8C4',
  metalDark: '#5E6E7C',
};
export const FONT = 'Bahnschrift, "DIN Alternate", "Arial Narrow", sans-serif';

export function label(text: string, x: number, y: number, size = 32, fill = C.ink) {
  return <Txt text={text} x={x} y={y} fontSize={size} fontFamily={FONT} fill={fill} fontWeight={500} /> as Txt;
}

export function room(x: number, y: number, w: number, h: number, name: string) {
  return (
    <Node x={x} y={y}>
      <Rect width={w} height={h} fill={C.room} stroke={C.wall} lineWidth={4} radius={h / 3.2} />
      {label(name, 0, -h / 2 + 34, 28, C.dim)}
    </Node>
  ) as Node;
}

/** The engine, or one third of it: same shape family, so a piece reads as the same material. */
export function engine() {
  return (
    <Node>
      <Rect width={132} height={92} fill={C.metal} stroke={C.gut} lineWidth={5} radius={10} />
      {[-40, 0, 40].map(x => <Rect x={x} y={-56} width={26} height={24} fill={C.metalDark} radius={4} />)}
      {[-34, 34].map(x => <Circle x={x} y={8} size={38} fill={C.metalDark} stroke={C.gut} lineWidth={4} />)}
    </Node>
  ) as Node;
}

export function piece(showShare = true) {
  return (
    <Node>
      <Line points={[[-34, -28], [20, -34], [36, 6], [8, 32], [-32, 20]]} closed fill={C.metal} stroke={C.gut} lineWidth={5} />
      <Circle x={-2} y={0} size={26} fill={C.metalDark} />
      {showShare ? label('⅓', 0, 54, 30) : null}
    </Node>
  ) as Node;
}

export function crew(name: string) {
  return (
    <Node>
      <Circle size={66} fill={C.sand} stroke={C.gut} lineWidth={5} />
      {label(name, 0, 2, 28, C.gut)}
    </Node>
  ) as Node;
}

/** The acid pit with a capacity bar underneath. Fill is controlled through the returned ref. */
export function pit(x: number, y: number, capacity: number) {
  const slots = createRef<Node>();
  const node = (
    <Node x={x} y={y}>
      <Rect width={360} height={190} radius={[20, 20, 90, 90]} fill={'#35421F'} stroke={C.bile} lineWidth={5} />
      <Rect y={34} width={332} height={96} radius={[8, 8, 66, 66]} fill={C.bile} opacity={0.28} />
      <Node ref={slots} y={132}>
        {Array.from({length: capacity}, (_, i) => (
          <Rect x={(i - (capacity - 1) / 2) * 112} width={104} height={20} radius={5} stroke={C.bile} lineWidth={3} />
        ))}
      </Node>
    </Node>
  ) as Node;
  return {
    node,
    *occupy(count: number, seconds = 0.35): ThreadGenerator {
      const cells = slots().children() as Rect[];
      for (let i = 0; i < cells.length; i++) cells[i].fill(i < count ? C.bile : '#00000000');
      yield* waitFor(seconds);
    },
  };
}
