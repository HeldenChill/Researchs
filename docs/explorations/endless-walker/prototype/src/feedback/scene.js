import * as THREE from 'three';
import { heightAt, zoneAt, LANDMARK } from '../terrain.js';

export function createScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c9d6e6');
  scene.fog = new THREE.Fog(0xc9d6e6, 700, 3800);

  // Terrain mesh
  const width = 1600; // x: -800 to 800
  const depth = 1900; // z: -800 to 1100
  const nx = 533;
  const nz = 633;
  const geometry = new THREE.PlaneGeometry(width, depth, nx, nz);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, 150);

  const pos = geometry.attributes.position;
  const colors = [];
  const colorSnowLow = new THREE.Color('#eef3f9');
  const colorSnowHigh = new THREE.Color('#ffffff');
  const colorSteep = new THREE.Color('#9fb2c8');
  const colorRock = new THREE.Color('#4a4e56');
  const c = new THREE.Color();
  const e = 0.5;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const vy = heightAt(vx, vz);
    pos.setY(i, vy);

    const zone = zoneAt(vx, vz);
    if (zone === 'cliff' || zone === 'rock') {
      c.copy(colorRock);
    } else {
      // Brighter with height, bluer with steepness, plus grain so movement reads.
      c.copy(colorSnowLow).lerp(colorSnowHigh, Math.min(1, vy / 320));
      const gx = (heightAt(vx + e, vz) - heightAt(vx - e, vz)) / (2 * e);
      const gz = (heightAt(vx, vz + e) - heightAt(vx, vz - e)) / (2 * e);
      const steep = Math.min(1, Math.atan(Math.hypot(gx, gz)) / (40 * Math.PI / 180));
      c.lerp(colorSteep, steep * 0.55);
    }
    const grain = 1 + (grainHash(vx, vz) - 0.5) * 0.08;
    colors.push(c.r * grain, c.g * grain, c.b * grain);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const terrainMat = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: false
  });
  const terrainMesh = new THREE.Mesh(geometry, terrainMat);
  scene.add(terrainMesh);

  // Sky gradient sphere
  const skyGeo = new THREE.SphereGeometry(3900, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color('#6d93c7') },
      bottomColor: { value: new THREE.Color('#f6d8b8') }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyMesh);

  // Lights
  const hemi = new THREE.HemisphereLight(0xdde8f5, 0x8a9bb0, 0.45);
  scene.add(hemi);

  // Low sun from the side (+x) so slopes get a lit and a shaded face.
  const sun = new THREE.DirectionalLight(0xffe8cc, 2.2);
  sun.position.set(500, 160, 100);
  scene.add(sun);
  scene.add(sun.target);

  // Ground detail: boulders and route poles. Scenery only.
  addBoulders(scene);
  addRoutePoles(scene);

  // Far ranges: 30 grey-blue cones
  const coneMat = new THREE.MeshLambertMaterial({ color: 0x9aaec4, flatShading: true });
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const r = 2500 + ((i * 179) % 1000);
    const coneH = 900 + ((i * 313) % 600);
    const coneR = 400 + ((i * 73) % 250);
    const coneGeo = new THREE.ConeGeometry(coneR, coneH, 7);
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    const cx = r * Math.sin(angle);
    const cz = r * Math.cos(angle);
    coneMesh.position.set(cx, coneH / 2 - 100, cz);
    scene.add(coneMesh);
  }

  // Landmark cone
  const landmarkGeo = new THREE.ConeGeometry(700, LANDMARK.height, 32);
  const landmarkMat = new THREE.MeshLambertMaterial({ color: 0xf2f6fb, flatShading: false });
  const landmarkMesh = new THREE.Mesh(landmarkGeo, landmarkMat);
  landmarkMesh.position.set(LANDMARK.x, LANDMARK.height / 2, LANDMARK.z);
  scene.add(landmarkMesh);

  return {
    scene,
    sun,
    hemi,
    update(feel) {
      if (!feel) return;
      sun.intensity = feel.sunIntensity;
      hemi.intensity = feel.fillIntensity;
      scene.fog.near = feel.fogNear;
      scene.fog.far = feel.fogFar;
    }
  };
}

function grainHash(x, z) {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

function addBoulders(scene) {
  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = new THREE.MeshLambertMaterial({ color: 0x5a5f68, flatShading: true });
  const count = 300;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  let placed = 0;
  for (let i = 0; placed < count && i < count * 4; i++) {
    const x = (grainHash(i, 1) - 0.5) * 900;
    const z = -640 + grainHash(i, 2) * 1250;
    const r = Math.hypot(x, z);
    if (r < 14 || Math.abs(x) < 6) continue; // keep summit and centre line clear
    if (r > 66 && r < 98 && z < 0) continue; // keep cliff band clear
    const s = 0.4 + grainHash(i, 3) * 1.4;
    p.set(x, heightAt(x, z) + s * 0.3, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), grainHash(i, 4) * 6.28);
    sc.set(s, s * 0.7, s);
    m.compose(p, q, sc);
    mesh.setMatrixAt(placed++, m);
  }
  mesh.count = placed;
  scene.add(mesh);
}

function addRoutePoles(scene) {
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x333840 });
  const flagGeo = new THREE.BoxGeometry(0.5, 0.3, 0.02);
  const flagMat = new THREE.MeshLambertMaterial({ color: 0xd8462b });
  const addPole = (x, z) => {
    const y = heightAt(x, z);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, y + 1.1, z);
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(x + 0.25, y + 2.0, z);
    scene.add(pole, flag);
  };
  // Approach every 50 m, offset 3 m from the centre line; slide face every 50 m.
  for (let z = -650; z <= -100; z += 50) addPole(3, z);
  for (let z = 50; z <= 600; z += 50) addPole(3, z);
}
