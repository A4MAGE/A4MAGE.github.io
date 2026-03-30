import { useEffect, useRef, useState } from "react";
// @ts-ignore
import { initMAGE } from "./mage-engine.mjs";
import "./engine.css";

type EnginePlayerProps = {
  width?: string;
  displayControls?: boolean;
};

const EnginePlayer = ({ width = "500px", displayControls = false }: EnginePlayerProps) => {
  const canvasRef = useRef(null); // This will keep play button disabled when canvas ref is null
  const [engine, setEngine] = useState<any>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { engine } = initMAGE({
      canvas: canvasRef.current,
      withControls: displayControls,
      autoStart: true,
      options: {
        log: true,
      },
    });

    setEngine(engine);

    engine.loadAudio(
      "https://bnovkavuiekmkanohxpm.supabase.co/storage/v1/object/public/TempPublicMusic/rick.mp3",
      setAudioLoaded,
    );

    return () => {
      // Ensure audio/context is torn down when this component unmounts.
      if (engine) {
        engine.dispose();
      }
    };
  }, []);

  const playAudio = () => {
    if (!engine) return;
    engine.play();
  };

  // Either display the start engine button or the canvas that the engine plays on.
  return (
    <div>
      <div style={{ display: engine ? "block" : "none", width: width }}>
        <canvas ref={canvasRef} className="engine-player"></canvas>
      </div>

      <button className="link-button" onClick={playAudio} disabled={!audioLoaded}>
        Play
      </button>
    </div>
  );
};

export default EnginePlayer;
