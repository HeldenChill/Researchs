export function createAudio() {
  let ctx = null;
  let noiseBuffer = null;
  let breathGain = null;
  let breathFilter = null;
  let slideGain = null;
  let slideFilter = null;
  let windGain = null;
  let windFilter = null;
  let hookOsc = null;
  let hookGain = null;

  let prevStepInt = 0;
  let lfoPhase = 0;
  let prevMode = 'OnFoot';
  let prevHeading = 0;

  function initContext() {
    if (ctx) return;
    const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AudioContextClass) return;

    ctx = new AudioContextClass();

    // 2-second white noise buffer
    const bufferSize = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Breath loop: noise -> bandpass -> gain -> destination
    const breathSource = ctx.createBufferSource();
    breathSource.buffer = noiseBuffer;
    breathSource.loop = true;

    breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = 600;
    breathFilter.Q.value = 3.0;

    breathGain = ctx.createGain();
    breathGain.gain.value = 0;

    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(ctx.destination);
    breathSource.start();

    // Slide loop: noise -> bandpass -> gain -> destination
    const slideSource = ctx.createBufferSource();
    slideSource.buffer = noiseBuffer;
    slideSource.loop = true;

    slideFilter = ctx.createBiquadFilter();
    slideFilter.type = 'bandpass';
    slideFilter.frequency.value = 500;
    slideFilter.Q.value = 1.5;

    slideGain = ctx.createGain();
    slideGain.gain.value = 0;

    slideSource.connect(slideFilter);
    slideFilter.connect(slideGain);
    slideGain.connect(ctx.destination);
    slideSource.start();

    // Wind roar loop: noise -> bandpass -> gain -> destination
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 300;
    windFilter.Q.value = 1.0;

    windGain = ctx.createGain();
    windGain.gain.value = 0;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ctx.destination);
    windSource.start();

    // Hook reel whine: saw -> gain -> destination
    hookOsc = ctx.createOscillator();
    hookOsc.type = 'sawtooth';
    hookOsc.frequency.value = 400;

    hookGain = ctx.createGain();
    hookGain.gain.value = 0;

    hookOsc.connect(hookGain);
    hookGain.connect(ctx.destination);
    hookOsc.start();
  }

  if (typeof window !== 'undefined') {
    const unlock = () => {
      initContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  function playFootstep(load, feel, master) {
    if (!ctx || ctx.state !== 'running' || master <= 0) return;

    const loadNorm = Math.min(1, Math.max(0, load / 60));
    const stepVol = (feel?.stepVolume ?? 0.7) * (0.6 + 0.4 * loadNorm) * master;

    // Crunch noise
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800 - 900 * loadNorm;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(stepVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    source.stop(ctx.currentTime + 0.09);

    // 70 Hz thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);

    oscGain.gain.setValueAtTime(stepVol * 0.5, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  function playHookThunk(feel, master) {
    if (!ctx || ctx.state !== 'running' || master <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);

    const vol = (feel?.hookVolume ?? 0.7) * 0.4 * master;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  function playFallThud(master) {
    if (!ctx || ctx.state !== 'running' || master <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.5 * master, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  }

  // Short dry click when the hook finds nothing in range.
  function playHookMiss(feel) {
    if (!ctx || ctx.state !== 'running') return;
    const master = (feel && feel.soundOn !== 0) ? (feel.masterVolume ?? 0.8) : 0;
    const vol = (feel?.hookVolume ?? 0.7) * 0.25 * master;
    if (vol <= 0) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  return {
    playHookMiss,
    update(state, config, dt, feel) {
      if (!ctx || ctx.state !== 'running') return;

      const master = (feel && feel.soundOn !== 0) ? (feel.masterVolume ?? 0.8) : 0;

      // 1. Footstep detection on integer step change
      const currentStepInt = Math.floor(state.steps);
      if (currentStepInt !== prevStepInt && state.mode === 'OnFoot' && state.speed > 0.1) {
        playFootstep(state.load || 0, feel, master);
      }
      prevStepInt = currentStepInt;

      // Mode entry one-shots
      if (prevMode !== 'Hooked' && state.mode === 'Hooked') {
        playHookThunk(feel, master);
      }
      if (prevMode !== 'Fallen' && state.mode === 'Fallen') {
        playFallThud(master);
      }

      // 2. Breath sound: gain = breathVolume * (1 - stamina/usable), rate up when tired
      const load = state.load || 0;
      const usable = Math.max(1, (config.staminaMax ?? 100) - load);
      const stamDeficit = Math.max(0, Math.min(1, 1 - state.stamina / usable));
      const breathRate = 0.4 + stamDeficit * 0.6;
      lfoPhase += dt * breathRate * Math.PI * 2;
      const lfo = (Math.sin(lfoPhase) + 1) * 0.5;
      const targetBreathGain = master > 0 ? (feel?.breathVolume ?? 0.5) * stamDeficit * lfo * master * 0.25 : 0;
      breathGain.gain.setValueAtTime(targetBreathGain, ctx.currentTime);

      // 3. Wind roar: centre 300 + 40 * speed Hz, gain = windVolume * clamp(speed / 25, 0, 1) in Sliding, Hooked, InAir
      let moveSpeed = state.speed;
      if (state.mode === 'InAir') {
        moveSpeed = Math.hypot(state.vel.x, state.vel.y, state.vel.z);
      }
      const inFastMode = state.mode === 'Sliding' || state.mode === 'Hooked' || state.mode === 'InAir';
      if (inFastMode && master > 0) {
        const windNorm = Math.min(1, Math.max(0, moveSpeed / 25));
        const targetWindGain = (feel?.windVolume ?? 0.7) * windNorm * master * 0.25;
        windFilter.frequency.setValueAtTime(300 + 40 * moveSpeed, ctx.currentTime);
        windGain.gain.setValueAtTime(targetWindGain, ctx.currentTime);
      } else {
        windGain.gain.setValueAtTime(0, ctx.currentTime);
      }

      // 4. Scrape and carve while sliding
      if (state.mode === 'Sliding' && state.speed > 1 && master > 0) {
        const speedNorm = Math.min(1, state.speed / 25);
        const steerNorm = Math.min(1, Math.abs(state.heading - prevHeading) / Math.max(dt, 0.001) / 1.5);
        slideFilter.frequency.setValueAtTime(400 + speedNorm * 800 + steerNorm * 1200, ctx.currentTime);
        const targetSlideGain = (0.15 * speedNorm + 0.15 * steerNorm) * master;
        slideGain.gain.setValueAtTime(targetSlideGain, ctx.currentTime);
      } else {
        slideGain.gain.setValueAtTime(0, ctx.currentTime);
      }

      // 5. Reel whine while Hooked
      if (state.mode === 'Hooked' && master > 0) {
        const hNorm = Math.min(1, Math.max(0, state.speed / (feel?.hookMaxSpeed ?? 35)));
        hookOsc.frequency.setValueAtTime(400 + 500 * hNorm, ctx.currentTime);
        const targetHookGain = (feel?.hookVolume ?? 0.7) * 0.12 * master;
        hookGain.gain.setValueAtTime(targetHookGain, ctx.currentTime);
      } else {
        hookGain.gain.setValueAtTime(0, ctx.currentTime);
      }

      prevMode = state.mode;
      prevHeading = state.heading;
    }
  };
}
