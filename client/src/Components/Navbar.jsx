import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { HiMenu } from "react-icons/hi";
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

  const navLinkClasses =
    "relative px-4 py-2 transition-all duration-300 ease-in-out rounded-md text-emerald-700 font-medium";

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed left-0 top-0 z-50 w-full bg-white shadow-md"
    >
      <div className="mx-auto w-11/12 py-3 xl:w-3/4">
        <div className="flex items-center justify-between gap-3 xl:gap-6">
          <div className="w-16 shrink-0 sm:w-20">
            <Link to="/">
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center gap-1 min-[1180px]:flex xl:gap-2">
            {navItems.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ backgroundColor: "rgba(5, 150, 105, 0.08)", scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 rounded-md"
              >
                <Link
                  to={link.to}
                  className={`${navLinkClasses} block max-w-[170px] truncate px-3 xl:max-w-none`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-full border border-emerald-200 bg-emerald-50 p-1 md:flex">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  language === "en" ? "bg-emerald-700 text-white" : "text-emerald-700"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  language === "bn" ? "bg-emerald-700 text-white" : "text-emerald-700"
                }`}
              >
                BN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="text-2xl text-emerald-700 min-[1180px]:hidden"
            >
              <HiMenu />
            </button>

            {user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden items-center rounded-full bg-emerald-600 px-3 py-1 min-[1180px]:flex"
              >
                <p className="hidden max-w-[140px] truncate text-white sm:block">
                  {userData?.firstname || user?.user?.firstname || "User"}{" "}
                  {userData?.lastname || user?.user?.lastname || ""}
                </p>
                <div className="dropdown dropdown-end ml-3">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="h-9 w-9 rounded-full border-2 border-white">
                      <img
                        src={resolveMediaUrl(userData?.img || user?.user?.img)}
                        alt="User"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 w-52 rounded-md border bg-white p-2 shadow z-[999]"
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
                      <span className="flex cursor-pointer items-center gap-2">
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
                  className="rounded-md bg-emerald-600 px-3 py-1 text-white transition hover:bg-emerald-700"
                >
                  {translate("navbar", "signup")}
                </Link>
              </div>
            )}
          </div>
        </div>

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
                    BN
                  </button>
                </div>
              </div>

              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}

              {!user && (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-emerald-700 hover:underline"
                  >
                    {translate("navbar", "login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-center text-white transition hover:bg-emerald-700"
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
