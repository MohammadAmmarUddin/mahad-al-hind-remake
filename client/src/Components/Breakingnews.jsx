import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSiteContent } from "../context/SiteContentContext";

const BreakingNews = () => {
  const { translate } = useSiteContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="relative mt-5 flex w-full flex-col items-center gap-4 text-primary md:flex-row">
        <Link to="/form">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative inline-flex items-center justify-center font-semibold text-white transition duration-300"
          >
            <span className="relative z-10 text-black">
              {translate("breakingNews", "label")}
            </span>
          </motion.button>
        </Link>

        <Marquee
          pauseOnClick
          speed={50}
          gradient
          gradientColor={[240, 253, 244]}
          gradientWidth={60}
          className="gap-x-10 text-[15px] font-medium tracking-wide text-emerald-800 md:text-base"
        >
          {translate("breakingNews", "message")}
        </Marquee>
      </div>
    </motion.div>
  );
};

export default BreakingNews;
