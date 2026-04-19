import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import {
  A11y,
  Autoplay,
  EffectCoverflow,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules";
import GalleryCard from "./GalleryCard";

const SmartGalleryCarousel = ({ items }) => {
  const loopEnabled = items.length > 3;

  return (
    <Swiper
      modules={[
        Navigation,
        Pagination,
        Autoplay,
        Keyboard,
        A11y,
        EffectCoverflow,
      ]}
      effect="coverflow"
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 120,
        modifier: 1.7,
        slideShadows: false,
        scale: 0.92,
      }}
      centeredSlides={items.length > 1}
      grabCursor={true}
      loop={loopEnabled}
      keyboard={{ enabled: true }}
      autoplay={{
        delay: 3200,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{ clickable: true }}
      navigation={items.length > 1}
      watchSlidesProgress={true}
      breakpoints={{
        0: { slidesPerView: 1.08, spaceBetween: 14 },
        480: { slidesPerView: 1.2, spaceBetween: 16 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 2.4, spaceBetween: 24 },
        1280: { slidesPerView: 3, spaceBetween: 28 },
      }}
      className="gallery-swiper !overflow-visible pb-12"
    >
      {items.map((item, index) => (
        <SwiperSlide key={item._id || `${item.imageUrl}-${index}`} className="py-3">
          <GalleryCard image={item.imageUrl} name={item.name} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SmartGalleryCarousel;
