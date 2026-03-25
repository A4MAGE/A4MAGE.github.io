// AudioController.js - Gladys
// Responsible for: platform-side commands (load, play, pause, seek, metadata, analysis)
// Sends commands to AudioEngine, reads back playback state

class AudioController {
    constructor(engine) {
        // engine is the AudioEngine instance passed in from the platform
        this.engine = engine;
        this._analysisCallback = null;
        this._analysisFrameId = null;
    }

    loadAudio(file) {
        if (!file) throw new Error("file loading error");
        return this.engine.setAudioSource(file);
    }

    play() {
        // plays audio unless already playing
        const state = this.getState();
        if (state.playing) {
            return;
        }
        return this.engine.play();
    }

    pause() {
        // pauses audio when playing
        const state = this.getState();
        if (state.playing) {
            this.engine.pause();
        } else {
            return;
        }
    }

    // Seek to a specific time in seconds.
    seek(time) {
        this.engine.seek(time);
    }

    // Sync to an external timeline (master clock).
    // Call this repeatedly from your timeline's tick/update loop.
    syncToTimeline(externalTime) {
        this.engine.syncToTimeline(externalTime);
    }

    // Attach metadata to the currently loaded audio.
    // Example: controller.attachMetadata({ bpm: 128, key: 'Am', artist: 'Name' })
    attachMetadata(meta) {
        this.engine.attachMetadata(meta);
    }

    getMetadata() {
        return this.engine.getMetadata();
    }

    getState() {
        return this.engine.getPlaybackState();
        // returns: { playing: true/false, currentTime: 12.4, duration: 240.0 }
    }

    // Load a preset JSON object and extract its audio-processing parameters.
    // Does NOT load an audio file — call loadAudio(file) separately.
    //
    // The preset drives how the audio signal shapes the visuals:
    //   minimizing_factor  — scales the raw bass/mid signal down
    //   power_factor       — applies a power curve (higher = more dramatic peaks)
    //   base_speed         — animation floor speed when audio is quiet
    //   easing_speed       — how smoothly the visual reacts to audio changes
    //   volume_multiplier  — master gate (0 = audio doesn't drive visuals)
    //
    // Returns the extracted audio params so the caller (e.g. MAGE renderer) can apply them.
    // Throws if the preset is missing required fields.
    //
    // Example:
    //   const params = controller.loadPreset(presetJSON);
    //   // params: { minimizing_factor, power_factor, base_speed, easing_speed, volume_multiplier }
    loadPreset(preset) {
        if (!preset || typeof preset !== 'object') {
            throw new Error('loadPreset: preset must be a JSON object');
        }
        if (!preset.intent) {
            throw new Error('loadPreset: preset is missing required "intent" block');
        }

        const intent = preset.intent;
        const state  = preset.state || {};

        const audioParams = {
            minimizing_factor: intent.minimizing_factor,
            power_factor:      intent.power_factor,
            base_speed:        intent.base_speed,
            easing_speed:      intent.easing_speed,
            time_multiplier:   intent.time_multiplier  ?? 1,
            volume_multiplier: state.volume_multiplier ?? 0,
        };

        // Store alongside any existing audio metadata so the renderer can read them back
        this.engine.attachMetadata({ preset: audioParams });

        return audioParams;
    }

    // Returns a single snapshot of analysis data.
    // { frequencyData: Uint8Array, timeDomainData: Uint8Array, bufferLength: number }
    getAnalysis() {
        return this.engine.getAnalysisData();
    }

    // Returns { bass, mid } normalized 0–1.
    // These are the exact values MAGE's shader system consumes to drive visuals.
    getBassAndMid() {
        return this.engine.getBassAndMid();
    }

    // Subscribe to continuous analysis data on every animation frame.
    // callback receives: { frequencyData, timeDomainData, bufferLength }
    // Returns a stop function — call it to unsubscribe.
    // Example:
    //   const stop = controller.onAnalysis(data => console.log(data.frequencyData));
    //   stop(); // when done
    onAnalysis(callback) {
        this._analysisCallback = callback;
        const tick = () => {
            const data = this.engine.getAnalysisData();
            if (data && this._analysisCallback) {
                this._analysisCallback(data);
            }
            this._analysisFrameId = requestAnimationFrame(tick);
        };
        this._analysisFrameId = requestAnimationFrame(tick);

        return () => {
            this._analysisCallback = null;
            if (this._analysisFrameId) {
                cancelAnimationFrame(this._analysisFrameId);
                this._analysisFrameId = null;
            }
        };
    }
}
