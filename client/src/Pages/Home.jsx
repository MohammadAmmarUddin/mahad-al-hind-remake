import "swiper/css";
import "swiper/css/pagination";
import { Suspense, lazy, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import useAuthContext from "../hooks/useAuthContext";
import BreakingNews from "../Components/Breakingnews.jsx";
import { useSiteContent } from "../context/SiteContentContext";
import { safeFetchJson } from "../config/api";
import { resolveMediaUrl } from "../utils/media";
import { SectionFallback } from "../Layout/RouteFallback";
import {
  defaultHomeSections,
  readLocalJson,
  HOME_SECTIONS_STORAGE_KEY,
} from "../config/localContent";

const UpdateBanner = lazy(() => import("../Components/UpdateBanner.jsx"));
const VideoSection = lazy(() => import("../Components/VideoSection.jsx"));
const PublicGallery = lazy(() => import("../Components/PublicGallery"));
const NoticeBoard = lazy(() => import("../Components/NoticeBoard"));
const StudentVideoReviews = lazy(() => import("../Components/StudentVideoReviews"));

const defaultHeroBanners = [
  { src: "/pagri/banner1.jpg", alt: "Ma'hadul Qira'at Al Hind", link: "" },
  { src: "/pagri/banner2.jpg", alt: "Qira'at Academy in the World", link: "" },
  { src: "/pagri/banner4.jpg", alt: "Knowledge & Learning", link: "" },
];

const Home = () => {
  const { user } = useAuthContext();
  const { translate } = useSiteContent();
  const location = useLocation();

  const sections = useMemo(
    () => readLocalJson(HOME_SECTIONS_STORAGE_KEY, defaultHomeSections),
    [],
  );

  const { data: remoteBanners } = useQuery({
    queryKey: ["hero-banners", "public"],
    queryFn: () => safeFetchJson("/api/hero-banners/public", {}, []),
    staleTime: 10 * 60 * 1000,
  });

  const banners = useMemo(() => {
    const remote = Array.isArray(remoteBanners)
      ? remoteBanners.filter((b) => b?.imageUrl)
      : [];

    if (!remote.length) return defaultHeroBanners;

    return remote.map((b) => ({
      src: resolveMediaUrl(b.imageUrl),
      alt: b.alt || "Ma'hadul Qira'at Al Hind",
      link: b.link || "",
    }));
  }, [remoteBanners]);

  useEffect(() => {
    if (location.hash === "#notice-board") {
      const timer = setTimeout(() => {
        document.getElementById("notice-board")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const renderSlide = (banner, index) => {
    const image = (
      <img
        src={banner.src}
        alt={banner.alt}
        decoding="async"
        loading={index === 0 ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );

    return (
      <SwiperSlide key={`${banner.src}-${index}`} className="!block">
        <div className="relative h-[340px] w-full sm:h-[420px] md:h-[480px] lg:h-[540px]">
          {banner.link ? (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 block"
              aria-label={banner.alt}
            >
              {image}
            </a>
          ) : (
            image
          )}
        </div>
      </SwiperSlide>
    );
  };

  return (
    <div className="bg-[#faf6ee]">
      {sections.hero && (
        <section className="relative overflow-hidden">
          {/* Swiper as full background */}
          <div className="hero-swiper relative h-[340px] sm:h-[420px] md:h-[480px] lg:h-[540px]">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{
                clickable: true,
                el: ".hero-pagination",
                bulletClass: "swiper-pagination-bullet !bg-white/50 !w-2.5 !h-2.5",
                bulletActiveClass: "swiper-pagination-bullet-active !bg-white !w-3.5 !h-3.5",
              }}
              loop={banners.length > 1}
              speed={0}
              className="absolute inset-0 h-full w-full"
            >
              {banners.map(renderSlide)}
            </Swiper>

            {/* Vintage vignette — dark edges, clear center */}
            <div className="pointer-events-none absolute inset-0 z-10">
              <div className="absolute inset-0 fade-vintage-vignette" />
              <div className="absolute inset-0 fade-vintage-grain opacity-[0.03]" />
            </div>

            {/* Text overlay */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container-main w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="max-w-2xl"
                >
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)", wordBreak: "break-word" }}
                  >
                    {translate("home", "heroTitle")}
                  </h1>
                  <h2 className="mt-2 sm:mt-3 font-heading text-lg sm:text-xl font-bold text-primary-300 md:text-2xl lg:text-3xl"
                    style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}
                  >
                    {translate("home", "heroSubtitle")}
                  </h2>
                  <p className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm text-white/80 md:text-base lg:text-lg"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
                  >
                    {translate("home", "heroDescription")}
                  </p>
                  <Link
                    to={
                      user?.user
                        ? user.user.role === "admin"
                          ? "/dashboard/admin/adminHome"
                          : "/dashboard/user/userHome"
                        : "/login"
                    }
                    className="mt-8 inline-block"
                  >
                    <span className="btn-primary px-8 py-3 text-base shadow-lg shadow-primary-700/30 hover:shadow-xl hover:shadow-primary-700/40">
                      {translate("home", "heroCta")}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Pagination */}
            <div className="hero-pagination absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2" />
          </div>
        </section>
      )}

      {/* Breaking News Ticker - under hero */}
      {sections.breakingNews && <BreakingNews />}

      <div className="container-main">
        {sections.noticeBoard !== false && (
          <Suspense fallback={<SectionFallback />}>
            <NoticeBoard />
          </Suspense>
        )}
        {sections.statsBanner && (
          <Suspense fallback={<SectionFallback />}>
            <UpdateBanner />
          </Suspense>
        )}
        {sections.videos && (
          <Suspense fallback={<SectionFallback />}>
            <VideoSection />
          </Suspense>
        )}
        {sections.studentReviews !== false && (
          <Suspense fallback={<SectionFallback />}>
            <StudentVideoReviews />
          </Suspense>
        )}
        {sections.gallery && (
          <Suspense fallback={<SectionFallback />}>
            <PublicGallery />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Home;
