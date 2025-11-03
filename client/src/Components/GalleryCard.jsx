import React from "react";

const GalleryCard = ({ image, name }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 w-full max-w-sm">
            <div className="w-full h-60 flex items-center justify-center bg-gray-50">
                <img
                    src={image}
                    alt={name}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
            <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-emerald-700">{name}</h3>
            </div>
        </div>
    );
};

export default GalleryCard;
