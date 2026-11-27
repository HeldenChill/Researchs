export type Box = [x0: number, y0: number, z0: number, x1: number, y1: number, z1: number];

interface MoveWorld {
  blocked(x: number, z: number, r: number, yLo: number, yHi: number): boolean;
  support(x: number, z: number, yTop: number): number;
}

export function boxWorld(boxes: readonly Box[]): MoveWorld {
  return {
    blocked(x: number, z: number, r: number, yLo: number, yHi: number): boolean {
      for (const [x0, y0, z0, x1, y1, z1] of boxes) {
        if (x + r > x0 && x - r < x1 && z + r > z0 && z - r < z1 && yHi > y0 && yLo < y1) {
          return true;
        }
      }
      return false;
    },

    support(x: number, z: number, yTop: number): number {
      let highest = 0;
      for (const [x0, , z0, x1, y1, z1] of boxes) {
        if (x0 <= x && x <= x1 && z0 <= z && z <= z1 && y1 <= yTop) {
          if (y1 > highest) {
            highest = y1;
          }
        }
      }
      return highest;
    },
  };
}
