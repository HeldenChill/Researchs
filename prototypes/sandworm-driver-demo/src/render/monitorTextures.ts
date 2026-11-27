import * as THREE from 'three';
import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';
import type { CctvRoom } from '../cockpit/cockpitState.ts';

const SCREEN_W = 512;
const SCREEN_H = 384;
const REDRAW_INTERVAL = 1 / 15;

export class InteriorMonitorScreen {
  readonly texture: THREE.CanvasTexture;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private accum = REDRAW_INTERVAL;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  update(state: SimState, dt: number): void {
    this.accum += dt;
    if (this.accum < REDRAW_INTERVAL) return;
    this.accum = 0;

    const ctx = this.ctx;
    const intr = state.interior;
    ctx.fillStyle = '#0d1411';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // Subtle CRT grid
    ctx.strokeStyle = 'rgba(105, 201, 138, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 32; x < SCREEN_W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SCREEN_H);
      ctx.stroke();
    }
    for (let y = 32; y < SCREEN_H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SCREEN_W, y);
      ctx.stroke();
    }

    // Header
    ctx.fillStyle = '#69c98a';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText('INTERIOR MINIMAP', 24, 38);
    ctx.fillStyle = '#8fa899';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('NEXT MODULE · STUB TELEMETRY', 24, 60);

    // Segmented worm rooms schematic
    const rooms = [
      { name: 'MOUTH', val: `${intr.mouthQueue} queued`, alert: intr.mouthQueue > 2 },
      { name: 'ACID PIT', val: `${intr.acidSlots.length}/${SIM_CONFIG.acidCapacity} active`, alert: intr.acidSlots.length >= SIM_CONFIG.acidCapacity },
      { name: 'HULL', val: `${intr.breaches} breach${intr.breaches === 1 ? '' : 'es'}`, alert: intr.breaches > 0 },
    ];

    rooms.forEach((r, idx) => {
      const rx = 28 + idx * 156;
      const ry = 104;
      const rw = 140;
      const rh = 136;
      ctx.fillStyle = r.alert ? 'rgba(220, 83, 66, 0.18)' : 'rgba(105, 201, 138, 0.09)';
      ctx.strokeStyle = r.alert ? '#dc5342' : '#69c98a';
      ctx.lineWidth = 2;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);

      ctx.fillStyle = r.alert ? '#ff8c7d' : '#f2e6d0';
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillText(r.name, rx + 14, ry + 34);

      ctx.fillStyle = '#b4a48d';
      ctx.font = '15px "Inter", sans-serif';
      ctx.fillText(r.val, rx + 14, ry + 78);
    });

    // Footer status
    ctx.fillStyle = intr.crewStunTimer > 0 ? '#ff8c7d' : '#69c98a';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillText(
      intr.crewStunTimer > 0
        ? `CREW STUNNED (${intr.crewStunTimer.toFixed(1)}s)`
        : intr.breaches > 0
          ? 'ALERT: BREACH SEALING IN PROGRESS'
          : 'ALL CHAMBERS NOMINAL',
      24,
      320,
    );

    this.texture.needsUpdate = true;
  }
}

export class CctvMonitorScreen {
  readonly texture: THREE.CanvasTexture;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private accum = REDRAW_INTERVAL;
  private clock = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  update(state: SimState, room: CctvRoom, dt: number): void {
    this.clock += dt;
    this.accum += dt;
    if (this.accum < REDRAW_INTERVAL) return;
    this.accum = 0;

    const ctx = this.ctx;
    const intr = state.interior;
    ctx.fillStyle = '#101216';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 0; y < SCREEN_H; y += 6) {
      ctx.fillRect(0, y, SCREEN_W, 2);
    }

    const titles: Record<CctvRoom, string> = {
      mouth: 'CAM 01 · MOUTH INTAKE',
      acid: 'CAM 02 · ACID DIGESTION PIT',
      hull: 'CAM 03 · HULL & BREACH WALL',
    };

    const details: Record<CctvRoom, string> = {
      mouth: `Food waiting in jaw: ${intr.mouthQueue}`,
      acid: `Active acid slots: ${intr.acidSlots.length} / ${SIM_CONFIG.acidCapacity}`,
      hull: `Active breaches: ${intr.breaches} · Seal ${Math.round(intr.sealProgress * 100)}%`,
    };

    // REC blink
    const blink = Math.sin(this.clock * 4) > 0;
    if (blink) {
      ctx.fillStyle = '#dc5342';
      ctx.beginPath();
      ctx.arc(34, 34, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f2e6d0';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText(titles[room], 52, 41);

    // Camera viewport frame
    ctx.strokeStyle = 'rgba(79, 179, 232, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 68, SCREEN_W - 48, 224);

    ctx.fillStyle = '#4fb3e8';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText(details[room], 48, 170);

    ctx.fillStyle = '#9aa5b4';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('ROOM CCTV · NEXT MODULE PLACEHOLDER', 48, 204);

    ctx.fillStyle = '#e59a38';
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillText('PRESS 1 / 2 / 3 OR TOP BAR TO SWITCH CAMERA', 24, 336);

    this.texture.needsUpdate = true;
  }
}
