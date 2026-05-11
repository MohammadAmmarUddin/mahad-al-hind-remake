import { useState, useRef, useEffect } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";

const WHATSAPP_NUMBER = "919365262648";
const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

const Whatsapp = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const popupRef = useRef(null);

  const togglePopup = () => setIsExpanded((p) => !p);

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  return (
    <div ref={popupRef} className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex flex-col items-end gap-3">
      {isExpanded && (
        <div className="bg-white rounded-xl shadow-2xl w-[280px] sm:w-72 overflow-hidden transition-all duration-300 border border-slate-100">
          <div className="flex items-center justify-between bg-green-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <FaWhatsapp className="text-white text-lg" />
              <h3 className="text-white font-semibold text-sm">Chat with us</h3>
            </div>
            <button onClick={togglePopup} className="text-white/80 hover:text-white transition p-0.5">
              <FaTimes className="text-sm" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Have questions? Chat with us on WhatsApp. We're here to help!
            </p>
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaWhatsapp className="text-base" />
              Chat Now
            </button>
          </div>
        </div>
      )}

      <button
        onClick={togglePopup}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-xl sm:text-2xl" />
      </button>
    </div>
  );
};

export default Whatsapp;
