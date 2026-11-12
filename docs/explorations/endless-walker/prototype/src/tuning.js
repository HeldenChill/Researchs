import GUI from 'lil-gui';

export function createTuning(config, CONFIG_SPEC, feel, FEEL_SPEC) {
  const gui = new GUI({ title: 'Endless Walker Tuning' });

  const folders = {};

  const addSpec = (targetObj, specObj) => {
    if (!targetObj || !specObj) return;
    for (const [key, spec] of Object.entries(specObj)) {
      const group = spec.group;
      if (!folders[group]) {
        folders[group] = gui.addFolder(group);
        folders[group].close();
      }
      const step = spec.step !== undefined ? spec.step : (spec.max - spec.min) / 200;
      folders[group].add(targetObj, key, spec.min, spec.max, step).listen();
    }
  };

  addSpec(config, CONFIG_SPEC);
  addSpec(feel, FEEL_SPEC);

  const actions = {
    'Reset values': () => {
      if (CONFIG_SPEC && config) {
        for (const [k, s] of Object.entries(CONFIG_SPEC)) {
          config[k] = s.value;
        }
      }
      if (FEEL_SPEC && feel) {
        for (const [k, s] of Object.entries(FEEL_SPEC)) {
          feel[k] = s.value;
        }
      }
    },
    'Copy values': () => {
      const changedConfig = {};
      if (CONFIG_SPEC && config) {
        for (const [k, s] of Object.entries(CONFIG_SPEC)) {
          if (config[k] !== s.value) {
            changedConfig[k] = config[k];
          }
        }
      }
      const changedFeel = {};
      if (FEEL_SPEC && feel) {
        for (const [k, s] of Object.entries(FEEL_SPEC)) {
          if (feel[k] !== s.value) {
            changedFeel[k] = feel[k];
          }
        }
      }
      const out = feel ? { config: changedConfig, feel: changedFeel } : changedConfig;
      const json = JSON.stringify(out, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(json).catch(() => {});
      }
      console.log('Changed config & feel:', json);
    }
  };

  gui.add(actions, 'Reset values');
  gui.add(actions, 'Copy values');

  // Starts closed / hidden
  gui.hide();

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        if (gui.domElement.style.display === 'none') {
          gui.show();
        } else {
          gui.hide();
        }
      }
    });
  }

  return gui;
}
