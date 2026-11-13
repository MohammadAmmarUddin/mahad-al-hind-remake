const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.cloudinary_cloud_name ||
  (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split("@")[0]?.split("://")[1]?.split(":")[0] : undefined);
const apiKey =
  process.env.CLOUDINARY_API_KEY ||
  process.env.cloudinary_api_key ||
  (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split("@")[1]?.split(":")[0] : undefined);
const apiSecret =
  process.env.CLOUDINARY_API_SECRET ||
  process.env.cloudinary_api_secret ||
  (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split(":").slice(2).join(":") : undefined);
const defaultFolder = process.env.cloudinary_upload_folder || "mahad-al-hind";

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

const isCloudinaryConfigured = () => Boolean(cloudName && apiKey && apiSecret);

// Cloudinary only accepts image | video | raw as resource_type.
// Audio files are stored under Cloudinary's "video" resource type.
const toCloudinaryResourceType = (resourceType = "image") => {
  const value = String(resourceType || "").toLowerCase();
  if (value === "audio") return "video";
  if (value === "video" || value === "raw" || value === "image") return value;
  return "image";
};

const normalizeFolder = (folder = defaultFolder) => {
  const value = String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  const safe = value.replace(/[^a-zA-Z0-9/_-]/g, "");
  return safe || defaultFolder;
};

const normalizeUploadInput = (input, metadata = {}) => {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();

    if (!trimmed) {
      return null;
    }

    if (/^data:[^;]+;base64,/i.test(trimmed)) {
      return trimmed;
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
      const mimeType = metadata.mimeType || "image/jpeg";
      return `data:${mimeType};base64,${trimmed}`;
    }

    return trimmed;
  }

  if (Buffer.isBuffer(input)) {
    const mimeType = metadata.mimeType || "image/jpeg";
    return `data:${mimeType};base64,${input.toString("base64")}`;
  }

  if (typeof input === "object") {
    if (typeof input.dataUrl === "string") {
      return normalizeUploadInput(input.dataUrl, metadata);
    }

    if (typeof input.image === "string") {
      return normalizeUploadInput(input.image, metadata);
    }

    if (typeof input.url === "string") {
      return normalizeUploadInput(input.url, metadata);
    }

    if (typeof input.file === "string") {
      return normalizeUploadInput(input.file, metadata);
    }

    if (typeof input.base64 === "string") {
      const mimeType = input.mimeType || metadata.mimeType || "image/jpeg";
      return input.base64.startsWith("data:")
        ? input.base64
        : `data:${mimeType};base64,${input.base64}`;
    }

    if (input.buffer && Buffer.isBuffer(input.buffer)) {
      const mimeType = input.mimeType || metadata.mimeType || "image/jpeg";
      return `data:${mimeType};base64,${input.buffer.toString("base64")}`;
    }
  }

  return null;
};

const buildOptimizedUrl = (publicId, resourceType = "image") =>
  cloudinary.url(publicId, {
    secure: true,
    fetch_format: resourceType === "image" ? "auto" : undefined,
    quality: resourceType === "image" ? "auto" : undefined,
    resource_type: resourceType,
  });

const uploadToCloudinary = async (input, metadata = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const file = normalizeUploadInput(input, metadata);

  if (!file) {
    throw new Error("No upload source was provided.");
  }

  const resourceType = toCloudinaryResourceType(metadata.resourceType || "image");
  const folder = normalizeFolder(metadata.folder);

  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: resourceType,
    overwrite: false,
    unique_filename: true,
    use_filename: false,
    format: metadata.format,
  });

  return {
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    assetId: result.asset_id,
    folder: result.folder || folder,
    resourceType: result.resource_type || resourceType,
    format: result.format || "",
    bytes: result.bytes || 0,
    width: result.width || 0,
    height: result.height || 0,
    originalName: metadata.originalName || result.original_filename || "",
    mimeType: metadata.mimeType || "",
    source: "cloudinary",
    optimizedUrl: resourceType === "image" ? buildOptimizedUrl(result.public_id, resourceType) : result.secure_url,
  };
};

const uploadBufferToCloudinary = (buffer, metadata = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(new Error("Cloudinary is not configured."));
      return;
    }

    if (!buffer || !Buffer.isBuffer(buffer)) {
      reject(new Error("Invalid file buffer."));
      return;
    }

    const resourceType = toCloudinaryResourceType(metadata.resourceType || "image");
    const folder = normalizeFolder(metadata.folder);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: true,
        use_filename: false,
        format: metadata.format,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          assetId: result.asset_id,
          folder: result.folder || folder,
          resourceType: result.resource_type || resourceType,
          format: result.format || "",
          bytes: result.bytes || 0,
          width: result.width || 0,
          height: result.height || 0,
          originalName: metadata.originalName || result.original_filename || "",
          mimeType: metadata.mimeType || "",
          source: "cloudinary",
          optimizedUrl:
            resourceType === "image"
              ? buildOptimizedUrl(result.public_id, resourceType)
              : result.secure_url,
        });
      },
    );

    Readable.from(buffer).pipe(stream);
  });

const parseCloudinaryUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return { publicId: "", resourceType: "image" };

  if (!/^https?:\/\//i.test(raw)) {
    return { publicId: raw, resourceType: "image" };
  }

  try {
    const url = new URL(raw);
    const segments = url.pathname.split("/").filter(Boolean);
    const typeIndex = segments.indexOf("upload");
    if (typeIndex === -1) return { publicId: "", resourceType: "image" };

    let resourceType = "image";
    let start = typeIndex + 1;
    if (segments[start] && !segments[start].includes(".")) {
      resourceType = segments[start];
      start += 1;
    }
    if (segments[start] && /^\d+$/.test(segments[start])) {
      start += 1;
    }

    const publicId = segments.slice(start).join("/").replace(/\.[^.]+$/, "");
    return { publicId, resourceType };
  } catch {
    return { publicId: "", resourceType: "image" };
  }
};

const destroyCloudinaryAsset = async (publicIdOrUrl, resourceType = "image") => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  if (!publicIdOrUrl) {
    throw new Error("publicId is required.");
  }

  const parsed = parseCloudinaryUrl(publicIdOrUrl);
  const publicId = parsed.publicId;
  const resolvedType = toCloudinaryResourceType(
    resourceType === "video" || resourceType === "raw" || resourceType === "audio"
      ? resourceType
      : parsed.resourceType,
  );

  if (!publicId) {
    throw new Error("Could not extract publicId from value.");
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resolvedType,
  });
};

module.exports = {
  cloudinary,
  buildOptimizedUrl,
  destroyCloudinaryAsset,
  defaultFolder,
  isCloudinaryConfigured,
  normalizeFolder,
  normalizeUploadInput,
  toCloudinaryResourceType,
  uploadToCloudinary,
  uploadBufferToCloudinary,
};
