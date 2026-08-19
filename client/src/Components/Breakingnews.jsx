import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API } from "../config/api";

const BreakingNews = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/breaking-news/public`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <div className="flex w-full flex-col items-center gap-3 rounded-card border border-primary-100 bg-primary-50/50 px-4 py-3 text-primary-700 sm:flex-row sm:gap-4">
        <Link to="/#notice-board">
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex shrink-0 items-center rounded-full bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            Breaking News
          </motion.span>
        </Link>

        <Marquee
          pauseOnClick
          speed={50}
          gradient
          gradientColor={[240, 253, 244]}
          gradientWidth={60}
          className="text-sm font-medium tracking-wide text-primary-800 sm:text-body-sm"
        >
          {items.map((item, i) => (
            <span key={item._id || i} className="mx-8">
              {item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary-900">
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          ))}
        </Marquee>
      </div>
    </motion.div>
  );
};

export default BreakingNews;
