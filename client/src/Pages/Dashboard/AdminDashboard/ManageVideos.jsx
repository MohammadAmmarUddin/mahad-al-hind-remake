import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaPlus,
  FaYoutube,
  FaTag,
  FaAlignLeft,
  FaLink,
  FaCheckCircle,
} from "react-icons/fa";
import { MdVideoLibrary, MdClose, MdRefresh } from "react-icons/md";

const BASE_URL = import.meta.env.VITE_MAHAD_baseUrl || "";

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

const showAlert = (options) => {
  setTimeout(() => Swal.fire(options), 0);
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#0d3d26",
  marginBottom: 6,
  display: "block",
};

const inputWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid rgba(0,128,78,0.25)",
  borderRadius: 10,
  padding: "9px 14px",
  background: "#f8fdf9",
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

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: "", tag: "", desc: "", url: "" });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [preview, setPreview] = useState(null);

  const styleRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(el);
    styleRef.current = el;

    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const res = await fetch(`${BASE_URL}/api/videos`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setVideos(data);
    } catch {
      setFetchError("Failed to load videos. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();

    const { title, url, tag, desc } = form;

    if (!title.trim() || !url.trim()) {
      showAlert({
        icon: "warning",
        title: "Required Fields",
        text: "Title and YouTube URL are required!",
      });
      return;
    }

    const embedUrl = toEmbedUrl(url.trim());

    if (!embedUrl) {
      showAlert({
        icon: "error",
        title: "Invalid URL",
        text: "Please enter a valid YouTube URL.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${BASE_URL}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tag, desc, embedUrl }),
      });

      if (!res.ok) throw new Error();

      const saved = await res.json();

      setVideos((prev) => [saved, ...prev]);

      setForm({ title: "", tag: "", desc: "", url: "" });

      showAlert({
        icon: "success",
        title: "Video Added!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      showAlert({
        icon: "error",
        title: "Upload Failed",
        text: "Could not add video.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Video?",
      text: "This video will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#00804e",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    setDeleting(id);

    try {
      const res = await fetch(`${BASE_URL}/api/videos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setVideos((prev) => prev.filter((v) => v._id !== id));

      showAlert({
        icon: "success",
        title: "Deleted!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      showAlert({
        icon: "error",
        title: "Delete Failed",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0faf5",
        padding: "32px 20px",
        fontFamily: "sans-serif",
      }}
    >
      {preview !== null && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              width: "90%",
              maxWidth: 700,
            }}
          >
            <div
              style={{
                background: "#047857",
                padding: 12,
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{preview.title}</span>

              <button
                onClick={() => setPreview(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <MdClose />
              </button>
            </div>

            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                src={`${preview.embedUrl}?autoplay=1`}
                allowFullScreen
                title={preview.title}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: "#065f46" }}>Manage Videos</h2>

        <form
          onSubmit={handleAdd}
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            marginBottom: 30,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Title</label>
            <div style={inputWrap}>
              <FaAlignLeft size={13} />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Tag</label>
            <div style={inputWrap}>
              <FaTag size={12} />
              <input
                name="tag"
                value={form.tag}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>YouTube URL</label>
            <div style={inputWrap}>
              <FaYoutube size={16} color="red" />
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "#00804e",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {submitting ? "Uploading..." : "Add Video"}
          </button>
        </form>

        {loading && <p>Loading videos...</p>}
        {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}

        {!loading &&
          videos.map((v, i) => {
            const videoId = v.embedUrl?.split("/embed/")[1] || "";

            return (
              <div
                key={v._id || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  background: "#fff",
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  width={120}
                  style={{ cursor: "pointer", borderRadius: 8 }}
                  onClick={() => setPreview(v)}
                />

                <div style={{ flex: 1 }}>
                  <strong>{v.title}</strong>
                  <p style={{ margin: 0, fontSize: 13 }}>{v.desc}</p>
                </div>

                <button
                  onClick={() => handleDelete(v._id)}
                  disabled={deleting === v._id}
                  style={{
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {deleting === v._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ManageVideos;
