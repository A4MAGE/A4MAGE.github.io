import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MyPresets = () => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; description: string }>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const { session } = UserAuth();
  const userID = session?.user?.id;

  useEffect(() => {
    if (!supabase) return;
    if (!userID) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.from("preset").select("*").eq("user_id", userID);
      if (!error) setPresets(data ?? []);
      setLoading(false);
    })();
  }, [userID]);

  const handleDelete = async (id: number) => {
    if (!supabase) return;
    const { error } = await supabase.from("preset").delete().eq("id", id);
    if (!error) setPresets(prev => prev.filter((p) => p.id !== id));
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditValues({ name: p.name, description: p.description ?? "" });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: number) => {
    if (!supabase || !editValues.name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("preset")
      .update({ name: editValues.name.trim(), description: editValues.description.trim() || null })
      .eq("id", id);
    if (!error) {
      setPresets(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, name: editValues.name.trim(), description: editValues.description.trim() || null }
            : p
        )
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <main className="mage-page">
      <header className="mage-page__header">
        <div className="mage-page__title-group">
          <p className="mage-eyebrow">
            <span className="mage-eyebrow__num">{presets.length}</span> Presets Saved
          </p>
          <h1 className="mage-title" style={{ whiteSpace: "nowrap" }}>My Presets</h1>
        </div>
        <Link to="/create" className="mage-btn mage-btn--primary">
          + Create New Preset
        </Link>
      </header>

      <div className="mage-stack mage-stack--lg">
        {loading ? (
          <div className="mage-panel">
            <p className="mage-preset-list__empty">Loading presets…</p>
          </div>
        ) : !userID ? (
          <div className="mage-panel">
            <p className="mage-preset-list__empty">Please sign in to see your presets.</p>
          </div>
        ) : presets.length > 0 ? (
          <ul className="mage-preset-list">
            {presets.map((p, index) => (
              <li key={p.id} className="mage-preset-item" style={{ alignItems: "center" }}>
                <span className="mage-preset-list__num">{index + 1}</span>
                {p.thumbnail_url && (
                  <img
                    src={p.thumbnail_url}
                    alt={p.name}
                    className="mage-preset-thumb"
                    style={{ width: 96, height: 96 }}
                    loading="lazy"
                  />
                )}
                <div className="mage-preset-info" style={{ flex: 1 }}>
                  {editingId === p.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <input
                        className="mage-input"
                        value={editValues.name}
                        onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                        onKeyDown={e => handleKeyDown(e, p.id)}
                        placeholder="Preset name"
                        autoFocus
                      />
                      <input
                        className="mage-input"
                        value={editValues.description}
                        onChange={e => setEditValues(v => ({ ...v, description: e.target.value }))}
                        onKeyDown={e => handleKeyDown(e, p.id)}
                        placeholder="Description (optional)"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="mage-preset-name">{p.name}</span>
                      {p.description && (
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--mage-cream-60)" }}>
                          {p.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {editingId === p.id ? (
                  <button className="mage-btn mage-btn--quiet" onClick={() => saveEdit(p.id)} disabled={saving || !editValues.name.trim()}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <button className="mage-btn mage-btn--quiet" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                )}
                {editingId === p.id ? (
                  <button className="mage-btn mage-btn--quiet" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                ) : null}
                <button className="mage-btn mage-btn--quiet delete-action" onClick={() => handleDelete(p.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mage-panel">
            <p className="mage-preset-list__empty">
              No presets found.{" "}
              <Link to="/create" className="mage-link">Create your first preset →</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyPresets;
