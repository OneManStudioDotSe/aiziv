import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AudioEngine } from './audio-engine.js';
import { StreamResolver } from './stream-resolver.js';

class App {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.audio = new AudioEngine();
        this.resolver = new StreamResolver();
        this.visualizers = [];
        this.activeVisualizer = null;
        this.activeVisualizerId = 'sphere';
        this.params = { speed: 3, palette: 0, background: 0 };
        
        this.palettes = [
            [0xff3e00, 0x00ffcc, 0xffffff], // Vizia Classic
            [0x8800ff, 0xff0088, 0x00ffff], // Cyberpunk
            [0x00ff00, 0x333333, 0xffffff], // Terminal
            [0xffcc00, 0x000000, 0xff3300]  // Construction
        ];

        this.backgrounds = [
            0xf0f0f0, // Default Light
            0x1a1a1a, // Dark
            0xffcc00, // Safety Yellow
            0x00ffcc, // Neon Teal
            0xff0066  // Hot Pink
        ];

        this.initThree();
        this.initUI();
        this.animate();
        
        window.addEventListener('resize', () => this.onResize());
        console.log("Vizia App Initialized");
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.backgrounds[0]);
        
        this.perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.perspectiveCamera.position.set(0, 5, 12);
        
        const aspect = window.innerWidth / window.innerHeight;
        const d = 10;
        this.orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.orthoCamera.position.set(0, 0, 10);
        this.orthoCamera.lookAt(0, 0, 0);

        this.camera = this.perspectiveCamera;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.controls = new OrbitControls(this.perspectiveCamera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }

    initUI() {
        document.getElementById('btn-mic').onclick = () => this.startMic();
        document.getElementById('btn-file').onclick = () => document.getElementById('file-input').click();
        document.getElementById('file-input').onchange = (e) => this.handleFile(e);
        document.getElementById('btn-toggle-play').onclick = () => this.togglePlayback();
        
        this.initVolumeMeter();
        
        const slider = document.getElementById('progress-slider');
        slider.oninput = (e) => {
            const time = (e.target.value / 100) * this.audio.getDuration();
            this.audio.seek(time);
        };

        this.groups = {
            "3D GEOMETRY": [
                { name: 'Spectrum Sphere', id: 'sphere' },
                { name: 'Neon Glow Cube', id: 'neon_cube' },
                { name: 'Wireframe Torus', id: 'torus' }
            ],
            "CLASSIC": [
                { name: 'Waveform Bars', id: 'bars' },
                { name: 'Oscilloscope', id: 'oscilloscope' }
            ],
            "PARTICLES": [
                { name: 'Hyper Speed', id: 'starfield' },
                { name: 'Plasma Dust', id: 'plasma' }
            ],
            "EXPERIMENTAL": [
                { name: 'Liquid Surface', id: 'liquid' },
                { name: 'Voxel Pulse', id: 'voxels' }
            ],
            "PREZIOTTE": [
                { name: 'Circle', id: 'prez_circle' },
                { name: 'Chop', id: 'prez_chop' },
                { name: 'Equal', id: 'prez_equal' },
                { name: 'Spin', id: 'prez_spin' },
                { name: 'Diagonal', id: 'prez_diagonal' },
                { name: 'Icosahedron', id: 'prez_icosa' },
                { name: 'Hex Grid', id: 'prez_hexgrid' }
            ]
        };

        this.renderVisualizerGroups();
        this.initSceneControls();
        this.initZenMode();
        this.loadVisualizer('sphere');
    }

    initVolumeMeter() {
        const segments = document.querySelectorAll('.vol-segment');
        segments.forEach((seg, i) => {
            seg.onclick = () => {
                if (seg.classList.contains('disabled')) return;
                const volume = (i + 1) / segments.length;
                this.audio.setVolume(volume);
                this.updateVolumeUI(i);
            };
        });
        this.updateVolumeUI(Math.floor(segments.length * 0.5) - 1);
    }

    updateVolumeUI(activeIndex) {
        const segments = document.querySelectorAll('.vol-segment');
        segments.forEach((seg, i) => {
            seg.classList.toggle('active', i <= activeIndex);
        });
    }

    initSceneControls() {
        const zoomStep = 4;
        const panStep = 3;
        document.getElementById('btn-zoom-in').onclick = () => this.animateCameraProperty(this.camera.position, 'z', this.camera.position.z - zoomStep);
        document.getElementById('btn-zoom-out').onclick = () => this.animateCameraProperty(this.camera.position, 'z', this.camera.position.z + zoomStep);
        document.getElementById('btn-pan-left').onclick = () => {
            this.animateCameraProperty(this.camera.position, 'x', this.camera.position.x - panStep);
            this.animateCameraProperty(this.controls.target, 'x', this.controls.target.x - panStep);
        };
        document.getElementById('btn-pan-right').onclick = () => {
            this.animateCameraProperty(this.camera.position, 'x', this.camera.position.x + panStep);
            this.animateCameraProperty(this.controls.target, 'x', this.controls.target.x + panStep);
        };
        document.getElementById('btn-pan-up').onclick = () => {
            this.animateCameraProperty(this.camera.position, 'y', this.camera.position.y + panStep);
            this.animateCameraProperty(this.controls.target, 'y', this.controls.target.y + panStep);
        };
        document.getElementById('btn-pan-down').onclick = () => {
            this.animateCameraProperty(this.camera.position, 'y', this.camera.position.y - panStep);
            this.animateCameraProperty(this.controls.target, 'y', this.controls.target.y - panStep);
        };
        document.getElementById('btn-reset-view').onclick = () => {
            this.animateCameraProperty(this.camera.position, 'x', 0);
            this.animateCameraProperty(this.camera.position, 'y', 5);
            this.animateCameraProperty(this.camera.position, 'z', 12);
            this.animateCameraProperty(this.controls.target, 'x', 0);
            this.animateCameraProperty(this.controls.target, 'y', 0);
            this.animateCameraProperty(this.controls.target, 'z', 0);
        };
    }

    initZenMode() {
        let timer;
        const resetTimer = () => {
            document.body.classList.remove('zen-active');
            clearTimeout(timer);
            timer = setTimeout(() => {
                document.body.classList.add('zen-active');
            }, 5000);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keydown', resetTimer);
        resetTimer();
    }

    animateCameraProperty(object, prop, targetVal) {
        const startVal = object[prop];
        const duration = 400;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            object[prop] = startVal + (targetVal - startVal) * ease;
            this.controls.update();
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    renderVisualizerGroups() {
        const row = document.getElementById('category-row');
        const subArea = document.getElementById('sub-visuals-area');
        const controlsArea = document.getElementById('sub-controls-area');
        row.innerHTML = '';
        
        let index = 1;
        for (const [groupName, visualizers] of Object.entries(this.groups)) {
            const catItem = document.createElement('div');
            catItem.className = 'category-item';
            const numStr = index < 10 ? `0${index}` : index;
            catItem.innerHTML = `<span class="category-name">${groupName}</span><span class="category-number">${numStr}</span>`;

            catItem.onclick = () => {
                const wasActive = catItem.classList.contains('active');
                document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
                subArea.classList.remove('expanded');
                controlsArea.classList.remove('expanded');
                subArea.innerHTML = '';

                if (!wasActive) {
                    catItem.classList.add('active');
                    subArea.classList.add('expanded');
                    
                    visualizers.forEach((viz, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const subItem = document.createElement('div');
                        subItem.className = 'sub-item';
                        if (this.activeVisualizerId === viz.id) subItem.classList.add('active');
                        
                        subItem.innerHTML = `
                            <span class="sub-name">${viz.name}</span>
                            <span class="sub-letter">${letter}</span>
                        `;
                        subItem.style.animationDelay = `${i * 0.05}s`;
                        
                        subItem.onclick = (e) => {
                            e.stopPropagation();
                            this.loadVisualizer(viz.id);
                            document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                            subItem.classList.add('active');
                        };
                        subArea.appendChild(subItem);
                    });
                }
            };
            row.appendChild(catItem);
            index++;
        }
    }

    async loadVisualizer(id) {
        this.activeVisualizerId = id;
        if (this.activeVisualizer) this.activeVisualizer.dispose(this.scene);
        
        try {
            const module = await import(`./visualizers/${id}.js`);
            const VisualizerClass = module.default;
            this.activeVisualizer = new VisualizerClass();
            
            if (id.startsWith('prez_')) {
                this.camera = this.orthoCamera;
                this.controls.enabled = false;
            } else {
                this.camera = this.perspectiveCamera;
                this.controls.enabled = true;
            }

            this.activeVisualizer.init(this.scene, this.camera, this.renderer);
            if (this.activeVisualizer.setParams) {
                this.activeVisualizer.setParams(this.params, this.palettes[this.params.palette]);
            }

            this.renderVisualizerControls();
        } catch (err) {
            console.error(`Failed to load visualizer: ${id}`, err);
        }
    }

    renderVisualizerControls() {
        const area = document.getElementById('sub-controls-area');
        area.innerHTML = '';
        area.classList.add('expanded');

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '2rem';

        // 1. Speed Control
        const speedGroup = document.createElement('div');
        speedGroup.className = 'control-group';
        speedGroup.innerHTML = `<span class="control-label">SPEED</span>`;
        const speedSelector = document.createElement('div');
        speedSelector.className = 'step-selector';
        for (let i = 1; i <= 5; i++) {
            const step = document.createElement('div');
            step.className = `step-box ${this.params.speed === i ? 'active' : ''}`;
            step.textContent = i;
            step.onclick = () => {
                this.params.speed = i;
                this.updateVisualizerParams();
                this.renderVisualizerControls();
            };
            speedSelector.appendChild(step);
        }
        speedGroup.appendChild(speedSelector);
        container.appendChild(speedGroup);

        // 2. Palette Control
        const paletteGroup = document.createElement('div');
        paletteGroup.className = 'control-group';
        paletteGroup.innerHTML = `<span class="control-label">PALETTE</span>`;
        const paletteSelector = document.createElement('div');
        paletteSelector.className = 'palette-selector';
        this.palettes.forEach((colors, i) => {
            const box = document.createElement('div');
            box.className = `palette-box ${this.params.palette === i ? 'active' : ''}`;
            colors.forEach(c => {
                const s = document.createElement('div');
                s.className = 'swatch';
                s.style.backgroundColor = `#${c.toString(16).padStart(6, '0')}`;
                box.appendChild(s);
            });
            box.onclick = () => {
                this.params.palette = i;
                this.updateVisualizerParams();
                this.renderVisualizerControls();
            };
            paletteSelector.appendChild(box);
        });
        paletteGroup.appendChild(paletteSelector);
        container.appendChild(paletteGroup);

        // 3. Background Control
        const bgGroup = document.createElement('div');
        bgGroup.className = 'control-group';
        bgGroup.innerHTML = `<span class="control-label">BACKGROUND</span>`;
        const bgSelector = document.createElement('div');
        bgSelector.className = 'background-selector';
        this.backgrounds.forEach((color, i) => {
            const box = document.createElement('div');
            box.className = `bg-box ${this.params.background === i ? 'active' : ''}`;
            box.style.backgroundColor = `#${color.toString(16).padStart(6, '0')}`;
            box.onclick = () => {
                this.params.background = i;
                this.animateBackground(color);
                this.renderVisualizerControls();
            };
            bgSelector.appendChild(box);
        });
        bgGroup.appendChild(bgSelector);
        container.appendChild(bgGroup);

        area.appendChild(container);
    }

    animateBackground(targetHex) {
        const startColor = this.scene.background.clone();
        const targetColor = new THREE.Color(targetHex);
        const duration = 600;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            this.scene.background.copy(startColor).lerp(targetColor, ease);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    updateVisualizerParams() {
        if (this.activeVisualizer && this.activeVisualizer.setParams) {
            this.activeVisualizer.setParams(this.params, this.palettes[this.params.palette]);
        }
    }

    togglePlayback() {
        if (this.audio.isPlaying()) { this.audio.pause(); this.updatePlayPauseIcon('play'); }
        else { this.audio.resume(); this.updatePlayPauseIcon('pause'); }
    }

    updatePlayPauseIcon(state) {
        const icon = document.getElementById('play-pause-icon');
        if (icon) { icon.setAttribute('data-lucide', state); lucide.createIcons(); }
    }

    async startMic() {
        this.audio.pause();
        const success = await this.audio.startMic();
        if (success) {
            document.getElementById('track-name').textContent = "Microphone Input";
            this.setActiveBtn('btn-mic');
            this.setPlaybackControlsEnabled(false);
            document.getElementById('current-time').textContent = "∞";
            document.getElementById('total-duration').textContent = "∞";
            const fill = document.getElementById('progress-bar-fill');
            fill.style.width = "100%";
            fill.classList.add('mic-active');
        }
    }

    handleFile(e) {
        const file = e.target.files[0];
        if (file) {
            this.audio.stopMic();
            this.audio.playFile(file);
            document.getElementById('track-name').textContent = file.name;
            this.setActiveBtn('btn-file');
            this.setPlaybackControlsEnabled(true);
            const fill = document.getElementById('progress-bar-fill');
            fill.classList.remove('mic-active');
            this.updatePlayPauseIcon('pause');
        }
    }

    setPlaybackControlsEnabled(enabled) {
        const btn = document.getElementById('btn-toggle-play');
        if (btn) btn.disabled = !enabled;
        const slider = document.getElementById('progress-slider');
        if (slider) slider.disabled = !enabled;
        const segments = document.querySelectorAll('.vol-segment');
        segments.forEach(seg => seg.classList.toggle('disabled', !enabled));
    }

    updateProgressUI() {
        if (this.audio.stream) return;
        const current = this.audio.getCurrentTime();
        const duration = this.audio.getDuration();
        if (duration) {
            const percent = (current / duration) * 100;
            document.getElementById('progress-bar-fill').style.width = `${percent}%`;
            document.getElementById('progress-slider').value = percent;
            document.getElementById('current-time').textContent = this.formatTime(current);
            document.getElementById('total-duration').textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    setActiveBtn(id) {
        ['btn-mic', 'btn-file'].forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(id);
        if (activeBtn) activeBtn.classList.add('active');
    }

    onResize() {
        this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
        this.perspectiveCamera.updateProjectionMatrix();
        const aspect = window.innerWidth / window.innerHeight;
        const d = 10;
        this.orthoCamera.left = -d * aspect;
        this.orthoCamera.right = d * aspect;
        this.orthoCamera.top = d;
        this.orthoCamera.bottom = -d;
        this.orthoCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        if (this.activeVisualizer) this.activeVisualizer.update(this.audio, time);
        this.updateProgressUI();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        if (time % 10 < 1) {
            const fpsElem = document.getElementById('fps');
            if (fpsElem) fpsElem.textContent = `FPS: ${Math.round(1000 / (time - this.lastTime || 16))}`;
        }
        this.lastTime = time;
    }
}

new App();
