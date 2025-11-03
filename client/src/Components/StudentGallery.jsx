import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import GalleryCard from "./GalleryCard";

const StudentGallery = () => {
    const [galleryData, setGalleryData] = useState([]);

    useEffect(() => {
        fetch("/StdGallery.json")
            .then(res => res.json())
            .then(data => setGalleryData(data))
            .catch(err => console.log("Error fetching gallery data:", err));
    }, []);

    return (
        <div className="py-16 bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5]">
            <h2 className="font-bold md:text-5xl text-3xl mb-10 text-center text-emerald-800">
                Our Students Gallery
            </h2>
            <div className="max-w-6xl mx-auto px-4">
                <Swiper
                    navigation={true}
                    loop={true}
                    autoplay={{ delay: 3000 }}
                    modules={[Navigation, Autoplay]}
                    breakpoints={{
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 2, spaceBetween: 30 },
                        1024: { slidesPerView: 3, spaceBetween: 40 },
                    }}
                    className="mySwiper"
                >
                    {galleryData.map((item, index) => (
                        <SwiperSlide key={index}>
                            <GalleryCard image={item.image} name={item.name} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default StudentGallery;
