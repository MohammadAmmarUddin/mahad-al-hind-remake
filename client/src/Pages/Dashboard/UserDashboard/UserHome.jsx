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
      if (!user?.user?._id) {
        return;
      }

      const [spentData, coursesData] = await Promise.all([
        safeFetchJson(`/api/course/getSpentByStudent/${user.user._id}`, {}, null),
        safeFetchJson(`/api/course/getAllEnrolledCourse/${user.user._id}`, {}, null),
      ]);

      if (!active) {
        return;
      }

      setTotalSpent(spentData?.totalPayment || 0);
      const courses = Array.isArray(coursesData?.courses) ? coursesData.courses : [];
      setTotalEnrolledCourses(courses.length);
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

    return () => {
      active = false;
    };
  }, [user?.user?._id]);

  return (
    <div className="min-h-screen bg-gray-50 pt-5 lg:p-8">
      <h1 className="mb-8 text-3xl font-bold text-primary">
        Welcome, {user?.user?.name || "User"}!
      </h1>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard icon={<FaBookOpen />} title="Enrolled Courses" value={totalEnrolledCourses} />
        <StatCard icon={<FaCertificate />} title="Certificates Earned" value={certificateEarned} />
        <StatCard
          icon={<TbCurrencyTaka />}
          title="Total Spent"
          value={
            <div className="flex items-center">
              {totalSpent}
              <TbCurrencyTaka className="ml-1" />
            </div>
          }
        />
      </div>

      <div className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-primary">Your Courses Progress</h2>
        <div className="space-y-4">
          {coursesByStudent.length > 0 ? (
            coursesByStudent.map((course) => (
              <CourseProgressCard key={course._id} course={course} userId={user.user._id} />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No enrolled courses available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-medium text-gray-500">{title}</h2>
      <div className="text-xl text-primary">{icon}</div>
    </div>
    <p className="text-3xl font-bold">{value}</p>
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
    <div className="rounded-lg bg-gray-50 p-4">
      <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">Progress</span>
        <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {unlockedVideos} / {totalVideos} videos completed
      </p>
      {studentData?.isCourseComplete && (
        <div className="mt-2 text-sm font-medium text-green-600">Course Completed!</div>
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
