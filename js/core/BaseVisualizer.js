import * as THREE from 'three';

export class BaseVisualizer {
    constructor() {
        this.params = { speed: 3 };
        this.palette = [0xff3e00, 0x00ffcc, 0xffffff];
        this._tracked = [];
        this._disposed = false;
    }

    // --- Lifecycle ---

    setParams(params, palette) {
        this.params = params;
        this.palette = palette;
        this.onParamsChanged();
    }

    onParamsChanged() {}

    // --- Speed helpers ---

    getSpeedFactor(base = 0.002) {
        return this.params.speed * base;
    }

    getLerpSpeed(base = 0.05) {
        return this.params.speed * base;
    }

    getSpeedNormalized() {
        return this.params.speed / 5;
    }

    // --- Audio helpers ---

    // Maps a normalizedPos (0–1) across the visual array to a frequency value (0–1).
    // rangeEnd limits how much of the FFT is used (0.5 = musical range only).
    getFreqBin(audio, normalizedPos, rangeEnd = 0.5) {
        const data = audio.getFrequencyData();
        if (!data) return 0;
        const bin = Math.floor(normalizedPos * data.length * rangeEnd);
        return data[Math.min(bin, data.length - 1)] / 255;
    }

    // Returns average energy (0–1) for a named frequency band.
    // Band bin ranges are derived from 44100 Hz / FFT 2048 ≈ 21.5 Hz/bin.
    getFreqBand(audio, bandName) {
        const data = audio.getFrequencyData();
        if (!data) return 0;
        const bands = {
            'sub-bass': [0,   4],
            'bass':     [4,   20],
            'low-mid':  [20,  60],
            'mid':      [60,  150],
            'high-mid': [150, 300],
            'high':     [300, 512],
        };
        const [start, end] = bands[bandName] || bands['mid'];
        let sum = 0;
        for (let i = start; i < end; i++) sum += data[i];
        return sum / ((end - start) * 255);
    }

    // --- Color helpers ---

    getPaletteColor(index) {
        const hex = this.palette[index % this.palette.length];
        return new THREE.Color(hex);
    }

    applyPaletteToMaterials(materials) {
        materials.forEach((mat, i) => {
            mat.color.setHex(this.palette[i % this.palette.length]);
        });
    }

    lerpColor(colorObj, targetHex, t) {
        colorObj.lerp(new THREE.Color(targetHex), t);
    }

    // --- Dispose helpers ---

    track(object, opts = { geometry: true, material: true }) {
        this._tracked.push({ object, opts });
    }

    _disposeTracked(scene) {
        this._tracked.forEach(({ object, opts }) => {
            scene.remove(object);
            if (opts.geometry && object.geometry) object.geometry.dispose();
            if (opts.material && object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        this._tracked = [];
        this._disposed = true;
    }
}
