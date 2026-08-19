import useAuthContext from "../hooks/useAuthContext";
import { MdEdit, MdPerson } from "react-icons/md";
import { FaMedal } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../config/api";
import { resolveMediaUrl } from "../utils/media";

const Profile = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const fetchSingleUser = () => {
    const url = `${API}/api/user/singleUser/${user?.user?._id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((error) => console.log(error));
  };

  const fetchEnrolledCourses = () => {
    const url = `${API}/api/course/getAllEnrolledCourse/${user?.user?._id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setEnrolledCourses(data.courses))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchSingleUser();
      fetchEnrolledCourses();
    }
  }, [user?.user?._id]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-32 sm:w-32 border-b-2 border-[#047857]"></div>
      </div>
    );
  }
  return (
    <div className="w-11/12 lg:w-3/4 mx-auto mt-6 sm:mt-10 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 sm:gap-8">
        <div className="md:col-span-3 lg:col-span-2">
          <img
            className="h-48 sm:h-64 md:h-[350px] lg:h-[400px] rounded-md w-full object-cover object-top border"
            src={resolveMediaUrl(userData.img && userData.img)}
            alt=""
          />
          <div className="block md:hidden">
            <div className="flex justify-between items-center pt-4">
              <h3 className="text-xl sm:text-2xl font-semibold break-words">
                {userData.firstname} {userData.lastname}
              </h3>
              <Link to={"/updateProfile"}>
                <MdEdit className="text-2xl sm:text-3xl bg-primary text-white rounded-full p-1 flex-shrink-0" />
              </Link>
            </div>
            <p className="text-base sm:text-xl">{userData.profession[0]?.position}</p>
          </div>
          <div className="py-4 sm:py-5">
            <p className="font-semibold text-xs text-slate-400 pb-1">
              PROFESSIONAL INFO
            </p>
            <p className="text-sm sm:text-base break-words">{userData.institution}</p>
            <p className="text-sm sm:text-base">{userData.profession[0]?.position}</p>
          </div>
          <div className="py-4 sm:py-5">
            <p className="font-semibold text-xs text-slate-400 pb-1">
              EDUCATIONAL HISTORY
            </p>
            <p className="text-sm sm:text-base break-words">{userData.degree}</p>
            <p className="text-sm sm:text-base">{userData.result}</p>
          </div>
        </div>
        <div className="md:col-span-4 lg:col-span-5">
          <div className="border-b pb-1">
            <div className="md:block hidden">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl lg:text-3xl font-semibold break-words">
                  {userData.firstname} {userData.lastname}
                </h3>
                <Link to={"/updateProfile"}>
                  <MdEdit className="text-3xl bg-primary text-white rounded-full p-1" />
                </Link>
              </div>
              <p className="text-lg sm:text-xl">{userData.profession[0]?.position}</p>
            </div>
            <div className="pt-5 sm:pt-7 flex gap-6 sm:gap-8">
              <p
                className={`flex gap-1 items-center cursor-pointer text-sm sm:text-base ${activeTab === 0 && "text-primary"
                  }`}
                onClick={() => setActiveTab(0)}
              >
                <MdPerson className="text-lg sm:text-xl" /> <span>About</span>
              </p>
              <p
                className={`flex gap-1 items-center cursor-pointer text-sm sm:text-base ${activeTab === 1 && "text-primary"
                  }`}
                onClick={() => setActiveTab(1)}
              >
                <FaMedal /> <span>Certificates</span>
              </p>
            </div>
          </div>
          {activeTab === 0 && (
            <div>
              <div className="py-4 sm:py-5 mt-4 sm:mt-5">
                <p className="font-semibold text-slate-400 pb-2 text-xs">
                  CONTACT INFO
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-2">
                  <p className="text-sm">Phone</p>
                  <p className="col-span-2 sm:col-span-4 text-sm break-words">{userData.phone}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 py-2 gap-y-2">
                  <p className="text-sm">Address</p>
                  <p className="col-span-2 sm:col-span-4 text-sm break-words">{userData.location}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-2">
                  <p className="text-sm">Email</p>
                  <p className="col-span-2 sm:col-span-4 text-sm break-words">{userData.email}</p>
                </div>
              </div>
              <div className="py-4 sm:py-5">
                <p className="font-semibold text-slate-400 pb-2 text-xs">
                  PERSONAL INFO
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-2">
                  <p className="text-sm">Birthday</p>
                  <p className="col-span-2 sm:col-span-4 text-sm">{userData.birthday}</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 py-2 gap-y-2">
                  <p className="text-sm">Gender</p>
                  <p className="col-span-2 sm:col-span-4 text-sm">{userData.gender}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 1 && (
            <div>
              {enrolledCourses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-5">
                  {enrolledCourses.map((course) => {
                    const isUserCompleted = course.students.some(
                      (student) =>
                        student.studentsId === user.user._id &&
                        student.isCourseComplete &&
                        student.isQuizComplete
                    );

                    return (
                      <div
                        key={course._id}
                        className="bg-white border border-gray-200 rounded-lg shadow-md p-4"
                      >
                        <img
                            src={resolveMediaUrl(course.banner)}
                          className="h-28 sm:h-32 min-w-full object-cover"
                          alt=""
                        />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Category:</strong> {course.category}
                        </p>
                        {isUserCompleted ? (
                          <Link
                            to={{
                              pathname: "/dashboard/user/userCertificate",
                            }}
                            state={{ courseTitle: course.title }}
                            className="btn bg-primary text-white text-sm"
                          >
                            Download Certificate
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Please Complete Your Course
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <h4 className="text-base sm:text-xl flex justify-center items-center pt-20 sm:pt-32 px-4 text-center">
                  You are not enrolled in any course; thus, no certificate is
                  available.
                </h4>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
