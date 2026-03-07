import * as THREE from 'three';

export default class TorusVisualizer {
    constructor() {
        this.mesh = null;
        this.params = { speed: 3 };
        this.palette = [0xff0066];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.mesh) {
            this.mesh.material.color.setHex(this.palette[0]);
            this.mesh.material.emissive.setHex(this.palette[0]);
        }
    }

    init(scene, camera, renderer) {
        const geo = new THREE.TorusGeometry(3, 1, 16, 100);
        const mat = new THREE.MeshStandardMaterial({
            color: this.palette[0],
            wireframe: true,
            emissive: this.palette[0],
            emissiveIntensity: 0.5
        });

        this.mesh = new THREE.Mesh(geo, mat);
        scene.add(this.mesh);
        camera.position.z = 10;
    }

    update(audio, time) {
        if (!this.mesh) return;

        const volume = audio.getVolume();
        const data = audio.getFrequencyData();
        const speedMult = this.params.speed * 0.005;

        this.mesh.rotation.x += speedMult;
        this.mesh.rotation.y += speedMult * 0.5;

        if (data) {
            const scale = 1 + volume * 1.2;
            this.mesh.scale.setScalar(scale);
            this.mesh.material.emissiveIntensity = volume * 4;
        }
    }

    dispose(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
    }
}
