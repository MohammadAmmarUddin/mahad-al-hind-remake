import { useState } from "react";
import { Link } from "react-router-dom";

const Whatsapp = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed z-50 bottom-10 right-10">
      {isExpanded ? (
        <div className="bg-white rounded-lg overflow-hidden w-64 h-72 transition-all duration-300 ease-in-out custom-shadow border p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-600 font-bold">WhatsApp</h3>
            <button
              onClick={handleClick}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-600">Scan to chat with us</p>
            <div className="p-2 rounded-md mb-2">
              <div className="w-48 h-48 mb-5 flex items-center justify-center">
                <img
                  src="./qr-code.png"
                  alt="WhatsApp QR Code"
                  className="w-full h-full object-cover border"
                />
              </div>
            </div>
            <span className="text-xs text-gray-500">Or click to chat now</span>
          </div>
        </div>
      ) : (
        <Link onClick={handleClick} className="block">
          <img
            className="w-12 h-12 cursor-pointer"
            src="./whatsapp-logo.png"
            alt="WhatsApp Logo"
          />
        </Link>
      )}
    </div>
  );
};

export default Whatsapp;
