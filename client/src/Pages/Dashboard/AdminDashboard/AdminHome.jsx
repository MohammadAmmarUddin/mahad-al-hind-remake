/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  FaUsers,
  FaBookOpen,
  FaUserGraduate,
  FaChartLine,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import { TbCurrencyTaka } from "react-icons/tb";
import { API } from "../../../config/api";

const safeJson = async (res) => {
  try {
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const AdminDashboard = () => {
  const [countUsers, setCountUsers] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState(null);
  const [courseCount, setCourseCount] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [totalAvgRating, setTotalAvgRating] = useState(null);
  const [courseCategories, setCoursesCategories] = useState([]);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [avgCourseCompleteTime, setAvgCourseCompleteTime] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [
          usersRes,
          coursesRes,
          enrolledRes,
          revenueRes,
          categoriesRes,
          ratingRes,
          completedRes,
          avgTimeRes,
        ] = await Promise.all([
          fetch(`${API}/api/user/allUsersCount`),
          fetch(`${API}/api/course/getCourseCount`),
          fetch(`${API}/api/course/enrolledUsersCourses`),
          fetch(`${API}/api/course/getTotalPayment`),
          fetch(`${API}/api/course/getCourseCategories`),
          fetch(`${API}/api/course/getAvgRating`),
          fetch(`${API}/api/course/getCompletedCoursesCount`),
          fetch(`${API}/api/course/getAverageCompletionTime`),
        ]);

        if (cancelled) return;

        const [users, courses, enrolled, revenue, categories, rating, completed, avgTime] =
          await Promise.all([
            safeJson(usersRes),
            safeJson(coursesRes),
            safeJson(enrolledRes),
            safeJson(revenueRes),
            safeJson(categoriesRes),
            safeJson(ratingRes),
            safeJson(completedRes),
            safeJson(avgTimeRes),
          ]);

        setCountUsers(users?.usersCount ?? 0);
        setCourseCount(courses?.courseCount ?? 0);
        setEnrolledUsers(enrolled?.totalEnrolledStudents ?? 0);
        setTotalRevenue(revenue?.totalPayment ?? 0);
        setCoursesCategories(categories?.categories ?? []);
        setTotalAvgRating(rating?.avgRating ?? "—");
        setCompletedCoursesCount(completed?.totalCompletedCourses ?? 0);
        setAvgCourseCompleteTime(avgTime?.averageCompletionTimeInDays ?? null);
      } catch {
        if (!cancelled) setLoadError("Failed to load dashboard stats.");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pb-6">
      <h1 className="mb-5 font-heading text-display-sm font-bold text-neutral-900">Admin Dashboard</h1>

      {loadError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={<FaUsers />} title="Total Users" value={countUsers ?? "…"} />
        <StatCard icon={<FaBookOpen />} title="Total Courses" value={courseCount ?? "…"} />
        <StatCard icon={<FaUserGraduate />} title="Enrolled Users" value={enrolledUsers ?? "…"} />
        <StatCard
          icon={<FaChartLine />}
          title="Revenue"
          value={
            <span className="flex items-center gap-1">
              {totalRevenue ?? "…"} <TbCurrencyTaka className="text-lg" />
            </span>
          }
        />
      </div>

      {/* Course Categories & Overview */}
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className="card-base p-5 sm:p-6">
          <h2 className="mb-4 font-heading text-heading-lg font-semibold text-neutral-900">Course Categories</h2>
          <div className="space-y-3">
            {courseCategories.length === 0 ? (
              <p className="text-body-sm text-neutral-400">No categories yet.</p>
            ) : (
              courseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-4 py-2.5">
                  <span className="min-w-0 truncate text-body-sm text-neutral-700">
                    {category.name || category.category}
                  </span>
                  <span className="badge-base shrink-0 bg-primary-100 text-primary-700">{category.count || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-base p-5 sm:p-6">
          <h2 className="mb-4 font-heading text-heading-lg font-semibold text-neutral-900">Platform Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<FaStar className="text-warning" />}
              title="Average Rating"
              value={totalAvgRating ?? "…"}
            />
            <MetricCard
              icon={<FaCheckCircle className="text-success" />}
              title="Completed Courses"
              value={completedCoursesCount ?? "…"}
            />
            {avgCourseCompleteTime !== null && (
              <MetricCard
                wide
                icon={<FaChartLine className="text-primary" />}
                title="Avg Completion (days)"
                value={avgCourseCompleteTime}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="card-base p-4 sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="min-w-0 truncate text-xs font-medium text-neutral-500 sm:text-meta">{title}</h2>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 sm:h-9 sm:w-9">
        {icon}
      </div>
    </div>
    <p className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">{value}</p>
  </div>
);

const MetricCard = ({ icon, title, value, wide = false }) => (
  <div className={`rounded-lg bg-neutral-50 p-4 ${wide ? "col-span-2" : ""}`}>
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h3 className="text-meta font-medium text-neutral-500">{title}</h3>
    </div>
    <p className="font-heading text-xl font-bold text-neutral-900">{value}</p>
  </div>
);

export default AdminDashboard;
