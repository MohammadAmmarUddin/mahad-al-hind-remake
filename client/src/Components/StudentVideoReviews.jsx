import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaChevronLeft, FaChevronRight, FaQuoteLeft } from "react-icons/fa";
import { API } from "../config/api";

const StudentVideoReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const scrollRef = useRef(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/student-video-reviews/public`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (loading || reviews.length === 0) return null;

  return (
    <section className="section-padding bg-[#faf6ee]">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <span className="badge-base mb-3 inline-block bg-primary-50 text-primary-700">Testimonials</span>
          <h2 className="font-heading text-display-sm font-bold text-neutral-900 sm:text-display-md">
            What Our Students Say
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-body text-neutral-500">
            Hear from our students about their learning experience and journey with us.
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-600 shadow-md transition-all hover:bg-primary-50 hover:text-primary-700 hover:shadow-lg lg:-left-5"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-600 shadow-md transition-all hover:bg-primary-50 hover:text-primary-700 hover:shadow-lg lg:-right-5"
            aria-label="Scroll right"
          >
            <FaChevronRight className="h-4 w-4" />
          </button>

          {/* Cards Scroll */}
          <div
            ref={scrollRef}
            className="scrollbar-hidden flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          >
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="min-w-[300px] max-w-[320px] snap-start flex-shrink-0"
              >
                <div className="card-base group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-neutral-100">
                    <img
                      src={review.thumbnailUrl || `https://img.youtube.com/vi/${review.videoId}/mqdefault.jpg`}
                      alt={`${review.studentName}'s testimonial`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { e.target.src = `https://img.youtube.com/vi/${review.videoId}/mqdefault.jpg`; }}
                    />
                    {/* Play Button Overlay */}
                    <button
                      onClick={() => setActiveVideo(review)}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100"
                      aria-label={`Play ${review.studentName}'s testimonial`}
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-600/90 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <FaPlay className="ml-1 h-5 w-5" />
                      </div>
                    </button>
                    {/* Featured Badge */}
                    {review.isFeatured && (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {review.caption && (
                      <div className="mb-3 flex gap-2">
                        <FaQuoteLeft className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary-300" />
                        <p className="text-body-sm text-neutral-600 leading-relaxed line-clamp-2">{review.caption}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-heading text-sm font-semibold text-neutral-800">{review.studentName}</h4>
                      {review.program && (
                        <p className="mt-0.5 text-meta text-neutral-400">{review.program}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <dialog className="modal modal-open" open>
          <div className="modal-box max-w-2xl sm:max-w-3xl bg-transparent p-0 shadow-none">
            <div className="overflow-hidden rounded-xl bg-black">
              <div className="relative pt-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${activeVideo.studentName}'s testimonial`}
                />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center justify-between px-1 gap-2">
              <div className="min-w-0">
                <p className="font-heading text-xs sm:text-sm font-semibold text-white truncate">{activeVideo.studentName}</p>
                {activeVideo.program && <p className="text-xs text-white/60 truncate">{activeVideo.program}</p>}
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="rounded-lg bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/20 flex-shrink-0"
              >
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveVideo(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </section>
  );
};

export default StudentVideoReviews;
