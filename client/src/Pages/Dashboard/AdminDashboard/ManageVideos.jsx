import { useState } from "react";
import {
  FaTrash,
  FaYoutube,
  FaPlus,
  FaLink,
  FaTag,
  FaAlignLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { MdVideoLibrary, MdClose } from "react-icons/md";

// ─── Replace with your real API base URL ───
const BASE_URL = import.meta.env?.VITE_MAHAD_baseUrl || "";

// ─── Simulated local state (replace fetch calls with your real API) ───
const SAMPLE = [
  {
    _id: "1",
    tag: "তিলাওয়াত",
    title: "সূরা আল-ফাতিহা",
    desc: "বিশেষ তিলাওয়াত পরিবেশনা।",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    _id: "2",
    tag: "ক্লাস",
    title: "কিরা'আত শিক্ষা – প্রথম পাঠ",
    desc: "কুরআনিক শিক্ষার জন্য বিশেষ ক্লাস।",
    embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
  },
];

const toEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let id = u.searchParams.get("v");
    if (!id && u.hostname === "youtu.be") id = u.pathname.slice(1);
    if (!id && u.pathname.includes("/embed/"))
      id = u.pathname.split("/embed/")[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
};

const ManageVideos = () => {
  const [videos, setVideos] = useState(SAMPLE);
  const [form, setForm] = useState({ title: "", tag: "", desc: "", url: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { title, tag, desc, url } = form;
    if (!title.trim() || !url.trim()) {
      setError("Title and YouTube URL are required.");
      return;
    }
    const embedUrl = toEmbedUrl(url.trim());
    if (!embedUrl) {
      setError(
        "Invalid YouTube URL. Use format: https://youtube.com/watch?v=...",
      );
      return;
    }

    setSubmitting(true);
    // ── Replace below with: await fetch(`${BASE_URL}/api/videos`, { method:'POST', ... })
    const newVideo = { _id: Date.now().toString(), title, tag, desc, embedUrl };
    setVideos((prev) => [newVideo, ...prev]);
    setForm({ title: "", tag: "", desc: "", url: "" });
    setSuccess("Video added successfully!");
    setTimeout(() => setSuccess(""), 3000);
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    // ── Replace below with: await fetch(`${BASE_URL}/api/videos/${id}`, { method:'DELETE' })
    setTimeout(() => {
      setVideos((prev) => prev.filter((v) => v._id !== id));
      setDeleting(null);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0faf5",
        padding: "32px 20px",
        fontFamily: "'Hind Siliguri', 'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* PAGE HEADER */}
      <div style={{ maxWidth: 900, margin: "0 auto 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "linear-gradient(135deg,#00804e,#00c47a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,128,78,0.3)",
            }}
          >
            <MdVideoLibrary size={22} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#0d3d26",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Manage Videos
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#4a7a62" }}>
              Add, preview and remove YouTube videos shown on the website
            </p>
          </div>
        </div>
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg,#00804e,#00c47a,transparent)",
            borderRadius: 3,
            marginTop: 16,
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* ADD FORM */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(0,128,78,0.15)",
            boxShadow: "0 4px 24px rgba(0,128,78,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#065f46,#047857)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FaPlus color="#fff" size={14} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              Add New Video
            </span>
          </div>

          <form
            onSubmit={handleAdd}
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Row 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>Video Title *</label>
                <div style={inputWrap}>
                  <FaAlignLeft
                    size={13}
                    color="#00804e"
                    style={{ flexShrink: 0 }}
                  />
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. সূরা আল-ফাতিহা তিলাওয়াত"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tag / Category</label>
                <div style={inputWrap}>
                  <FaTag size={12} color="#00804e" style={{ flexShrink: 0 }} />
                  <input
                    name="tag"
                    value={form.tag}
                    onChange={handleChange}
                    placeholder="e.g. তিলাওয়াত, ক্লাস, ইভেন্ট"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* YouTube URL */}
            <div>
              <label style={labelStyle}>YouTube URL *</label>
              <div style={inputWrap}>
                <FaYoutube
                  size={16}
                  color="#ff0000"
                  style={{ flexShrink: 0 }}
                />
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <div
                style={{
                  ...inputWrap,
                  alignItems: "flex-start",
                  padding: "10px 14px",
                }}
              >
                <FaAlignLeft
                  size={13}
                  color="#00804e"
                  style={{ flexShrink: 0, marginTop: 3 }}
                />
                <textarea
                  name="desc"
                  value={form.desc}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Short description (optional)"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff5f5",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                }}
              >
                <MdClose size={16} /> {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#16a34a",
                  fontSize: 13,
                }}
              >
                <FaCheckCircle size={14} /> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                alignSelf: "flex-start",
                background: submitting
                  ? "#9ca3af"
                  : "linear-gradient(135deg,#00804e,#00c47a)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "11px 28px",
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(0,128,78,0.3)",
                transition: "opacity .2s",
              }}
            >
              <FaPlus size={12} />
              {submitting ? "Adding..." : "Add Video"}
            </button>
          </form>
        </div>

        {/* VIDEO LIST */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(0,128,78,0.15)",
            boxShadow: "0 4px 24px rgba(0,128,78,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#065f46,#047857)",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MdVideoLibrary color="#fff" size={16} />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                Uploaded Videos
              </span>
            </div>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: 999,
              }}
            >
              {videos.length} videos
            </span>
          </div>

          {videos.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#4a7a62" }}>
              <MdVideoLibrary
                size={48}
                color="rgba(0,128,78,0.2)"
                style={{ marginBottom: 12 }}
              />
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                No videos yet
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                Add your first YouTube video above.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {videos.map((v, i) => (
                <div
                  key={v._id}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    padding: "18px 24px",
                    borderBottom:
                      i < videos.length - 1
                        ? "1px solid rgba(0,128,78,0.08)"
                        : "none",
                    transition: "background .2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0fdf4")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => setPreview(v)}
                    style={{
                      flexShrink: 0,
                      width: 110,
                      height: 68,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#0d3d26",
                      cursor: "pointer",
                      position: "relative",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${v.embedUrl.split("/embed/")[1]}/hqdefault.jpg`}
                      alt={v.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(0,128,78,0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <polygon points="6,3 20,12 6,21" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      {v.tag && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#fff",
                            background: "#00804e",
                            padding: "2px 9px",
                            borderRadius: 4,
                          }}
                        >
                          {v.tag}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0d3d26",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {v.title}
                      </span>
                    </div>
                    {v.desc && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#4a7a62",
                          lineHeight: 1.5,
                        }}
                      >
                        {v.desc}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      <FaLink size={10} color="#9ca3af" />
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 300,
                        }}
                      >
                        {v.embedUrl}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setPreview(v)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,128,78,0.3)",
                        background: "transparent",
                        color: "#00804e",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#00804e";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#00804e";
                      }}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      disabled={deleting === v._id}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: "1px solid rgba(220,38,38,0.25)",
                        background: "transparent",
                        color: "#dc2626",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all .2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#dc2626";
                      }}
                    >
                      <FaTrash size={11} />
                      {deleting === v._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              width: "100%",
              maxWidth: 700,
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#065f46,#047857)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {preview.title}
              </span>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdClose size={16} />
              </button>
            </div>
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                background: "#000",
              }}
            >
              <iframe
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                src={`${preview.embedUrl}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={preview.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared micro-styles ──
const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#0d3d26",
  marginBottom: 6,
  display: "block",
  letterSpacing: "0.04em",
};
const inputWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid rgba(0,128,78,0.25)",
  borderRadius: 10,
  padding: "9px 14px",
  background: "#f8fdf9",
  transition: "border-color .2s",
};
const inputStyle = {
  flex: 1,
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: 14,
  color: "#0d3d26",
  fontFamily: "inherit",
};

export default ManageVideos;
