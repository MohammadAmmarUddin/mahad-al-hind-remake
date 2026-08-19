import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
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
    <section className="overflow-hidden bg-gradient-to-br from-accent-50 via-white to-accent-100/30 section-padding">
      <div className="container-main">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-heading text-display-sm font-bold text-neutral-900 sm:text-display-md"
        >
          {translate("gallerySection", "fareginTitle")}
        </motion.h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : items.length > 0 ? (
          <Swiper
            modules={[Autoplay, FreeMode]}
            freeMode={{ enabled: true, momentum: false }}
            autoplay={{ delay: 0, disableOnInteraction: false }}
            speed={3000}
            loop={true}
            slidesPerView={2}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="gallery-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item._id}>
                <div className="card-interactive overflow-hidden">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={resolveMediaUrl(item.imageUrl)}
                      alt={item.title || item.name || "Gallery image"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {(item.title || item.name) && (
                    <div className="px-4 py-3 text-center">
                      <h3 className="line-clamp-1 text-body-sm font-semibold text-neutral-800">
                        {item.title || item.name}
                      </h3>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="card-base border-dashed p-8 text-center text-body-sm text-neutral-500">
            No gallery items available right now.
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicGallery;
