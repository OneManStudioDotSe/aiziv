# VIZIA — Ideas & Future Directions

Bold, non-conformist feature ideas. All respect the zero-build, neo-brutalist, Zen Mode mandates.

---

## 1. Audio Fingerprint Identity
When a track loads, VIZIA analyzes its BPM, key, and spectral signature and generates a unique visual fingerprint — a permanent glyph/sigil rendered in the corner. Same song always produces the same sigil. It's your song's face. Unexpected and deeply personal.

## 2. Chaos Mode — Let the Visualizer Break Itself
A hidden toggle (keyboard shortcut, never in the main UI) that gradually corrupts the visualizer: vertices drift, palettes bleed, geometries tear. The visualizer degrades beautifully with the music. Resets on track end. Most users won't know it exists until they discover it.

## 3. "Ghost" — Multi-Layer Echo of Past Frames
Each frame's geometry is cloned at 10–20% opacity and persists for 2–3 seconds before fading. The result: the visualizer leaves glowing afterimages of itself. Especially surreal on the sphere and torus. Zero added complexity — just retain and fade geometry snapshots.

## 4. Frequency-to-Typography Mode
A visualizer where audio doesn't draw shapes — it types. Real-time frequency bands map to characters (low = block glyphs, high = punctuation, mids = letters). The screen fills with drifting monospaced characters that are literally the sound's shape. Fits perfectly with the neo-brutalist mono font aesthetic.

## 5. Seismic Recorder
A permanently scrolling horizontal strip (think a lie detector or EKG) that records the last 60 seconds of waveform in a single continuous line across the screen. The present is at the right edge, the past scrolls left. It's not a visualizer — it's an audio artifact. Add a "print" button that exports the strip as SVG.

## 6. Two-Player / Split-Source Mode
Two audio sources simultaneously — mic on one side, file on the other — each driving half the visualization. Left brain vs right brain. A shared geometry in the center morphs based on the *difference* between the two signals. Completely unexpected for a solo visualizer tool.

## 7. Gravity Field — Mouse as an Attractor
Particles in Plasma/Starfield mode are repelled or attracted by the mouse cursor like a gravity well. Strength scales with audio volume. When the music drops, the particles collapse toward or explode away from the cursor. Turns passive watching into tactile play.

## 8. Palette Rebellion — Auto-Mutate on Sustained Peaks
When audio stays at high volume for 3+ seconds (a climax/drop), the active palette briefly inverts, saturates, or shifts hue. It snaps back when the energy drops. The UI never announces this — users discover it. Fits the "mechanical surprise" philosophy.

## 9. Cassette Memory — Session Heatmap
VIZIA silently records which frequencies were loudest over the session lifetime and builds a color-coded frequency heatmap revealed with a keypress. A literal map of what you listened to. Show it as a glowing horizontal bar at fullscreen — your listening session as a single image.

## 10. Visualizer Alchemy — Chain Two Visualizers
Instead of picking one visualizer, allow compositing two: the first renders at 60% opacity, the second at 40%, both active simultaneously. A hidden dial (not in the main UI) controls the blend ratio. The sphere bleeding into voxels. The oscilloscope ghosting through plasma. No other tool does this.
