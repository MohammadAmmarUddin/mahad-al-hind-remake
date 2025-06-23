import { useEffect, useState } from "react";
import {
  FaHome,
  FaBookOpen,
  FaSearch,
  FaTachometerAlt,
  FaUsers,
  FaBars,
  FaUser,
  FaCertificate,
} from "react-icons/fa";
import { MdLibraryBooks, MdPayment, MdSchool, MdAssignmentTurnedIn } from "react-icons/md";
import { GrUserManager, GrAddCircle } from "react-icons/gr";
import { NavLink, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const [currentUser, setCurrentUser] = useState({});
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const fetchAllUsers = () => {
    fetch(`${baseUrl}/api/user/allUsers`)
      .then((res) => res.json())
      .then((data) => {
        const userData = data.find((u) => u._id === user?.user?._id);
        setCurrentUser(userData || {});
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchAllUsers();
    }
  }, [user?.user?._id]);

  const singleCourseRegex = /^\/singleCourse\/[^/]+$/;

  const navLinkStyle = ({ isActive }, path) => {
    const isSingleCoursePage = singleCourseRegex.test(location.pathname);
    const active = isActive || (isSingleCoursePage && path === "/dashboard/admin/manageCourses");

    return {
      backgroundColor: active ? "rgba(255, 255, 255, 0.2)" : "transparent",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "600",
      color: "white",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      transition: "background-color 0.3s",
    };
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 border-2 border-white text-white p-2 rounded-full shadow-lg"
      >
        <FaBars size={20} />
      </button>

      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      />

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="h-screen fixed left-0 top-0 bottom-0 w-64 z-50 shadow-xl overflow-y-auto scrollbar-hidden"
        style={{
          background: "linear-gradient(to bottom right, #065f46, #047857, #064e3b)",
          color: "white",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="w-60 p-4 flex justify-center">
          <img
            src={user?.user?.img || "/default-profile.png"}
            alt="Profile"
            className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
          />
        </div>

        <ul className="menu p-4 space-y-3 text-white">
          {currentUser?.role === "admin" && (
            <>
              <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/admin/adminHome"}>
                  <FaTachometerAlt />
                  Admin Home
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/admin/addCourses"}>
                  <GrAddCircle />
                  Add Course
                </NavLink>
              </li>
              <li>
                <NavLink
                  style={(navData) =>
                    navLinkStyle(navData, "/dashboard/admin/manageCourses")
                  }
                  to={"/dashboard/admin/manageCourses"}
                >
                  <MdLibraryBooks />
                  Manage Courses
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/admin/transactionHistory"}>
                  <MdPayment />
                  Transaction History
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/admin/allUsers"}>
                  <GrUserManager />
                  All Users
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/admin/addCertificate"}>
                  <FaCertificate />
                  Add Certificate
                </NavLink>
              </li>
            </>
          )}

          {currentUser?.role === "user" && (
            <>
              <h2 className="text-xl font-bold mb-4">User Dashboard</h2>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/user/userHome"}>
                  <FaTachometerAlt />
                  User Home
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/user/userPaymentHistory"}>
                  <MdPayment />
                  Transaction History
                </NavLink>
              </li>
              <li>
                <NavLink style={navLinkStyle} to={"/dashboard/user/userCourses"}>
                  <MdSchool />
                  My Classes
                </NavLink>
              </li>
            </>
          )}

          <div className="border-t border-white my-4" />

          <li>
            <NavLink style={navLinkStyle} to={"/"}>
              <FaHome />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink style={navLinkStyle} to={"/AllCourses"}>
              <FaBookOpen />
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink style={navLinkStyle} to={"/others"}>
              <MdAssignmentTurnedIn />
              Others
            </NavLink>
          </li>
          <li>
            <NavLink style={navLinkStyle} to={"/profile"}>
              <FaUser />
              Profile
            </NavLink>
          </li>
        </ul>
      </motion.div>
    </>
  );
};

export default Sidebar;
