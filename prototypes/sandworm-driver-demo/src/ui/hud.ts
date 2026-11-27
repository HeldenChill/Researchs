import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';
import type { CctvRoom, CockpitState, MonitorId } from '../cockpit/cockpitState.ts';
import { MinimapView } from './minimap.ts';

export class HudView {
  private readonly hudRoot = document.getElementById('hud')!;
  private readonly vitals = document.getElementById('hud-vitals')!;
  private readonly progress = document.getElementById('hud-progress')!;
  private readonly interior = document.getElementById('hud-interior')!;
  private readonly actionPill = document.getElementById('hud-action');
  private readonly overlay = document.getElementById('overlay')!;
  private readonly overlayTitle = document.getElementById('overlay-title')!;
  private readonly overlayDesc = document.getElementById('overlay-desc')!;
  private readonly cctvRooms = document.getElementById('cctv-rooms');
  private readonly monitorBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-monitor]'));
  private readonly roomBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-room]'));
  private readonly minimap = new MinimapView();

  constructor(
    onRestart: () => void,
    onSelectMonitor?: (id: MonitorId) => void,
    onSelectRoom?: (room: CctvRoom) => void,
  ) {
    document.getElementById('restart-btn')!.addEventListener('click', onRestart);
    for (const btn of this.monitorBtns) {
      btn.addEventListener('click', () => {
        const id = btn.dataset.monitor as MonitorId | undefined;
        if (id && onSelectMonitor) onSelectMonitor(id);
        btn.blur();
      });
    }
    for (const btn of this.roomBtns) {
      btn.addEventListener('click', () => {
        const room = btn.dataset.room as CctvRoom | undefined;
        if (room && onSelectRoom) onSelectRoom(room);
        btn.blur();
      });
    }
  }

  update(state: SimState, cockpit?: CockpitState): void {
    if (cockpit) {
      this.hudRoot.classList.toggle('cockpit-away', cockpit.activeMonitor !== 'drive');
      for (const btn of this.monitorBtns) {
        btn.classList.toggle('active', btn.dataset.monitor === cockpit.activeMonitor);
      }
      if (this.cctvRooms) {
        this.cctvRooms.classList.toggle('show', cockpit.activeMonitor === 'cctv');
      }
      for (const btn of this.roomBtns) {
        btn.classList.toggle('active', btn.dataset.room === cockpit.cctvRoom);
      }
    }
    const w = state.worm;
    const intr = state.interior;
    const hpPct = Math.max(0, Math.min(100, Math.round((w.health / SIM_CONFIG.maxHealth) * 100)));
    const hgPct = Math.max(0, Math.min(100, Math.round((w.hunger / SIM_CONFIG.maxHunger) * 100)));
    const momPct = Math.min(100, Math.round((w.momentum / SIM_CONFIG.momentumMax) * 100));
    const momThresholdPct = Math.min(100, Math.round((SIM_CONFIG.highMomentumThreshold / SIM_CONFIG.momentumMax) * 100));
    const breakReady = w.momentum >= SIM_CONFIG.highMomentumThreshold;
    const speed = Math.hypot(w.vx, w.vy);

    const presets: Array<{ id: string; key: string; label: string }> = [
      { id: 'fast', key: '1', label: 'Fast' },
      { id: 'balanced', key: '2', label: 'Bal' },
      { id: 'bite', key: '3', label: 'Bite' },
    ];
    const presetPills = presets
      .map((p) => `<span class="preset-pill${w.preset === p.id ? ' active' : ''}">${p.key} ${p.label}</span>`)
      .join('');

    this.vitals.innerHTML = `
      <div class="panel-head">
        <span class="panel-title">Worm Vitals</span>
        <div class="preset-row">${presetPills}</div>
      </div>
      <div class="heart-stats">Speed ${w.heart.s} · Reach ${w.heart.r} · Bite ${w.heart.b} · Vel <span class="stat-num">${speed.toFixed(1)}</span></div>
      <div class="vital-row">
        <div class="vital-label"><span>Health</span><strong>${Math.round(w.health)}</strong></div>
        <div class="bar-wrap"><div class="bar bar-hp" style="width:${hpPct}%"></div></div>
      </div>
      <div class="vital-row">
        <div class="vital-label"><span>Hunger</span><strong>${Math.round(w.hunger)}</strong></div>
        <div class="bar-wrap"><div class="bar bar-hunger" style="width:${hgPct}%"></div></div>
      </div>
      <div class="vital-row">
        <div class="vital-label">
          <span>Momentum ${breakReady ? '<span class="ready-tag">· BREAK READY</span>' : ''}</span>
          <strong>${Math.round(w.momentum)}</strong>
        </div>
        <div class="bar-wrap">
          <div class="bar-threshold" style="left:${momThresholdPct}%"></div>
          <div class="bar bar-mom${breakReady ? ' ready' : ''}" style="width:${momPct}%"></div>
        </div>
      </div>
    `;

    const rock = state.obstacles.find(
      (o) => !o.broken && Math.hypot(o.x - w.x, o.y - w.y) <= o.radius + SIM_CONFIG.headRadius + 0.6,
    );
    let actionText = '';
    let actionDanger = false;
    if (w.activeObstacleId !== null) {
      actionText = `Grinding rock ${Math.round(w.gnawProgress * 100)}% (S to release)`;
    } else if (w.recoilTimer > 0) {
      actionText = 'Impact recoil';
      actionDanger = true;
    } else if (w.blocked && rock && w.heart.b < rock.requiredBite) {
      actionText = `Too hard: need bite ${rock.requiredBite} (press 3) or steer around`;
      actionDanger = true;
    }

    if (this.actionPill) {
      if (actionText) {
        this.actionPill.textContent = actionText;
        this.actionPill.classList.add('show');
        this.actionPill.classList.toggle('danger', actionDanger);
      } else {
        this.actionPill.classList.remove('show', 'danger');
      }
    }

    const distGoal = Math.max(0, Math.round(SIM_CONFIG.goalX - w.x));
    const distApoc = Math.round(w.x - state.apocalypseX);
    const goalSpan = Math.max(1, SIM_CONFIG.goalX);
    const wormTrackPct = Math.max(0, Math.min(100, (w.x / goalSpan) * 100));
    const stormTrackPct = Math.max(0, Math.min(wormTrackPct, (state.apocalypseX / goalSpan) * 100));
    const airborne = w.y > 0;

    this.progress.innerHTML = `
      <div class="race-meta">
        <span class="panel-title">Race to Safe Pocket</span>
        <span class="depth-badge${airborne ? ' airborne' : ''}">${airborne ? 'Airborne' : `Depth ${Math.abs(w.y).toFixed(1)} m`}</span>
      </div>
      <div class="race-track">
        <div class="race-storm-fill" style="width:${stormTrackPct}%"></div>
        <div class="race-worm-dot" style="left:${wormTrackPct}%"></div>
        <div class="race-goal-pin"></div>
      </div>
      <div class="race-numbers">
        <span>Storm lead: <strong class="stat-num" style="color:${distApoc < 25 ? '#ff8c7d' : '#f2e6d0'}">${distApoc} m</strong></span>
        <span>Goal B: <strong class="stat-num">${distGoal} m</strong></span>
      </div>
    `;

    const acidPips = Array.from({ length: SIM_CONFIG.acidCapacity }, (_, i) =>
      `<span class="acid-pip${i < intr.acidSlots.length ? ' filled' : ''}"></span>`,
    ).join('');
    const crewText =
      intr.crewStunTimer > 0
        ? 'Crew stunned by shake'
        : intr.breaches > 0
          ? 'Crew sealing breach…'
          : 'Crew nominal';

    this.interior.innerHTML = `
      <div class="panel-head">
        <span class="panel-title">Interior Crew</span>
        <span class="stat-num" style="color:${intr.breaches > 0 ? '#ff8c7d' : '#69c98a'}">${intr.breaches} ${intr.breaches === 1 ? 'breach' : 'breaches'}</span>
      </div>
      <div class="interior-grid">
        <div class="interior-row">
          <span>Mouth queue</span>
          <strong class="stat-num" style="color:var(--ink-sand)">${intr.mouthQueue}</strong>
        </div>
        <div class="interior-row">
          <span>Acid pit (${intr.acidSlots.length}/${SIM_CONFIG.acidCapacity})</span>
          <div class="acid-pips">${acidPips}</div>
        </div>
        <div class="crew-status${intr.crewStunTimer > 0 ? ' stunned' : ''}">${crewText}</div>
      </div>
    `;

    this.minimap.update(state);

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
