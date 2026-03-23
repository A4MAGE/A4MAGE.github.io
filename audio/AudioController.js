// AudioController.js - Gladys
// Responsible for: platform-side commands (load, play, pause)
// Sends commands to AudioEngine, reads back playback state
class AudioController {
    constructor(engine) {
        // engine is the AudioEngine instance passed in from the platform
        this.engine = engine;
    }

    loadAudio(file) {
        if (!file) throw new error("file loading error");
        return this.engine.setAudioSource(file);
    }

    play() {
        // plays audio unless already playing
        const state = this.getstate(); 
        if (state.playing){
            return;
        }
        return this.engine.play();
    }

    pause() {
        //pauses audio when playing
        const state = this.getstate(); 
        if (state.playing){
            this.engine.pause();
        }
        else{ 
            return;
        }
    }

    getState() {
        return this.engine.getPlaybackState();
        // returns: { playing: true/false, currentTime: 12.4, duration: 240.0 }
    }
}
