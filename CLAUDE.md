# VIZIA — Audio Visualizer

A high-performance, browser-native audio visualizer with 13 real-time WebGL visualizations driven by Web Audio API. Neo-brutalist UI design. Zero build tooling.

## Project Structure

```
/index.html              — Entry point, Three.js import map
/js/app.js               — Orchestration: UI, visualizer loading, parameter propagation
/js/audio-engine.js      — Web Audio API wrapper: FFT, waveform, volume, playback
/js/stream-resolver.js   — Experimental stream proxy (YouTube/SoundCloud/Bandcamp)
/js/visualizers/*.js     — One class per visualizer: init / update / dispose
/css/style.css           — Neo-brutalist design system, Zen Mode, all panels
/GEMINI.md               — Core design & technical mandates (read before touching anything)
/CONTROLS.md             — Visualizer parameter contract
```

## Running

```bash
python3 -m http.server 8080
# or: npx serve .
```
Open `http://localhost:8080`. No install, no build.

## Architecture

**App.js** orchestrates everything: loads visualizer modules dynamically on user selection, relays audio data each frame, and manages UI state.

**AudioEngine** is the single source of truth for audio. All visualizers pull from it — never create separate audio contexts.

**Visualizer contract** — every visualizer must implement:
```js
constructor()
init(scene, camera, renderer)   // setup Three.js geometry
update(audioData, time)          // called every frame
setParams(params, palette)       // called on speed/palette/bg change
dispose(scene)                   // cleanup geometries & materials
```

**Dual camera system**: Perspective camera for 3D visualizers (OrbitControls active), Orthographic for Preziotte 2D set (fixed). App.js switches automatically on visualizer change.

**Zen Mode**: 5s inactivity triggers UI auto-minimize. All four panels shrink to 44px icon buttons. Any mouse/touch activity restores them.

## Mandates (from GEMINI.md — non-negotiable)

1. **Neo-Brutalist aesthetics only**: solid 3px black borders, hard 3px offset shadows (no blur), stark white `#f0f0f0` / accent orange-red `#ff3e00` / cyan `#00ffcc`.
2. **Zero build process**: pure Vanilla JS + ES Modules + import maps. No Vite, Webpack, Babel, or npm install.
3. **Visualization is the hero**: UI is secondary. Zen Mode must always work.
4. **Centralized audio**: all audio data through `AudioEngine`, never bypass it.
5. **All new visualizers must implement `setParams(params, palette)`**.

## Visualizer Categories

| Category | Visualizers |
|----------|-------------|
| 3D GEOMETRY | Spectrum Sphere, Neon Glow Cube, Wireframe Torus |
| CLASSIC | Waveform Bars, Oscilloscope |
| PARTICLES | Hyper Speed (starfield), Plasma Dust |
| EXPERIMENTAL | Liquid Surface, Voxel Pulse |
| PREZIOTTE | Circle, Chop, Equal, Spin, Diagonal, Icosahedron, Hex Grid |

## Shared Parameters

All visualizers respond to:
- **SPEED** (1–5): step selector, controls rotation / flow / deformation velocity
- **PALETTE** (4 options): Vizia Classic, Cyberpunk, Terminal, Construction
- **BACKGROUND** (5 options): animated 600ms eased color transition

## Known Constraints

- Stream resolution (YouTube/SoundCloud) has CORS limitations — needs a backend proxy to fully work
- Camera controls (OrbitControls) are not touch-optimized for mobile
- No fullscreen API integration yet
- All parameters are global — no per-visualizer memory
