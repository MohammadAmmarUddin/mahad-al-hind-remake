import { useEffect, useState } from "react";
import {
  FaHome,
  FaBookOpen,
  FaTachometerAlt,
  FaUsers,
  FaBars,
  FaUser,
  FaCertificate,
  FaVideo,
  FaImages,
  FaSlidersH,
  FaCalendarAlt,
  FaMobileAlt,
  FaMusic,
  FaWallet,
  FaTimes,
  FaBullhorn,
  FaStickyNote,
  FaStar,
} from "react-icons/fa";
import { MdLibraryBooks, MdPayment, MdSchool, MdAssignmentTurnedIn, MdStar } from "react-icons/md";
import { GrUserManager, GrAddCircle } from "react-icons/gr";
import { NavLink, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../config/api";
import { resolveMediaUrl } from "../utils/media";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState({});
  const location = useLocation();
  const baseUrl = API;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const fetchAllUsers = () => {
    fetch(`${baseUrl}/api/user/allUsers`)
      .then((res) => res.json())
      .then((data) => {
        const userData = data.find((u) => u._id === user?.user?._id);
        setCurrentUser(userData || {});
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user?.user?._id) fetchAllUsers();
  }, [user?.user?._id]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const singleCourseRegex = /^\/singleCourse\/[^/]+$/;

  const navLinkClass = ({ isActive }, path) => {
    const isSingleCoursePage = singleCourseRegex.test(location.pathname);
    const active =
      isActive ||
      (isSingleCoursePage && path === "/dashboard/admin/manageCourses");

    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-white/20 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;
  };

  const adminLinks = [
    { to: "/dashboard/admin/adminHome", icon: <FaTachometerAlt className="h-4 w-4" />, label: "Admin Home" },
    { to: "/dashboard/admin/addCourses", icon: <GrAddCircle className="h-4 w-4" />, label: "Add Course" },
    { to: "/dashboard/admin/manageCourses", icon: <MdLibraryBooks className="h-4 w-4" />, label: "Manage Courses", matchPath: "/dashboard/admin/manageCourses" },
    { to: "/dashboard/admin/transactionHistory", icon: <MdPayment className="h-4 w-4" />, label: "Transaction History" },
    { to: "/dashboard/admin/allUsers", icon: <GrUserManager className="h-4 w-4" />, label: "All Users" },
    { to: "/dashboard/admin/addCertificate", icon: <FaCertificate className="h-4 w-4" />, label: "Add Certificate" },
    { to: "/dashboard/admin/manageVideos", icon: <FaVideo className="h-4 w-4" />, label: "Manage Videos" },
    { to: "/dashboard/admin/homeSections", icon: <FaSlidersH className="h-4 w-4" />, label: "Home Sections" },
    { to: "/dashboard/admin/gallery", icon: <FaImages className="h-4 w-4" />, label: "Gallery" },
    { to: "/dashboard/admin/enrollmentSettings", icon: <FaCalendarAlt className="h-4 w-4" />, label: "Enrollment Notice" },
    { to: "/dashboard/admin/appUpdate", icon: <FaMobileAlt className="h-4 w-4" />, label: "App Updates" },
    { to: "/dashboard/admin/audioLibrary", icon: <FaMusic className="h-4 w-4" />, label: "Audio Library" },
    { to: "/dashboard/admin/finance", icon: <FaWallet className="h-4 w-4" />, label: "Finance" },
    { to: "/dashboard/admin/breakingNews", icon: <FaBullhorn className="h-4 w-4" />, label: "Breaking News" },
    { to: "/dashboard/admin/manageNotices", icon: <FaStickyNote className="h-4 w-4" />, label: "Manage Notices" },
    { to: "/dashboard/admin/manageNoticeCategories", icon: <FaStickyNote className="h-4 w-4" />, label: "Notice Categories" },
    { to: "/dashboard/admin/manageStudentReviews", icon: <FaStar className="h-4 w-4" />, label: "Student Reviews" },
  ];

  const userLinks = [
    { to: "/dashboard/user/userHome", icon: <FaTachometerAlt className="h-4 w-4" />, label: "User Home" },
    { to: "/dashboard/user/userPaymentHistory", icon: <MdPayment className="h-4 w-4" />, label: "Transaction History" },
    { to: "/dashboard/user/userCourses", icon: <MdSchool className="h-4 w-4" />, label: "My Classes" },
    { to: "/dashboard/user/userReview", icon: <MdStar className="h-4 w-4" />, label: "Add Review" },
  ];

  const links = currentUser?.role === "admin" ? adminLinks : userLinks;
  const dashboardTitle = currentUser?.role === "admin" ? "Admin Dashboard" : "User Dashboard";

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-lg bg-primary-700 text-white shadow-lg transition-colors hover:bg-primary-800 lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen || typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col overflow-y-auto bg-gradient-to-b from-primary-800 via-primary-700 to-primary-900 shadow-xl scrollbar-hidden"
      >
        {/* Profile */}
        <div className="flex flex-col items-center border-b border-white/10 px-6 py-6">
          <img
            src={resolveMediaUrl(user?.user?.img || "/default-profile.png")}
            alt="Profile"
            className="mb-3 h-20 w-20 rounded-full border-3 border-white/30 object-cover shadow-lg"
          />
          <h2 className="font-heading text-base font-bold text-white">{dashboardTitle}</h2>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={(navData) => navLinkClass(navData, link.matchPath || link.to)}
              to={link.to}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="border-t border-white/10 px-4 py-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <FaHome className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink
            to="/allCourses"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <FaBookOpen className="h-4 w-4" />
            Courses
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <FaUser className="h-4 w-4" />
            Profile
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
