import * as THREE from 'three';

export default class PrezDiagonalVisualizer {
    constructor() {
        this.group = null;
        this.bands = [];
        this.count = 40;
        this.params = { speed: 3 };
        this.palette = [0xff3e00, 0x00ffcc, 0xffffff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.bands.forEach((b, i) => {
            const col = new THREE.Color(this.palette[i % this.palette.length]);
            b.material.color.copy(col);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        // Long planes to cover the screen at a 45deg angle
        const aspect = window.innerWidth / window.innerHeight;
        const size = 40; 
        const geo = new THREE.PlaneGeometry(size * 2, 1.0);

        for (let i = 0; i < this.count; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                transparent: true,
                opacity: 0.25,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const band = new THREE.Mesh(geo, mat);
            
            // Rotate to diagonal
            band.rotation.z = Math.PI / 4;
            
            // Distribute across the screen
            band.position.x = (i - this.count / 2) * 1.2;
            band.position.y = (i - this.count / 2) * -0.5;
            band.position.z = -i * 0.01;

            this.bands.push(band);
            this.group.add(band);
        }

        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        const maxVal = Math.max(...data);
        const speedMult = this.params.speed * 0.001;

        this.bands.forEach((band, i) => {
            const binIndex = Math.floor(i * (data.length / this.count) * 0.5);
            const val = data[binIndex] / 255;
            
            // Expand width based on audio — wilder amplitude
            const targetScaleY = 1 + val * 30;
            band.scale.y = THREE.MathUtils.lerp(band.scale.y, targetScaleY, 0.15);

            // Aggressive diagonal slide movement
            band.position.x += Math.sin(time * speedMult + i * 0.7) * 0.05;
            band.position.y += Math.cos(time * speedMult * 0.5 + i * 0.3) * 0.02;
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.bands.forEach(b => {
                b.geometry.dispose();
                b.material.dispose();
            });
            this.group = null;
        }
    }
}
