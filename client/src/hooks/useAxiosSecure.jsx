import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "./useAuthContext";
import { API_BASE } from "../config/api";
import { startTransition } from "react";
import { getStoredAuthToken } from "../utils/authToken";

const axiosSecure = axios.create({
  baseURL: API_BASE,
});
const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = getStoredAuthToken();
        config.headers = config.headers || {};
        if (token) {
          config.headers.authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem("user");
          localStorage.removeItem("access-token");
          dispatch({ type: "LOGOUT" });
          startTransition(() => {
            navigate("/login");
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [dispatch, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
