export function stepsForFrame(acc, frameDt, step = 1 / 60, maxSteps = 5) {
  const total = acc + frameDt;
  let steps = Math.floor(total / step);
  let newAcc = total - steps * step;
  if (steps > maxSteps) {
    steps = maxSteps;
    newAcc = total % step;
  }
  return { steps, acc: newAcc };
}
