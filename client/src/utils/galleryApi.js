import { API } from "../config/api";
import { getStoredAuthToken } from "./authToken";

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
};

export const fetchGalleryItems = async ({
  galleryType = "",
  page = 1,
  limit = 50,
  search = "",
  admin = false,
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (galleryType) params.set("galleryType", galleryType);
  if (search) params.set("search", search);
  if (admin) params.set("admin", "true");

  const token = getStoredAuthToken();
  return requestJson(`/api/gallery?${params}`, {
    headers: admin && token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token }
      : {},
  });
};

export const uploadGalleryItem = async ({
  file,
  title = "",
  sortOrder = 0,
  isVisible = true,
  onProgress,
}) => {
  const token = getStoredAuthToken();
  if (!token) {
    throw new Error("You must be logged in as admin to upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("sortOrder", String(sortOrder));
  formData.append("isVisible", String(Boolean(isVisible)));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/gallery/upload`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-access-token", token);

    let rejected = false;
    const doReject = (msg) => {
      if (!rejected) { rejected = true; reject(new Error(msg)); }
    };

    xhr.upload.onprogress = (event) => {
      if (typeof onProgress === "function" && event.lengthComputable) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 0) { doReject("Network error"); return; }
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else if (xhr.status === 401) {
          doReject("Session expired. Please log in again.");
        } else {
          doReject(data?.message || data?.error || "Upload failed");
        }
      } catch {
        doReject("Upload failed");
      }
    };

    xhr.onerror = () => doReject("Network error — check your connection");
    xhr.ontimeout = () => doReject("Upload timed out");
    xhr.send(formData);
  });
};

export const updateGalleryItem = async (id, payload) => {
  const token = getStoredAuthToken();

  if (payload.file instanceof File) {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.title) formData.append("title", payload.title);
    if (payload.sortOrder !== undefined) formData.append("sortOrder", String(payload.sortOrder));
    if (payload.isVisible !== undefined) formData.append("isVisible", String(payload.isVisible));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `${API}/api/gallery/${id}`);
      xhr.withCredentials = true;
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("x-access-token", token);
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else if (xhr.status === 401) {
            reject(new Error("Session expired. Please log in again."));
          } else {
            reject(new Error(data?.message || data?.error || "Update failed"));
          }
        } catch {
          reject(new Error("Update failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  }

  return requestJson(`/api/gallery/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}`, "x-access-token": token } : {}),
    },
    body: JSON.stringify(payload),
  });
};

export const deleteGalleryItem = async (id) => {
  const token = getStoredAuthToken();
  return requestJson(`/api/gallery/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}`, "x-access-token": token } : {}),
    },
  });
};

export const fetchPublicGallery = async (galleryType) => {
  return requestJson(`/api/galleries/${galleryType}`);
};
