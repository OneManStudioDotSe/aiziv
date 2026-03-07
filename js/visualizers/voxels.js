import * as THREE from 'three';

export default class VoxelVisualizer {
    constructor() {
        this.group = null;
        this.voxels = [];
        this.gridSize = 10;
        this.params = { speed: 3 };
        this.palette = [0xffffff, 0x00ffcc];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        
        for (let x = -this.gridSize/2; x < this.gridSize/2; x++) {
            for (let z = -this.gridSize/2; z < this.gridSize/2; z++) {
                const mat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.5,
                    roughness: 0.2
                });
                const voxel = new THREE.Mesh(geo, mat);
                voxel.position.set(x * 1.2, 0, z * 1.2);
                this.voxels.push(voxel);
                this.group.add(voxel);
            }
        }

        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        const lerpSpeed = this.params.speed * 0.05;
        const col1 = new THREE.Color(this.palette[0]);
        const col2 = new THREE.Color(this.palette[1] || this.palette[0]);

        this.voxels.forEach((voxel, i) => {
            const bin = i % 128;
            const ratio = data ? data[bin] / 255 : 0;
            
            const targetY = ratio * 8;
            voxel.scale.y = THREE.MathUtils.lerp(voxel.scale.y, 0.1 + targetY, lerpSpeed);
            voxel.position.y = voxel.scale.y / 2;
            
            // Color interpolation based on height
            voxel.material.color.copy(col1).lerp(col2, ratio);
        });

        this.group.rotation.y += 0.001 * this.params.speed;
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.voxels.forEach(v => {
                v.geometry.dispose();
                v.material.dispose();
            });
            this.voxels = [];
            this.group = null;
        }
    }
}
