import { useEffect, useRef } from "react";
import Player from "./Player";
import "./Create.css";

const Create = () => {
  const cameraDockSlotRef = useRef<HTMLDivElement | null>(null);
  const fxDockSlotRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="mage-page">
      <Player displayControls={true} />
      <div className="mage-create-controls">
        <p>Right Click on engine to toggle controls!</p>
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
