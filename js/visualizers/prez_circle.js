import * as THREE from 'three';

export default class PrezCircleVisualizer {
    static descriptor = {
        id: 'prez_circle',
        name: 'Circle',
        group: 'PREZIOTTE',
        perspective: '2d',
        camera: { preset: 'front-2d', orbitEnabled: false },
        audio: { usesFrequency: true, usesWaveform: false, frequencyFocus: 'bass+mid' },
    };

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
            c.material.color.copy(this._colorAt(i));
        });
    }

    _colorAt(i) {
        // Smooth gradient that interpolates through the full palette
        const t = i / this.count;
        const scaled = t * this.palette.length;
        const fromIdx = Math.floor(scaled) % this.palette.length;
        const toIdx = (fromIdx + 1) % this.palette.length;
        return new THREE.Color(this.palette[fromIdx]).lerp(new THREE.Color(this.palette[toIdx]), scaled % 1);
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        // We use CircleGeometry for solid disks
        const geo = new THREE.CircleGeometry(1, 64);

        for (let i = 0; i < this.count; i++) {
            // Vary opacity: outer circles faint, inner circles bold
            const opacity = 0.08 + (i / this.count) * 0.35;
            const mat = new THREE.MeshBasicMaterial({
                color: this._colorAt(i),
                transparent: true,
                opacity,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const circle = new THREE.Mesh(geo, mat);
            // Stack them slightly in Z so they don't Z-fight, 
            // but keep them effectively "flat"
            circle.position.z = -i * 0.01; 
            
            this.circles.push(circle);
            this.group.add(circle);
        }

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
