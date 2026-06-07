import * as THREE from 'three';

export default class PrezEqualVisualizer {
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
        const barWidth = width / this.count;

        for (let i = 0; i < this.count; i++) {
            const geo = new THREE.PlaneGeometry(barWidth * 0.8, 1);
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
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
        const col1 = new THREE.Color(this.palette[0]);
        const col2 = new THREE.Color(this.palette[this.palette.length - 1]);

        this.bars.forEach((bar, i) => {
            const val = data[i % data.length];
            const ratio = val / (maxVal || 1);

            // Bars grow symmetrically from center — distinct from Chop's one-sided expand
            bar.scale.y = Math.max(0.05, ratio * height);
            bar.position.y = 0;

            // Color shifts low→high based on amplitude
            bar.material.color.copy(col1).lerp(col2, ratio);
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
