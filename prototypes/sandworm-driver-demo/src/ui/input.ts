import type { DriverInput, HeartPreset } from '../sim/types.ts';

export class InputController {
  private readonly keys = new Set<string>();
  private pingQueued = false;
  private presetQueued: HeartPreset | null = null;
  private restartQueued = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const target = e.target;
      // Typing a number in the tuning popup must not drive the worm.
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return;
      if (target instanceof HTMLButtonElement) {
        // Space would otherwise press the last clicked button again.
        target.blur();
        e.preventDefault();
      }
      const code = e.code;
      this.keys.add(code);
      if (code === 'KeyE') this.pingQueued = true;
      if (code === 'Digit1') this.presetQueued = 'fast';
      if (code === 'Digit2') this.presetQueued = 'balanced';
      if (code === 'Digit3') this.presetQueued = 'bite';
      if (code === 'KeyR') this.restartQueued = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  sample(): DriverInput {
    const held = (a: string, b: string) => (this.keys.has(a) || this.keys.has(b) ? 1 : 0);
    const push = held('KeyW', 'ArrowUp');
    const brake = held('KeyS', 'ArrowDown');
    const left = held('KeyA', 'ArrowLeft');
    const right = held('KeyD', 'ArrowRight');

    const ping = this.pingQueued;
    const preset = this.presetQueued;
    this.pingQueued = false;
    this.presetQueued = null;

    return {
      throttle: push - brake,
      steer: left - right,
      boost: this.keys.has('Space'),
      ping,
      preset,
    };
  }

  consumeRestart(): boolean {
    const r = this.restartQueued;
    this.restartQueued = false;
    return r;
  }
}
