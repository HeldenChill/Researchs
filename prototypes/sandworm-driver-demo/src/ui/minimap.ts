import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';

const LOOK_BEHIND_M = 30;
const LOOK_AHEAD_M = 140;
const TOTAL_SPAN_M = LOOK_BEHIND_M + LOOK_AHEAD_M;

export class MinimapView {
  private readonly canvas: HTMLCanvasElement | null;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly callout: HTMLElement | null;

  constructor() {
    this.canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement | null;
    this.ctx = this.canvas?.getContext('2d') ?? null;
    this.callout = document.getElementById('minimap-callout');
  }

  update(state: SimState): void {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(240, Math.round(rect.width) || 380);
    const cssH = Math.max(64, Math.round(rect.height) || 82);
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const w = state.worm;
    const xMin = w.x - LOOK_BEHIND_M;
    const xMax = w.x + LOOK_AHEAD_M;
    const yMax = SIM_CONFIG.maxAltitude;
    const yMin = SIM_CONFIG.maxDepth;
    const ySpan = yMax - yMin;

    const toX = (wx: number): number => ((wx - xMin) / TOTAL_SPAN_M) * cssW;
    const toY = (wy: number): number => ((yMax - wy) / ySpan) * cssH;
    const surfaceY = toY(0);

    // Sky / air region above surface
    ctx.fillStyle = 'rgba(79, 179, 232, 0.08)';
    ctx.fillRect(0, 0, cssW, surfaceY);

    // Underground region
    ctx.fillStyle = 'rgba(229, 154, 56, 0.05)';
    ctx.fillRect(0, surfaceY, cssW, cssH - surfaceY);

    // Surface horizon line (y = 0)
    ctx.strokeStyle = 'rgba(242, 230, 208, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(cssW, surfaceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Apocalypse storm wall
    if (state.apocalypseX >= xMin) {
      const stormPx = Math.min(cssW, toX(state.apocalypseX));
      ctx.fillStyle = 'rgba(220, 83, 66, 0.26)';
      ctx.fillRect(0, 0, Math.max(0, stormPx), cssH);
      ctx.strokeStyle = '#dc5342';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(stormPx, 0);
      ctx.lineTo(stormPx, cssH);
      ctx.stroke();
    }

    // Safe Pocket Goal B
    if (SIM_CONFIG.goalX <= xMax && SIM_CONFIG.goalX >= xMin) {
      const goalPx = toX(SIM_CONFIG.goalX);
      ctx.strokeStyle = '#69c98a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(goalPx, 0);
      ctx.lineTo(goalPx, cssH);
      ctx.stroke();
    }

    // Uneaten food / spawners
    for (const sp of state.spawners) {
      if (sp.eaten || sp.x < xMin - 4 || sp.x > xMax + 4) continue;
      const px = toX(sp.x);
      const py = toY(sp.y);
      ctx.fillStyle = sp.kind === 'tyre' ? '#b4a48d' : '#69c98a';
      ctx.beginPath();
      ctx.arc(px, py, sp.kind === 'large_meat' ? 4 : 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Unbroken rock obstacles + find nearest ahead for crew callout
    let nearestHardDist = Infinity;
    let nearestSoftDist = Infinity;
    let nearestFoodDist = Infinity;

    for (const sp of state.spawners) {
      if (sp.eaten || sp.x < w.x) continue;
      const d = sp.x - w.x;
      if (d < nearestFoodDist) nearestFoodDist = d;
    }

    for (const obs of state.obstacles) {
      if (obs.broken) continue;
      if (obs.x >= w.x) {
        const d = obs.x - w.x;
        if (w.heart.b < obs.requiredBite && d < nearestHardDist) nearestHardDist = d;
        else if (w.heart.b >= obs.requiredBite && d < nearestSoftDist) nearestSoftDist = d;
      }
      if (obs.x < xMin - 8 || obs.x > xMax + 8) continue;

      const px = toX(obs.x);
      const py = toY(obs.y);
      const r = Math.max(3.5, (obs.radius / TOTAL_SPAN_M) * cssW * 1.35);
      const tooHard = w.heart.b < obs.requiredBite;

      ctx.fillStyle = tooHard ? 'rgba(220, 83, 66, 0.85)' : 'rgba(229, 154, 56, 0.35)';
      ctx.strokeStyle = tooHard ? '#ff8c7d' : '#e59a38';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Worm position + heading vector
    const wx = toX(w.x);
    const wy = toY(w.y);
    const lookLen = 22;
    const dx = Math.cos(w.heading) * lookLen;
    const dy = -Math.sin(w.heading) * lookLen;

    ctx.strokeStyle = 'rgba(242, 230, 208, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + dx, wy + dy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e59a38';
    ctx.strokeStyle = '#f2e6d0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(wx, wy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    if (this.callout) {
      if (nearestHardDist <= LOOK_AHEAD_M) {
        this.callout.textContent = `Hard rock in ${Math.round(nearestHardDist)} m`;
        this.callout.style.color = '#ff8c7d';
      } else if (nearestSoftDist <= LOOK_AHEAD_M) {
        this.callout.textContent = `Rock in ${Math.round(nearestSoftDist)} m`;
        this.callout.style.color = '#e59a38';
      } else if (nearestFoodDist <= LOOK_AHEAD_M) {
        this.callout.textContent = `Food in ${Math.round(nearestFoodDist)} m`;
        this.callout.style.color = '#69c98a';
      } else {
        this.callout.textContent = 'Clear ahead';
        this.callout.style.color = '#b4a48d';
      }
    }
  }
}
