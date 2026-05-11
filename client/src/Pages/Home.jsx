import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthContext from "../hooks/useAuthContext";
import BreakingNews from "../Components/Breakingnews.jsx";
import UpdateBanner from "../Components/UpdateBanner.jsx";
import VideoSection from "../Components/VideoSection.jsx";
import PublicGallery from "../Components/PublicGallery";
import { useSiteContent } from "../context/SiteContentContext";
import {
  defaultHomeSections,
  readLocalJson,
  HOME_SECTIONS_STORAGE_KEY,
} from "../config/localContent";

const Home = () => {
  const { user } = useAuthContext();
  const { translate } = useSiteContent();
  const sections = readLocalJson(
    HOME_SECTIONS_STORAGE_KEY,
    defaultHomeSections,
  );

  return (
    <div>
      <div className="mx-auto w-11/12 lg:w-3/4">
        {sections.breakingNews && <BreakingNews />}

        {sections.hero && (
          <div className="flex flex-col-reverse items-center gap-5 py-10 lg:grid lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold leading-snug text-emerald-800 md:text-4xl lg:text-5xl">
                {translate("home", "heroTitle")}
              </h3>
              <h3 className="mt-2 text-xl font-bold text-primary md:text-3xl lg:text-4xl">
                {translate("home", "heroSubtitle")}
              </h3>
              <p className="my-4 text-justify text-sm text-gray-700 md:text-base lg:text-lg">
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
              >
                <button className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-emerald-700 md:text-base">
                  {translate("home", "heroCta")}
                </button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-full w-full overflow-hidden rounded-lg"
            >
              <img
                src="/banner.png"
                alt="Banner"
                className="relative z-10 h-auto w-full rounded-lg shadow-md"
              />
            </motion.div>
          </div>
        )}
      </div>

      {sections.statsBanner && <UpdateBanner />}
      {sections.videos && <VideoSection />}
      {sections.gallery && <PublicGallery />}
    </div>
  );
};

export default Home;
