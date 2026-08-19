import { motion } from "framer-motion";
import { FaUsers, FaBookOpen, FaGlobe, FaAward } from "react-icons/fa";

const LiveStatsBanner = () => {
  const stats = {
    students: 300,
    courses: 20,
    countries: 4,
    successRate: 92,
  };

  const statItems = [
    {
      icon: <FaUsers className="h-7 w-7" />,
      value: `${stats.students}+`,
      label: "Active Students",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      icon: <FaBookOpen className="h-7 w-7" />,
      value: `${stats.courses}+`,
      label: "Courses",
      color: "text-primary-700",
      bg: "bg-primary-50",
    },
    {
      icon: <FaGlobe className="h-7 w-7" />,
      value: `${stats.countries}+`,
      label: "Countries",
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      icon: <FaAward className="h-7 w-7" />,
      value: `${stats.successRate}%`,
      label: "Success Rate",
      color: "text-primary-700",
      bg: "bg-primary-50",
    },
  ];

  return (
    <section className="bg-gradient-to-r from-primary-50/60 via-white to-primary-50/60 section-padding">
      <div className="container-main">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-heading text-display-sm font-bold text-neutral-900 sm:text-display-md"
        >
          Our Growing Qira&apos;at Community Worldwide
        </motion.h2>

        <div className="grid grid-cols-2 gap-4 text-center sm:gap-6 md:grid-cols-4">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="card-interactive p-5 sm:p-6"
            >
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <h3 className={`font-heading text-2xl font-bold sm:text-3xl ${item.color}`}>
                {item.value}
              </h3>
              <p className="mt-2 text-body-sm text-neutral-500">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStatsBanner;
