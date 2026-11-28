import * as THREE from 'three';
import { SIM_CONFIG } from '../sim/config.ts';
import { preyBodyPoints } from '../sim/prey.ts';
import type { SimState } from '../sim/types.ts';

export class PreyVisual {
  readonly group = new THREE.Group();
  private readonly meshesById = new Map<number, THREE.Mesh[]>();
  private readonly geo = new THREE.SphereGeometry(SIM_CONFIG.preySegmentRadius, 10, 8);
  private readonly headMat = new THREE.MeshStandardMaterial({ color: 0x8a6e45, roughness: 0.7 });
  private readonly bodyMat = new THREE.MeshStandardMaterial({ color: 0xc9b48a, roughness: 0.7 });

  update(state: SimState): void {
    for (const p of state.prey) {
      let segs = this.meshesById.get(p.id);
      if (!segs) {
        segs = [];
        for (let i = 0; i < SIM_CONFIG.preySegments; i++) {
          const mesh = new THREE.Mesh(this.geo, i === 0 ? this.headMat : this.bodyMat);
          this.group.add(mesh);
          segs.push(mesh);
        }
        this.meshesById.set(p.id, segs);
      }

      const pts = p.alive ? preyBodyPoints(p) : [];
      for (let i = 0; i < segs.length; i++) {
        const mesh = segs[i]!;
        const visible = p.alive && i < p.sections && i < pts.length;
        mesh.visible = visible;
        if (visible) {
          const pt = pts[i]!;
          mesh.position.set(pt.x, pt.y, 0);
        }
      }
    }
  }
}
