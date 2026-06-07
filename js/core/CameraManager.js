import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PRESETS = {
    'front-3d':     { type: 'perspective', position: [0, 5, 12],     lookAt: [0, 0, 0], fov: 75 },
    'close-up-3d':  { type: 'perspective', position: [0, 0, 8],      lookAt: [0, 0, 0], fov: 75 },
    'elevated-3d':  { type: 'perspective', position: [0, 8, 12],     lookAt: [0, 0, 0], fov: 75 },
    'isometric-3d': { type: 'perspective', position: [10, 10, 10],   lookAt: [0, 0, 0], fov: 75 },
    'diagonal-3d':  { type: 'perspective', position: [4, 4, 8],      lookAt: [0, 0, 0], fov: 75 },
    'top-down':     { type: 'perspective', position: [0, 20, 0.001], lookAt: [0, 0, 0], fov: 60 },
    'wide-3d':      { type: 'perspective', position: [0, 0, 25],     lookAt: [0, 0, 0], fov: 75 },
    'front-2d':     { type: 'ortho',       position: [0, 0, 15],     lookAt: [0, 0, 0], orthoScale: 10 },
    'close-2d':     { type: 'ortho',       position: [0, 0, 10],     lookAt: [0, 0, 0], orthoScale: 10 },
};

export class CameraManager {
    constructor(domElement) {
        const aspect = window.innerWidth / window.innerHeight;

        this._perspCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this._perspCamera.position.set(0, 5, 12);

        const d = 10;
        this._orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this._orthoCamera.position.set(0, 0, 10);
        this._orthoCamera.lookAt(0, 0, 0);

        this._activeCamera = this._perspCamera;

        this._controls = new OrbitControls(this._perspCamera, domElement);
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.05;
        this._controls.screenSpacePanning = true;
    }

    get activeCamera() { return this._activeCamera; }
    get controls() { return this._controls; }

    static registerPreset(name, config) {
        PRESETS[name] = config;
    }

    applyDescriptor(descriptor) {
        const cam = descriptor.camera;
        const preset = PRESETS[cam.preset];

        if (!preset) {
            console.warn(`[CameraManager] Unknown preset "${cam.preset}" on "${descriptor.id}", falling back to legacy.`);
            this.applyLegacy(descriptor.id);
            return;
        }

        const resolved = {
            type: cam.type || preset.type,
            position: cam.position || preset.position,
            lookAt: cam.lookAt || preset.lookAt || [0, 0, 0],
            fov: cam.fov || preset.fov || 75,
            orthoScale: cam.orthoScale || preset.orthoScale || 10,
            orbitEnabled: cam.orbitEnabled !== undefined ? cam.orbitEnabled : preset.type !== 'ortho',
        };

        this._applyResolved(resolved);
    }

    applyLegacy(id) {
        if (id.startsWith('prez_')) {
            this._activeCamera = this._orthoCamera;
            this._controls.enabled = false;
        } else {
            this._activeCamera = this._perspCamera;
            this._controls.enabled = true;
        }
        // Camera position is owned by the visualizer's init() in legacy mode
    }

    onResize() {
        const aspect = window.innerWidth / window.innerHeight;

        this._perspCamera.aspect = aspect;
        this._perspCamera.updateProjectionMatrix();

        const d = this._currentOrthoScale || 10;
        this._orthoCamera.left   = -d * aspect;
        this._orthoCamera.right  =  d * aspect;
        this._orthoCamera.top    =  d;
        this._orthoCamera.bottom = -d;
        this._orthoCamera.updateProjectionMatrix();
    }

    update() {
        this._controls.update();
    }

    _applyResolved(config) {
        if (config.type === 'ortho') {
            this._activeCamera = this._orthoCamera;
            this._currentOrthoScale = config.orthoScale;
            const aspect = window.innerWidth / window.innerHeight;
            const d = config.orthoScale;
            this._orthoCamera.left   = -d * aspect;
            this._orthoCamera.right  =  d * aspect;
            this._orthoCamera.top    =  d;
            this._orthoCamera.bottom = -d;
            this._orthoCamera.updateProjectionMatrix();
        } else {
            this._activeCamera = this._perspCamera;
            this._perspCamera.fov = config.fov;
            this._perspCamera.updateProjectionMatrix();
        }

        const [px, py, pz] = config.position;
        this._activeCamera.position.set(px, py, pz);

        const [lx, ly, lz] = config.lookAt;
        this._activeCamera.lookAt(lx, ly, lz);
        this._controls.target.set(lx, ly, lz);

        this._controls.enabled = config.orbitEnabled;
    }
}
