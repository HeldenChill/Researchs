export function applyDeadzone(v, dz = 0.15) {
  const abs = Math.abs(v);
  if (abs <= dz) return 0;
  return Math.sign(v) * ((abs - dz) / (1 - dz));
}

export function toWorldMove(rawX, rawY, yaw) {
  const len = Math.hypot(rawX, rawY);
  const mag = Math.min(1, len);
  if (len === 0) {
    return { x: 0, z: 0, mag: 0 };
  }
  const scale = len > 1 ? 1 / len : 1;
  const nx = rawX * scale;
  const ny = rawY * scale;

  const x = nx * Math.cos(yaw) + ny * Math.sin(yaw);
  const z = -nx * Math.sin(yaw) + ny * Math.cos(yaw);
  return { x, z, mag };
}

export function createInput(domElement) {
  const keys = new Set();
  const edges = {
    jump: false,
    reset: false,
    toPeak: false,
    loadDelta: 0,
    hookToggle: false
  };

  let mouseDown = false;
  let rightMouseDown = false;
  let mouseLookX = 0;
  let mouseLookY = 0;

  let prevPadButtons = [];

  // Toggle help element if present
  const helpEl = typeof document !== 'undefined' ? document.getElementById('help') : null;

  function onKeyDown(e) {
    if (e.repeat) return;
    keys.add(e.code);

    if (e.code === 'Space') edges.jump = true;
    if (e.code === 'KeyR') edges.reset = true;
    if (e.code === 'KeyT') edges.toPeak = true;
    if (e.code === 'KeyZ') edges.loadDelta = -1;
    if (e.code === 'KeyX') edges.loadDelta = 1;
    if (e.code === 'KeyG') edges.hookToggle = true;

    if (e.code === 'KeyH' && helpEl) {
      helpEl.style.display = helpEl.style.display === 'none' ? 'block' : 'none';
    }
  }

  function onKeyUp(e) {
    keys.delete(e.code);
  }

  function onMouseDown(e) {
    if (e.button === 0) {
      mouseDown = true;
      if (domElement && domElement.requestPointerLock && document.pointerLockElement !== domElement) {
        domElement.requestPointerLock();
      }
    } else if (e.button === 2) {
      rightMouseDown = true;
    }
  }

  function onMouseUp(e) {
    if (e.button === 0) {
      mouseDown = false;
    } else if (e.button === 2) {
      rightMouseDown = false;
    }
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (typeof document !== 'undefined' && document.pointerLockElement === domElement) {
      mouseLookX += e.movementX || 0;
      mouseLookY += e.movementY || 0;
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    if (domElement) {
      domElement.addEventListener('contextmenu', onContextMenu);
      domElement.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    }
  }

  return {
    read(cameraYaw) {
      let rawX = 0;
      let rawY = 0;

      if (keys.has('KeyW') || keys.has('ArrowUp')) rawY += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) rawY -= 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) rawX -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) rawX += 1;

      let sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
      let crouch = keys.has('KeyC');
      let grab = mouseDown;
      let hookFire = rightMouseDown;

      let jump = edges.jump;
      let reset = edges.reset;
      let toPeak = edges.toPeak;
      let loadDelta = edges.loadDelta;
      let hookToggle = edges.hookToggle;

      edges.jump = false;
      edges.reset = false;
      edges.toPeak = false;
      edges.loadDelta = 0;
      edges.hookToggle = false;

      let lookDX = mouseLookX;
      let lookDY = mouseLookY;
      mouseLookX = 0;
      mouseLookY = 0;

      // Poll Gamepad
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const pad = gamepads ? (gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3]) : null;
        if (pad && pad.connected) {
          const stickX = applyDeadzone(pad.axes[0] || 0);
          const stickY = applyDeadzone(-(pad.axes[1] || 0)); // Stick up is negative Y
          if (Math.hypot(stickX, stickY) > 0) {
            rawX = stickX;
            rawY = stickY;
          }

          const padLookX = applyDeadzone(pad.axes[2] || 0);
          const padLookY = applyDeadzone(pad.axes[3] || 0);
          lookDX += padLookX * 20; // Scale stick look to feel similar to mouse dx
          lookDY += padLookY * 20;

          // RT (button 7) sprint, LT (button 6) grab, RB (button 5) hookFire
          const rt = pad.buttons[7];
          const lt = pad.buttons[6];
          const rb = pad.buttons[5];
          if ((rt && rt.value > 0.5) || (rt && rt.pressed)) sprint = true;
          if ((lt && lt.value > 0.5) || (lt && lt.pressed)) grab = true;
          if ((rb && rb.value > 0.5) || (rb && rb.pressed)) hookFire = true;

          // A (0) jump, B (1) crouch
          const aBtn = pad.buttons[0] && pad.buttons[0].pressed;
          const bBtn = pad.buttons[1] && pad.buttons[1].pressed;
          const dpadL = pad.buttons[14] && pad.buttons[14].pressed;
          const dpadR = pad.buttons[15] && pad.buttons[15].pressed;
          const backBtn = pad.buttons[8] && pad.buttons[8].pressed;
          const startBtn = pad.buttons[9] && pad.buttons[9].pressed;

          if (aBtn && !prevPadButtons[0]) jump = true;
          if (bBtn) crouch = true;
          if (dpadL && !prevPadButtons[14]) loadDelta = -1;
          if (dpadR && !prevPadButtons[15]) loadDelta = 1;
          if (backBtn && !prevPadButtons[8]) reset = true;
          if (startBtn && !prevPadButtons[9]) toPeak = true;

          prevPadButtons = pad.buttons.map(b => b.pressed);
        }
      }

      // Three.js is right-handed: seen from behind the walker (heading 0 = +z), +x is screen-left.
      // Flip once here so "right" input means screen-right in walking, slide steer and wall climbing.
      rawX = -rawX;

      const move = toWorldMove(rawX, rawY, cameraYaw);

      return {
        raw: { x: rawX, y: rawY },
        move,
        sprint,
        jump,
        grab,
        crouch,
        loadDelta,
        reset,
        toPeak,
        lookDX,
        lookDY,
        hookFire,
        hookToggle,
        aim: null
      };
    }
  };
}
