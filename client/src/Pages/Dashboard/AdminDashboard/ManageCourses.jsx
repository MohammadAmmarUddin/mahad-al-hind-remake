import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { API } from "../../../config/api";
import { resolveMediaUrl } from "../../../utils/media";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [visibleDropdown, setVisibleDropdown] = useState(null);

  const fetchCourses = () => {
    fetch(`${API}/api/course/getAllCourses`)
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => {});
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#047857",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API}/api/course/deleteCourse/${id}`, { method: "DELETE" })
          .then((res) => res.json())
          .then(() => {
            Swal.fire({ title: "Deleted!", text: "The course has been deleted.", icon: "success", confirmButtonColor: "#047857" });
            fetchCourses();
          })
          .catch(() => {
            Swal.fire({ title: "Error!", text: "There was an error deleting the course.", icon: "error", confirmButtonColor: "#047857" });
          });
      }
    });
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setVisibleDropdown(visibleDropdown === id ? null : id);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".dropdown-container")) setVisibleDropdown(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="p-4 pt-6 lg:p-6">
      <h1 className="mb-6 font-heading text-display-sm font-bold text-neutral-900">Manage Courses</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {courses?.map((course) => (
          <div key={course._id} className="card-interactive overflow-hidden">
            <Link to={`/singleCourse/${course?._id}`}>
              <div className="relative aspect-video overflow-hidden bg-neutral-100">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  src={resolveMediaUrl(course?.banner)}
                  alt={course?.title}
                />
              </div>
            </Link>
            <div className="dropdown-container relative">
              <button
                onClick={(e) => toggleDropdown(course._id, e)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-800"
              >
                <BsThreeDots className="text-lg" />
              </button>
              {visibleDropdown === course._id && (
                <div className="absolute right-3 top-12 z-20 w-48 rounded-xl border border-neutral-100 bg-white p-1.5 shadow-elevated">
                  <Link
                    to={`/dashboard/admin/updateCourse/${course?._id}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <MdEdit className="h-4 w-4" />
                    Update Course
                  </Link>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <RiDeleteBin5Line className="h-4 w-4" />
                    Delete Course
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCourses;
