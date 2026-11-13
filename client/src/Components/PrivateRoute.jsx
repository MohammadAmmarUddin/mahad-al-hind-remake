/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return children;
  }

  return <Navigate to="/login" state={location.pathname} replace />;
};

export { LoadingScreen };
export default PrivateRoute;
