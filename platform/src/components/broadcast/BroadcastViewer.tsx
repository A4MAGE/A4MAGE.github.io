import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EnginePlayer from "../mage engine/EnginePlayer";
import { subscribeToRoom, type RoomState } from "../../lib/ablyBroadcast";
import type { MAGEEngineAPI } from "@notrac/mage";

// Only correct drift larger than this — small seeks every 2s cause the stutter loop
const LARGE_DRIFT = 3;

const BroadcastViewer = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [title] = useState("Live Room");
  const [ended, setEnded] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<object | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const engineRef = useRef<MAGEEngineAPI | null>(null);
  const shouldPlayRef = useRef(false);
  const targetTimeRef = useRef(0);
  const retryRef = useRef<number | null>(null);
  const lastPresetJsonRef = useRef<string | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);

  const clearRetry = () => { if (retryRef.current) { window.clearInterval(retryRef.current); retryRef.current = null; } };

  const startPlay = (time: number) => {
    console.log("[Viewer] startPlay called, time=", time);
    shouldPlayRef.current = true;
    targetTimeRef.current = time;
    clearRetry();
    retryRef.current = window.setInterval(() => {
      const eng = engineRef.current;
      const loaded = eng?.isAudioLoaded();
      console.log("[Viewer] retry tick — eng=", !!eng, "isAudioLoaded=", loaded);
      if (!eng || !loaded) return;
      eng.seek(targetTimeRef.current);
      eng.play();
      clearRetry();
      console.log("[Viewer] play started at", targetTimeRef.current);
    }, 100);
  };

  const tryPause = () => {
    console.log("[Viewer] tryPause");
    shouldPlayRef.current = false;
    clearRetry();
    engineRef.current?.pause();
  };

  const applyState = (state: RoomState) => {
    console.log("[Viewer] applyState", {
      playing: state.playing,
      playbackTime: state.playbackTime,
      hasPreset: !!state.presetData,
      audioUrl: state.audioUrl,
      ended: state.ended,
      shouldPlay: shouldPlayRef.current,
    });

    if (state.ended) { setEnded(true); return; }

    if (state.presetData) {
      const json = JSON.stringify(state.presetData);
      if (json !== lastPresetJsonRef.current) {
        console.log("[Viewer] preset changed — updating");
        lastPresetJsonRef.current = json;
        setCurrentPreset(state.presetData);
      } else {
        console.log("[Viewer] preset unchanged — skipping");
      }
    }

    if (state.audioUrl && state.audioUrl !== lastAudioUrlRef.current) {
      console.log("[Viewer] audio URL changed —", state.audioUrl);
      lastAudioUrlRef.current = state.audioUrl;
      setCurrentAudio(state.audioUrl);
    } else if (state.audioUrl) {
      console.log("[Viewer] audio URL unchanged — skipping");
    } else {
      console.log("[Viewer] no audio URL in state");
    }

    if (state.playing) {
      if (!shouldPlayRef.current) {
        console.log("[Viewer] paused→playing transition, calling startPlay");
        startPlay(state.playbackTime);
      } else {
        const eng = engineRef.current;
        const loaded = eng?.isAudioLoaded();
        const currentTime = eng?.getAudioTime() ?? 0;
        const drift = Math.abs(currentTime - state.playbackTime);
        console.log("[Viewer] already playing — isAudioLoaded=", loaded, "currentTime=", currentTime, "hostTime=", state.playbackTime, "drift=", drift);
        if (loaded) {
          if (drift > LARGE_DRIFT) {
            console.log("[Viewer] drift too large, seeking to", state.playbackTime);
            eng!.seek(state.playbackTime);
          }
        } else {
          targetTimeRef.current = state.playbackTime;
        }
      }
    } else {
      tryPause();
    }
  };

  const onEngineReady = (eng: MAGEEngineAPI) => {
    console.log("[Viewer] onEngineReady, shouldPlay=", shouldPlayRef.current);
    engineRef.current = eng;
    if (shouldPlayRef.current) startPlay(targetTimeRef.current);
  };

  useEffect(() => {
    if (!roomId) return;
    // rewind:1 in subscribeToRoom means Ably replays the last published state
    // immediately on subscribe — late joiners get it within milliseconds
    const unsub = subscribeToRoom(roomId, applyState);
    return () => { unsub(); clearRetry(); };
  }, [roomId]);

  if (ended) return (
    <div className="mage-page">
      <header className="mage-page__header">
        <div className="mage-page__title-group">
          <p className="mage-eyebrow"><span className="mage-eyebrow__num">05</span>Broadcast</p>
          <h1 className="mage-title">Broadcast Ended</h1>
        </div>
      </header>
      <p className="mage-body">The host has stopped broadcasting.</p>
    </div>
  );

  return (
    <div className="mage-page">
      <header className="mage-page__header">
        <div className="mage-page__title-group">
          <p className="mage-eyebrow"><span className="mage-eyebrow__num">05</span>Broadcast</p>
          <h1 className="mage-title">{title}</h1>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#e74c3c", fontWeight: 600 }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e74c3c", animation: "pulse 1.5s infinite" }} />
          LIVE
        </span>
      </header>

      <EnginePlayer
        preset={currentPreset ?? undefined}
        audioSource={currentAudio ?? undefined}
        onEngineReady={onEngineReady}
        readOnly
      />

      {!currentPreset && (
        <p className="mage-body" style={{ marginTop: "12px", color: "var(--mage-cream-60)" }}>
          Waiting for host to load a preset…
        </p>
      )}
    </div>
  );
};

export default BroadcastViewer;
