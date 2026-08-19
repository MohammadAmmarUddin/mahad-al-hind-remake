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

const AdminDashboard = () => {
  const [countUsers, setCountUsers] = useState([]);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [courseCount, setCourseCount] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState([]);
  const [totalAvgRating, setTotalAvgRating] = useState([]);
  const [courseCategories, setCoursesCategories] = useState([]);
  const [avgCourseCompleteTime, setAvgCourseCompleteTime] = useState([]);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/user/allUsersCount`).then(r => r.json()).then(setCountUsers).catch(() => {});
    fetch(`${API}/api/course/getCourseCount`).then(r => r.json()).then(setCourseCount).catch(() => {});
    fetch(`${API}/api/course/enrolledUsersCourses`).then(r => r.json()).then(setEnrolledUsers).catch(() => {});
    fetch(`${API}/api/course/getTotalPayment`).then(r => r.json()).then(d => setTotalRevenue(d.totalPayment)).catch(() => {});
    fetch(`${API}/api/course/getCourseCategories`).then(r => r.json()).then(d => setCoursesCategories(d.categories)).catch(() => {});
    fetch(`${API}/api/course/getAvgRating`).then(r => r.json()).then(d => setTotalAvgRating(d.avgRating)).catch(() => {});
    fetch(`${API}/api/course/getCompletedCoursesCount`).then(r => r.json()).then(d => setCompletedCoursesCount(d.totalCompletedCourses)).catch(() => {});
    fetch(`${API}/api/course/getAverageCompletionTime`).then(r => r.json()).then(d => setAvgCourseCompleteTime(d.averageCompletionTimeInDays)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen p-4 pt-6 lg:p-8">
      <h1 className="mb-6 font-heading text-display-sm font-bold text-neutral-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard icon={<FaUsers />} title="Total Users" value={countUsers.usersCount} />
        <StatCard icon={<FaBookOpen />} title="Total Courses" value={courseCount.courseCount} />
        <StatCard icon={<FaUserGraduate />} title="Enrolled Users" value={enrolledUsers.totalEnrolledStudents} />
        <StatCard
          icon={<FaChartLine />}
          title="Revenue"
          value={
            <span className="flex items-center gap-1">
              {totalRevenue} <TbCurrencyTaka className="text-lg" />
            </span>
          }
        />
      </div>

      {/* Course Categories & Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-base p-6">
          <h2 className="mb-4 font-heading text-heading-lg font-semibold text-neutral-900">Course Categories</h2>
          <div className="space-y-3">
            {courseCategories?.map((category, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2.5">
                <span className="text-body-sm text-neutral-700">{category.name || category.category}</span>
                <span className="badge-base bg-primary-100 text-primary-700">{category.count || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-base p-6">
          <h2 className="mb-4 font-heading text-heading-lg font-semibold text-neutral-900">Platform Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={<FaStar className="text-warning" />}
              title="Average Rating"
              value={totalAvgRating}
            />
            <MetricCard
              icon={<FaCheckCircle className="text-success" />}
              title="Completed Courses"
              value={completedCoursesCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="card-base p-4 sm:p-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xs sm:text-meta font-medium text-neutral-500">{title}</h2>
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        {icon}
      </div>
    </div>
    <p className="font-heading text-xl sm:text-2xl font-bold text-neutral-900">{value}</p>
  </div>
);

const MetricCard = ({ icon, title, value }) => (
  <div className="rounded-lg bg-neutral-50 p-4">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h3 className="text-meta font-medium text-neutral-500">{title}</h3>
    </div>
    <p className="font-heading text-xl font-bold text-neutral-900">{value}</p>
  </div>
);

export default AdminDashboard;
