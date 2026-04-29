import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { initMAGE, type MAGEEngineAPI } from "@notrac/mage";
import "./engine.css";

type EnginePlayerProps = {
  preset?: string | object | null;
  displayControls?: boolean;
  audioSource?: string;
  onEngineReady?: (engine: MAGEEngineAPI) => void;
};

const EnginePlayer = ({ displayControls = false, preset, audioSource, onEngineReady }: EnginePlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<MAGEEngineAPI | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // TODO: Remove this when this bug is patched in MAGE engine that causes crashing on mac
    // Workaround for a @notrac/mage non-Windows initialization bug where
    // switchControls() expects an element with id="ui_hide" to exist.
    let shimHideButton: HTMLButtonElement | null = null;
    if (!document.getElementById("ui_hide")) {
      shimHideButton = document.createElement("button");
      shimHideButton.id = "ui_hide";
      shimHideButton.type = "button";
      shimHideButton.setAttribute("data-mage-shim", "true");
      shimHideButton.style.display = "none";
      document.body.appendChild(shimHideButton);
    }

    const mageEngine = initMAGE({
      canvas: canvasRef.current,
      withControls: { active: displayControls, integrated: false },
      autoStart: true,
    });
    setEngine(mageEngine);
    onEngineReady?.(mageEngine);

    return () => {
      mageEngine.dispose();
      if (shimHideButton?.parentNode) {
        shimHideButton.parentNode.removeChild(shimHideButton);
      }
    };
  }, []);

  useEffect(() => {
    if (!engine || !audioSource) return;
    setAudioLoaded(false);
    engine.loadAudio(audioSource);

    const intervalId = window.setInterval(() => {
      if (engine.isAudioLoaded()) {
        setAudioLoaded(true);
        window.clearInterval(intervalId);
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [audioSource, engine]);

  useEffect(() => {
    if (engine && preset) engine.loadPreset(preset as any);
  }, [preset, engine]);

  return (
    <div className="mage-engine">
      <div className="mage-engine__frame">
        {!engine && (
          <div className="engine-player-loading">
            <LoadingSpinner />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="engine-player"
          style={{ display: engine ? "block" : "none" }}
        />
      </div>
      <div className="mage-engine__controls">
        <button
          type="button"
          className="mage-btn"
          onClick={() => engine?.play()}
          disabled={!audioLoaded}
        >
          Play
        </button>
        <button
          type="button"
          className="mage-btn"
          onClick={() => engine?.pause()}
          disabled={!audioLoaded}
        >
          Pause
        </button>
      </div>
    </div>
  );
};

export default EnginePlayer;
