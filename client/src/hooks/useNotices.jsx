import { useQuery } from "@tanstack/react-query";
import { API } from "../config/api";

const fetchNotices = async ({ page = 1, limit = 9, category = "", search = "" }) => {
  const params = new URLSearchParams({ page, limit });
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);

  const res = await fetch(`${API}/api/notices/public?${params}`);
  if (!res.ok) throw new Error("Failed to fetch notices");
  return res.json();
};

export const useNotices = ({ page = 1, limit = 9, category = "", search = "" } = {}) => {
  return useQuery({
    queryKey: ["notices", { page, limit, category, search }],
    queryFn: () => fetchNotices({ page, limit, category, search }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};
