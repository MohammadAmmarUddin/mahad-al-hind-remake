const BreakingNews = require("../Models/breakingNewsModel");

const getPublicBreakingNews = async (req, res) => {
  try {
    const items = await BreakingNews.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch breaking news", error: error.message });
  }
};

const getAllBreakingNews = async (req, res) => {
  try {
    const items = await BreakingNews.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch breaking news", error: error.message });
  }
};

const createBreakingNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { text, link, isActive, order } = req.body;
    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const item = await BreakingNews.create({
      text,
      link: link || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create breaking news", error: error.message });
  }
};

const updateBreakingNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await BreakingNews.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update breaking news", error: error.message });
  }
};

const deleteBreakingNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await BreakingNews.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete breaking news", error: error.message });
  }
};

module.exports = {
  getPublicBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
};
