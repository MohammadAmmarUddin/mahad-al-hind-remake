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
import { useSiteContent } from "../context/SiteContentContext";

const Navbar = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState(null);
  const { logout } = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, translate } = useSiteContent();

  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  useEffect(() => {
    if (user?.user?._id) {
      fetch(`${baseUrl}/api/user/singleUser/${user?.user?._id}`)
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((error) => console.log(error));
    }
  }, [user?.user?._id]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinkClasses =
    "relative px-4 py-2 transition-all duration-300 ease-in-out rounded-md text-emerald-700 font-medium";

  const navLinkHoverEffect = {
    whileHover: {
      backgroundColor: "rgba(5, 150, 105, 0.8)",
      color: "#ffffff",
      scale: 1.05,
      radius: "0.375rem",
    },
    transition: { duration: 0.3 },
  };

  const navItems = [
    { to: "/", label: translate("navbar", "home") },
    {
      to:
        user?.user?.role === "admin"
          ? "/dashboard/admin/adminHome"
          : user?.user?.role === "user"
          ? "/dashboard/user/userHome"
          : null,
      label: translate("navbar", "dashboard"),
    },
    { to: "/allCourses", label: translate("navbar", "courses") },
    {
      to: "/certificate-checker",
      label: translate("navbar", "certificateChecker"),
    },
    { to: "/Admission-help", label: translate("navbar", "admissionHelp") },
  ].filter((link) => link.to);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 z-50 w-full bg-white shadow-md"
    >
      <div className="mx-auto w-11/12 py-3 xl:w-3/4">
        <div className="flex items-center justify-between gap-3 xl:gap-6">
          {/* Logo */}
          <div className="w-16 shrink-0 sm:w-20">
            <Link to={"/"}>
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 min-[1180px]:flex xl:gap-2">
            {navItems.map((link, idx) => (
              <motion.div key={idx} {...navLinkHoverEffect} className="min-w-0">
                <Link
                  to={link.to}
                  className={`${navLinkClasses} block max-w-[170px] truncate px-3 xl:max-w-none`}
                  title={link.label}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Profile / Auth */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-full border border-emerald-200 bg-emerald-50 p-1 md:flex">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  language === "en"
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-700"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  language === "bn"
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-700"
                }`}
              >
                বাং
              </button>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={toggleMenu}
              className="text-2xl text-emerald-700 min-[1180px]:hidden"
            >
              <HiMenu />
            </button>

            {/* Desktop Auth Buttons */}
            {user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden items-center rounded-full bg-emerald-600 px-3 py-1 min-[1180px]:flex"
              >
                <p className="hidden max-w-[140px] truncate text-white sm:block">
                  {userData?.firstname} {userData?.lastname}
                </p>
                <div className="dropdown dropdown-end ml-3">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
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
                        <CgProfile /> {translate("navbar", "profile")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="flex items-center gap-2">
                        <IoSettingsOutline /> {translate("navbar", "settings")}
                      </Link>
                    </li>
                    <li onClick={logout}>
                      <span className="flex items-center gap-2 cursor-pointer">
                        <MdLogout /> {translate("navbar", "logout")}
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="hidden items-center gap-3 font-semibold min-[1180px]:flex">
                <Link to="/login" className="text-emerald-700 hover:underline">
                  {translate("navbar", "login")}
                </Link>
                <Link
                  to="/signup"
                  className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition"
                >
                  {translate("navbar", "signup")}
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
              className="mt-3 flex flex-col gap-3 rounded-md border bg-white p-4 font-medium text-emerald-700 shadow-md min-[1180px]:hidden"
            >
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                <span>{translate("navbar", "language")}</span>
                <div className="flex items-center rounded-full border border-emerald-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      language === "en" ? "bg-emerald-700 text-white" : ""
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("bn")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      language === "bn" ? "bg-emerald-700 text-white" : ""
                    }`}
                  >
                    বাং
                  </button>
                </div>
              </div>

              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={toggleMenu}>
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="text-emerald-700 hover:underline"
                  >
                    {translate("navbar", "login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={toggleMenu}
                    className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition text-center"
                  >
                    {translate("navbar", "signup")}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Navbar;
