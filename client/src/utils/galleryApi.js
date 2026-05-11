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

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}`, "x-access-token": token } : {};

const getSignature = async () => {
  const token = getStoredAuthToken();
  if (!token) throw new Error("Authentication required.");
  return requestJson("/api/gallery/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
  });
};

const uploadToCloudinary = (file, { signature, timestamp, apiKey, cloudName, folder }, onProgress) =>
  new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

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
          reject(new Error(data.error?.message || "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Cloudinary upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error uploading to Cloudinary"));
    xhr.send(fd);
  });

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
    headers: admin && token ? authHeaders(token) : {},
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

  // 1. Get Cloudinary upload signature from server
  const sig = await getSignature();

  // 2. Upload file directly to Cloudinary from the browser
  const cloudinaryResult = await uploadToCloudinary(file, sig, onProgress);

  // 3. Save the Cloudinary URL to the server database
  return requestJson("/api/gallery/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      title,
      sortOrder,
      isVisible,
    }),
  });
};

export const updateGalleryItem = async (id, payload) => {
  const token = getStoredAuthToken();

  if (payload.file instanceof File) {
    // Direct upload to Cloudinary, then update server
    const sig = await getSignature();
    const cloudinaryResult = await uploadToCloudinary(payload.file, sig);

    return requestJson(`/api/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? authHeaders(token) : {}) },
      body: JSON.stringify({
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        title: payload.title,
        sortOrder: payload.sortOrder,
        isVisible: payload.isVisible,
      }),
    });
  }

  return requestJson(`/api/gallery/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? authHeaders(token) : {}),
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
