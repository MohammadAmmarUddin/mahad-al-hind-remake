import { useState } from "react";
import useAuth from "./useAuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { apiPath, safeFetch } from "../config/api";
import { startTransition } from "react";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await safeFetch(
        apiPath("/api/user/login"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response) {
        setError("Backend is unavailable. Please try again later.");
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Backend is unavailable. Please try again later.",
          showConfirmButton: true,
        });
        return null;
      }

      const json = await response.json();

      if (!response.ok) {
        const msg = json.error || json.message || "Login failed. Please try again.";
        setError(msg);
        Swal.fire({
          position: "center",
          icon: "error",
          title: msg,
          showConfirmButton: true,
        });
        return null;
      }

      localStorage.setItem("user", JSON.stringify(json));
      if (json?.token) {
        localStorage.setItem("access-token", json.token);
      }
      dispatch({ type: "LOGIN", payload: json });
      return json;
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Something went wrong. Please try again later.",
        showConfirmButton: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (userData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await safeFetch(
        apiPath("/api/user/googleLogin"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );

      if (!response) {
        throw new Error("Backend is unavailable. Please try again later.");
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || json.message || "Google login failed.");
      }

      localStorage.setItem("user", JSON.stringify(json));
      if (json?.token) {
        localStorage.setItem("access-token", json.token);
      }
      dispatch({ type: "LOGIN", payload: json });

      if (json?.user?.role === "school-owner") {
        startTransition(() => {
          navigate("/dashboard");
        });
      } else if (json?.user?.role === "teacher") {
        startTransition(() => {
          navigate("/teacherDashboard");
        });
      } else {
        startTransition(() => {
          navigate("/");
        });
      }

      return true;
    } catch (err) {
      setError(err.message || "Something went wrong with Google login.");
      Swal.fire({
        position: "center",
        icon: "error",
        title:
          err.message ||
          "Something went wrong with Google login. Please try again later.",
        showConfirmButton: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, googleLogin, error, isLoading };
};
