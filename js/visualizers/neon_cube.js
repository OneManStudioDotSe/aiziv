import * as THREE from 'three';

export default class NeonCubeVisualizer {
    constructor() {
        this.group = null;
        this.cube = null;
        this.outerCube = null;
        this.params = { speed: 3 };
        this.palette = [0x00ffcc, 0xff3e00];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.cube) {
            this.cube.material.color.setHex(this.palette[1]);
            this.cube.material.emissive.setHex(this.palette[1]);
        }
        if (this.outerCube) {
            this.outerCube.material.color.setHex(this.palette[0]);
        }
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geo = new THREE.BoxGeometry(2, 2, 2);
        const mat = new THREE.MeshStandardMaterial({
            color: this.palette[1],
            wireframe: true,
            emissive: this.palette[1],
            emissiveIntensity: 1
        });

        this.cube = new THREE.Mesh(geo, mat);
        this.group.add(this.cube);

        const outerGeo = new THREE.BoxGeometry(4, 4, 4);
        const outerMat = new THREE.MeshStandardMaterial({
            color: this.palette[0],
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });

        this.outerCube = new THREE.Mesh(outerGeo, outerMat);
        this.group.add(this.outerCube);

        camera.position.set(4, 4, 8);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const volume = audio.getVolume();
        const data = audio.getFrequencyData();
        const speedMult = this.params.speed * 0.005;

        this.group.rotation.y += speedMult;
        this.group.rotation.z += speedMult * 0.5;

        if (data) {
            const scale = 1 + volume * 1.5;
            this.cube.scale.setScalar(scale);
            this.cube.material.emissiveIntensity = volume * 5;
            
            this.outerCube.rotation.y -= speedMult * 2;
            this.outerCube.scale.setScalar(1 + (data[10] / 255) * 0.5);
        }
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.cube.geometry.dispose();
            this.cube.material.dispose();
            this.outerCube.geometry.dispose();
            this.outerCube.material.dispose();
            this.group = null;
        }
    }
}
