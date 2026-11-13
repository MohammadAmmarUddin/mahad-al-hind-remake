import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar";
import DashNavbar from "./UserDashboard/DashNavbar";
import RouteFallback from "../../Layout/RouteFallback";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <div className="relative">
        <Sidebar />
      </div>
      <div className="min-h-screen min-w-0 flex-1 lg:ml-[280px]">
        <DashNavbar />
        <div className="p-3 sm:p-4">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
