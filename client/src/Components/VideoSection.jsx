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
    if (!videos.length) return;
    setCurrent(index);
    setPlaying(false);
  };

  const prev = () => goTo((current - 1 + videos.length) % videos.length);
  const next = () => goTo((current + 1) % videos.length);

  return (
    <section className="relative overflow-hidden bg-neutral-50 section-padding">
      <div className="container-narrow flex min-h-[40vh] sm:min-h-[50vh] lg:min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <span className="badge-base border border-primary-200 bg-primary-50 text-primary-700">
            {translate("videoSection", "badge")}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 text-neutral-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
            <p className="text-body-sm">{translate("videoSection", "loading")}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="card-base max-w-lg p-8 text-center">
            <p className="font-heading text-heading-lg font-semibold text-neutral-800">
              {translate("videoSection", "emptyTitle")}
            </p>
            <p className="mt-2 text-body-sm text-neutral-500">
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
                  className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 md:flex"
                  aria-label="Previous video"
                >
                  <span className="text-lg">&#8249;</span>
                </button>
              )}

              <div
                className="relative flex-1 overflow-hidden rounded-card border border-neutral-200 bg-neutral-900 shadow-elevated"
                onClick={() => setPlaying(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setPlaying(true);
                }}
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
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900/70 to-primary-900/30">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-110">
                        <span className="ml-1 text-2xl">&#9654;</span>
                      </div>
                      <span className="rounded-full bg-black/30 px-4 py-1.5 text-body-sm font-medium text-white backdrop-blur-sm">
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
                  className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 md:flex"
                  aria-label="Next video"
                >
                  <span className="text-lg">&#8250;</span>
                </button>
              )}
            </div>

            <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="truncate text-body-sm font-semibold text-neutral-800">
                  {currentVideo?.title || ""}
                </div>
                {currentVideo?.desc && (
                  <div className="mt-1 text-meta text-neutral-500">{currentVideo.desc}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-meta font-semibold text-neutral-400">
                  {current + 1} / {videos.length}
                </span>
                {videos.map((video, index) => (
                  <button
                    key={video._id || index}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      index === current ? "w-5 bg-primary-600" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                    aria-label={`Go to video ${index + 1}`}
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
