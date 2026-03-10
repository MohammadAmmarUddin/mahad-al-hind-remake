import { useState } from "react";

const videos = [
  {
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "তিলাওয়াত",
    title: "সূরা আল-ফাতিহা – বিশেষ তিলাওয়াত",
    desc: "মা'হাদুল কিরা'আত আল হিন্দের বিশেষ তিলাওয়াত পরিবেশনা।",
  },
  {
    embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    tag: "ক্লাস",
    title: "কিরা'আত শিক্ষা – প্রথম পাঠ",
    desc: "কুরআনিক শিক্ষার জন্য আমাদের বিশেষ ক্লাস সিরিজ।",
  },
  {
    embedUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    tag: "ইভেন্ট",
    title: "বার্ষিক কিরা'আত প্রতিযোগিতা ২০২৪",
    desc: "আমাদের বার্ষিক কুরআন তিলাওয়াত প্রতিযোগিতার হাইলাইটস।",
  },
  {
    embedUrl: "https://www.youtube.com/embed/JGwWNGJdvx8",
    tag: "বিশেষ",
    title: "শায়খের বিশেষ দারস – তাজবিদ",
    desc: "তাজবিদের গুরুত্বপূর্ণ নিয়মকানুন নিয়ে বিশেষ আলোচনা।",
  },
  {
    embedUrl: "https://www.youtube.com/embed/OPf0YbXqDm0",
    tag: "অনুষ্ঠান",
    title: "সনদ প্রদান অনুষ্ঠান ২০২৪",
    desc: "কৃতী শিক্ষার্থীদের সনদ প্রদান অনুষ্ঠানের বিশেষ মুহূর্ত।",
  },
  {
    embedUrl: "https://www.youtube.com/embed/YqeW9_5kURI",
    tag: "পরিচিতি",
    title: "মা'হাদুল কিরা'আত – প্রতিষ্ঠানের পরিচয়",
    desc: "২০২২ সালে প্রতিষ্ঠিত আমাদের কুরআনিক শিক্ষাপ্রতিষ্ঠানের পরিচয়।",
  },
];

const VideoSection = () => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  const goTo = (idx) => {
    setCurrent(idx);
    setPlaying(false);
  };

  const prev = () => goTo((current - 1 + videos.length) % videos.length);
  const next = () => goTo((current + 1) % videos.length);
  const v = videos[current];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          background: "#f8fdf9",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          fontFamily: "'Hind Siliguri', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative shapes */}
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
        {/* top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #00804e, #00a86b, #00804e)",
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
          {/* eyebrow */}
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
              ভিডিও গ্যালারি
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

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
              fontWeight: 800,
              color: "#0d3d26",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            Ma'hadul Qira'at Al Hind
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#4a7a62",
              margin: 0,
              fontWeight: 500,
            }}
          >
            কুরআনিক শিক্ষার বিশেষ ভিডিও সংকলন
          </p>
        </div>

        {/* PLAYER ROW */}
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
          {/* Left Arrow */}
          <button
            onClick={prev}
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Video Player */}
          <div
            onClick={() => !playing && setPlaying(true)}
            style={{
              flex: 1,
              position: "relative",
              paddingTop: "56.25%",
              borderRadius: 20,
              overflow: "hidden",
              background: "#0d3d26",
              boxShadow:
                "0 20px 60px rgba(0,128,78,0.18), 0 4px 20px rgba(0,0,0,0.12)",
              cursor: playing ? "default" : "pointer",
              border: "3px solid rgba(0,128,78,0.15)",
            }}
          >
            <iframe
              key={v.embedUrl + playing}
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
                    "linear-gradient(160deg, rgba(13,61,38,0.55) 0%, rgba(0,128,78,0.35) 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  zIndex: 2,
                }}
              >
                {/* geometric accent */}
                <div
                  style={{
                    position: "absolute",
                    right: 32,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.15,
                  }}
                >
                  <svg width="80" height="100" viewBox="0 0 80 100">
                    <polygon points="0,0 80,50 0,100" fill="#fff" />
                  </svg>
                </div>
                {/* play button */}
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00804e, #00c47a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 0 0 14px rgba(0,128,78,0.2), 0 8px 32px rgba(0,128,78,0.5)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                    letterSpacing: "0.04em",
                    position: "relative",
                    zIndex: 1,
                    background: "rgba(0,0,0,0.2)",
                    padding: "4px 14px",
                    borderRadius: 999,
                  }}
                >
                  ক্লিক করে দেখুন
                </span>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <button
            onClick={next}
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* META + DOTS */}
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Tag + desc */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
              minWidth: 0,
            }}
          >
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
            <div style={{ minWidth: 0 }}>
              <div
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
              </div>
              <div style={{ fontSize: 12, color: "#4a7a62", marginTop: 2 }}>
                {v.desc}
              </div>
            </div>
          </div>

          {/* Counter + Dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4a7a62" }}>
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
                    transition: "width .3s, background .3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom divider accent */}
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
    </>
  );
};

export default VideoSection;
