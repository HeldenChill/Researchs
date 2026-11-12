import * as THREE from 'three';

// Hook cord drawn as a thin 3D cylinder (WebGL ignores Line linewidth, so a Line is always 1 px).
// Shows a shot animation on every fire: the tip flies out to the target (hit) or to max range (miss),
// then a miss reels back. While Hooked the cord spans walker to anchor with a short tension wobble.
export function createRope(scene) {
  const SEGMENTS = 16;
  const SHOT_SPEED = 220; // m/s, tip travel
  const RETRACT_SPEED = 160;

  const cordMat = new THREE.MeshLambertMaterial({ color: 0x2b2420 });
  const segGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6, 1, true);
  segGeo.translate(0, 0.5, 0);
  segGeo.rotateX(Math.PI / 2); // length along +z
  const segs = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const m = new THREE.Mesh(segGeo, cordMat);
    m.visible = false;
    scene.add(m);
    segs.push(m);
  }
  const tipMat = new THREE.MeshLambertMaterial({ color: 0x9aa3ad });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), tipMat);
  tip.visible = false;
  scene.add(tip);

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const pts = Array.from({ length: SEGMENTS + 1 }, () => new THREE.Vector3());

  let shot = null; // { target: Vector3, hit: bool, travelled, length, retracting }

  function hideAll() {
    for (const s of segs) s.visible = false;
    tip.visible = false;
  }

  function drawCord(from, to, wobble, perp) {
    for (let i = 0; i <= SEGMENTS; i++) {
      const f = i / SEGMENTS;
      const arc = Math.sin(f * Math.PI) * wobble;
      pts[i].lerpVectors(from, to, f).addScaledVector(perp, arc);
    }
    for (let i = 0; i < SEGMENTS; i++) {
      const s = segs[i];
      const len = pts[i].distanceTo(pts[i + 1]);
      s.visible = len > 1e-4;
      s.position.copy(pts[i]);
      s.lookAt(pts[i + 1]);
      s.scale.set(1, 1, len);
    }
    tip.visible = true;
    tip.position.copy(to);
    tip.lookAt(from);
    tip.rotateX(-Math.PI / 2);
  }

  return {
    // fire: { origin: {x,y,z}, dir: {x,y,z}, hit: {x,y,z} | null, range } on the frame the button is pressed, else null
    update(state, feel, dt, fire) {
      a.set(state.pos.x, state.pos.y + 1.2, state.pos.z);

      if (fire) {
        const target = fire.hit
          ? new THREE.Vector3(fire.hit.x, fire.hit.y, fire.hit.z)
          : new THREE.Vector3(
              fire.origin.x + fire.dir.x * fire.range,
              fire.origin.y + fire.dir.y * fire.range,
              fire.origin.z + fire.dir.z * fire.range
            );
        shot = { target, hit: !!fire.hit, travelled: 0, retracting: false };
      }

      const perp = new THREE.Vector3(0, 1, 0);

      if (state.mode === 'Hooked' && state.hookAnchor) {
        b.set(state.hookAnchor.x, state.hookAnchor.y, state.hookAnchor.z);
        const full = a.distanceTo(b);
        // Finish the fly-out animation first, then show the taut cord.
        if (shot && shot.hit && shot.travelled < full) {
          shot.travelled += SHOT_SPEED * dt;
          const f = Math.min(1, shot.travelled / Math.max(full, 1e-3));
          drawCord(a, new THREE.Vector3().lerpVectors(a, b, f), 0, perp);
          return;
        }
        shot = null;
        const t = state.modeTime;
        const wobble = Math.max(0, 1 - t / 0.3) * Math.sin(t * 35) * 0.25;
        perp.set(-(b.z - a.z), 0, b.x - a.x).normalize();
        drawCord(a, b, wobble, perp);
        return;
      }

      if (shot) {
        const full = a.distanceTo(shot.target);
        if (!shot.retracting) {
          shot.travelled += SHOT_SPEED * dt;
          if (shot.travelled >= full) {
            shot.travelled = full;
            shot.retracting = true; // a hit that did not become Hooked also reels back
          }
        } else {
          shot.travelled -= RETRACT_SPEED * dt;
          if (shot.travelled <= 0) {
            shot = null;
            hideAll();
            return;
          }
        }
        const f = Math.min(1, shot.travelled / Math.max(full, 1e-3));
        drawCord(a, new THREE.Vector3().lerpVectors(a, shot.target, f), 0, perp);
        return;
      }

      hideAll();
    }
  };
}
