import * as THREE from 'three';

export default class PrezRingsVisualizer {
    constructor() {
        this.group = null;
        this.rings = [];
        this.ringCount = 12;
        this.params = { speed: 3 };
        this.palette = [0xff3e00, 0x00ffcc];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.rings.forEach((ring, i) => {
            ring.material.color.setHex(this.palette[i % this.palette.length]);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        for (let i = 0; i < this.ringCount; i++) {
            const geo = new THREE.TorusGeometry(i * 0.8 + 1, 0.05, 16, 100);
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                wireframe: false
            });
            const ring = new THREE.Mesh(geo, mat);
            this.rings.push(ring);
            this.group.add(ring);
        }

        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        const speedMult = this.params.speed * 0.005;

        this.rings.forEach((ring, i) => {
            const bin = i * 10;
            const ratio = data ? data[bin] / 255 : 0;
            
            const targetScale = 1 + ratio * 2;
            ring.scale.setScalar(THREE.MathUtils.lerp(ring.scale.x, targetScale, 0.1));
            
            ring.rotation.z += (i % 2 === 0 ? 1 : -1) * speedMult * (i + 1) * 0.2;
            ring.rotation.x = Math.sin(time * 0.001) * 0.2;
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.rings.forEach(r => {
                r.geometry.dispose();
                r.material.dispose();
            });
            this.rings = [];
            this.group = null;
        }
    }
}
