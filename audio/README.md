# Engine Audio Control Interface

Implemented by Yazeed & Gladys for Issue #5 — Audio Playback Controls.

## Feature Overview
- Platform tells the engine what audio to use
- Platform can play / pause
- Engine exposes playback state to be read and controlled by platform

## Folder Structure

```
audio/
├── README.md               ← this file
├── AudioEngine.js          ← core audio engine (play, pause, state)
├── AudioController.js      ← platform-side controller (sends commands to engine)
└── ui/
    └── AudioControls.html  ← play/pause UI controls
```

## Responsibilities
| File | Owner |
|------|-------|
| AudioEngine.js | Gladys (gcubilet) |
| AudioController.js | Yazeed |
| AudioControls.html | Yazeed |

## How It Works
1. Platform loads an audio file via `AudioController`
2. `AudioController` sends commands (play/pause/load) to `AudioEngine`
3. `AudioEngine` manages playback and exposes state (playing, paused, current track)
4. Platform reads state from `AudioEngine` to update the UI
