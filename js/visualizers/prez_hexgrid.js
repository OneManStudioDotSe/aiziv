import * as THREE from 'three';

export default class PrezHexGridVisualizer {
    constructor() {
        this.group = null;
        this.hexagons = [];
        this.params = { speed: 3 };
        this.palette = [0xffcc00];
    }

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.hexagons.forEach(h => {
            h.material.color.setHex(this.palette[0]);
        });
    }

    init(scene, camera, renderer) {
        this.group = new THREE.Group();
        scene.add(this.group);

        // 300% larger than original (0.8 → 2.4)
        const radius = 2.4;
        const hexGeo = new THREE.CircleGeometry(radius, 6);
        hexGeo.rotateZ(Math.PI / 2);

        // 4 rows × 12 cols covers ~80% of screen height with orthoScale=10
        const rows = 4;
        const cols = 12;
        const spacingX = radius * 1.5;
        const spacingY = radius * Math.sqrt(3);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const mat = new THREE.MeshBasicMaterial({
                    color: this.palette[0],
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });

                const hex = new THREE.Mesh(hexGeo, mat);

                const x = (c * spacingX) - (cols * spacingX) / 2 + spacingX / 2;
                const y = (r * spacingY) - (rows * spacingY) / 2 + (c % 2 === 0 ? 0 : spacingY / 2);

                hex.position.set(x, y, -r * 0.01);
                this.hexagons.push(hex);
                this.group.add(hex);
            }
        }

        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        this.hexagons.forEach((hex, i) => {
            const bin = i % data.length;
            const ratio = data[bin] / 255;

            const s = 0.1 + ratio * 1.5;
            hex.scale.setScalar(THREE.MathUtils.lerp(hex.scale.x, s, 0.1));
            hex.material.opacity = 0.2 + (ratio * 0.6);
        });
    }

    dispose(scene) {
        if (this.group) {
            scene.remove(this.group);
            this.hexagons.forEach(h => {
                h.geometry.dispose();
                h.material.dispose();
            });
            this.group = null;
        }
    }
}
