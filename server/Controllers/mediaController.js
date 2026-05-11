const Media = require("../Models/mediaModel");
const {
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} = require("../Services/cloudinaryService");

const getResourceType = (file = {}, body = {}) => {
  const declared = String(body.resourceType || "").toLowerCase();

  if (declared === "video" || declared === "raw") {
    return declared;
  }

  if (file.mimetype?.startsWith("video/")) {
    return "video";
  }

  if (file.mimetype?.startsWith("application/pdf")) {
    return "raw";
  }

  return "image";
};

const getMediaType = (resourceType, file = {}) => {
  if (resourceType === "video" || file.mimetype?.startsWith("video/")) {
    return "video";
  }

  if (resourceType === "image" || file.mimetype?.startsWith("image/")) {
    return "image";
  }

  return null;
};

const normalizeMedia = (media = {}) => ({
  _id: media._id,
  url: media.url || media.secureUrl || "",
  secureUrl: media.secureUrl || media.url || "",
  image: media.image || media.url || media.secureUrl || "",
  public_id: media.public_id || media.publicId || "",
  publicId: media.publicId || media.public_id || "",
  type: media.type || "image",
  title: media.title || "",
  description: media.description || "",
  isPublic: Boolean(media.isPublic),
  createdAt: media.createdAt,
  updatedAt: media.updatedAt,
  stored: media.stored ?? true,
});

const uploadMedia = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ message: "Cloudinary is not configured" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const resourceType = getResourceType(req.file, req.body);
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
      folder: req.body?.folder || "media",
      resourceType,
      originalName: req.file.originalname || "",
      mimeType: req.file.mimetype || "",
    });

    const mediaType = getMediaType(resourceType, req.file);

    if (mediaType === "image" || mediaType === "video") {
      const media = await Media.create({
        url: uploaded.secureUrl,
        public_id: uploaded.publicId,
        type: mediaType,
        title: req.body?.title || "",
        description: req.body?.description || "",
        isPublic: req.body?.isPublic !== "false" && req.body?.isPublic !== false,
      });

      return res.json(normalizeMedia(media.toObject()));
    }

    return res.json({
      url: uploaded.secureUrl,
      secureUrl: uploaded.secureUrl,
      image: uploaded.secureUrl,
      public_id: uploaded.publicId,
      publicId: uploaded.publicId,
      type: "file",
      title: req.body?.title || "",
      description: req.body?.description || "",
      isPublic: true,
      stored: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};

const getPublicMedia = async (req, res) => {
  try {
    const media = await Media.find({ isPublic: true }).sort({ createdAt: -1 }).lean();
    return res.json(media.map(normalizeMedia));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load public media",
      error: error.message,
    });
  }
};

const getAdminMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    return res.json(media.map(normalizeMedia));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load media",
      error: error.message,
    });
  }
};

const updateMedia = async (req, res) => {
  try {
    const updated = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Media not found" });
    }

    return res.json(normalizeMedia(updated));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update media",
      error: error.message,
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).lean();

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    await destroyCloudinaryAsset(media.public_id, media.type || "image");
    await Media.findByIdAndDelete(req.params.id);

    return res.json({ message: "Media deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete media",
      error: error.message,
    });
  }
};

module.exports = {
  deleteMedia,
  getAdminMedia,
  getPublicMedia,
  updateMedia,
  uploadMedia,
};
