import * as THREE from 'three';

export default class PrezSpinVisualizer {
    constructor() {
        this.group = null;
        this.arcs = [];
        this.params = { speed: 3 };
        this.palette = [0x000000];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.arcs.forEach((a, i) => {
            a.material.color.setHex(this.palette[i % this.palette.length]);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        for (let i = 0; i < 15; i++) {
            const inner = 1 + i * 0.6;
            const outer = inner + 0.3;
            // Party-mode uses specific arc lengths
            const arcLength = (Math.PI * 2) * (0.1 + Math.random() * 0.5);
            const geo = new THREE.RingGeometry(inner, outer, 64, 1, 0, arcLength);
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const arc = new THREE.Mesh(geo, mat);
            arc.rotation.z = Math.random() * Math.PI * 2;
            this.arcs.push(arc);
            this.group.add(arc);
        }
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        const maxVal = Math.max(...data);
        const speedMult = this.params.speed * 0.005;

        this.arcs.forEach((arc, i) => {
            const val = data[i % data.length];
            const ratio = val / (maxVal || 1);
            
            // Replicate the constant spin + audio reaction
            arc.rotation.z += (i % 2 === 0 ? 1 : -1) * speedMult * (1 + ratio * 2);
            
            // Audio pulses the scale slightly
            const s = 1 + ratio * 0.2;
            arc.scale.set(s, s, 1);
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.arcs.forEach(a => {
                a.geometry.dispose();
                a.material.dispose();
            });
            this.group = null;
        }
    }
}
