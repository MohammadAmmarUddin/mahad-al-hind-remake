import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { HiMenu } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import useAuthContext from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";
import { safeFetchJson } from "../config/api";
import logo from "../../public/logo.png";

const Navbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { language, setLanguage, translate } = useSiteContent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (!user?.user?._id) {
        setUserData(null);
        return;
      }

      const data = await safeFetchJson(
        `/api/user/singleUser/${user.user._id}`,
        {},
        null,
      );

      if (active) {
        setUserData(data || null);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [user?.user?._id]);

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
    { to: "/certificate-checker", label: translate("navbar", "certificateChecker") },
    { to: "/Admission-help", label: translate("navbar", "admissionHelp") },
  ].filter((item) => item.to);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 z-50 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md shadow-navbar"
    >
      <div className="container-main flex items-center justify-between gap-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="Ma'hadul Qira'at Al Hind" className="h-9 w-auto sm:h-10" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 min-[1180px]:flex">
          {navItems.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-primary-50 hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <div className="hidden items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5 md:flex">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                language === "en"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                language === "bn"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              BN
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 min-[1180px]:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <FiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>

          {/* User / Auth */}
          {user ? (
            <div className="hidden items-center gap-2 min-[1180px]:flex">
              <span className="max-w-[140px] truncate text-sm font-medium text-neutral-700">
                {userData?.firstname || user?.user?.firstname || "User"}{" "}
                {userData?.lastname || user?.user?.lastname || ""}
              </span>
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-primary-200 transition-all duration-200 hover:border-primary-400"
                >
                  <img
                    src={resolveMediaUrl(userData?.img || user?.user?.img)}
                    alt="User"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 w-52 rounded-xl border border-neutral-100 bg-white p-2 shadow-elevated z-[999]"
                >
                  <li>
                    <Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700">
                      <CgProfile className="h-4 w-4" /> {translate("navbar", "profile")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700">
                      <IoSettingsOutline className="h-4 w-4" /> {translate("navbar", "settings")}
                    </Link>
                  </li>
                  <li>
                    <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600">
                      <MdLogout className="h-4 w-4" /> {translate("navbar", "logout")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 min-[1180px]:flex">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              >
                {translate("navbar", "login")}
              </Link>
              <Link to="/signup" className="btn-primary">
                {translate("navbar", "signup")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-neutral-100 bg-white min-[1180px]:hidden"
          >
            <div className="container-main space-y-1 py-4">
              {/* Language */}
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 mb-2">
                <span className="text-sm font-medium text-neutral-600">{translate("navbar", "language")}</span>
                <div className="flex items-center rounded-full border border-neutral-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                      language === "en" ? "bg-primary-600 text-white" : "text-neutral-500"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("bn")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                      language === "bn" ? "bg-primary-600 text-white" : "text-neutral-500"
                    }`}
                  >
                    BN
                  </button>
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  {item.label}
                </Link>
              ))}

              {!user && (
                <div className="border-t border-neutral-100 pt-3 mt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-center text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                  >
                    {translate("navbar", "login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full"
                  >
                    {translate("navbar", "signup")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
