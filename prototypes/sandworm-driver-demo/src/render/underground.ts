import * as THREE from 'three';
import { SIM_CONFIG } from '../sim/config.ts';
import { VIEW_CONFIG } from './viewConfig.ts';
import type { Pose } from './pose.ts';

const WALL_Z = -6;
const WALL_WIDTH = 220;
const WALL_TOP = 16;
const WALL_BOTTOM = -90;

const vertexShader = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform vec2 uWorm;
uniform float uMaxDepth;
uniform float uGlow;
uniform float uTime;
varying vec3 vWorld;

float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

/** Scattered stones: one possible stone per grid cell. Returns light on the top side. */
vec2 stones(vec2 p, float cell, float chance) {
  vec2 id = floor(p / cell);
  if (hash(id + 7.3) > chance) return vec2(0.0);
  vec2 centre = (id + 0.25 + 0.5 * vec2(hash(id), hash(id + 19.1))) * cell;
  vec2 q = (p - centre) * vec2(1.0, 1.6);
  float r = cell * (0.08 + 0.14 * hash(id + 3.7));
  float inside = 1.0 - smoothstep(r * 0.8, r, length(q));
  return vec2(inside, clamp(0.5 + q.y / r * 0.5, 0.0, 1.0));
}

/** Colour change at one layer boundary, with a dark seam on it. */
vec3 layer(vec3 above, vec3 below, float d, float edge) {
  vec3 c = mix(above, below, smoothstep(edge - 0.25, edge + 0.25, d));
  return c * (1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.45, abs(d - edge))));
}

void main() {
  // Where this pixel's view ray crosses the gameplay plane z = 0, so lines match sim heights.
  vec2 act = cameraPosition.xy + (vWorld.xy - cameraPosition.xy) * (cameraPosition.z / (cameraPosition.z - vWorld.z));
  float surface = 0.22 * sin(act.x * 0.31) + 0.12 * sin(act.x * 0.87 + 1.7);
  if (act.y > surface) discard;
  float depth = surface - act.y;

  // Layers bend with noise so they look geological.
  vec2 p = vWorld.xy;
  float bent = depth + noise(p * vec2(0.055, 0.09)) * 4.0 + noise(p * 0.23) * 1.3 - 2.6;
  vec3 col = vec3(0.58, 0.43, 0.23);                          // loose sand
  col = layer(col, vec3(0.45, 0.29, 0.15), bent, 5.0);       // packed ochre
  col = layer(col, vec3(0.35, 0.17, 0.11), bent, 12.0);      // red clay
  col = layer(col, vec3(0.23, 0.15, 0.19), bent, 19.0);      // dark shale
  col = layer(col, vec3(0.12, 0.13, 0.19), bent, 25.0);      // cold deep rock

  col += 0.025 * sin(bent * 4.2 + noise(p * 0.4) * 3.0);      // sediment ripples
  col += (noise(p * 3.5) - 0.5) * 0.09;                       // grain
  vec2 small = stones(p, 1.7, 0.4);
  col = mix(col, col * (0.65 + 0.85 * small.y), small.x);
  vec2 big = stones(p + 11.0, 6.5, 0.35);
  col = mix(col, vec3(0.30, 0.25, 0.22) * (0.55 + 0.8 * big.y), big.x * 0.85);
  col *= 1.0 - 0.25 * clamp(depth / 34.0, 0.0, 1.0);          // darker with depth

  // Dashed depth line every 7 m, to read depth and speed at a glance.
  float toLine = abs(mod(depth + 3.5, 7.0) - 3.5);
  float dash = step(0.5, fract(act.x / 3.0));
  col += vec3(0.16, 0.13, 0.09) * (1.0 - smoothstep(0.04, 0.12, toLine)) * dash * step(3.0, depth);

  // Bedrock below the dig limit, with a glowing edge.
  // The limit applies to the head centre, so draw the rock a body radius lower.
  float below = uMaxDepth - 1.4 - act.y + (noise(vec2(act.x * 0.45, 0.0)) - 0.7) * 0.8;
  if (below > 0.0) {
    float crack = abs(noise(p * 0.33) - noise(p * 0.51 + 5.0));
    col = vec3(0.055, 0.05, 0.065) + 0.05 * noise(p * 0.8);
    col += vec3(0.45, 0.16, 0.04) * (1.0 - smoothstep(0.0, 0.025, crack)) * (0.55 + 0.25 * sin(uTime * 1.6 + act.x * 0.1));
  }
  col += vec3(0.85, 0.38, 0.1) * (1.0 - smoothstep(0.0, 0.35, abs(below)));

  // Bright sand crust at the surface.
  col = mix(vec3(0.95, 0.76, 0.45), col, smoothstep(0.05, 0.6, depth));

  // Warm light around the worm head.
  vec2 toWorm = act - uWorm;
  float halo = exp(-dot(toWorm, toWorm) / 55.0);
  col += uGlow * halo * (vec3(0.16, 0.10, 0.04) + col * 0.45);

  gl_FragColor = vec4(col, 1.0);
}
`;

/** Cutaway wall behind the worm that shows what is under the sand. */
export class Underground {
  readonly mesh: THREE.Mesh;
  private readonly uniforms = {
    uWorm: { value: new THREE.Vector2() },
    uMaxDepth: { value: SIM_CONFIG.maxDepth as number },
    uGlow: { value: VIEW_CONFIG.undergroundGlow },
    uTime: { value: 0 },
  };

  constructor() {
    const geo = new THREE.PlaneGeometry(WALL_WIDTH, WALL_TOP - WALL_BOTTOM);
    const mat = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader, fragmentShader });
    this.mesh = new THREE.Mesh(geo, mat);
  }

  /** The wall travels with the camera; the pattern is in world space, so it stays put. */
  update(cameraX: number, pose: Pose, time: number): void {
    this.mesh.position.set(cameraX, (WALL_TOP + WALL_BOTTOM) / 2, WALL_Z);
    this.uniforms.uWorm.value.set(pose.x, pose.y);
    this.uniforms.uMaxDepth.value = SIM_CONFIG.maxDepth;
    this.uniforms.uGlow.value = VIEW_CONFIG.undergroundGlow;
    this.uniforms.uTime.value = time;
  }
}
