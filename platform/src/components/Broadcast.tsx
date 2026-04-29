import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { UserAuth } from "../context/AuthContext";
import BroadcastRoomList from "./broadcast/BroadcastRoomList";

const Broadcast = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const startRoom = async () => {
    if (!supabase || !session?.user) return;
    setCreating(true);
    const roomId = crypto.randomUUID();
    navigate(`/broadcast/host/${roomId}`);
  };

  return (
    <div className="mage-page">
      <header className="mage-page__header">
        <div className="mage-page__title-group">
          <p className="mage-eyebrow">
            <span className="mage-eyebrow__num">05</span>
            Broadcast
          </p>
          <h1 className="mage-title" style={{ whiteSpace: "nowrap" }}>Live Rooms</h1>
        </div>
        <button
          type="button"
          className="mage-btn mage-btn--primary"
          onClick={startRoom}
          disabled={creating}
        >
          {creating ? "Starting…" : "Start your own room"}
        </button>
      </header>

      <div className="mage-stack mage-stack--lg">
        <BroadcastRoomList />
      </div>
    </div>
  );
};

export default Broadcast;
