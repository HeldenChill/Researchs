# Sandworm 3D Driver Cockpit Scene — Design Spec

**Date:** 2026-11-27  
**Prototype:** `prototypes/sandworm-driver-demo/`  
**Status:** Approved

---

## 1. Goal

Turn `sandworm-driver-demo` into a fixed-seat, point-and-click 3D driver cockpit where the player sits in front of **3 physical 3D monitors**:
- **Center Monitor — Drive:** Live 3D sandworm simulation (`WorldRenderer` rendered to `WebGLRenderTarget`) + Drive HUD and Sonar Minimap when focused.
- **Left Monitor — Interior Minimap (stub):** Live `CanvasTexture` schematic showing worm interior state (`mouthQueue`, `acidSlots`, `breaches`) as a placeholder for the upcoming Interior Minimap editor.
- **Right Monitor — Room CCTV (stub):** Live `CanvasTexture` camera feed placeholder with clickable room selector (`Mouth`, `Acid Pit`, `Hull`) for the upcoming Room CCTV editor.

The driver cannot walk around; they supervise and control the sandworm by clicking monitors to focus/switch actions.

---

## 2. Interaction & Input Rules

1. **Monitor Focus (`MonitorId = 'overview' | 'drive' | 'interior' | 'cctv'`):**
   - Starts in `'overview'` so the player sees the 3-monitor desk immediately.
   - Clicking any monitor mesh in the 3D scene smoothly zooms/pans the cockpit camera onto that monitor's screen.
   - Pressing `Escape`, clicking the cockpit desk/background, or clicking the `Overview (Esc)` pill returns the camera to `'overview'`.
   - Clicking another monitor directly (or using top cockpit bar pills) transitions straight to that monitor.
2. **Drive Control Gating (Option A):**
   - The simulation (`stepSim`) runs continuously regardless of which monitor is focused.
   - When `activeMonitor === 'drive'`, `InputController.sample()` passes player keyboard inputs (`W/S/A/D`, `Space`, `E`, `1/2/3`).
   - When `activeMonitor !== 'drive'`, `InputController.sample()` returns neutral drive input (`throttle: 0, steer: 0, boost: false, ping: false, preset: null`), so the worm cruises at its last heading without steering while the driver looks away. (`R` restart and `F3` tuning remain global.)
3. **HUD Visibility:**
   - The Drive HUD (`#hud-vitals`, `#hud-progress`, `#hud-interior`, `#hud-minimap`, `#hud-controls`, `#hud-action`) is shown when `activeMonitor === 'drive'` and hidden otherwise so the 3D cockpit remains unobstructed.
   - A minimal **Cockpit Bar** (`#cockpit-bar`) is always visible at top-left/top-center with active monitor label and quick-switch buttons (`Overview`, `Drive`, `Interior`, `CCTV`), plus `Tune (F3)` at bottom-right.

---

## 3. Rendering Architecture (Single-Renderer Dual-Pass)

- **One `THREE.WebGLRenderer`** owned by `WorldRenderer` (or shared via `getRenderer()`).
- **Pass 1 (`WorldRenderer.renderToTarget`):** Renders the existing underground/sandworm Three.js scene into a `THREE.WebGLRenderTarget` (`1024x640`, `LinearFilter`).
- **Pass 2 (`CockpitScene.render`):** Renders the 3D driver cabin (curved basalt/brass console, 3 angled CRT/rugged monitor housings, bezel glow/LEDs, subtle cabin lighting, and inherited impact camera shake) to the main canvas.
- **Raycasting:** `THREE.Raycaster` on `pointermove` (hover bezel highlight + pointer cursor) and `pointerdown` (select monitor or `'overview'`).
- **CanvasTextures:** Left (`InteriorMonitorTexture`) and Right (`CctvMonitorTexture`) render at ~15 Hz (throttled) onto `512x384` offscreen 2D canvases and mark `texture.needsUpdate = true` only when redrawn.

---

## 4. File Boundaries

- `src/cockpit/cockpitState.ts`: Pure state machine (`MonitorId`, `CctvRoom`, `createCockpitState`, `focusMonitor`, `selectCctvRoom`, `gateDriverInput`). Zero Three.js/DOM dependencies; unit-tested with Vitest.
- `src/render/monitorTextures.ts`: `InteriorMonitorScreen` & `CctvMonitorScreen` offscreen 2D canvas renderers for the Left & Right stub monitors.
- `src/render/cockpit.ts`: `CockpitRenderer` building the 3D desk, 3 monitors, raycast hitboxes, camera pose interpolation, and cabin shake.
- `src/render/world.ts`: Add `renderToTarget(state, pose, dt, target)` and `getRenderer()` / `getShake()` helpers.
- `src/main.ts`, `src/ui/hud.ts`, `index.html`: Wire `CockpitState`, `CockpitRenderer`, `CockpitBar`, and `gateDriverInput`.
- `test/cockpit.test.ts`: Unit tests for `cockpitState` transitions, room switching, and input gating.
