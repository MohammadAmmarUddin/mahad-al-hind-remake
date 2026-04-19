import { useState, useEffect, useRef } from "react";
import { useSiteContent } from "../context/SiteContentContext";

const BASE_URL = import.meta.env.VITE_MAHAD_baseUrl || "";

const VideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const styleRef = useRef(null);
  const { translate } = useSiteContent();

  // ── Inject @keyframes ──
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => {
      try {
        if (styleRef.current && document.head.contains(styleRef.current))
          document.head.removeChild(styleRef.current);
      } catch {}
    };
  }, []);

  // ── Track screen size ──
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Fetch videos ──
  useEffect(() => {
    fetch(`${BASE_URL}/api/videos`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => {
        setError(translate("videoSection", "error"));
        setLoading(false);
      });
  }, [translate]);

  const goTo = (idx) => {
    setCurrent(idx);
    setPlaying(false);
  };
  const prev = () => goTo((current - 1 + videos.length) % videos.length);
  const next = () => goTo((current + 1) % videos.length);
  const v = videos[current];

  const ArrowBtn = ({ onClick, direction }) => (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#00804e";
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.borderColor = "#00804e";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.color = "#00804e";
        e.currentTarget.style.borderColor = "rgba(0,128,78,0.25)";
      }}
      style={{
        flexShrink: 0,
        width: 46,
        height: 46,
        borderRadius: "50%",
        background: "#fff",
        border: "2px solid rgba(0,128,78,0.25)",
        color: "#00804e",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 12px rgba(0,128,78,0.1)",
        transition: "all .2s",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "left" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    </button>
  );

  return (
    <div
      style={{
        background: "#f8fdf9",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* BG blobs */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,128,78,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,128,78,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg,#00804e,#00a86b,#00804e)",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 36,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(0,128,78,0.08)",
            border: "1px solid rgba(0,128,78,0.2)",
            borderRadius: 999,
            padding: "5px 16px",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#00804e",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#00804e",
            }}
          >
            {translate("videoSection", "badge")}
          </span>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#00804e",
              display: "inline-block",
            }}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid rgba(0,128,78,0.15)",
              borderTop: "4px solid #00804e",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#4a7a62", fontSize: 14, margin: 0 }}>
            {translate("videoSection", "loading")}
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          style={{
            zIndex: 1,
            background: "#fff5f5",
            border: "1px solid #fca5a5",
            borderRadius: 12,
            padding: "20px 32px",
            color: "#dc2626",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && videos.length === 0 && (
        <div style={{ zIndex: 1, textAlign: "center", color: "#4a7a62" }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0,128,78,0.3)"
            strokeWidth="1.5"
            style={{ marginBottom: 12 }}
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            {translate("videoSection", "emptyTitle")}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            {translate("videoSection", "emptySubtitle")}
          </p>
        </div>
      )}

      {/* PLAYER */}
      {!loading && !error && videos.length > 0 && v && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* ── Player Row ── */}
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left arrow — desktop only */}
            {!isMobile && <ArrowBtn onClick={prev} direction="left" />}

            {/* Video box */}
            <div
              onClick={() => !playing && setPlaying(true)}
              style={{
                flex: 1,
                position: "relative",
                paddingTop: "56.25%",
                borderRadius: isMobile ? 14 : 20,
                overflow: "hidden",
                background: "#0d3d26",
                boxShadow:
                  "0 20px 60px rgba(0,128,78,0.18),0 4px 20px rgba(0,0,0,0.12)",
                cursor: playing ? "default" : "pointer",
                border: "3px solid rgba(0,128,78,0.15)",
              }}
            >
              <iframe
                key={`${v._id}-${playing}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  pointerEvents: playing ? "all" : "none",
                }}
                src={
                  playing
                    ? `${v.embedUrl}?autoplay=1&rel=0&modestbranding=1`
                    : `${v.embedUrl}?rel=0&modestbranding=1`
                }
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={v.title}
              />
              {/* Overlay */}
              {!playing && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(160deg,rgba(13,61,38,0.55) 0%,rgba(0,128,78,0.35) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#00804e,#00c47a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 0 0 14px rgba(0,128,78,0.2),0 8px 32px rgba(0,128,78,0.5)",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(0,0,0,0.2)",
                      padding: "4px 14px",
                      borderRadius: 999,
                    }}
                  >
                    {translate("videoSection", "clickToWatch")}
                  </span>
                </div>
              )}
            </div>

            {/* Right arrow — desktop only */}
            {!isMobile && <ArrowBtn onClick={next} direction="right" />}
          </div>

          {/* ── Mobile swipe dots row ── */}
          {isMobile && videos.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                zIndex: 1,
              }}
            >
              <button
                onClick={prev}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#00804e",
                  padding: "4px 10px",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ‹
              </button>
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === current ? 22 : 7,
                    height: 7,
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    background:
                      i === current ? "#00804e" : "rgba(0,128,78,0.2)",
                    transition: "width .3s,background .3s",
                  }}
                />
              ))}
              <button
                onClick={next}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#00804e",
                  padding: "4px 10px",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ›
              </button>
            </div>
          )}

          {/* ── META + DOTS (desktop) ── */}
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              marginTop: isMobile ? 14 : 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                minWidth: 0,
              }}
            >
              {v.tag && (
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: "#00804e",
                    padding: "4px 12px",
                    borderRadius: 6,
                  }}
                >
                  {v.tag}
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 700,
                    color: "#0d3d26",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {v.title}
                </div>
                {v.desc && (
                  <div style={{ fontSize: 12, color: "#4a7a62", marginTop: 2 }}>
                    {v.desc}
                  </div>
                )}
              </div>
            </div>

            {/* Dots — desktop only */}
            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#4a7a62" }}
                >
                  {current + 1} / {videos.length}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {videos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      style={{
                        width: i === current ? 22 : 7,
                        height: 7,
                        borderRadius: 999,
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        background:
                          i === current ? "#00804e" : "rgba(0,128,78,0.2)",
                        transition: "width .3s,background .3s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: 40,
              width: 60,
              height: 3,
              borderRadius: 3,
              background: "linear-gradient(90deg,#00804e,#00c47a)",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoSection;
