/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { LoadingScreen } from "./PrivateRoute";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && user?.user?.role === "admin") {
    return children;
  }

  if (user) {
    return <Navigate to="/dashboard/user" replace />;
  }

  return <Navigate to="/login" state={location.pathname} replace />;
};

export default AdminRoute;
