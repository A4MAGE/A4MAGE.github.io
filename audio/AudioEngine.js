// AudioEngine.js - Yazeed
// Responsible for: core audio playback, state management
// Exposes playback state to be read and controlled by platform

class AudioEngine {
    constructor() {
        this._audio = new Audio();
        this._metadata = null;
    }

    // Provide or clear the current audio source.
    // file: HTML5 File object | null
    // metadata (optional): { title, bpm, offset }
    setAudioSource(file, metadata = null) {
        if (this._audio.src) {
            URL.revokeObjectURL(this._audio.src);
            this._audio.src = '';
        }
        this._metadata = metadata || null;
        if (!file) return;
        this._audio.src = URL.createObjectURL(file);
        this._audio.load();
    }

    play() {
        return this._audio.play();
    }

    pause() {
        this._audio.pause();
    }

    // Returns: { playing: boolean, currentTime: number, duration?: number }
    getPlaybackState() {
        const state = {
            playing: !this._audio.paused,
            currentTime: this._audio.currentTime,
        };
        if (this._audio.duration && !isNaN(this._audio.duration)) {
            state.duration = this._audio.duration;
        }
        return state;
    }

    // Set playback state for UI synchronization
    // { playing: boolean, currentTime: number, duration?: number }
    setPlaybackState({ playing, currentTime }) {
        if (typeof currentTime === 'number') {
            this._audio.currentTime = currentTime;
        }
        if (playing && this._audio.paused) {
            this._audio.play();
        } else if (!playing && !this._audio.paused) {
            this._audio.pause();
        }
    }

    getMetadata() {
        return this._metadata;
    }
}
