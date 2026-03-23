# Engine Audio Control Interface

Implemented by Yazeed & Gladys for Issue #5 — Audio Playback Controls.

## What's Done vs. What's Left

| File | Owner | Status | Notes |
|------|-------|--------|-------|
| `AudioEngine.js` | Yazeed | Done | Core audio engine — fully implemented |
| `AudioControls.html` | Yazeed & Gladys | Done | Play/pause UI — fully implemented |
| `AudioController.js` | Gladys | **To do** | See instructions below |

---

## AudioController.js — Gladys

`AudioController.js` is the bridge between the platform and the engine. It receives commands from the platform and forwards them to `AudioEngine`.

### AudioEngine API reference

```js
const engine = new AudioEngine();

// Load an audio file (HTML5 File object from the platform)
engine.setAudioSource(file);

// Playback control
engine.play();
engine.pause();

// Read current playback state
const state = engine.getPlaybackState();
// returns: { playing: boolean, currentTime: number, duration?: number }

// Force a specific playback state (for platform sync)
engine.setPlaybackState({ playing: false, currentTime: 0 });
```

### Expected interface for AudioController.js

The platform will interact with the controller through these methods:

| Method | What it does |
|--------|--------------|
| `loadAudio(file)` | Passes the file to `engine.setAudioSource(file)` |
| `play()` | Calls `engine.play()` |
| `pause()` | Calls `engine.pause()` |
| `getState()` | Returns `engine.getPlaybackState()` |

---

## Folder Structure

```
audio/
├── README.md               ← this file
├── AudioEngine.js          ← core audio engine (done)
├── AudioController.js      ← platform-side controller (Gladys)
└── ui/
    └── AudioControls.html  ← play/pause UI (done)
```

## Feature Overview

- Platform tells the engine what audio file to use
- Platform can play / pause
- Engine exposes playback state to be read and controlled by platform
