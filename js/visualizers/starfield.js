import * as THREE from 'three';

export default class StarfieldVisualizer {
    constructor() {
        this.group = null;
        this.starCount = 1000;
        this.stars = [];
        this.speeds = [];
        this.params = { speed: 3 };
        this.palette = [0xffffff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.stars.length > 0) {
            this.stars.forEach(star => {
                star.material.color.setHex(this.palette[0]);
            });
        }
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        
        for (let i = 0; i < this.starCount; i++) {
            const material = new THREE.MeshBasicMaterial({ color: this.palette[0] });
            const star = new THREE.Mesh(geometry, material);
            star.position.x = (Math.random() - 0.5) * 50;
            star.position.y = (Math.random() - 0.5) * 50;
            star.position.z = (Math.random() - 0.5) * 100;
            this.stars.push(star);
            this.speeds.push(Math.random() * 0.2 + 0.1);
            this.group.add(star);
        }
        camera.position.set(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const volume = audio.getVolume();
        const data = audio.getFrequencyData();
        const speedMult = (this.params.speed * 0.5) * (1 + (volume * 10));

        this.stars.forEach((star, i) => {
            star.position.z += this.speeds[i] * speedMult;
            if (star.position.z > 10) {
                star.position.z = -90;
                star.position.x = (Math.random() - 0.5) * 50;
                star.position.y = (Math.random() - 0.5) * 50;
            }
            if (data) {
                const bin = i % 32;
                const ratio = data[bin] / 255;
                star.scale.setScalar(0.5 + ratio * 2);
            }
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.stars.forEach(star => {
                star.geometry.dispose();
                star.material.dispose();
            });
            this.stars = [];
            this.group = null;
        }
    }
}
