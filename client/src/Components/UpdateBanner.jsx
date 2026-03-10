import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaBookOpen, FaGlobe, FaAward } from "react-icons/fa";

const LiveStatsBanner = () => {
  const [stats, setStats] = useState({
    students: 285,
    courses: 20,
    countries: 4,
    successRate: 92,
  });

  // Simulate real-time update (replace with API later)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        students: prev.students + Math.floor(Math.random() * 3),
        courses: prev.courses,
        countries: prev.countries,
        successRate: prev.successRate,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: <FaUsers size={40} />,
      value: `${stats.students}+`,
      label: "Active Students",
      color: "text-emerald-700",
    },
    {
      icon: <FaBookOpen size={40} />,
      value: `${stats.courses}+`,
      label: "Courses",
      color: "text-primary",
    },
    {
      icon: <FaGlobe size={40} />,
      value: `${stats.countries}+`,
      label: "Countries",
      color: "text-emerald-600",
    },
    {
      icon: <FaAward size={40} />,
      value: `${stats.successRate}%`,
      label: "Success Rate",
      color: "text-primary",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 py-14">
      <div className="lg:w-3/4 w-11/12 mx-auto">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-bold text-center text-emerald-800 mb-10"
        >
          Our Growing Qira’at Community Worldwide
        </motion.h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white shadow-md rounded-xl p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`${item.color} flex justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold ${item.color}`}>
                {item.value}
              </h3>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveStatsBanner;
