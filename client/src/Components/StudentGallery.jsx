import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SmartGalleryCarousel from "./SmartGalleryCarousel";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

const StudentGallery = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";
  const { translate } = useSiteContent();

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/galleries/student`);
        const data = await res.json();
        setGalleryData(
          (data.data || []).map((item) => ({
            ...item,
            imageUrl: resolveMediaUrl(item.imageUrl),
          })),
        );
      } catch (err) {
        console.log("Error fetching gallery data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, [baseUrl]);

  if (loading || galleryData.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-gradient-to-br from-[#ecfdf5] via-white to-[#d1fae5] py-16 sm:py-20">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl"
      >
        {translate("gallerySection", "studentTitle")}
      </motion.h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SmartGalleryCarousel items={galleryData} />
      </div>
    </section>
  );
};

export default StudentGallery;
