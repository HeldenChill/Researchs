import GUI, { type Controller } from 'lil-gui';
import {
  SETTINGS, applyValues, clearValues, exportValues, resetValues, saveValues, targetOf,
  type KeyValueStore,
} from '../tune/settings.ts';
import { DEBUG_FLAGS } from '../tune/debugFlags.ts';
import type { SimState } from '../sim/types.ts';

export interface TuningHooks {
  getState: () => SimState;
  restart: () => void;
  jumpToNextRock: () => void;
}

/** Help box left of the popup. Shows a row's explanation as soon as the mouse is over it. */
function createHelpBox(): { attach: (ctl: Controller, title: string, text: string) => void; hide: () => void } {
  const box = document.createElement('div');
  box.style.cssText = [
    'position:fixed', 'top:8px', 'right:330px', 'max-width:300px', 'padding:10px 12px', 'z-index:31',
    'background:rgba(16,18,24,0.95)', 'border:1px solid #4a90d9', 'border-radius:6px', 'color:#e8e8e8',
    'font:13px/1.45 sans-serif', 'pointer-events:none', 'display:none',
  ].join(';');
  document.body.appendChild(box);
  const hide = (): void => {
    box.style.display = 'none';
  };
  return {
    hide,
    attach: (ctl, title, text) => {
      ctl.domElement.addEventListener('mouseenter', () => {
        const heading = document.createElement('div');
        heading.style.cssText = 'font-weight:bold;color:#9fd0ff;margin-bottom:4px';
        heading.textContent = title;
        const body = document.createElement('div');
        body.textContent = text;
        box.replaceChildren(heading, body);
        box.style.display = 'block';
      });
      ctl.domElement.addEventListener('mouseleave', hide);
    },
  };
}

/** Tuning popup. Starts hidden; F3, backquote or the Tune button toggles it. Changes apply live. */
export function createTuning(hooks: TuningHooks, store: KeyValueStore | null): { update: () => void } {
  const gui = new GUI({ title: 'Tuning (F3) · hover a row for help' });
  const help = createHelpBox();
  const refresh = (): void => gui.controllersRecursive().forEach((c) => c.updateDisplay());

  const live = { state: '', momentum: '', speed: '', height: '', noseDeg: '' };
  const liveFolder = gui.addFolder('Live values');
  for (const key of Object.keys(live) as Array<keyof typeof live>) {
    liveFolder.add(live, key).disable();
  }

  const test = gui.addFolder('Test tools');
  help.attach(test.add(DEBUG_FLAGS, 'timeScale', 0.1, 2, 0.05).name('Game speed'), 'Game speed', 'Slow the game down to watch collisions and body motion.');
  help.attach(test.add(DEBUG_FLAGS, 'invincible').name('Invincible'), 'Invincible', 'Health and hunger stay full and breaches are removed.');
  help.attach(test.add(DEBUG_FLAGS, 'freezeStorm').name('Freeze storm'), 'Freeze storm', 'The storm wall stops advancing.');
  help.attach(test.add(DEBUG_FLAGS, 'showHitboxes').name('Show hitboxes'), 'Show hitboxes', 'Blue wire sphere: contact happens when the head centre touches it.');
  help.attach(test.add({ run: hooks.jumpToNextRock }, 'run').name('Jump to next rock'), 'Jump to next rock', 'Move the worm 40 m before the next unbroken rock to test collisions quickly.');
  help.attach(test.add({ run: hooks.restart }, 'run').name('Restart run (R)'), 'Restart run', 'Start again from the beginning. Tuned values are kept.');

  const folders = new Map<string, GUI>();
  for (const s of SETTINGS) {
    let folder = folders.get(s.folder);
    if (!folder) {
      folder = gui.addFolder(s.folder);
      if (s.folder !== 'Momentum') folder.close();
      folders.set(s.folder, folder);
    }
    const ctl = folder.add(targetOf(s.key), s.key, s.min, s.max, s.step).name(s.label);
    ctl.onChange(() => saveValues(store));
    help.attach(ctl, s.label, s.help);
  }

  const share = gui.addFolder('Save and share');
  const copy = share.add({
    run: () => {
      const json = exportValues();
      console.log(json);
      void navigator.clipboard?.writeText(json).then(() => copy.name('Copied!'), () => copy.name('Copy blocked: see console'));
      setTimeout(() => copy.name('Copy changed values'), 1500);
    },
  }, 'run').name('Copy changed values');
  help.attach(copy, 'Copy changed values', 'Copies only the values you changed, as JSON. Paste it to share or to make it the new default.');

  const paste = share.add({
    run: () => {
      void navigator.clipboard?.readText().then(
        (text) => {
          try {
            applyValues(JSON.parse(text) as Record<string, unknown>);
            saveValues(store);
            refresh();
          } catch {
            paste.name('Clipboard is not valid JSON');
            setTimeout(() => paste.name('Paste values'), 1500);
          }
        },
        () => paste.name('Paste blocked by browser'),
      );
    },
  }, 'run').name('Paste values');
  help.attach(paste, 'Paste values', 'Applies JSON values from the clipboard. Unknown names are ignored and numbers are kept inside each range.');

  const reset = share.add({
    run: () => {
      resetValues();
      clearValues(store);
      refresh();
    },
  }, 'run').name('Reset all to defaults');
  help.attach(reset, 'Reset all to defaults', 'Forget every saved value.');
  share.close();

  let visible = false;
  const setVisible = (on: boolean): void => {
    visible = on;
    gui.show(on);
    if (!on) help.hide();
  };
  setVisible(false);

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'F3' && e.code !== 'Backquote') return;
    e.preventDefault();
    setVisible(!visible);
  });
  const button = document.getElementById('tune-btn') as HTMLButtonElement;
  button.addEventListener('click', () => {
    setVisible(!visible);
    button.blur();
  });

  return {
    update: () => {
      if (!visible) return;
      const w = hooks.getState().worm;
      live.state = w.activeObstacleId !== null ? 'grinding' : w.recoilTimer > 0 ? 'recoil' : w.blocked ? 'blocked' : w.y > 0 ? 'air' : 'underground';
      live.momentum = w.momentum.toFixed(1);
      live.speed = Math.hypot(w.vx, w.vy).toFixed(1);
      live.height = w.y.toFixed(1);
      live.noseDeg = ((w.heading * 180) / Math.PI).toFixed(0);
      liveFolder.controllers.forEach((c) => c.updateDisplay());
    },
  };
}
