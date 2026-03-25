import { useRef, useState } from "react";
// @ts-ignore
import { initMAGE } from "./mage-engine.mjs";
import "./engine.css";
import tempPreset from "./presets/preset7.v2.json";

type EnginePlayerProps = {
  width?: string;
  displayControls?: boolean;
};

const EnginePlayer = ({ width = "500px", displayControls = false }: EnginePlayerProps) => {
  const canvasRef = useRef(null); // This will keep play button disabled when canvas ref is null
  const [isPlaying, setIsPlaying] = useState(false); // hides the play button and replaces with the engine canvas.

  const playEngine = () => {
    if (isPlaying) {
      return;
    } else if (!canvasRef.current) {
      console.error("Canvas ref not found");
      return;
    }

    setIsPlaying(true);

    const { engine } = initMAGE({
      canvas: canvasRef.current,
      withControls: displayControls,
      autoStart: false,
      options: {
        log: true,
      },
    });

    engine.start();
    engine.loadPreset(tempPreset);
  };

  // Either display the start engine button or the canvas that the engine plays on.
  return (
    <div>
      <div style={{ display: isPlaying ? "block" : "none", width: width }}>
        <canvas ref={canvasRef} className="engine-player"></canvas>
      </div>

      {!isPlaying && (
        <button className="link-button" onClick={playEngine} disabled={!canvasRef}>
          Start Engine
        </button>
      )}
    </div>
  );
};

export default EnginePlayer;
