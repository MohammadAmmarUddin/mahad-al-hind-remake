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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-padding text-center">
        <div className="card-base mx-auto max-w-md p-8">
          <p className="font-heading text-heading-lg font-semibold text-neutral-800">{error}</p>
          <p className="mt-2 text-body-sm text-neutral-500">Showing an empty state because the backend is unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main pb-20 pt-10">
      <h2 className="mb-8 text-center font-heading text-display-sm font-bold text-neutral-900">
        All Courses
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {courses?.length > 0 ? (
          courses.map((course) => (
            <Link
              key={course._id}
              to={`/singleCourse/${course?._id}`}
              className="card-interactive overflow-hidden group"
            >
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={resolveMediaUrl(course?.banner)}
                  alt={course?.title}
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-heading-sm font-semibold text-neutral-800 line-clamp-2 transition-colors group-hover:text-primary-600">
                  {course?.title}
                </h3>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full card-base border-dashed p-8 text-center text-body-sm text-neutral-500">
            No courses available right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
