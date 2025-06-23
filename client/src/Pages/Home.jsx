import useAuthContext from "../hooks/useAuthContext";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import BreakingNews from "../components/BreakingNews";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useAuthContext();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/course/topCourses`);
        if (!response.ok) {
          throw new Error("Failed to fetch top courses");
        }
        const data = await response.json();
        setCourses(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTopCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
      </div>
    );
  }

  if (error) {
    console.log(error);
  }

  return (
    <div className="lg:w-3/4 w-11/12 mx-auto">
      <BreakingNews />
      <div className="lg:grid lg:grid-cols-2 flex flex-col-reverse gap-5 items-center py-10">
        <div>
          <div>
            <h3 className="text-5xl md:text-5xl font-bold text-emerald-800">Ma’hadul Qira’at Al Hind</h3>
            <h3 className="text-5xl md:text-3xl font-bold text-primary">Qira'at Academy In the world</h3>
          </div>
          <p className="my-5 text-gray-700 text-justify">
            Welcome to Ma’hadul Qira’at Al Hind– Established in 2022, Ma’hadul Qira’at Al Hind has quickly emerged as a distinguished institution for Quranic education. We are honored to be a hub for many of Bangladesh’s most respected Qaris and renowned reciters of the Holy Qur’an, who are currently pursuing their studies under our guidance..
          </p>
          <Link to={user?.user ? (user.user.role === "admin" ? "/dashboard/admin/adminHome" : "/dashboard/user/userHome") : "/login"}>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300">
              Get Started
            </button>
          </Link>
        </div>
        <motion.div
          className="relative w-full h-full rounded-lg overflow-hidden"
          initial={{ background: "linear-gradient(135deg, #d1fae5, #ffffff, #bbf7d0)" }}

        >
          <img src="/banner.png" alt="Banner" className="relative z-10 rounded-lg shadow-md w-full h-auto" />
        </motion.div>
      </div>




    </div>
  );
};

export default Home;
