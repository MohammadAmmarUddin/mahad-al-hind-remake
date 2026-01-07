import useAuthContext from "../hooks/useAuthContext";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import BreakingNews from "../Components/Breakingnews.jsx";
import { motion } from "framer-motion";
import StudentReview from "../Components/StudentReview";
import StudentGallery from "../Components/StudentGallery";
import PagriGallery from "../Components/PagriGallery";
const Home = () => {
  const { user } = useAuthContext();
  // const [courses, setCourses] = useState([]);
  // const [error, setError] = useState(null);
  // const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  // useEffect(() => {
  //   const fetchTopCourses = async () => {
  //     try {
  //       const response = await fetch(`${baseUrl}/api/course/topCourses`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch top courses");
  //       }
  //       const data = await response.json();
  //       setCourses(data.data);

  //     } catch (err) {
  //       setError(err.message);
  //     }
  //   };

  //   fetchTopCourses();
  // }, []);

  return (
    <div>
      {/* Centered container for normal content */}
      <div className="lg:w-3/4 w-11/12 mx-auto">
        <BreakingNews />

        <div className="lg:grid lg:grid-cols-2 flex flex-col-reverse gap-5 items-center py-10">
          <div>
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-emerald-800 leading-snug">
              Ma’hadul Qira’at Al Hind
            </h3>
            <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary mt-2">
              Qira'at Academy In the World
            </h3>
            <p className="my-4 text-sm md:text-base lg:text-lg text-gray-700 text-justify">
              Welcome to Ma’hadul Qira’at Al Hind – Established in 2022,
              Ma’hadul Qira’at Al Hind has quickly emerged as a distinguished
              institution for Quranic education. We are honored to be a hub for
              many of Bangladesh’s most respected Qaris and renowned reciters of
              the Holy Qur’an, who are currently pursuing their studies under
              our guidance.
            </p>
            <Link
              to={
                user?.user
                  ? user.user.role === "admin"
                    ? "/dashboard/admin/adminHome"
                    : "/dashboard/user/userHome"
                  : "/login"
              }
            >
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 text-sm md:text-base">
                Get Started
              </button>
            </Link>
          </div>

          <motion.div className="relative w-full h-full rounded-lg overflow-hidden">
            <img
              src="/banner.png"
              alt="Banner"
              className="relative z-10 rounded-lg shadow-md w-full h-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Full width student review */}
      <StudentReview />
      <StudentGallery />
      <PagriGallery />
    </div>
  );
};

export default Home;
