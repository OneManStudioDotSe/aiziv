import * as THREE from 'three';

export default class SphereVisualizer {
    constructor() {
        this.mesh = null;
        this.originalPositions = null;
        this.params = { speed: 3 };
        this.palette = [0xff3e00];
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
        const geometry = new THREE.IcosahedronGeometry(2, 4);
        const material = new THREE.MeshStandardMaterial({
            color: this.palette[0],
            wireframe: true,
            emissive: this.palette[0],
            emissiveIntensity: 0.5,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
        this.originalPositions = geometry.attributes.position.array.slice();
        camera.position.set(0, 0, 8);
    }

    update(audio, time) {
        if (!this.mesh) return;

        const data = audio.getFrequencyData();
        const volume = audio.getVolume();
        
        // Speed affects rotation
        const speedMult = this.params.speed * 0.002;
        this.mesh.rotation.y += speedMult;
        this.mesh.rotation.x += speedMult * 0.5;

        if (data) {
            const positions = this.mesh.geometry.attributes.position;
            const count = positions.count;

            for (let i = 0; i < count; i++) {
                const bin = i % (data.length / 2);
                const ratio = data[bin] / 255;
                const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
                const ox = this.originalPositions[ix], oy = this.originalPositions[iy], oz = this.originalPositions[iz];

                const mag = 1 + (ratio * 1.5);
                positions.array[ix] = ox * mag;
                positions.array[iy] = oy * mag;
                positions.array[iz] = oz * mag;
            }
            positions.needsUpdate = true;
            this.mesh.material.emissiveIntensity = volume * 2;
            this.mesh.scale.setScalar(1 + volume * 0.2);
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
