import { useEffect, useRef, useState } from "react";
import Player from "./Player";
import "./Create.css";
import { type MAGEEngineAPI } from "@notrac/mage";
import UploadPreset from "./UploadPreset";

const Create = () => {
  const cameraDockSlotRef = useRef<HTMLDivElement | null>(null);
  const fxDockSlotRef = useRef<HTMLDivElement | null>(null);
  const [engine, setEngine] = useState<MAGEEngineAPI | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // This useEffect moves the auto generated scene edit docks below the canvas so the user can easily edit settings.
  useEffect(() => {
    const moveDock = (dockClassName: string, target: HTMLDivElement | null) => {
      if (!target) return false;

      const dock = document.querySelector(`.${dockClassName}`) as HTMLDivElement | null;
      if (!dock || target.contains(dock)) return false;

      target.appendChild(dock);
      return true;
    };

    const moveDocks = () => {
      const cameraMoved = moveDock("mage-scene-camera-dock", cameraDockSlotRef.current);
      const fxMoved = moveDock("mage-fx-studio-dock", fxDockSlotRef.current);
      return cameraMoved || fxMoved;
    };

    moveDocks();

    const observer = new MutationObserver(() => {
      moveDocks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const PrintPreset = () => {
    if (!engine) return;

    console.log(engine.toPreset());
  };

  return (
    <div className="mage-page">
      {uploadOpen && <UploadPreset close={() => setUploadOpen(false)}/>}
      <Player displayControls={true} setCreatePresetEngineRef={setEngine}/>
      <div>
        <p>Right Click on engine to toggle controls!</p>
        <button className="mage-btn" onClick={PrintPreset}>
          Get Preset
        </button>
        <button className="mage-btn" onClick={() => setUploadOpen(true)}>
          Upload Preset
        </button>
      </div>
      <div className="mage-create-docks">
        <div className="mage-create-dock-slot">
          <div ref={cameraDockSlotRef} className="mage-create-dock-target" />
        </div>

        <div className="mage-create-dock-slot">
          <div ref={fxDockSlotRef} className="mage-create-dock-target" />
        </div>
      </div>
    </div>
  );
};

export default Create;
