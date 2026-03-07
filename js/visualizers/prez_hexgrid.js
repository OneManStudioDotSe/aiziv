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

        const radius = 0.8;
        const hexGeo = new THREE.CircleGeometry(radius, 6);
        // Rotate to flat-top
        hexGeo.rotateZ(Math.PI / 2);

        const rows = 12;
        const cols = 18;
        const spacingX = radius * 1.5;
        const spacingY = radius * Math.sqrt(3);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; r < cols; c++) {
                const mat = new THREE.MeshBasicMaterial({
                    color: this.palette[0],
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });

                const hex = new THREE.Mesh(hexGeo, mat);
                
                // Hexagonal grid math
                const x = (c * spacingX) - (cols * spacingX) / 2;
                const y = (r * spacingY) - (rows * spacingY) / 2 + (c % 2 === 0 ? 0 : spacingY / 2);
                
                hex.position.set(x, y, 0);
                this.hexagons.push(hex);
                this.group.add(hex);
                
                // Break infinite loop if any
                if (this.hexagons.length > 300) break;
            }
            if (this.hexagons.length > 300) break;
        }

        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, 0);
    }

    update(audio, time) {
        if (!this.group) return;

        const data = audio.getFrequencyData();
        if (!data) return;

        const maxVal = Math.max(...data);

        this.hexagons.forEach((hex, i) => {
            const bin = i % data.length;
            const ratio = data[bin] / 255;
            
            // Replicate the scaling effect from screenshot
            const s = 0.1 + ratio * 1.5;
            hex.scale.setScalar(THREE.MathUtils.lerp(hex.scale.x, s, 0.1));
            
            // Jitter opacity
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
