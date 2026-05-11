import { API } from "../config/api";
import { getStoredAuthToken } from "./authToken";

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

const authHeaders = () => {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAdminMedia = async () => {
  try {
    return await requestJson("/api/media/admin", {
      headers: authHeaders(),
    });
  } catch {
    return [];
  }
};

export const fetchPublicMedia = async () => {
  try {
    return await requestJson("/api/media/public");
  } catch {
    return [];
  }
};

export const uploadMedia = async ({ file, title = "", description = "", isPublic = true, folder = "media", resourceType = "auto", onProgress }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("isPublic", String(Boolean(isPublic)));
  formData.append("folder", folder);
  formData.append("resourceType", resourceType);

  const response = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/api/media/upload`);
    xhr.upload.onprogress = (event) => {
      if (typeof onProgress === "function" && event.lengthComputable) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data?.message || data?.error || "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });

  return response;
};

export const updateMedia = async (id, payload) =>
  requestJson(`/api/media/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

export const deleteMedia = async (id) =>
  requestJson(`/api/media/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
