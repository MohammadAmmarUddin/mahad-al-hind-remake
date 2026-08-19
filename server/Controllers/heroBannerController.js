const HeroBanner = require("../Models/heroBannerModel");
const { destroyCloudinaryAsset } = require("../Services/cloudinaryService");

const getPublicHeroBanners = async (req, res) => {
  try {
    const items = await HeroBanner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hero banners", error: error.message });
  }
};

const getAllHeroBanners = async (req, res) => {
  try {
    const items = await HeroBanner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hero banners", error: error.message });
  }
};

const createHeroBanner = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { imageUrl, publicId, alt, link, isActive, order } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl is required" });
    }

    const item = await HeroBanner.create({
      imageUrl,
      publicId: publicId || "",
      alt: alt || "",
      link: link || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create hero banner", error: error.message });
  }
};

const updateHeroBanner = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await HeroBanner.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update hero banner", error: error.message });
  }
};

const deleteHeroBanner = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await HeroBanner.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Banner not found" });
    }

    if (item.publicId) {
      try {
        await destroyCloudinaryAsset(item.publicId, "image");
      } catch {}
    }

    await HeroBanner.findByIdAndDelete(id);
    res.status(200).json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete hero banner", error: error.message });
  }
};

module.exports = {
  getPublicHeroBanners,
  getAllHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
};
