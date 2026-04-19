const apiBaseUrl =
  import.meta.env.VITE_MAHAD_baseUrl || "http://localhost:4000";

export const resolveMediaUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${apiBaseUrl}${value}`;
  }

  return `${apiBaseUrl}/${value}`;
};

export const toStoredMediaPath = (value) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (url.pathname.startsWith("/uploads/")) {
      return url.pathname;
    }
    return value;
  } catch {
    return value;
  }
};
