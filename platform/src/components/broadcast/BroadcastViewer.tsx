import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import EnginePlayer from "../mage engine/EnginePlayer";
import { openViewerSubscription, type RoomRow } from "../../lib/broadcastChannel";
import type { MAGEEngineAPI } from "@notrac/mage";

const DRIFT_THRESHOLD = 0.3;

const BroadcastViewer = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ended, setEnded] = useState(false);
  const [title, setTitle] = useState("Live Room");

  const [currentPreset, setCurrentPreset] = useState<object | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const engineRef = useRef<MAGEEngineAPI | null>(null);

  // Intended playback state — decoupled from engine readiness
  const shouldPlayRef = useRef(false);
  const targetTimeRef = useRef(0);
  const playRetryRef = useRef<number | null>(null);

  const clearRetry = () => {
    if (playRetryRef.current) { window.clearInterval(playRetryRef.current); playRetryRef.current = null; }
  };

  // Try to play. If engine/audio not ready, keep retrying until they are.
  const tryPlay = (time: number) => {
    shouldPlayRef.current = true;
    targetTimeRef.current = time;
    clearRetry();
    playRetryRef.current = window.setInterval(() => {
      const eng = engineRef.current;
      if (!eng) return; // engine not mounted yet
      if (!eng.isAudioLoaded()) return; // audio still loading
      if (Math.abs(eng.getAudioTime() - targetTimeRef.current) > DRIFT_THRESHOLD) {
        eng.seek(targetTimeRef.current);
      }
      eng.play();
      clearRetry();
    }, 100);
  };

  const tryPause = () => {
    shouldPlayRef.current = false;
    clearRetry();
    engineRef.current?.pause();
  };

  const applyPlayback = (playing: boolean, time: number) => {
    if (playing) tryPlay(time);
    else tryPause();
  };

  const applyRow = (row: Partial<RoomRow>) => {
    if (row.is_active === false) { setEnded(true); return; }
    if (row.current_preset_data) setCurrentPreset(row.current_preset_data);
    if (row.current_audio_url) setCurrentAudio(row.current_audio_url);
    if (row.title) setTitle(row.title);
    if (typeof row.is_playing === "boolean") {
      applyPlayback(row.is_playing, row.playback_time ?? 0);
    }
  };

  // When engine becomes ready, retry play if we should be playing
  const onEngineReady = (eng: MAGEEngineAPI) => {
    engineRef.current = eng;
    if (shouldPlayRef.current) tryPlay(targetTimeRef.current);
  };

  // Fetch initial room state
  useEffect(() => {
    if (!supabase || !roomId) return;
    supabase
      .from("broadcast_room")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data, error }: any) => {
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        applyRow(data as RoomRow);
        setLoading(false);
      });
  }, [roomId]);

  // Subscribe to Postgres Changes + broadcast ticks
  useEffect(() => {
    if (!roomId || loading || notFound) return;
    const unsub = openViewerSubscription(
      roomId,
      (row) => applyRow(row),
      (tick) => applyPlayback(tick.playing, tick.currentTime)
    );
    return () => { unsub(); clearRetry(); };
  }, [roomId, loading, notFound]);

  if (loading) return <div className="mage-page"><p className="mage-body">Joining room…</p></div>;
  if (notFound) return <div className="mage-page"><p className="mage-body">Room not found.</p></div>;
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
