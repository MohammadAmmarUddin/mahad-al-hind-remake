import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import useAuthContext from "../hooks/useAuthContext";
import BreakingNews from "../Components/Breakingnews.jsx";
import UpdateBanner from "../Components/UpdateBanner.jsx";
import VideoSection from "../Components/VideoSection.jsx";
import PublicGallery from "../Components/PublicGallery";
import NoticeBoard from "../Components/NoticeBoard";
import StudentVideoReviews from "../Components/StudentVideoReviews";
import { useSiteContent } from "../context/SiteContentContext";
import {
  defaultHomeSections,
  readLocalJson,
  HOME_SECTIONS_STORAGE_KEY,
} from "../config/localContent";

const heroBanners = [
  { src: "/pagri/banner1.jpg", alt: "Ma'hadul Qira'at Al Hind" },
  { src: "/pagri/banner2.jpg", alt: "Qira'at Academy in the World" },
  { src: "/pagri/banner4.jpg", alt: "Knowledge & Learning" },
];

const Home = () => {
  const { user } = useAuthContext();
  const { translate } = useSiteContent();
  const sections = readLocalJson(
    HOME_SECTIONS_STORAGE_KEY,
    defaultHomeSections,
  );

  return (
    <div className="bg-[#faf6ee]">
      <div className="container-main">
        {sections.breakingNews && <BreakingNews />}
      </div>

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
              loop={true}
              speed={0}
              className="absolute inset-0 h-full w-full"
            >
              {heroBanners.map((banner, index) => (
                <SwiperSlide key={index} className="!block">
                  <div className="relative h-[340px] w-full sm:h-[420px] md:h-[480px] lg:h-[540px]">
                    <img
                      src={banner.src}
                      alt={banner.alt}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  </div>
                </SwiperSlide>
              ))}
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

      <div className="container-main">
        {sections.noticeBoard !== false && <NoticeBoard />}
        {sections.statsBanner && <UpdateBanner />}
        {sections.videos && <VideoSection />}
        {sections.studentReviews !== false && <StudentVideoReviews />}
        {sections.gallery && <PublicGallery />}
      </div>
    </div>
  );
};

export default Home;
