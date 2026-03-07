import * as THREE from 'three';

export default class PrezVoronoiVisualizer {
    constructor() {
        this.plane = null;
        this.cells = [];
        this.cellCount = 8;
        this.params = { speed: 3 };
        this.palette = [0x8800ff, 0x00ffff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
    }

    init(scene, camera, renderer) {
        const geo = new THREE.PlaneGeometry(20, 20, 40, 40);
        const mat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            wireframe: true,
            side: THREE.DoubleSide
        });
        this.plane = new THREE.Mesh(geo, mat);
        this.plane.rotation.x = -Math.PI / 2;
        scene.add(this.plane);

        for (let i = 0; i < this.cellCount; i++) {
            this.cells.push({
                position: new THREE.Vector3((Math.random() - 0.5) * 15, 0, (Math.random() - 0.5) * 15),
                velocity: new THREE.Vector2((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)
            });
        }

        camera.position.set(0, 10, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.plane) return;

        const data = audio.getFrequencyData();
        const volume = audio.getVolume();
        const speedMult = this.params.speed * 0.5;

        // Move cells
        this.cells.forEach(cell => {
            cell.position.x += cell.velocity.x * speedMult;
            cell.position.z += cell.velocity.y * speedMult;

            if (Math.abs(cell.position.x) > 10) cell.velocity.x *= -1;
            if (Math.abs(cell.position.z) > 10) cell.velocity.y *= -1;
        });

        const positions = this.plane.geometry.attributes.position.array;
        const col1 = new THREE.Color(this.palette[0]);
        
        for (let i = 0; i < positions.length / 3; i++) {
            const vx = positions[i * 3];
            const vz = positions[i * 3 + 1]; // Plane is rotated, so Y is Z
            
            // Find nearest cell distance
            let minDist = 100;
            this.cells.forEach(cell => {
                const dx = vx - cell.position.x;
                const dz = vz - cell.position.z;
                const dist = dx * dx + dz * dz;
                if (dist < minDist) minDist = dist;
            });

            const ratio = Math.max(0, 1 - Math.sqrt(minDist) / 5);
            positions[i * 3 + 2] = ratio * (2 + volume * 10);
        }

        this.plane.geometry.attributes.position.needsUpdate = true;
        this.plane.material.color.copy(col1).lerp(new THREE.Color(this.palette[1] || 0xffffff), volume);
    }

    dispose(scene) {
        if (this.plane) {
            scene.remove(this.plane);
            this.plane.geometry.dispose();
            this.plane.material.dispose();
            this.plane = null;
        }
    }
}
