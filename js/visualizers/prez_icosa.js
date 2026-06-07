import * as THREE from 'three';

export default class PrezIcosaVisualizer {
    constructor() {
        this.group = null;
        this.shapes = [];
        this.count = 6;
        this.params = { speed: 3 };
        this.palette = [0xff3e00, 0x00ffcc, 0xffffff];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.shapes.forEach((s, i) => {
            s.material.color.setHex(this.palette[i % this.palette.length]);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        const geo = new THREE.IcosahedronGeometry(1, 0);

        for (let i = 0; i < this.count; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: this.palette[i % this.palette.length],
                wireframe: true,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const shape = new THREE.Mesh(geo, mat);
            // Slightly offset in Z to prevent flickering, but keep flat look
            shape.position.z = -i * 0.1;
            
            this.shapes.push(shape);
            this.group.add(shape);
        }

        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const volume = audio.getVolume();
        const data = audio.getFrequencyData();
        const speedMult = this.params.speed * 0.001;

        this.shapes.forEach((shape, i) => {
            const binIndex = Math.floor(i * 10);
            const val = data ? data[binIndex] / 255 : 0;
            
            // Nested scaling logic
            const baseScale = (i + 1) * 2;
            const targetScale = baseScale + (val * 5);
            
            shape.scale.setScalar(THREE.MathUtils.lerp(shape.scale.x, targetScale, 0.1));
            
            // Counter-rotation for the "shifting" geometry look
            shape.rotation.y += (i % 2 === 0 ? 1 : -1) * speedMult * (i + 1);
            shape.rotation.x += speedMult * 0.5;
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.shapes.forEach(s => {
                s.geometry.dispose();
                s.material.dispose();
            });
            this.group = null;
        }
    }
}
