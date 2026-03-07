import * as THREE from 'three';

export default class PlasmaVisualizer {
    constructor() {
        this.points = null;
        this.particleCount = 5000;
        this.params = { speed: 3 };
        this.palette = [0x00ffcc, 0xff3e00, 0x8800ff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
    }

    init(scene, camera, renderer) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
        camera.position.z = 15;
    }

    update(audio, time) {
        if (!this.points) return;

        const data = audio.getFrequencyData();
        const volume = audio.getVolume();
        const speedMult = this.params.speed * 0.001;
        
        const positions = this.points.geometry.attributes.position.array;
        const colors = this.points.geometry.attributes.color.array;

        const col1 = new THREE.Color(this.palette[0]);
        const col2 = new THREE.Color(this.palette[1]);

        for (let i = 0; i < this.particleCount; i++) {
            const bin = i % 128;
            const ratio = data ? data[bin] / 255 : 0;
            
            positions[i * 3 + 1] += Math.sin(time * speedMult + i) * 0.01;
            
            // Interpolate between palette colors
            const mixedColor = col1.clone().lerp(col2, ratio);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        this.points.geometry.attributes.position.needsUpdate = true;
        this.points.geometry.attributes.color.needsUpdate = true;
        this.points.rotation.y += speedMult;
    }

    dispose(scene) {
        if (this.points) {
            scene.remove(this.points);
            this.points.geometry.dispose();
            this.points.material.dispose();
            this.points = null;
        }
    }
}
