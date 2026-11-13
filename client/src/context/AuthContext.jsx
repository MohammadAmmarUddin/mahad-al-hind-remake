/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useReducer } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload, loading: false };
    case "LOGOUT":
      return { user: null, loading: false };
    case "HYDRATED":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
  });

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        if (user.token) {
          localStorage.setItem("access-token", user.token);
        }
        dispatch({ type: "LOGIN", payload: user });
      } else {
        dispatch({ type: "HYDRATED" });
      }
    } catch {
      dispatch({ type: "HYDRATED" });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
