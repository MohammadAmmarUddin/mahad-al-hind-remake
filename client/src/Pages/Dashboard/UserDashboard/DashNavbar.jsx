import { IoIosNotifications } from "react-icons/io";
import useAuthContext from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const DashNavbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    console.log("Navbar loaded. You can trigger API calls here if needed.");
  }, []);

  return (
    <div
      className="w-full h-16 flex items-center justify-between px-4 shadow z-50"
      style={{
        background: "linear-gradient(90deg, #047857, #ecfccb)",
      }}
    >
      <p className="text-xl font-bold text-white drop-shadow">
        Welcome {user?.user?.firstname + " " + user?.user?.lastname}
      </p>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle hover:bg-[#047857] transition"
          >
            <IoIosNotifications className="text-3xl text-white" />
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content mt-3 w-60 shadow bg-white z-[1]"
          >
            <div className="card-body">
              <span className="text-lg font-bold text-gray-800">8 Items</span>
              <span className="text-[#047857] font-semibold">Subtotal: $999</span>
              <div className="card-actions">
                <button className="btn bg-[#047857] hover:bg-emerald-800 text-white btn-block">
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar hover:bg-[#047857] transition"
          >
            <div className="w-10 rounded-full">
              <img
                alt="User"
                src={user?.user?.img}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 w-52 p-2 shadow bg-white rounded-box z-[1]"
          >
            <li>
              <Link to="/profile" className="justify-between hover:bg-[#ecfccb] rounded">
                Profile
                <span className="badge bg-[#047857] text-white">New</span>
              </Link>
            </li>
            <li>
              <a className="hover:bg-[#ecfccb] rounded">Settings</a>
            </li>
            <li>
              <a onClick={handleLogout} className="hover:bg-[#ecfccb] rounded">
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashNavbar;
