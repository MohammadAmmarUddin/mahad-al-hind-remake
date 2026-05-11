export const getStoredAuthToken = () => {
  const directToken = localStorage.getItem("access-token");

  if (directToken) {
    return directToken;
  }

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return "";
    }

    const parsed = JSON.parse(storedUser);
    return parsed?.token || parsed?.user?.token || "";
  } catch {
    return "";
  }
};
