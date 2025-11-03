import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  const fetchCourses = () => {
    const url = `${baseUrl}/api/course/getAllCourses`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (!courses) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
      </div>
    );
  }

  return (
    <div className="w-11/12 mx-auto pb-20 mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">All Courses</h2>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {courses?.map((course) => (
          <div
            key={course._id}
            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border rounded-xl overflow-hidden"
          >
            <Link to={`/singleCourse/${course?._id}`}>
              <img
                className="w-full h-48 object-cover"
                src={course?.banner}
                alt={course?.title}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {course?.title}
                </h3>
                {/* Optional: Add description or short info here */}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllCourses;
