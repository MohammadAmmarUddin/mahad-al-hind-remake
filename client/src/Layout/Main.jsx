import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Whatsapp from "../Components/Whatsapp";
import VortiCholche from "../Components/VortiCholche";
import UtilityBar from "../Components/UtilityBar";
import RouteFallback from "./RouteFallback";

function Main() {
  const location = useLocation();

  const singleCourseRegex = /^\/singleCourse\/[^/]+$/;

  const shouldRenderHeaderFooter =
    !["/login", "/dashboard", "/signup"].includes(location.pathname) &&
    !singleCourseRegex.test(location.pathname);

  return (
    <div className="relative">
      {shouldRenderHeaderFooter && (
        <div className="">
          <UtilityBar />
          <Navbar />
        </div>
      )}
      <div className="">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <VortiCholche />
      <Whatsapp />
      {shouldRenderHeaderFooter && <Footer />}
    </div>
  );
}

export default Main;
