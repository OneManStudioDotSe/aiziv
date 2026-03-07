# VIZIA // 2026 AUDIO VISUALIZER

**Vizia** is a high-performance, web-based audio visualizer built with Three.js and WebGL. It blends modern Neo-brutalist aesthetics with the nostalgic spirit of classic visualizers (like Winamp), providing a distraction-free, immersive listening experience.

## 🚀 Features

### 1. Advanced 3D Engine
- **13 Unique Visualizers**: Organized into categories like 3D Geometry, Particles, and Experimental.
- **Preziotte Collection**: Exact 2D recreations of the iconic "Party Mode" visualizers using Orthographic projection.
- **Dynamic Camera**: Full Orbit controls (Zoom, Pan, Rotate) plus manual mechanical scene controls with smooth ease-out transitions.

### 2. Immersive UX
- **Zen Mode**: UI panels automatically minimize into compact square icons after 5 seconds of inactivity.
- **Neo-brutalist Design**: Stark white/black themes, bold borders, and segmented mechanical controls.
- **Unified Controls**: Shared parameters for Speed, Palette, and Background across all visualizations.

### 3. Smart Audio Handling
- **Microphone Input**: Live analysis with low-latency visualization.
- **Local File Support**: Drag and drop or upload local audio files.
- **Dynamic States**: UI intelligently enables/disables controls (Play/Pause, Volume, Progress) based on the input type.

---

## 🛠 Project Structure

- `js/app.js`: Main orchestration and UI management.
- `js/audio-engine.js`: Web Audio API high-performance wrapper.
- `js/visualizers/`: Modular, class-based visualizer definitions.
- `css/style.css`: The "Vizia Machine" design system.
- `CONTROLS.md`: Technical documentation for visualizer parameters.

---

## 🖥 How to Run

Vizia uses ES Modules and requires a local server.

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

---

## 🎨 Visualizers Included

| Category | Name | ID |
|----------|------|----|
| **3D GEOMETRY** | Spectrum Sphere, Neon Glow Cube, Wireframe Torus | `sphere`, `neon_cube`, `torus` |
| **CLASSIC** | Waveform Bars, Oscilloscope | `bars`, `oscilloscope` |
| **PARTICLES** | Hyper Speed, Plasma Dust | `starfield`, `plasma` |
| **EXPERIMENTAL** | Liquid Surface, Voxel Pulse | `liquid`, `voxels` |
| **PREZIOTTE** | Circle, Chop, Equal, Spin, Diagonal, Icosahedron, Hex Grid | `prez_*` |
