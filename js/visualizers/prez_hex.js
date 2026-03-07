import * as THREE from 'three';

export default class PrezHexVisualizer {
    constructor() {
        this.group = null;
        this.hexes = [];
        this.params = { speed: 3 };
        this.palette = [0xffcc00, 0x000000];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geo = new THREE.CylinderGeometry(0.6, 0.6, 1, 6);
        const count = 6;
        for (let q = -count; q <= count; q++) {
            for (let r = -count; r <= count; r++) {
                if (Math.abs(q + r) > count) continue;

                const mat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.4,
                    roughness: 0.2
                });
                const hex = new THREE.Mesh(geo, mat);
                
                // Hexagonal grid positioning
                const x = 1.1 * (q + r / 2);
                const z = 1.1 * (Math.sqrt(3) / 2) * r;
                hex.position.set(x, 0, z);
                
                this.hexes.push(hex);
                this.group.add(hex);
            }
        }

        camera.position.set(8, 8, 8);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        const speedMult = this.params.speed * 0.05;
        const col1 = new THREE.Color(this.palette[0]);
        const col2 = new THREE.Color(this.palette[1] || 0x333333);

        this.hexes.forEach((hex, i) => {
            const dist = hex.position.length();
            const bin = Math.floor(dist * 10) % 128;
            const ratio = data ? data[bin] / 255 : 0;
            
            const targetY = 0.1 + ratio * 6;
            hex.scale.y = THREE.MathUtils.lerp(hex.scale.y, targetY, speedMult);
            hex.position.y = hex.scale.y / 2;
            
            hex.material.color.copy(col1).lerp(col2, ratio);
        });

        this.group.rotation.y += 0.002 * this.params.speed;
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.hexes.forEach(h => {
                h.geometry.dispose();
                h.material.dispose();
            });
            this.hexes = [];
            this.group = null;
        }
    }
}
