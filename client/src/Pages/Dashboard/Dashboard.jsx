import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import DashNavbar from "./UserDashboard/DashNavbar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <div className="relative">
        <Sidebar />
      </div>
      <div className="flex-1 lg:ml-64 min-h-screen">
        <DashNavbar />
        <div className="p-3 sm:p-4">
          {" "}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
