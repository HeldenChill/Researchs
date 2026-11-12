import * as THREE from 'three';

export function createBody(scene) {
  const group = new THREE.Group();

  const jacketMat = new THREE.MeshLambertMaterial({ color: 0x334d66 });
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x223344 });
  const packMat = new THREE.MeshLambertMaterial({ color: 0x8d5b4c });
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0b896 });

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Head
  const headGeo = new THREE.BoxGeometry(0.3, 0.32, 0.3);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.6;
  group.add(head);

  // Backpack
  const packGeo = new THREE.BoxGeometry(0.45, 0.55, 0.2);
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.set(0, 1.05, -0.22);
  group.add(pack);

  // Left Leg Pivot
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.15, 0.7, 0);
  const legGeo = new THREE.BoxGeometry(0.18, 0.7, 0.2);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.35;
  leftLegPivot.add(leftLegMesh);
  group.add(leftLegPivot);

  // Right Leg Pivot
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.15, 0.7, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.35;
  rightLegPivot.add(rightLegMesh);
  group.add(rightLegPivot);

  // Left Arm Pivot
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.35, 1.35, 0);
  const armGeo = new THREE.BoxGeometry(0.14, 0.6, 0.16);
  const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
  leftArmMesh.position.y = -0.3;
  leftArmPivot.add(leftArmMesh);
  group.add(leftArmPivot);

  // Right Arm Pivot
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.35, 1.35, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
  rightArmMesh.position.y = -0.3;
  rightArmPivot.add(rightArmMesh);
  group.add(rightArmPivot);

  scene.add(group);

  let prevHeading = 0;

  return {
    group,
    update(state, config, dt) {
      group.position.set(state.pos.x, state.pos.y, state.pos.z);
      group.rotation.order = 'YXZ'; // yaw first, then pitch and roll in the body frame
      group.rotation.y = state.heading;
      group.rotation.z = 0;
      group.rotation.x = 0;
      torso.position.y = 1.05;
      head.position.y = 1.6;
      leftLegPivot.rotation.z = 0;
      rightLegPivot.rotation.z = 0;

      // Backpack depth sizing from load: 0 to 60 -> 0.2 to 0.6 m deep (scale 1 to 3)
      const loadScale = 1 + (Math.max(0, Math.min(60, state.load)) / 60) * 2;
      pack.scale.z = loadScale;
      pack.position.z = -0.15 - 0.1 * loadScale;

      // Calculate steer rate for lean
      let headingDiff = (state.heading - prevHeading) / Math.max(dt, 0.001);
      prevHeading = state.heading;

      // Wobble if balance < 70
      let wobble = 0;
      if (state.balance < 70) {
        const wobbleFactor = (70 - state.balance) / 70;
        wobble = Math.sin(performance.now() * 0.015) * wobbleFactor * 0.35;
      }

      if (state.mode === 'OnFoot') {
        // Forward lean uphill
        const uphillLean = (0.4 + state.load / 100) * 0.3;
        torso.rotation.x = uphillLean;
        torso.rotation.z = wobble;
        head.rotation.x = -uphillLean * 0.5;

        // Leg and arm swing from steps
        const usable = config.staminaMax - state.load;
        const tired = state.stamina < 0.25 * usable;
        const swingAmp = tired ? 0.35 : 0.75;
        const phase = state.steps * Math.PI * 2;

        leftLegPivot.rotation.x = Math.sin(phase) * swingAmp;
        rightLegPivot.rotation.x = -Math.sin(phase) * swingAmp;
        leftArmPivot.rotation.x = -Math.sin(phase) * swingAmp * 0.7;
        rightArmPivot.rotation.x = Math.sin(phase) * swingAmp * 0.7;
        leftArmPivot.rotation.z = 0;
        rightArmPivot.rotation.z = 0;

      } else if (state.mode === 'OnWall') {
        // Flat to face, arms up
        torso.rotation.x = 0;
        torso.rotation.z = 0;
        head.rotation.x = -0.3;
        leftArmPivot.rotation.x = Math.PI * 0.85;
        rightArmPivot.rotation.x = Math.PI * 0.85;
        leftArmPivot.rotation.z = -0.2;
        rightArmPivot.rotation.z = 0.2;
        leftLegPivot.rotation.x = 0.1;
        rightLegPivot.rotation.x = -0.1;

      } else if (state.mode === 'Sliding') {
        // Surf stance: turned side-on to the slope, low crouch, legs apart, arms out for balance.
        const carve = Math.max(-0.5, Math.min(0.5, -headingDiff * 0.18));
        group.rotation.y = state.heading + 1.15;
        group.rotation.z = carve * 0.6 + wobble * 0.5; // lean into the turn
        group.position.y = state.pos.y - 0.28;
        torso.position.y = 0.95;
        head.position.y = 1.48;
        torso.rotation.x = 0.35;
        torso.rotation.z = -0.15;
        head.rotation.x = -0.25;
        leftLegPivot.rotation.x = -0.35;
        rightLegPivot.rotation.x = 0.35;
        leftLegPivot.rotation.z = -0.38;
        rightLegPivot.rotation.z = 0.38;
        leftArmPivot.rotation.x = -0.2;
        rightArmPivot.rotation.x = 0.3;
        leftArmPivot.rotation.z = -1.15 - carve;
        rightArmPivot.rotation.z = 1.15 - carve;

      } else if (state.mode === 'Hooked' || state.mode === 'InAir') {
        // Flight: body pitched along velocity. Hooked: arms reach forward along the cord, legs trail.
        const v = state.vel || { x: 0, y: 0, z: 0 };
        const hs = Math.hypot(v.x, v.z);
        const sp = Math.hypot(hs, v.y);
        if (hs > 0.5) group.rotation.y = Math.atan2(v.x, v.z);
        const pitch = sp > 2 ? Math.atan2(hs, Math.max(-sp, Math.min(sp, v.y))) : 0.3; // 0 = upright
        group.rotation.x = Math.max(0, Math.min(1.35, pitch * 0.8));
        group.rotation.z = Math.max(-0.5, Math.min(0.5, -headingDiff * 0.12));
        torso.rotation.x = 0;
        torso.rotation.z = 0;
        head.rotation.x = -0.5;
        if (state.mode === 'Hooked') {
          leftArmPivot.rotation.x = -2.6;
          rightArmPivot.rotation.x = -2.4;
          leftArmPivot.rotation.z = -0.15;
          rightArmPivot.rotation.z = 0.15;
          leftLegPivot.rotation.x = 0.45;
          rightLegPivot.rotation.x = 0.25;
        } else {
          // Free flight after release: arms out, knees tucked
          leftArmPivot.rotation.x = -0.6;
          rightArmPivot.rotation.x = -0.6;
          leftArmPivot.rotation.z = -1.0;
          rightArmPivot.rotation.z = 1.0;
          leftLegPivot.rotation.x = -0.8;
          rightLegPivot.rotation.x = -0.5;
        }

      } else if (state.mode === 'Fallen') {
        // Rolled on side
        group.rotation.z = Math.PI / 2;
        group.position.y = state.pos.y + 0.25;
        leftLegPivot.rotation.x = 0.3;
        rightLegPivot.rotation.x = -0.4;
        leftArmPivot.rotation.x = 0.2;
        rightArmPivot.rotation.x = -0.3;
      }
    }
  };
}
