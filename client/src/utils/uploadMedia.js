import axios from "axios";
import { API } from "../config/api";

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const DEFAULT_ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
];

export const DEFAULT_ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

export const DEFAULT_MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

export const validateFile = (file, { allowedTypes = [], maxSize = DEFAULT_MAX_UPLOAD_SIZE } = {}) => {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
  }

  if (maxSize && file.size > maxSize) {
    throw new Error(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
  }
};

const appendFilesToFormData = (formData, files) => {
  files.forEach((file) => {
    formData.append("file", file);
  });
};

export const uploadFilesToBackend = async ({
  files = [],
  folder = "admin/general",
  resourceType = "image",
  onProgress,
}) => {
  const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [files].filter(Boolean);

  if (normalizedFiles.length === 0) {
    throw new Error("No files selected.");
  }

  const uploads = [];
  for (let index = 0; index < normalizedFiles.length; index += 1) {
    const file = normalizedFiles[index];
    const formData = new FormData();
    appendFilesToFormData(formData, [file]);
    formData.append("folder", folder);
    formData.append("resourceType", resourceType);

    try {
      const response = await axios.post(`${API}/api/media/upload`, formData, {
        timeout: 8000,
        onUploadProgress: (event) => {
          if (typeof onProgress === "function" && event.total) {
            const current = Math.round((event.loaded * 100) / event.total);
            const overall = Math.round(((index + current / 100) / normalizedFiles.length) * 100);
            onProgress(overall);
          }
        },
      });

      const data = response.data || {};
      uploads.push(
        data.data ||
          data || {
            url: data.url || data.secureUrl || data.secure_url || "",
            secureUrl: data.secureUrl || data.secure_url || data.url || "",
            publicId: data.publicId || data.public_id || "",
            public_id: data.public_id || data.publicId || "",
            image: data.url || data.secureUrl || data.secure_url || "",
          },
      );
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error.message;
      throw new Error(message || "Upload failure");
    }
  }

  return normalizedFiles.length === 1 ? uploads[0] : uploads;
};

export const uploadFileToBackend = async (options = {}) =>
  uploadFilesToBackend({
    ...options,
    files: Array.isArray(options.files) ? options.files : options.file,
  });
