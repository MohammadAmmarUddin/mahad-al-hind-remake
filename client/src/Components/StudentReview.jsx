import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import { Navigation, Autoplay } from "swiper/modules";
import TestimonialCard from "./StudentReviewCard.jsx";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API } from "../config/api";

const StudentReview = () => {
  const { data: datas = [] } = useQuery({
    queryKey: ["student-reviews"],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/review`);
      return res.data;
    },
    retry: 5,
  });

  return (
    <section className="overflow-hidden bg-gradient-to-br from-primary-50 via-primary-100/40 to-primary-600 section-padding">
      <div className="container-main">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-heading text-display-sm font-bold text-neutral-900 sm:text-display-md"
        >
          Reviews of Our Students
        </motion.h2>

        <Swiper
          navigation={true}
          loop={true}
          autoplay={{ delay: 3000 }}
          modules={[Navigation, Autoplay]}
          className="review-swiper"
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 32 },
          }}
        >
          {datas.map((item) => (
            <SwiperSlide key={item._id}>
              <TestimonialCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default StudentReview;
