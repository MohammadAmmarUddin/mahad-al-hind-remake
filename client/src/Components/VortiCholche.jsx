import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowRight, FaTimesCircle } from "react-icons/fa";
import { useSiteContent } from "../context/SiteContentContext";
import {
  ENROLLMENT_STORAGE_KEY,
  defaultEnrollmentWidget,
  readLocalJson,
} from "../config/localContent";

const VortiCholche = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { language } = useSiteContent();
  const widget = readLocalJson(ENROLLMENT_STORAGE_KEY, defaultEnrollmentWidget);

  if (!widget?.isVisible) {
    return null;
  }

  const pick = (field) =>
    widget?.[`${field}${language === "bn" ? "Bn" : "En"}`] || widget?.[`${field}En`] || "";

  return (
    <div className="fixed bottom-10 left-6 z-50 hidden md:block">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-80 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-xl md:w-96"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 text-white/80 transition hover:text-white"
            >
              <FaTimesCircle />
            </button>

            <h3 className="mb-4 text-lg font-bold tracking-wide">{pick("title")}</h3>

            <div className="space-y-4 text-sm md:text-base">
              <div className="flex items-center gap-3">
                <FaArrowRight className="text-white" />
                <p>
                  {pick("startLabel")}: <span className="font-bold">{widget?.startDate}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <FaArrowRight className="text-white rotate-90" />
                <p>
                  {pick("endLabel")}: <span className="font-bold">{widget?.endDate}</span>
                </p>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:bg-emerald-700"
        >
          {pick("reopenLabel")}
        </button>
      )}
    </div>
  );
};

export default VortiCholche;
