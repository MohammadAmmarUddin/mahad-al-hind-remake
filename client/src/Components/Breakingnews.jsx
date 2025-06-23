import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const BreakingNews = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
      className=""
    >
      <div className="relative mt-5 flex flex-col md:flex-row items-center gap-4 w-full text-primary ">
        {/* Breaking News Button */}
        <Link to="/form">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.80 }}
            className="relative inline-flex items-center justify-center font-semibold text-white   transition duration-300"
          >
            {/* <span className="absolute -inset-0.5 animate-ping bg-emerald-400 rounded-xl opacity-20"></span> */}
            <span className="relative z-10 text-black">📢 Breaking News</span>
          </motion.button>
        </Link>

        {/* Marquee Content */}
        <Marquee
          pauseOnClick={true}
          speed={50}
          gradient={true}
          gradientColor={[240, 253, 244]}
          gradientWidth={60}
          className="font-medium text-[15px] md:text-base text-emerald-800 tracking-wide gap-x-10"
        >
          ভর্তি চলছে মা'হাদুল কিরা'আত আল হিন্দে অনলাইন ও অফলাইন | কিরা'আত এ সাবা ও আশা'রার ভর্তি চলছে । যোগাযোগ : +919365262648 | +8801883128299
        </Marquee>
      </div>
    </motion.div>
  );
};

export default BreakingNews;
