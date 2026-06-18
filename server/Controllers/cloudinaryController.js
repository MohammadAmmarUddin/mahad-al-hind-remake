const { destroyCloudinaryAsset } = require("../Utils/cloudinary");

const destroyAsset = async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, message: "publicId is required" });
    }
    await destroyCloudinaryAsset(publicId, resourceType || "image");
    res.status(200).json({ success: true, message: "Asset destroyed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { destroyAsset };
