import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FaBookOpen, FaCertificate } from "react-icons/fa";
import { TbCurrencyTaka } from "react-icons/tb";
import useAuthContext from "../../../hooks/useAuthContext";
import { safeFetchJson } from "../../../config/api";

const UserHome = () => {
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalEnrolledCourses, setTotalEnrolledCourses] = useState(0);
  const [coursesByStudent, setCoursesByStudent] = useState([]);
  const [certificateEarned, setCertificateEarned] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!user?.user?._id) return;

      const [spentData, coursesData] = await Promise.all([
        safeFetchJson(`/api/course/getSpentByStudent/${user.user._id}`, {}, null),
        safeFetchJson(`/api/course/getAllEnrolledCourse/${user.user._id}`, {}, null),
      ]);

      if (!active) return;

      setTotalSpent(spentData?.totalPayment || 0);
      const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];
      setTotalEnrolledCourses(courses);
      setCoursesByStudent(courses);

      const completedCourses = courses.reduce((count, course) => {
        const studentData = course.students?.find(
          (student) => student.studentsId === user.user._id,
        );
        return count + (studentData?.isCourseComplete ? 1 : 0);
      }, 0);

      setCertificateEarned(completedCourses);
    };

    loadData();
    return () => { active = false; };
  }, [user?.user?._id]);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 pt-6 lg:p-8">
      <h1 className="mb-8 font-heading text-display-sm font-bold text-neutral-900">
        Welcome, {user?.user?.name || "User"}!
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={<FaBookOpen />} title="Enrolled Courses" value={totalEnrolledCourses} />
        <StatCard icon={<FaCertificate />} title="Certificates Earned" value={certificateEarned} />
        <StatCard
          icon={<TbCurrencyTaka />}
          title="Total Spent"
          value={
            <span className="flex items-center gap-1">
              {totalSpent}
              <TbCurrencyTaka className="text-lg" />
            </span>
          }
        />
      </div>

      <div className="card-base p-6">
        <h2 className="mb-4 font-heading text-heading-lg font-semibold text-neutral-900">Your Courses Progress</h2>
        <div className="space-y-3">
          {coursesByStudent.length > 0 ? (
            coursesByStudent.map((course) => (
              <CourseProgressCard key={course._id} course={course} userId={user.user._id} />
            ))
          ) : (
            <p className="py-8 text-center text-body-sm text-neutral-400">
              No enrolled courses available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="card-base p-5">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-meta font-medium text-neutral-500">{title}</h2>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        {icon}
      </div>
    </div>
    <p className="font-heading text-2xl font-bold text-neutral-900">{value}</p>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
};

const CourseProgressCard = ({ course, userId }) => {
  const studentData = course.students?.find((student) => student.studentsId === userId);
  const totalVideos = course.videos?.length || 0;
  const unlockedVideos = studentData?.unlockedVideo || 0;
  const progress = totalVideos > 0 ? (unlockedVideos / totalVideos) * 100 : 0;

  return (
    <div className="rounded-lg bg-neutral-50 p-4 transition-colors hover:bg-neutral-100/50">
      <h3 className="mb-2 font-heading text-heading-sm font-semibold text-neutral-800">{course.title}</h3>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-body-sm text-neutral-500">Progress</span>
        <span className="text-body-sm font-semibold text-neutral-700">{progress.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-body-sm text-neutral-500">
        {unlockedVideos} / {totalVideos} videos completed
      </p>
      {studentData?.isCourseComplete && (
        <p className="mt-2 text-body-sm font-semibold text-success">Course Completed!</p>
      )}
    </div>
  );
};

CourseProgressCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    videos: PropTypes.arrayOf(PropTypes.object),
    students: PropTypes.arrayOf(
      PropTypes.shape({
        studentsId: PropTypes.string.isRequired,
        unlockedVideo: PropTypes.number,
        isCourseComplete: PropTypes.bool,
      }),
    ),
  }).isRequired,
  userId: PropTypes.string.isRequired,
};

export default UserHome;
