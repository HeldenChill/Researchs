import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';

export class HudView {
  private readonly vitals = document.getElementById('hud-vitals')!;
  private readonly progress = document.getElementById('hud-progress')!;
  private readonly interior = document.getElementById('hud-interior')!;
  private readonly overlay = document.getElementById('overlay')!;
  private readonly overlayTitle = document.getElementById('overlay-title')!;
  private readonly overlayDesc = document.getElementById('overlay-desc')!;

  constructor(onRestart: () => void) {
    document.getElementById('restart-btn')!.addEventListener('click', onRestart);
  }

  update(state: SimState): void {
    const w = state.worm;
    const intr = state.interior;
    const hpPct = Math.round((w.health / SIM_CONFIG.maxHealth) * 100);
    const hgPct = Math.round((w.hunger / SIM_CONFIG.maxHunger) * 100);
    const momPct = Math.min(100, Math.round((w.momentum / SIM_CONFIG.momentumMax) * 100));
    const speed = Math.hypot(w.vx, w.vy);
    const rock = state.obstacles.find((o) => !o.broken && Math.hypot(o.x - w.x, o.y - w.y) <= o.radius + SIM_CONFIG.headRadius + 0.6);
    let action = '';
    if (w.activeObstacleId !== null) action = `GRINDING ${Math.round(w.gnawProgress * 100)}% (S: let go)`;
    else if (w.recoilTimer > 0) action = 'RECOIL';
    else if (w.blocked && rock && w.heart.b < rock.requiredBite) action = `TOO HARD: need bite ${rock.requiredBite} (press 3) or steer around`;

    this.vitals.innerHTML = `
      <div><strong>Worm Vitals</strong> (${w.preset.toUpperCase()} · s:${w.heart.s} r:${w.heart.r} b:${w.heart.b})</div>
      <div>Health: ${Math.round(w.health)}</div>
      <div class="bar-wrap"><div class="bar bar-hp" style="width:${hpPct}%"></div></div>
      <div>Hunger: ${Math.round(w.hunger)}</div>
      <div class="bar-wrap"><div class="bar bar-hunger" style="width:${hgPct}%"></div></div>
      <div>Momentum: ${Math.round(w.momentum)} ${w.momentum >= SIM_CONFIG.highMomentumThreshold ? '(BREAK READY)' : ''}</div>
      <div class="bar-wrap"><div class="bar bar-mom" style="width:${momPct}%"></div></div>
      <div class="muted">Speed ${speed.toFixed(1)}</div>
      <div><strong>${action}</strong></div>
    `;

    const distGoal = Math.max(0, Math.round(SIM_CONFIG.goalX - w.x));
    const distApoc = Math.round(w.x - state.apocalypseX);
    this.progress.innerHTML = `
      <div><strong>Race to Safe Pocket</strong></div>
      <div>To Goal B: <strong>${distGoal} m</strong></div>
      <div>Apocalypse Lead: <strong>${distApoc} m</strong></div>
      <div class="muted">${w.y > 0 ? 'AIRBORNE' : `DEPTH ${Math.abs(w.y).toFixed(1)}m`}</div>
    `;

    this.interior.innerHTML = `
      <div><strong>Interior (Simulated Crew)</strong></div>
      <div>Mouth Queue: ${intr.mouthQueue} · Acid: ${intr.acidSlots.length}/${SIM_CONFIG.acidCapacity}</div>
      <div>Breaches: <strong style="color:${intr.breaches > 0 ? '#e05a47' : '#52b788'}">${intr.breaches}</strong></div>
      <div class="muted">${intr.crewStunTimer > 0 ? 'CREW STUNNED BY SHAKE!' : intr.breaches > 0 ? 'Crew sealing breach...' : 'Crew working'}</div>
    `;

    if (state.outcome === 'playing') {
      this.overlay.classList.remove('show');
    } else {
      this.overlay.classList.add('show');
      const labels: Record<string, [string, string]> = {
        win: ['Safe Pocket Reached!', `Survived in ${state.time.toFixed(1)}s with ${Math.round(w.health)} HP.`],
        loss_health: ['Worm Died', 'Hull breaches and damage drained worm health to 0.'],
        loss_hunger: ['Starved', 'Hunger hit 0 before reaching the Safe Pocket.'],
        loss_apocalypse: ['Consumed by Apocalypse', 'The storm wall overtook the worm.'],
      };
      const [title, desc] = labels[state.outcome] ?? ['Run Ended', ''];
      this.overlayTitle.textContent = title;
      this.overlayDesc.textContent = desc;
    }
  }
}
