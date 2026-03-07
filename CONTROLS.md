# Vizia Visualizer Controls Template

This document defines the common parameters used by Vizia visualizers and their category organization.

## Common Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| **Speed** | Step | 1 - 5 | Multiplier for rotation, flow, or deformation speed. |
| **Palette**| Choice | 0 - 3 | Index of the 3-color array used for materials and particles. |
| **Background**| Choice | 0 - 4 | Index of the static background color for the scene. |

## Implementation Progress

| Category         | ID             | Name            | Speed Mapping                   | Palette Mapping |
|------------------|----------------|-----------------|---------------------------------|-----------------|
| **3D GEOMETRY**  | `sphere`       | Spectrum Sphere | Mesh rotation velocity.         | Wireframe & Emissive color. |
| **3D GEOMETRY**  | `neon_cube`    | Neon Glow Cube  | Inner/Outer rotation speed.     | Inner/Outer wireframe colors. |
| **3D GEOMETRY**  | `torus`        | Wireframe Torus | Twist and spin velocity.        | Primary wireframe color. |
| **CLASSIC**      | `bars`         | Waveform Bars   | Height-smoothing (Lerp) factor. | Gradient across the bar circle. |
| **CLASSIC**      | `oscilloscope` | Oscilloscope    | Phase shift and flow speed.     | Line emissive color. |
| **PARTICLES**    | `starfield`    | Hyper Speed     | Base particle velocity.         | Star glow and HSL shift. |
| **PARTICLES**    | `plasma`       | Plasma Dust     | Float and drift turbulence.     | Vertex color interpolation range. |
| **EXPERIMENTAL** | `liquid`       | Liquid Surface  | Wave frequency and phase speed. | Surface HSL range. |
| **EXPERIMENTAL** | `voxels`       | Voxel Pulse     | Height transition smoothness.   | Grid base and pulse colors. |

## Implementation Pattern
Each visualizer class implements `setParams(params, palette)` to update its internal state instantly.
