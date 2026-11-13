import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { API } from "../config/api";

const BreakingNews = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/breaking-news/public`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 shadow-md">
      <div className="container-main flex items-stretch">
        <div className="flex shrink-0 items-center bg-red-800 px-4 py-2.5 sm:px-5">
          <span className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
            </span>
            Breaking
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full items-center overflow-hidden py-2.5">
            <Marquee
              pauseOnClick
              speed={50}
              gradient={false}
              className="text-sm font-medium text-white sm:text-body-sm"
            >
              {items.map((item, i) => (
                <span key={item._id || i} className="mx-8">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 decoration-white/50 hover:decoration-white"
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
