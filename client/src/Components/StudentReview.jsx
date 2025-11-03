// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// Import required modules
import { Navigation, Autoplay } from "swiper/modules";
import TestimonialCard from "./StudentReviewCard.jsx";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const StudentReview = () => {
    const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

    const { data: datas = [] } = useQuery({
        queryKey: ["student-reviews"],
        queryFn: async () => {
            const res = await axios.get(`${baseUrl}/api/review`);
            return res.data;
        },
        retry: 5

    });

    return (
        <div className="bg-gradient-to-br from-[#ecfdf5] via-[#a7f3d0] to-[#07945c] py-16">
            <h2 className="font-bold md:text-5xl text-3xl mb-12 text-center text-emerald-900">
                Reviews of   Our Students
            </h2>
            <div className="max-w-6xl mx-auto px-4">
                <Swiper
                    navigation={true}
                    loop={true}
                    autoplay={{ delay: 3000 }}
                    modules={[Navigation, Autoplay]}
                    className="mySwiper"
                    breakpoints={{
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 2, spaceBetween: 30 },
                        1024: { slidesPerView: 3, spaceBetween: 40 },
                    }}
                >
                    {datas.map((item) => (
                        <SwiperSlide key={item._id}>
                            <TestimonialCard item={item} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>

    );
};

export default StudentReview;
