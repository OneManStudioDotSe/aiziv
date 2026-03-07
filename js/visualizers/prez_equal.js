import * as THREE from 'three';

export default class PrezEqualVisualizer {
    constructor() {
        this.group = null;
        this.bars = [];
        this.count = 70;
        this.params = { speed: 3 };
        this.palette = [0x000000];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.bars.forEach((b, i) => {
            b.material.color.setHex(this.palette[i % this.palette.length]);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const aspect = window.innerWidth / window.innerHeight;
        const width = 20 * aspect;
        const barWidth = width / this.count;

        for (let i = 0; i < this.count; i++) {
            const geo = new THREE.PlaneGeometry(barWidth * 0.8, 1);
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                side: THREE.DoubleSide
            });
            const bar = new THREE.Mesh(geo, mat);
            bar.position.x = (i * barWidth) - (width / 2) + (barWidth / 2);
            this.bars.push(bar);
            this.group.add(bar);
        }
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        const maxVal = Math.max(...data);
        const height = 20;

        this.bars.forEach((bar, i) => {
            const val = data[i % data.length];
            const ratio = val / (maxVal || 1);
            
            // Vertical expansion from bottom
            bar.scale.y = ratio * height;
            bar.position.y = (bar.scale.y / 2) - (height / 2);
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.bars.forEach(b => {
                b.geometry.dispose();
                b.material.dispose();
            });
            this.group = null;
        }
    }
}
