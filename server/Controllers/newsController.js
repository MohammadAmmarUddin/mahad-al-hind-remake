const News = require("../Models/newsModel");

const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id).lean();
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
};

const getPublicNews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      category = "",
      search = "",
      date = "",
    } = req.query;

    const filter = { isVisible: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      News.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      News.countDocuments(filter),
    ]);

    res.status(200).json({
      notices: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
};

const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 20, category = "", search = "" } = req.query;

    const filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      News.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      News.countDocuments(filter),
    ]);

    res.status(200).json({
      notices: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
};

const createNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { title, excerpt, content, category, isPinned, attachmentUrl, attachmentName, postedBy } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "title, excerpt, and content are required" });
    }

    const item = new News({
      title,
      excerpt,
      content,
      category: category || "general",
      isPinned: isPinned || false,
      attachmentUrl: attachmentUrl || "",
      attachmentName: attachmentName || "",
      postedBy: postedBy || "Administration",
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create news", error: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await News.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update news", error: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await News.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json({ message: "News deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete news", error: error.message });
  }
};

module.exports = {
  getNewsById,
  getPublicNews,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
};
