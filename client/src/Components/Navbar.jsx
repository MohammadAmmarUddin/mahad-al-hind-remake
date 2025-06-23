import { Link } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import logo from "../../public/logo.png";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { HiMenu } from "react-icons/hi";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const { logout } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  const fetchUser = () => {
    const url = `${baseUrl}/api/user/singleUser/${user?.user?._id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchUser();
  }, [user?.user?._id]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinkClasses =
    "relative px-4 py-2 transition-all duration-300 ease-in-out rounded-md text-emerald-700 font-medium";

  const navLinkHoverEffect = {
    whileHover: {
      backgroundColor: "rgba(5, 150, 105, 0.8)", // Tailwind's emerald-600
      color: "#ffffff",
      scale: 1.05,
      radius: "0.375rem", // Tailwind's rounded-md
    },
    transition: { duration: 0.3 },
  };


  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 bg-white shadow-md"
    >
      <div className="lg:w-3/4 w-11/12 mx-auto py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="w-20">
            <img src={logo} alt="Logo" className="w-full object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {[
              { to: "/", label: "Home" },
              {
                to:
                  user?.user?.role === "admin"
                    ? "/dashboard/admin/adminHome"
                    : user?.user?.role === "user"
                      ? "/dashboard/user/userHome"
                      : null,
                label: "Dashboard",
              },
              { to: "/allCourses", label: "Courses" },

              { to: "/certificate-checker", label: "Certificate Checker" },
            ]
              .filter((link) => link.to)
              .map((link, idx) => (
                <motion.div key={idx} {...navLinkHoverEffect}>
                  <Link to={link.to} className={navLinkClasses}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
          </div>

          {/* Profile / Auth */}
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button onClick={toggleMenu} className="lg:hidden text-2xl text-emerald-700">
              <HiMenu />
            </button>

            {user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center bg-emerald-600 rounded-full px-3 py-1"
              >
                <p className="text-white font-medium hidden sm:block">
                  {userData?.firstname} {userData?.lastname}
                </p>
                <div className="dropdown dropdown-end ml-3">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-9 rounded-full border-2 border-white">
                      <img
                        src={userData?.img}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 p-2 shadow border rounded-md bg-white w-52 z-[999]"
                  >
                    <li>
                      <Link to="/profile" className="flex items-center gap-2">
                        <CgProfile /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="flex items-center gap-2">
                        <IoSettingsOutline /> Settings
                      </Link>
                    </li>
                    <li onClick={logout}>
                      <span className="flex items-center gap-2 cursor-pointer">
                        <MdLogout /> Logout
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 font-semibold">
                <Link to="/login" className="text-emerald-700 hover:underline">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-3 flex flex-col gap-3 p-4 bg-white border rounded-md shadow-md text-emerald-700 font-medium"
            >
              <Link to="/" onClick={toggleMenu}>Home</Link>
              {user?.user?.role === "admin" && (
                <Link to="/dashboard/admin/adminHome" onClick={toggleMenu}>
                  Dashboard
                </Link>
              )}
              {user?.user?.role === "user" && (
                <Link to="/dashboard/user/userHome" onClick={toggleMenu}>
                  Dashboard
                </Link>
              )}
              <Link to="/allCourses" onClick={toggleMenu}>Courses</Link>

              <Link to="/certificate-checker" onClick={toggleMenu}>Certificate Checker</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Navbar;
