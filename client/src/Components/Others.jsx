import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const ManageOtherCard = () => {
  const [cards] = useState([
    {
      id: 1,
      img: "/safara1.jpg",
      title: "Luxury Residential Complex",
      description:
        "A state-of-the-art residential project featuring modern amenities and breathtaking views. Perfect for families and individuals seeking luxury living.",
    },
    {
      id: 2,
      img: "/safara1.jpg",
      title: "Commercial Office Space",
      description:
        "An innovative and high-tech office space for businesses looking for a dynamic and collaborative work environment. Strategically located for convenience.",
    },
    {
      id: 3,
      img: "/safara2.jpg",
      title: "Eco-Friendly Housing Development",
      description:
        "A sustainable and green residential project focused on energy efficiency, eco-friendly materials, and a harmonious connection with nature.",
    },
    {
      id: 4,
      img: "/safara2.jpg",
      title: "Luxury Villas by the Beach",
      description:
        "Exclusive beachfront villas offering panoramic ocean views, private pools, and luxurious amenities for those who seek the ultimate in relaxation and privacy.",
    },
    {
      id: 5,
      img: "/safara2.jpg",
      title: "Urban Mixed-Use Complex",
      description:
        "A vibrant community blending residential, commercial, and retail spaces. Perfectly designed for city living with easy access to everything you need.",
    },
    {
      id: 6,
      img: "/safara2.jpg",
      title: "Affordable Housing Project",
      description:
        "A budget-friendly housing solution aimed at providing quality living for families and individuals without compromising on comfort and safety.",
    },
  ]);

  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div className="section-padding bg-neutral-50">
      <div className="container-main">
        <h1 className="mb-10 text-center font-heading text-display-sm font-bold text-neutral-900 sm:text-display-md">
          Our Other Projects
        </h1>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="card-interactive cursor-pointer overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={card.img}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-heading-sm font-semibold text-neutral-800 transition-colors group-hover:text-primary-600">
                  {card.title}
                </h3>
                <p className="mt-2 text-body-sm text-neutral-500 line-clamp-2">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={() => setSelectedCard(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="card-base max-w-lg overflow-hidden p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-100">
                  <img
                    src={selectedCard.img}
                    alt={selectedCard.title}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-800"
                    aria-label="Close"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6">
                  <h2 className="font-heading text-heading-lg font-bold text-neutral-900">
                    {selectedCard.title}
                  </h2>
                  <p className="mt-3 text-body text-neutral-600 leading-relaxed">
                    {selectedCard.description}
                  </p>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="btn-primary mt-6 w-full"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageOtherCard;
