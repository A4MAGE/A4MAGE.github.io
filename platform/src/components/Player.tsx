import { UserAuth } from "../context/AuthContext";
import EnginePlayer from "./mage engine/EnginePlayer";
import PresetPreviews from "./PresetPreviews";
import { useState } from "react";
// @ts-ignore
import Search from "@search/search-bar-main";


const Player = () => {
  const { session, signOut } = UserAuth();
  const [preset, setPreset] = useState<any>("");
  const [audioSource, setAudioSource] = useState("");

  const handlePresetSelect = (item: any) => {
    // Item could either be a raw json object or a item object with both scene data and audio source.
    if (item.scene_data) {
      setPreset(item.scene_data);
    } else {
      setPreset(item);
    }
    
    if (item.audioSource) setAudioSource(item.audioSource);
  };

  return (
    <div className="dashboard-container">
      <div className="content-center-card">
        <h1>Player</h1>
        <h2>Welcome, {session?.user?.email}</h2>
        <div onClick={signOut}>
          <button className="link-button">Sign Out</button>
        </div>
        {/*  @ts-ignore */}
        <Search onSelect={handlePresetSelect} />
        <EnginePlayer preset={preset} audioSource={audioSource} />
      </div>
      <PresetPreviews onSelect={handlePresetSelect} />
    </div>
  );
};

export default Player;
