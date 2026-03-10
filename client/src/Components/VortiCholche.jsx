import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaTimesCircle } from "react-icons/fa";

const VortiCholche = () => {
  const [isOpen, setIsOpen] = useState(true);

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
              📢 ভর্তি চলছে
            </h3>

            {/* Dates */}
            <div className="space-y-4 text-sm md:text-base">
              <div className="flex items-center gap-3">
                <FaArrowRight className="text-white" />
                <p>
                  এনরোলমেন্ট শুরু:{" "}
                  <span className="font-bold">১ ফেব্রুয়ারী, 2026</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <FaTimesCircle className="text-white" />
                <p>
                  এনরোলমেন্ট শেষ:{" "}
                  <span className="font-bold">১০রমাদান, 2026</span>
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
          ভর্তি চলছে
        </button>
      )}
    </div>
  );
};

export default VortiCholche;
