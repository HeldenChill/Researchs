export function startLoop(step: () => void, tickRate: number): () => void {
  const period = 1000 / tickRate;
  let next = performance.now();
  let timer: NodeJS.Timeout | null = null;
  let running = true;

  const run = () => {
    if (!running) return;
    const now = performance.now();
    let n = 0;
    while (now >= next && n < 5) {
      step();
      next += period;
      n++;
    }
    if (now - next > period * 5) next = now;
    if (running) {
      timer = setTimeout(run, Math.max(0, next - performance.now() - 1));
    }
  };

  run();

  return () => {
    running = false;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}
