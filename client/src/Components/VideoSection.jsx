import { useEffect, useMemo, useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import { safeFetchJson } from "../config/api";

const VideoSection = () => {
  const { translate } = useSiteContent();
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    let active = true;

    const loadVideos = async () => {
      const data = await safeFetchJson("/api/videos", {}, []);
      const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

      if (active) {
        setVideos(items);
        setLoading(false);
      }
    };

    loadVideos();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const currentVideo = useMemo(() => videos[current], [videos, current]);

  const goTo = (index) => {
    if (!videos.length) {
      return;
    }

    setCurrent(index);
    setPlaying(false);
  };

  const prev = () => goTo((current - 1 + videos.length) % videos.length);
  const next = () => goTo((current + 1) % videos.length);

  return (
    <section className="relative overflow-hidden bg-[#f8fdf9] px-5 py-16 sm:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            {translate("videoSection", "badge")}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 text-slate-600">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="text-sm">{translate("videoSection", "loading")}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="max-w-lg rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">
              {translate("videoSection", "emptyTitle")}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {translate("videoSection", "emptySubtitle")}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mx-auto flex max-w-4xl items-center gap-4">
              {!isMobile && (
                <button
                  type="button"
                  onClick={prev}
                  className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white md:flex"
                >
                  <span className="text-xl">&#8249;</span>
                </button>
              )}

              <div
                className="relative flex-1 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-950 shadow-2xl"
                onClick={() => setPlaying(true)}
                role="button"
                tabIndex={0}
              >
                <div className="pt-[56.25%]" />
                <iframe
                  key={`${currentVideo?._id || current}-${playing}`}
                  className="absolute inset-0 h-full w-full border-0"
                  title={currentVideo?.title || "Video"}
                  src={
                    currentVideo?.embedUrl
                      ? playing
                        ? `${currentVideo.embedUrl}?autoplay=1&rel=0&modestbranding=1`
                        : `${currentVideo.embedUrl}?rel=0&modestbranding=1`
                      : ""
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950/70 to-emerald-700/40">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur">
                        <span className="text-3xl">▶</span>
                      </div>
                      <span className="rounded-full bg-black/25 px-4 py-1 text-sm font-medium text-white">
                        {translate("videoSection", "clickToWatch")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isMobile && (
                <button
                  type="button"
                  onClick={next}
                  className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white md:flex"
                >
                  <span className="text-xl">&#8250;</span>
                </button>
              )}
            </div>

            <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-emerald-950">
                  {currentVideo?.title || ""}
                </div>
                {currentVideo?.desc && (
                  <div className="mt-1 text-xs text-slate-600">{currentVideo.desc}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {current + 1} / {videos.length}
                </span>
                {videos.map((video, index) => (
                  <button
                    key={video._id || index}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === current ? "w-6 bg-emerald-600" : "w-2 bg-emerald-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
