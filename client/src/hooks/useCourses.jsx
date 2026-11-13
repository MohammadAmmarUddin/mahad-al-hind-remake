import { useQuery } from "@tanstack/react-query";
import { API } from "../config/api";
import { getStoredAuthToken } from "../utils/authToken";

const fetchCourses = async () => {
  const token = getStoredAuthToken();
  const res = await fetch(`${API}/api/course/getAllCourses`, {
    headers: token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token }
      : {},
  });
  if (!res.ok) {
    throw new Error("Failed to load courses");
  }
  return res.json();
};

const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 60 * 1000,
  });
};

export default useCourses;
