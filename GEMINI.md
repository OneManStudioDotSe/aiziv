# VIZIA // CORE MANDATES & PHILOSOPHY

This document serves as the foundational guide for any AI or developer working on the **Vizia** project.

## 1. Aesthetic Mandate: Neo-Brutalism
- **Borders**: Always use solid black borders (default `3px`).
- **Shadows**: Use hard, non-blurred offset shadows (default `3px`). No soft drop shadows allowed.
- **Color**: Use stark white/off-white backgrounds (`#ffffff`, `#f0f0f0`) with high-saturation accents (`#ff3e00`, `#00ffcc`).
- **Typography**: Strictly use Monospaced fonts for technical data and Bold Sans-serif for headers.
- **Interactions**: UI elements should feel mechanical. Use step-based selectors instead of smooth sliders where possible (e.g., the Volume Meter and Speed Selector).

## 2. Technical Mandate: No Build Process
- Vizia must remain a **pure Vanilla JS/HTML/CSS** project.
- **ES Modules**: Use browser-native `import` and `export`.
- **Import Maps**: Maintain the `index.html` import map for external dependencies (Three.js).
- **Zero Build**: The project must be testable by simply serving the root directory. Do not introduce Vite, Webpack, or Babel.

## 3. UI/UX Mandate: The "Zen" Machine
- **Non-Intrusive**: The visualization is the hero. The UI must always support **Zen Mode** (automatic minimization on inactivity).
- **Responsive Animations**: Use mechanical, cubic-bezier transitions for panel movements. Avoid "bouncy" or "cutesy" spring animations.
- **Consistency**: All new visualizers MUST implement the `setParams(params, palette)` pattern defined in `CONTROLS.md`.

## 4. Architectural Patterns
- **Modular Visualizers**: Each visualizer is a class in `js/visualizers/` with `init`, `update`, and `dispose` methods.
- **Centralized Audio**: All FFT and Waveform data must flow through the `AudioEngine` class to ensure minimal latency and single-source-of-truth.
- **Dual Camera Support**: Support both `PerspectiveCamera` (for 3D Geometry) and `OrthographicCamera` (for 2D Recreations like the Preziotte set).
