import { useState } from "react";
import Swal from "sweetalert2";
import useAuth from "./useAuthContext";
import { apiPath, safeFetchJson } from "../config/api";

export const useSignup = () => {
    const [error, setError] = useState(null);
    const { dispatch } = useAuth();

    const signup = async (
      firstname,
      lastname,
      email,
      phone,
      role,
      prevRole,
      img,
      password,
      options = {},
    ) => {
        setError(null);
        try {
            const json = await safeFetchJson(
              apiPath("/api/user/signup"),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname, lastname, email, phone, role, prevRole, img, password }),
              },
              null,
            );

            if (!json) {
                throw new Error("Backend is unavailable. Please try again later.");
            }

            localStorage.setItem("user", JSON.stringify(json));
            if (json?.token) {
                localStorage.setItem("access-token", json.token);
            }
            dispatch({ type: "LOGIN", payload: json });
            Swal.fire({
                    position: "top-middle",
                    icon: "success",
                    title: "Your account has been created",
                    showConfirmButton: false,
                    timer: 1500,
                });
            return true;

        } catch (err) {
            const message = err?.response?.data?.error || err.message || "Signup failed.";
            setError(message);
            Swal.fire({
                position: "top-middle",
                icon: "error",
                title: message,
                showConfirmButton: true,
            });
            return false;
        }
    };

    return { signup, error };
};
