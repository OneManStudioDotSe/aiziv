import * as THREE from 'three';

export default class PlaceholderVisualizer {
    init(scene, camera, renderer) {
        const geometry = new THREE.TextGeometry ? new THREE.TextGeometry('COMING SOON', { size: 1, height: 0.1 }) : new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x333333, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    update(audio, time) {
        if (this.mesh) {
            this.mesh.rotation.y += 0.01;
            const volume = audio.getVolume();
            this.mesh.scale.setScalar(1 + volume);
        }
    }

    dispose(scene) {
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
