import * as THREE from 'three';

export default class PrezChopVisualizer {
    constructor() {
        this.group = null;
        this.bars = [];
        this.count = 23;
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
        const height = 20;
        const barHeight = height / this.count;

        for (let i = 0; i < this.count; i++) {
            const geo = new THREE.PlaneGeometry(width, barHeight * 0.8);
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                side: THREE.DoubleSide
            });
            const bar = new THREE.Mesh(geo, mat);
            bar.position.y = (i * barHeight) - (height / 2) + (barHeight / 2);
            this.bars.push(bar);
            this.group.add(bar);
        }
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        const maxVal = Math.max(...data);
        const aspect = window.innerWidth / window.innerHeight;
        const fullWidth = 20 * aspect;

        this.bars.forEach((bar, i) => {
            const val = data[i % data.length];
            const ratio = val / (maxVal || 1);
            
            // Bars expand from center — exaggerated chop effect
            bar.scale.x = 0.05 + ratio * 1.2;

            // Bold horizontal slide with alternating direction per bar
            const dir = i % 2 === 0 ? 1 : -1;
            bar.position.x = dir * Math.sin(time * 0.001 * this.params.speed + i * 0.5) * (ratio * 5);
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
