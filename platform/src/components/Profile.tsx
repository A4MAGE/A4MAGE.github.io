import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

type ProfileRow = {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
};

function gradientForName(name = "") {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < name.length; i++) {
    h1 = (h1 * 31 + name.charCodeAt(i)) & 0xffff;
    h2 = (h2 * 17 + name.charCodeAt(i)) & 0xffff;
  }
  const hue1 = h1 % 360;
  const hue2 = (hue1 + 60 + (h2 % 60)) % 360;
  return `linear-gradient(135deg, hsl(${hue1},55%,28%), hsl(${hue2},60%,18%))`;
}

const Profile = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const userId = session?.user?.id;
  const email = session?.user?.email ?? "";
  const createdAt = session?.user?.created_at;

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPresets, setRecentPresets] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabase || !userId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("user_id, username, avatar_url, bio")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setProfile(data as ProfileRow);
        setNameDraft((data as ProfileRow).username ?? "");
        setBioDraft((data as ProfileRow).bio ?? "");
      } else {
        const fallback: ProfileRow = { user_id: userId, username: email ? email.split("@")[0] : null, avatar_url: null, bio: null };
        setProfile(fallback);
        setNameDraft(fallback.username ?? "");
      }

      // Fetch recent presets
      const { data: presets } = await supabase
        .from("preset_with_username")
        .select("id, name, thumbnail_url, scene_data")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!cancelled && presets) setRecentPresets(presets);

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId, email]);

  const displayName = profile?.username?.trim() || (email ? email.split("@")[0] : "guest");
  const initial = (displayName[0] ?? "?").toUpperCase();
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "—";

  const saveUsername = async () => {
    if (!supabase || !userId) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) { setError("Username can't be empty."); return; }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("profile").upsert({ user_id: userId, username: trimmed }, { onConflict: "user_id" });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setProfile((p) => (p ? { ...p, username: trimmed } : p));
    setEditingName(false);
  };

  const saveBio = async () => {
    if (!supabase || !userId) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("profile").upsert({ user_id: userId, bio: bioDraft.trim() }, { onConflict: "user_id" });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setProfile((p) => (p ? { ...p, bio: bioDraft.trim() } : p));
    setEditingBio(false);
  };

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase || !userId) return;
    if (!file.type.startsWith("image/")) { setError("Avatar must be an image."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Avatar must be under 2 MB."); return; }
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); setError(upErr.message); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const cacheBusted = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: dbErr } = await supabase.from("profile").upsert({ user_id: userId, avatar_url: cacheBusted }, { onConflict: "user_id" });
    setUploading(false);
    if (dbErr) { setError(dbErr.message); return; }
    setProfile((p) => (p ? { ...p, avatar_url: cacheBusted } : p));
  };

  return (
    <div className="mage-page">
      <header className="mage-page__header">
        <div className="mage-page__title-group">
          <p className="mage-eyebrow">
            <span className="mage-eyebrow__num">01</span>
            Profile
          </p>
          <h1 className="mage-title">Account</h1>
        </div>
      </header>

      {loading ? (
        <p className="mage-preset-list__empty">Loading…</p>
      ) : (
        <div className="mage-stack mage-stack--lg">

          {/* Hero card */}
          <div className="mage-profile-hero">
            <div className="mage-profile-hero__avatar-wrap">
              <button
                type="button"
                className="mage-avatar mage-avatar--hero mage-avatar--button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload avatar"
                disabled={uploading}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="mage-avatar__img" />
                ) : (
                  <span className="mage-avatar__initial">{initial}</span>
                )}
                <span className="mage-avatar__overlay">{uploading ? "Uploading…" : "Change"}</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />
            </div>

            <div className="mage-profile-hero__info">
              {editingName ? (
                <div className="mage-identity__edit">
                  <input
                    type="text"
                    className="mage-input"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") { setEditingName(false); setNameDraft(profile?.username ?? ""); } }}
                    maxLength={32}
                    autoFocus
                  />
                  <button type="button" className="mage-btn mage-btn--primary" onClick={saveUsername} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                  <button type="button" className="mage-btn mage-btn--quiet" onClick={() => { setEditingName(false); setNameDraft(profile?.username ?? ""); setError(null); }}>Cancel</button>
                </div>
              ) : (
                <div className="mage-profile-hero__name-row">
                  <h2 className="mage-profile-hero__name">{displayName}</h2>
                  <button type="button" className="mage-btn mage-btn--quiet mage-btn--tiny" onClick={() => setEditingName(true)}>Edit</button>
                </div>
              )}

              <p className="mage-profile-hero__email">{email}</p>
              <p className="mage-profile-hero__since">Member since {memberSince}</p>

              {/* Bio */}
              {editingBio ? (
                <div className="mage-profile-bio-edit">
                  <textarea
                    className="mage-input mage-profile-bio-edit__ta"
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    placeholder="Tell people a bit about yourself…"
                    maxLength={200}
                    rows={3}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="mage-btn mage-btn--primary" onClick={saveBio} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                    <button type="button" className="mage-btn mage-btn--quiet" onClick={() => { setEditingBio(false); setBioDraft(profile?.bio ?? ""); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mage-profile-bio">
                  {profile?.bio ? (
                    <p className="mage-profile-bio__text">{profile.bio}</p>
                  ) : (
                    <p className="mage-profile-bio__placeholder">No bio yet.</p>
                  )}
                  <button type="button" className="mage-btn mage-btn--quiet mage-btn--tiny" onClick={() => setEditingBio(true)}>
                    {profile?.bio ? "Edit bio" : "Add bio"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <p className="mage-profile__error">{error}</p>}

          {/* Recent presets strip */}
          {recentPresets.length > 0 && (
            <div className="mage-profile-recent">
              <p className="mage-eyebrow">
                <span className="mage-eyebrow__num">02</span>
                Recent Presets
              </p>
              <div className="mage-profile-recent__strip">
                {recentPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="mage-profile-recent__card"
                    onClick={() => navigate("/player", { state: { preset: p } })}
                  >
                    <div className="mage-profile-recent__thumb">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.name} />
                      ) : (
                        <div className="mage-profile-recent__thumb-placeholder" style={{ background: gradientForName(p.name) }} />
                      )}
                    </div>
                    <span className="mage-profile-recent__name">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Profile;
