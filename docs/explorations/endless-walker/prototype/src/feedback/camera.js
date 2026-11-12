import * as THREE from 'three';
import { heightAt, fieldAt } from '../terrain.js';

export function createCameraRig(aspect) {
  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 5000);

  let yaw = 0;
  let pitch = 0.1;
  let roll = 0;
  let lookIdleTime = 0;
  let prevMode = 'OnFoot';
  let prevHeading = 0;
  let shakeTimer = 0;
  let hardLandDipTimer = 0;
  let punchTimer = 0;
  let inAirKickTimer = 0;
  let simTime = 0;
  let smoothNoisePhase = 0;

  // Initial position behind walker start (0, -680)
  camera.position.set(0, heightAt(0, -680) + 1.8, -680 - 5.5);

  return {
    camera,
    get yaw() {
      return yaw;
    },
    update(state, config, dt, lookDX, lookDY, feel) {
      simTime += dt;
      const fxScale = (feel && feel.camFxOn) ? 1 : 0;

      // Look input
      if (Math.abs(lookDX) > 0.001 || Math.abs(lookDY) > 0.001) {
        lookIdleTime = 0;
        yaw -= lookDX * 0.0025;
        pitch = Math.max(-1.1, Math.min(1.1, pitch + lookDY * 0.0025));
      } else {
        lookIdleTime += dt;
      }

      // Auto-recenter
      if (lookIdleTime >= 1.0 && state.speed > 1 && state.mode !== 'Hooked') {
        let diff = (state.heading - yaw) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        const maxStep = 1.5 * dt;
        if (Math.abs(diff) < maxStep) {
          yaw = state.heading;
        } else {
          yaw += Math.sign(diff) * maxStep;
        }
      }

      // Hook ease yaw toward velocity direction at 3 rad/s
      if (state.mode === 'Hooked' && fxScale > 0) {
        const hSpeed = Math.hypot(state.vel.x, state.vel.z);
        if (hSpeed > 0.5) {
          const vYaw = Math.atan2(state.vel.x, state.vel.z);
          let diff = (vYaw - yaw) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          const maxStep = 3.0 * dt;
          if (Math.abs(diff) < maxStep) {
            yaw = vYaw;
          } else {
            yaw += Math.sign(diff) * maxStep;
          }
        }
      }

      // Mode detection transitions
      if (prevMode === 'InAir' && state.mode === 'Fallen') {
        shakeTimer = 0.25;
        hardLandDipTimer = 0.25;
      }
      if (prevMode !== 'Hooked' && state.mode === 'Hooked') {
        punchTimer = 0.1;
      }
      if (prevMode === 'Hooked' && state.mode === 'InAir') {
        inAirKickTimer = 0.5;
      } else if (state.mode !== 'InAir') {
        inAirKickTimer = 0;
      }

      const isSlide = state.mode === 'Sliding';
      let camDist = isSlide ? config.camDistSlide : config.camDistFoot;
      let camHeight = isSlide ? config.camHeightSlide : config.camHeightFoot;

      let targetRoll = 0;

      // OnWall: distance x 0.7
      if (state.mode === 'OnWall') {
        camDist *= (1 - 0.3 * fxScale);
      }

      // OnFoot adjustments: head bob, roll sway, uphill drop, tired sway
      if (state.mode === 'OnFoot' && feel) {
        // Head bob
        const load = state.load || 0;
        const bob = fxScale * feel.bobHeight * (1 + feel.bobLoadGain * load / 60) * Math.sin(2 * Math.PI * state.steps);
        camHeight += bob;

        // Roll sway
        targetRoll += fxScale * (feel.swayRollDeg * Math.PI / 180) * Math.sin(Math.PI * state.steps);

        // Uphill drop & distance
        const field = fieldAt(state.pos.x, state.pos.z, state.heading);
        if (field.slopeAlongDeg > 0) {
          const slopeRad = (field.slopeAlongDeg * Math.PI) / 180;
          camHeight -= fxScale * feel.uphillCamDrop * Math.sin(slopeRad);
          camDist *= (1 - 0.15 * fxScale);
        }

        // Tired sway
        const usable = (config.staminaMax ?? 100) - load;
        if (usable > 0 && state.stamina < 0.25 * usable) {
          targetRoll += fxScale * feel.tiredSway * Math.sin(1.3 * simTime);
        }
      }

      // Slide carve roll
      if (isSlide && feel) {
        let dHeading = (state.heading - prevHeading) / Math.max(dt, 0.001);
        while (dHeading > Math.PI / dt) dHeading -= (2 * Math.PI) / dt;
        while (dHeading < -Math.PI / dt) dHeading += (2 * Math.PI) / dt;
        const maxRollRad = (feel.carveRollDeg * Math.PI) / 180;
        const carveRoll = fxScale * Math.max(-maxRollRad, Math.min(maxRollRad, -dHeading * 0.1));
        targetRoll += carveRoll;
      }

      // Smooth roll easing
      roll += (targetRoll - roll) * Math.min(1, 10 * dt);

      // FOV
      let targetFOV = config.fovFoot;
      if (isSlide) {
        targetFOV = config.fovFoot + (config.fovSlideMax - config.fovFoot) * Math.min(1, state.speed / config.fovSlideSpeed);
      } else if (state.mode === 'Hooked' && feel) {
        targetFOV = config.fovFoot + fxScale * feel.hookFovKick;
      } else if (state.mode === 'InAir' && inAirKickTimer > 0 && feel) {
        inAirKickTimer -= dt;
        const frac = Math.max(0, inAirKickTimer / 0.5);
        targetFOV = config.fovFoot + fxScale * feel.hookFovKick * frac;
      }

      // Zoom punch
      if (punchTimer > 0 && feel) {
        punchTimer -= dt;
        const punchFrac = Math.max(0, punchTimer / 0.1);
        targetFOV -= fxScale * (feel.hookPunch * 10) * punchFrac;
      }

      const alpha = config.camDelay > 0 ? 1 - Math.exp(-dt / config.camDelay) : 1;
      camera.fov += (targetFOV - camera.fov) * alpha;
      camera.updateProjectionMatrix();

      // Target camera eye position
      const targetEyeX = state.pos.x - camDist * Math.sin(yaw) * Math.cos(pitch);
      const targetEyeZ = state.pos.z - camDist * Math.cos(yaw) * Math.cos(pitch);
      let targetEyeY = state.pos.y + camHeight + camDist * Math.sin(pitch);

      if (hardLandDipTimer > 0) {
        hardLandDipTimer -= dt;
        targetEyeY -= fxScale * 0.2 * (hardLandDipTimer / 0.25);
      }

      camera.position.x += (targetEyeX - camera.position.x) * alpha;
      camera.position.y += (targetEyeY - camera.position.y) * alpha;
      camera.position.z += (targetEyeZ - camera.position.z) * alpha;

      // Min ground clearance
      const groundH = heightAt(camera.position.x, camera.position.z);
      if (camera.position.y < groundH + 0.5) {
        camera.position.y = groundH + 0.5;
      }

      // Existing hard land shake
      if (shakeTimer > 0) {
        shakeTimer -= dt;
        const amp = 0.15 * (shakeTimer / 0.25);
        camera.position.x += (Math.random() * 2 - 1) * amp;
        camera.position.y += (Math.random() * 2 - 1) * amp;
        camera.position.z += (Math.random() * 2 - 1) * amp;
      }

      // Slide smooth shake
      if (isSlide && feel && fxScale > 0) {
        const shakeT = Math.min(1, Math.max(0, (state.speed - feel.slideShakeFrom) / 10));
        if (shakeT > 0) {
          smoothNoisePhase += dt * 25;
          const amp = feel.slideShakeAmp * shakeT;
          const sx = Math.sin(smoothNoisePhase) * amp;
          const sy = Math.cos(smoothNoisePhase * 0.73) * amp;
          camera.position.x += sx;
          camera.position.y += sy;
        }
      }

      const lookTargetY = state.pos.y + (isSlide ? 0.6 : 1.2);
      camera.lookAt(state.pos.x, lookTargetY, state.pos.z);

      if (roll !== 0) {
        camera.rotateZ(roll);
      }

      prevMode = state.mode;
      prevHeading = state.heading;
    }
  };
}
