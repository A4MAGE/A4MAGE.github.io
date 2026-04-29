import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

type Room = {
  id: string;
  title: string;
  host_user_id: string;
  current_preset_id: number | null;
  thumbnail_url: string | null;
  host_username: string | null;
};

const BroadcastRoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase
      .from("broadcast_room")
      .select(`
        id,
        title,
        host_user_id,
        current_preset_id,
        preset:current_preset_id (thumbnail_url),
        profile:host_user_id (username)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }: { data: any; error: any }) => {
        if (!error && data) {
          setRooms(
            data.map((r: any) => ({
              id: r.id,
              title: r.title,
              host_user_id: r.host_user_id,
              current_preset_id: r.current_preset_id,
              thumbnail_url: r.preset?.thumbnail_url ?? null,
              host_username: r.profile?.username ?? null,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="mage-body">Loading rooms…</p>;
  if (rooms.length === 0)
    return <p className="mage-body">No live rooms right now.</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px",
      }}
    >
      {rooms.map((room) => (
        <div
          key={room.id}
          style={{
            background: "var(--mage-surface, #1a1a1a)",
            border: "1px solid var(--mage-border, #333)",
            borderRadius: "8px",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/broadcast/room/${room.id}`)}
        >
          {room.thumbnail_url ? (
            <img
              src={room.thumbnail_url}
              alt={room.title}
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "var(--mage-surface-2, #222)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mage-muted, #666)",
                fontSize: "12px",
              }}
            >
              No preview
            </div>
          )}
          <div style={{ padding: "12px" }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                color: "var(--mage-text, #fff)",
                fontSize: "14px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {room.title}
            </p>
            {room.host_username && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "var(--mage-muted, #888)",
                }}
              >
                {room.host_username}
              </p>
            )}
            <button
              type="button"
              className="mage-btn"
              style={{ marginTop: "10px", width: "100%" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/broadcast/room/${room.id}`);
              }}
            >
              Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BroadcastRoomList;
