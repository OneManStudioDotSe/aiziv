import * as THREE from 'three';

export default class PrezCircleVisualizer {
    constructor() {
        this.group = null;
        this.circles = [];
        this.count = 50; // Total number of layers
        this.params = { speed: 3 };
        this.palette = [0xff3e00, 0x00ffcc, 0xffffff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.circles.forEach((c, i) => {
            // Map palette colors across the layers
            const col = new THREE.Color(this.palette[i % this.palette.length]);
            c.material.color.copy(col);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        // We use CircleGeometry for solid disks
        const geo = new THREE.CircleGeometry(1, 64);

        for (let i = 0; i < this.count; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                transparent: true,
                opacity: 0.2, // Low opacity for beautiful overlapping colors
                side: THREE.DoubleSide,
                depthWrite: false // Crucial for clean transparency layering
            });

            const circle = new THREE.Mesh(geo, mat);
            // Stack them slightly in Z so they don't Z-fight, 
            // but keep them effectively "flat"
            circle.position.z = -i * 0.01; 
            
            this.circles.push(circle);
            this.group.add(circle);
        }

        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        // The original logic maps higher indices to smaller circles
        // We iterate backwards to ensure smaller ones are logically "above"
        for (let i = 0; i < this.count; i++) {
            const circle = this.circles[i];
            
            // Map bin to frequency data (skip some bins for variety)
            const binIndex = Math.floor(i * (data.length / this.count) * 0.5);
            const val = data[binIndex] / 255;
            
            // Exact visual mapping: low frequencies = huge circles, high = small sharp ones
            // Base size + frequency-driven expansion
            const baseSize = (this.count - i) * 0.2;
            const targetScale = baseSize + (val * 10);
            
            // Smooth lerp for the "liquid" motion feel
            const s = THREE.MathUtils.lerp(circle.scale.x, targetScale, 0.1 * (this.params.speed / 3));
            circle.scale.set(s, s, 1);
            
            // Very subtle rotation jitter as seen in original
            circle.rotation.z += (i % 2 === 0 ? 1 : -1) * 0.001 * this.params.speed;
        }
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.circles.forEach(c => {
                c.geometry.dispose();
                c.material.dispose();
            });
            this.group = null;
        }
    }
}
