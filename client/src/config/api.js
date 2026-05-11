const env =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.VITE_MAHAD_baseUrl ||
  (typeof process !== "undefined" ? process.env?.REACT_APP_API : "") ||
  "";

export const API_BASE = String(env || "http://localhost:4000").replace(/\/$/, "");
export const API = API_BASE;

export const apiPath = (path = "") => {
  if (!path) {
    return API_BASE;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const resolveApiUrl = (url = "") => {
  if (!url) {
    return API_BASE;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return apiPath(url);
};

export const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const safeFetch = async (url, options = {}, timeoutMs = 8000) => {
  try {
    return await fetchWithTimeout(resolveApiUrl(url), options, timeoutMs);
  } catch (error) {
    return null;
  }
};

export const safeFetchJson = async (url, options = {}, fallbackValue = null) => {
  const response = await safeFetch(url, options);

  if (!response || !response.ok) {
    return fallbackValue;
  }

  try {
    return await response.json();
  } catch (error) {
    return fallbackValue;
  }
};
