import * as THREE from 'three';

export default class OscilloscopeVisualizer {
    constructor() {
        this.line = null;
        this.count = 256;
        this.params = { speed: 3 };
        this.palette = [0x00ffcc];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        if (this.line) {
            this.line.material.color.setHex(this.palette[0]);
        }
    }

    init(scene, camera, renderer) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.LineBasicMaterial({
            color: this.palette[0],
            linewidth: 4
        });

        this.line = new THREE.Line(geo, mat);
        scene.add(this.line);
        camera.position.set(0, 0, 10);
    }

    update(audio, time) {
        if (!this.line) return;

        const data = audio.getWaveformData();
        if (!data) return;

        const positions = this.line.geometry.attributes.position.array;
        const speedMult = this.params.speed * 0.002;
        
        for (let i = 0; i < this.count; i++) {
            const ratio = i / this.count;
            const x = (ratio - 0.5) * 15;
            const bin = Math.floor(ratio * data.length);
            const val = (data[bin] / 128) - 1;
            
            const y = val * 5;
            const z = Math.sin(time * speedMult * 2 + ratio * 10) * 2;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.rotation.y = Math.sin(time * speedMult) * 0.5;
    }

    dispose(scene) {
        if (this.line) {
            scene.remove(this.line);
            this.line.geometry.dispose();
            this.line.material.dispose();
            this.line = null;
        }
    }
}
