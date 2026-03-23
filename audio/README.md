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

### What is this file and why does it exist?

`AudioEngine.js` is the actual audio player — it handles loading a song, playing it, pausing it, and tracking how far along it is. It's already fully built.

`AudioController.js` sits between the React app and the engine. The website sends commands to the controller, and the controller passes them to the engine. The audio player itself does not need to be touched.

---

### What you need to write

Create a class in `AudioController.js` with these four actions:

| Method | What it should do |
|--------|-------------------|
| `loadAudio(file)` | Tell the engine which audio file to use |
| `play()` | Tell the engine to start playing |
| `pause()` | Tell the engine to pause |
| `getState()` | Ask the engine what it's currently doing and return that |

---

### How to do it — copy this and fill it in

```js
// AudioController.js - Gladys
// Responsible for: platform-side commands (load, play, pause)
// Sends commands to AudioEngine, reads back playback state

class AudioController {
    constructor(engine) {
        // engine is the AudioEngine instance passed in from the platform
        this.engine = engine;
    }

    loadAudio(file) {
        this.engine.setAudioSource(file);
    }

    play() {
        this.engine.play();
    }

    pause() {
        this.engine.pause();
    }

    getState() {
        return this.engine.getPlaybackState();
        // returns: { playing: true/false, currentTime: 12.4, duration: 240.0 }
    }
}
```

That's the whole file. Each method is one line that calls the engine.

---

### How this connects to the React website

In React, a component (like an audio player page) will import both files and wire them together. Here is what that looks like:

```jsx
import AudioEngine from './audio/AudioEngine.js';
import AudioController from './audio/AudioController.js';

// Create the engine and controller once when the component loads
const engine = new AudioEngine();
const controller = new AudioController(engine);

// Then the buttons on the page call the controller directly
function AudioPlayer() {
    return (
        <div>
            <input type="file" onChange={(e) => controller.loadAudio(e.target.files[0])} />
            <button onClick={() => controller.play()}>Play</button>
            <button onClick={() => controller.pause()}>Pause</button>
        </div>
    );
}
```

The React component never touches `AudioEngine.js` directly — it only talks to the controller. The controller handles the rest.

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
