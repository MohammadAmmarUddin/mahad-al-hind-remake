import useAuthContext from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";
import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../../../utils/media";
import NotificationBell from "../../../Components/NotificationBell";
import { FiLogOut, FiSettings, FiUser } from "react-icons/fi";

const DashNavbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-primary-100 bg-gradient-to-r from-primary-600 to-primary-500 px-4 shadow-sm">
      <p className="text-sm font-semibold text-white drop-shadow sm:text-base">
        Welcome {user?.user?.firstname + " " + user?.user?.lastname}
      </p>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/40 transition-all duration-200 hover:border-white/70"
          >
            <img
              alt="User"
              src={resolveMediaUrl(user?.user?.img)}
              className="h-full w-full object-cover"
            />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 w-52 rounded-xl border border-neutral-100 bg-white p-2 shadow-elevated z-[1]"
          >
            <li>
              <Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700">
                <FiUser className="h-4 w-4" />
                Profile
              </Link>
            </li>
            <li>
              <a className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700">
                <FiSettings className="h-4 w-4" />
                Settings
              </a>
            </li>
            <li>
              <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600">
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashNavbar;
