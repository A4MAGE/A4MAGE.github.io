import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EnginePlayer from "../mage engine/EnginePlayer";
import { subscribeToRoom, type RoomState } from "../../lib/ablyBroadcast";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import type { MAGEEngineAPI } from "@notrac/mage";

const LARGE_DRIFT = 3;

const BroadcastViewer = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { session } = UserAuth();
  const navigate = useNavigate();

  const [ended, setEnded] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<object | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [hostPlaying, setHostPlaying] = useState(false);
  const [hostName, setHostName] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  const engineRef = useRef<MAGEEngineAPI | null>(null);
  const shouldPlayRef = useRef(false);
  // Store raw host clock so we can recompute fresh at any moment
  const hostClockRef = useRef<{ playbackTime: number; sentAt: number } | null>(null);
  const retryRef = useRef<number | null>(null);
  const lastPresetJsonRef = useRef<string | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);

  // Redirect to sign in if not logged in (preserve return URL)
  useEffect(() => {
    if (session === null) {
      navigate(`/signin?next=/broadcast/room/${roomId}`);
    }
  }, [session, roomId, navigate]);

  // Fetch host display name from broadcast_room table
  useEffect(() => {
    if (!supabase || !roomId) return;
    supabase
      .from("broadcast_room")
      .select("title, host_user_id")
      .eq("id", roomId)
      .single()
      .then(({ data }: any) => {
        if (data?.title) setHostName(data.title);
      });
  }, [roomId]);

  const clearRetry = () => {
    if (retryRef.current) { window.clearInterval(retryRef.current); retryRef.current = null; }
  };

  const startPlay = useCallback(() => {
    shouldPlayRef.current = true;
    clearRetry();
    retryRef.current = window.setInterval(() => {
      const eng = engineRef.current;
      if (!eng || !eng.isAudioLoaded()) return;
      // Recompute the exact host position right now using the freshest clock data
      const clock = hostClockRef.current;
      const seekTo = clock
        ? clock.playbackTime + (Date.now() - clock.sentAt) / 1000
        : 0;
      eng.seek(seekTo);
      eng.play();
      clearRetry();
      console.log("[Viewer] ▶ playing at", seekTo.toFixed(2));
    }, 100);
  }, []);

  const tryPause = useCallback(() => {
    shouldPlayRef.current = false;
    clearRetry();
    engineRef.current?.pause();
    console.log("[Viewer] ⏸ paused");
  }, []);

  const applyState = useCallback((state: RoomState) => {
    console.log("[Viewer] state", {
      playing: state.playing,
      t: state.playbackTime,
      hasPreset: !!state.presetData,
      audioUrl: state.audioUrl ?? "(none)",
      ended: state.ended,
    });

    if (state.ended) { setEnded(true); return; }

    let presetChanged = false;
    if (state.presetData) {
      const json = JSON.stringify(state.presetData);
      if (json !== lastPresetJsonRef.current) {
        lastPresetJsonRef.current = json;
        setCurrentPreset(state.presetData);
        presetChanged = true;
      }
    }

    let audioChanged = false;
    if (state.audioUrl && state.audioUrl !== lastAudioUrlRef.current) {
      lastAudioUrlRef.current = state.audioUrl;
      setCurrentAudio(state.audioUrl);
      setAudioReady(false); // reset while new audio loads
      audioChanged = true;
    }

    setHostPlaying(state.playing);

    if (state.playing) {
      // Update clock FIRST so startPlay()'s retry loop always seeks to the right position
      hostClockRef.current = { playbackTime: state.playbackTime, sentAt: state.sentAt ?? Date.now() };

      if (!shouldPlayRef.current || presetChanged || audioChanged) {
        // Start playback, or re-sync after preset/audio change (engine may have reset position)
        startPlay();
      } else {
        const eng = engineRef.current;
        if (eng?.isAudioLoaded()) {
          const currentHostTime = state.playbackTime + (state.sentAt ? (Date.now() - state.sentAt) / 1000 : 0);
          const drift = Math.abs(eng.getAudioTime() - currentHostTime);
          if (drift > LARGE_DRIFT) {
            console.log("[Viewer] correcting drift", drift.toFixed(2), "→", currentHostTime.toFixed(2));
            eng.seek(currentHostTime);
          }
        }
      }
    } else {
      hostClockRef.current = null;
      tryPause();
    }
  }, [startPlay, tryPause]);

  const onEngineReady = useCallback((eng: MAGEEngineAPI) => {
    engineRef.current = eng;
    if (shouldPlayRef.current) startPlay();
  }, [startPlay]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, applyState);
    return () => { unsub(); clearRetry(); };
  }, [roomId, applyState]);

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
          <h1 className="mage-title">{hostName ?? "Live Room"}</h1>
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
        onAudioLoaded={() => setAudioReady(true)}
        readOnly
      />

      <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--mage-cream-60)", display: "flex", flexDirection: "column", gap: "4px" }}>
        {!currentPreset && <span>⏳ Waiting for host to select a preset…</span>}
        {currentPreset && !currentAudio && <span>⏳ Waiting for host to add audio…</span>}
        {currentPreset && currentAudio && !audioReady && <span>⏳ Downloading audio — this may take a moment…</span>}
        {currentPreset && currentAudio && audioReady && !hostPlaying && <span>⏸ Host is paused</span>}
        {currentPreset && currentAudio && audioReady && hostPlaying && <span>▶ Live</span>}
      </div>
    </div>
  );
};

export default BroadcastViewer;
