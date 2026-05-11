import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchGalleryItems } from "../utils/galleryApi";
import { resolveMediaUrl } from "../utils/media";
import { useSiteContent } from "../context/SiteContentContext";

const PublicGallery = () => {
  const { translate } = useSiteContent();
  const { data, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => fetchGalleryItems({ limit: 50 }),
    staleTime: 0,
  });

  const items = data?.data || [];

  return (
    <section className="overflow-hidden bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe] py-16 sm:py-20">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl"
      >
        {translate("gallerySection", "fareginTitle")}
      </motion.h2>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt={item.title || item.name || "Gallery image"}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                {(item.title || item.name) && (
                  <div className="px-4 py-3 text-center">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-800">
                      {item.title || item.name}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/70 p-8 text-center text-sm text-slate-600">
            No gallery items available right now.
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicGallery;
