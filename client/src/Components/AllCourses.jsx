import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { safeFetchJson } from "../config/api";
import { resolveMediaUrl } from "../utils/media";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const data = await safeFetchJson("/api/course/getAllCourses", {}, null);
      const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCourses(items);
    } catch {
      setCourses([]);
      setError("Unable to load courses right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        <p>{error}</p>
        <p className="mt-2">Showing an empty state because the backend is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="w-11/12 mx-auto pb-20 mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">All Courses</h2>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {courses?.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id}
              className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border rounded-xl overflow-hidden"
            >
              <Link to={`/singleCourse/${course?._id}`}>
                <img
                  className="w-full h-48 object-cover"
                  src={resolveMediaUrl(course?.banner)}
                  alt={course?.title}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {course?.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No courses available right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
