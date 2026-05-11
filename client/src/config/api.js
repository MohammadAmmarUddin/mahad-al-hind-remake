const env =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_MAHAD_baseUrl ||
  (typeof process !== "undefined" ? process.env.REACT_APP_API : "") ||
  "";

export const API_BASE = String(env).replace(/\/$/, "");

if (
  typeof window !== "undefined" &&
  (API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1"))
) {
  console.warn(
    "[API] WARNING: API_BASE points to localhost in a deployed build —",
    API_BASE,
    ". Set VITE_MAHAD_baseUrl to your production server URL.",
  );
}
export const API = API_BASE;

const defaults = {
  headers: { "Content-Type": "application/json" },
};

export const apiPath = (path = "") => {
  if (!path) return API_BASE;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const resolveApiUrl = (url = "") => {
  if (!url) return API_BASE;
  if (/^https?:\/\//i.test(url)) return url;
  return apiPath(url);
};

export const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...defaults,
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const safeFetch = async (url, options = {}, timeoutMs = 8000) => {
  try {
    const resolved = resolveApiUrl(url);
    const res = await fetchWithTimeout(resolved, options, timeoutMs);
    if (!res.ok) {
      let body = "";
      try {
        body = await res.clone().text();
      } catch {}
      console.warn(
        `[API] ${res.status} ${res.statusText} — ${url}`,
        body.slice(0, 500),
      );
    }
    return res;
  } catch (error) {
    const msg =
      error?.name === "AbortError"
        ? `[API] Timeout (${timeoutMs}ms) — ${url}`
        : `[API] Network error — ${url} — ${error?.message || error}`;
    console.warn(msg);
    return null;
  }
};

export const safeFetchJson = async (
  url,
  options = {},
  fallbackValue = null,
) => {
  const response = await safeFetch(url, options);
  if (!response) return fallbackValue;
  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch {}
    console.warn(
      `[API] JSON fetch failed ${response.status} — ${url}`,
      body.slice(0, 500),
    );
    return fallbackValue;
  }
  try {
    return await response.json();
  } catch (error) {
    console.warn(
      `[API] JSON parse error — ${url} — ${error?.message || error}`,
    );
    return fallbackValue;
  }
};

export const apiFetch = async (url, options = {}) => {
  const res = await safeFetch(url, options);
  if (!res) throw new Error(`Request failed — ${url}`);
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}
    throw new Error(
      `${res.status} ${res.statusText} — ${url} — ${body.slice(0, 500)}`,
    );
  }
  return res.json();
};
