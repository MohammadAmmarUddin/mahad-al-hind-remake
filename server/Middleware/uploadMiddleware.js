const multer = require("multer");

const memoryStorage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
  "audio/mp4",
  "audio/m4a",
]);

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 300 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!file || !file.mimetype) {
      cb(new Error("Invalid file."));
      return;
    }

    const mime = file.mimetype.toLowerCase();

    if (
      allowedMimeTypes.has(mime) ||
      mime.startsWith("image/") ||
      mime.startsWith("video/") ||
      mime.startsWith("audio/")
    ) {
      cb(null, true);
      return;
    }

    cb(new Error("Invalid file."));
  },
});

const sendUploadError = (res, error) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Invalid file. File is too large.",
    });
  }

  if (error?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Invalid file.",
    });
  }

  return res.status(400).json({
    success: false,
    message: error?.message || "Invalid file.",
  });
};

const uploadSingle = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      return sendUploadError(res, error);
    }

    return next();
  });
};

module.exports = {
  uploadSingle,
};
