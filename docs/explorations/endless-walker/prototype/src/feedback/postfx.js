import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const FeelShader = {
  name: 'FeelShader',
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0 },
    uDesat: { value: 0 },
    uBlur: { value: 0 },
    uLines: { value: 0 },
    uFlash: { value: 0 },
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uDesat;
    uniform float uBlur;
    uniform float uLines;
    uniform float uFlash;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = uv - center;
      float dist = length(toCenter);

      vec4 color = vec4(0.0);
      if (uBlur > 0.001) {
        float tapStep = (uBlur * 0.04) / 8.0;
        for (int i = 0; i < 8; i++) {
          vec2 offset = toCenter * (float(i) * tapStep);
          color += texture2D(tDiffuse, uv - offset);
        }
        color /= 8.0;
      } else {
        color = texture2D(tDiffuse, uv);
      }

      if (uLines > 0.001 && dist > 0.25) {
        float angle = atan(toCenter.y, toCenter.x);
        float ray = hash(vec2(floor(angle * 32.0), floor(uTime * 15.0)));
        float edgeFactor = smoothstep(0.25, 0.75, dist);
        if (ray > 0.65) {
          float lineIntensity = (ray - 0.65) / 0.35 * edgeFactor * uLines;
          color.rgb = mix(color.rgb, vec3(1.0), lineIntensity * 0.6);
        }
      }

      if (uDesat > 0.001) {
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(color.rgb, vec3(gray), uDesat);
      }

      if (uVignette > 0.001) {
        float vFactor = smoothstep(0.3, 0.85, dist);
        color.rgb *= (1.0 - vFactor * uVignette);
      }

      if (uFlash > 0.001) {
        float edge = smoothstep(0.2, 0.8, dist);
        vec3 flashCol = vec3(1.0, 1.0, 1.0);
        color.rgb = mix(color.rgb, flashCol, uFlash * (0.4 + 0.6 * edge));
      }

      gl_FragColor = color;
    }
  `
};

export function createPostFx(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const shaderPass = new ShaderPass(FeelShader);
  composer.addPass(shaderPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  let prevMode = 'OnFoot';
  let desatCur = 0;
  let flashTimer = 0;
  let time = 0;

  return {
    composer,
    render(state, config, feel, dt) {
      time += dt;

      if (!feel || feel.screenFxOn === 0) {
        shaderPass.enabled = false;
        composer.render();
        prevMode = state.mode;
        return;
      }

      shaderPass.enabled = true;

      // Vignette
      const load = state.load || 0;
      const usable = Math.max(1, (config.staminaMax ?? 100) - load);
      const deficit = Math.max(0, Math.min(1, 1 - state.stamina / usable));
      let vignette = feel.vignetteMax * deficit;
      if (state.mode === 'Sliding') {
        vignette *= 0.25;
      } else if (state.mode !== 'OnFoot' && state.mode !== 'OnWall') {
        vignette = 0;
      }

      // Desaturation eased over 0.5 s when stamina is 0
      if (state.stamina <= 0.001) {
        desatCur = Math.min(feel.desatEmpty, desatCur + (feel.desatEmpty / 0.5) * dt);
      } else {
        desatCur = Math.max(0, desatCur - (feel.desatEmpty / 0.5) * dt);
      }

      // Speed effects (sliding, hooked, in air)
      let spd = state.speed;
      if (state.mode === 'InAir') {
        spd = Math.hypot(state.vel.x, state.vel.y, state.vel.z);
      }
      let speedFx = 0;
      if (state.mode === 'Sliding' || state.mode === 'Hooked' || state.mode === 'InAir') {
        const norm = Math.max(0, Math.min(1, (spd - feel.speedFxFrom) / 12));
        speedFx = feel.speedFxMax * norm;
      }

      // Flash on entering Hooked or hard landing (Fallen from InAir)
      if (prevMode !== 'Hooked' && state.mode === 'Hooked') {
        flashTimer = feel.flashTime;
      }
      if (prevMode === 'InAir' && state.mode === 'Fallen') {
        flashTimer = feel.flashTime;
      }

      let flashVal = 0;
      if (flashTimer > 0) {
        flashTimer -= dt;
        flashVal = Math.max(0, flashTimer / Math.max(feel.flashTime, 0.001));
      }

      // Assign uniforms
      shaderPass.uniforms.uVignette.value = vignette;
      shaderPass.uniforms.uDesat.value = desatCur;
      shaderPass.uniforms.uBlur.value = feel.blurStrength * speedFx;
      shaderPass.uniforms.uLines.value = speedFx;
      shaderPass.uniforms.uFlash.value = flashVal;
      shaderPass.uniforms.uTime.value = time;

      prevMode = state.mode;
      composer.render();
    },
    setSize(w, h) {
      composer.setSize(w, h);
    }
  };
}
