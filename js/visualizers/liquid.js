import * as THREE from 'three';

export default class LiquidVisualizer {
    constructor() {
        this.mesh = null;
        this.originalPositions = null;
        this.params = { speed: 3 };
        this.palette = [0x0066ff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.mesh) {
            this.mesh.material.color.setHex(this.palette[0]);
        }
    }

    init(scene, camera, renderer) {
        const geo = new THREE.PlaneGeometry(20, 20, 64, 64);
        const mat = new THREE.MeshPhongMaterial({
            color: this.palette[0],
            wireframe: true,
            side: THREE.DoubleSide,
            shininess: 100
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.rotation.x = -Math.PI / 2.5;
        scene.add(this.mesh);

        this.originalPositions = geo.attributes.position.array.slice();
        camera.position.set(0, 5, 12);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.mesh) return;

        const data = audio.getFrequencyData();
        const volume = audio.getVolume();
        const speedMult = this.params.speed * 0.002;
        
        const positions = this.mesh.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const x = this.originalPositions[i * 3];
            const y = this.originalPositions[i * 3 + 1];
            
            const dist = Math.sqrt(x * x + y * y);
            const wave = Math.sin(dist * 0.5 - time * speedMult) * 1.5;
            
            const bin = Math.floor((dist / 15) * 128) % 128;
            const ratio = data ? data[bin] / 255 : 0;
            
            positions[i * 3 + 2] = wave * (1 + ratio * 3);
        }

        this.mesh.geometry.attributes.position.needsUpdate = true;
        // Subtle color shift
        const col = new THREE.Color(this.palette[0]);
        const hsl = {};
        col.getHSL(hsl);
        this.mesh.material.color.setHSL(hsl.h + volume * 0.1, hsl.s, hsl.l);
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
