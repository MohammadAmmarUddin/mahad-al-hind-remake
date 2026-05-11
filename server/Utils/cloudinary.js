const {
  cloudinary,
  buildOptimizedUrl,
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  normalizeFolder,
  normalizeUploadInput,
  uploadBufferToCloudinary,
  uploadToCloudinary,
} = require("../Services/cloudinaryService");

const uploadImageToCloudinary = async (input, metadata = {}) =>
  uploadToCloudinary(input, {
    ...metadata,
    resourceType: metadata.resourceType || "image",
  });

const destroyCloudinaryImage = async (publicId) =>
  destroyCloudinaryAsset(publicId, "image");

module.exports = {
  cloudinary,
  buildOptimizedUrl,
  destroyCloudinaryImage,
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  normalizeFolder,
  normalizeUploadInput,
  uploadBufferToCloudinary,
  uploadImageToCloudinary,
  uploadToCloudinary,
};
