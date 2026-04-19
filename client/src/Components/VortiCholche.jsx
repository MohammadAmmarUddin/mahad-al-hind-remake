import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaTimesCircle } from "react-icons/fa";
import { useSiteContent } from "../context/SiteContentContext";

const VortiCholche = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { content, language } = useSiteContent();
  const widget = content?.enrollmentWidget;

  if (!widget?.isVisible) {
    return null;
  }

  const pick = (field) => widget?.[field]?.[language] || widget?.[field]?.en || "";

  return (
    <div className="fixed z-50 bottom-10 left-6 hidden md:block">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="
              w-80 md:w-96 p-6 rounded-2xl shadow-xl
              bg-gradient-to-r from-emerald-600 to-emerald-500
              text-white relative overflow-hidden
            "
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white transition"
            >
              ✕
            </button>

            {/* Title */}
            <h3 className="text-lg font-bold mb-4 tracking-wide">
              📢 {pick("title")}
            </h3>

            {/* Dates */}
            <div className="space-y-4 text-sm md:text-base">
              <div className="flex items-center gap-3">
                <FaArrowRight className="text-white" />
                <p>
                  {pick("startLabel")}:{" "}
                  <span className="font-bold">{widget?.startDate}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <FaTimesCircle className="text-white" />
                <p>
                  {pick("endLabel")}:{" "}
                  <span className="font-bold">{widget?.endDate}</span>
                </p>
              </div>
            </div>

            {/* Decorative subtle glow */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            bg-emerald-600 hover:bg-emerald-700
            text-white px-4 py-2 rounded-full shadow-lg
            transition-all duration-300
          "
        >
          {pick("reopenLabel")}
        </button>
      )}
    </div>
  );
};

export default VortiCholche;
