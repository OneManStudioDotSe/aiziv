import * as THREE from 'three';

export default class BarsVisualizer {
    constructor() {
        this.group = null;
        this.bars = [];
        this.barCount = 64;
        this.params = { speed: 3 };
        this.palette = [0x00ffcc, 0xff3e00];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.bars.length > 0) {
            this.bars.forEach((bar, i) => {
                const color = new THREE.Color(this.palette[i % this.palette.length]);
                bar.material.color.copy(color);
            });
        }
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        
        for (let i = 0; i < this.barCount; i++) {
            const color = new THREE.Color(this.palette[i % this.palette.length]);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: 0x000000,
                roughness: 0.3,
                metalness: 0.2
            });

            const bar = new THREE.Mesh(geometry, material);
            const angle = (i / this.barCount) * Math.PI * 2;
            const radius = 4;
            bar.position.x = Math.cos(angle) * radius;
            bar.position.z = Math.sin(angle) * radius;
            bar.rotation.y = -angle;

            this.bars.push(bar);
            this.group.add(bar);
        }

        camera.position.set(0, 8, 12);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        const volume = audio.getVolume();
        const lerpSpeed = this.params.speed * 0.05;

        this.group.rotation.y += 0.002 * this.params.speed;

        if (data) {
            for (let i = 0; i < this.barCount; i++) {
                const bin = Math.floor(i * (data.length / 4) / this.barCount);
                const ratio = data[bin] / 255;
                const targetScale = Math.max(0.1, ratio * 12);
                this.bars[i].scale.y = THREE.MathUtils.lerp(this.bars[i].scale.y, targetScale, lerpSpeed);
                this.bars[i].position.y = this.bars[i].scale.y / 2;
                this.bars[i].material.emissiveIntensity = ratio * 2;
            }
        }
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.bars.forEach(bar => {
                bar.geometry.dispose();
                bar.material.dispose();
            });
            this.bars = [];
            this.group = null;
        }
    }
}
