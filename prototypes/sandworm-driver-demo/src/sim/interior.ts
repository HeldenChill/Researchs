import { SIM_CONFIG } from './config.ts';
import type { DriverInput, SimState } from './types.ts';

export function stepInteriorAndBody(state: SimState, input: DriverInput, dt: number): void {
  const w = state.worm;
  const intr = state.interior;

  // Heavy Driver shake stuns simulated crew and can trigger a breach
  if (w.shakeImpulse > 0.35) {
    intr.crewStunTimer = Math.max(intr.crewStunTimer, 0.8 * w.shakeImpulse);
    if (w.shakeImpulse >= 0.45 && intr.breaches < 3) {
      intr.breaches += 1;
    }
  }

  if (intr.crewStunTimer > 0) {
    intr.crewStunTimer = Math.max(0, intr.crewStunTimer - dt);
  } else {
    // Crew prioritizes sealing breaches if any, else carries mouthQueue into acidSlots
    if (intr.breaches > 0) {
      intr.sealProgress += dt / SIM_CONFIG.crewSealTime;
      if (intr.sealProgress >= 1) {
        intr.sealProgress = 0;
        intr.breaches -= 1;
      }
    } else if (intr.mouthQueue > 0 && intr.acidSlots.length < SIM_CONFIG.acidCapacity) {
      intr.crewWorkTimer += dt / SIM_CONFIG.crewCarryTime;
      if (intr.crewWorkTimer >= 1) {
        intr.crewWorkTimer = 0;
        intr.mouthQueue -= 1;
        const fromPrey = intr.preySections > 0;
        if (fromPrey) intr.preySections -= 1;
        intr.acidSlots.push({ yieldHunger: fromPrey ? SIM_CONFIG.preyYieldPerSection : 20, remaining: 2.6, total: 2.6 });
      }
    }
  }

  // O14 Digest: all admitted acidSlots digest concurrently
  const nextSlots = [];
  for (const item of intr.acidSlots) {
    item.remaining -= dt;
    if (item.remaining <= 0) {
      w.hunger = Math.min(SIM_CONFIG.maxHunger, w.hunger + item.yieldHunger);
    } else {
      nextSlots.push(item);
    }
  }
  intr.acidSlots = nextSlots;

  // O19 Metabolism + O17 Hazard tick
  const boostDrain = input.boost && w.hunger > 5 ? SIM_CONFIG.boostHungerCost : 0;
  const drain = SIM_CONFIG.hungerBaseDrain + w.heart.s * SIM_CONFIG.hungerDrainPerSpeedPt + boostDrain;
  w.hunger = Math.max(0, w.hunger - drain * dt);

  const regen = w.heart.r * SIM_CONFIG.regenPerPoint;
  const breachDmg = intr.breaches * SIM_CONFIG.breachDps;
  w.health = Math.max(0, Math.min(SIM_CONFIG.maxHealth, w.health + (regen - breachDmg) * dt));
}
