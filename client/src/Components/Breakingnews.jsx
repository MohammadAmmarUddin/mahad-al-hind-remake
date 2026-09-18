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
  );
};

export default BreakingNews;
