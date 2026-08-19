const Notice = require("../Models/noticeModel");

const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id).lean();
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notice", error: error.message });
  }
};

const getPublicNotices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      category = "",
      search = "",
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

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    res.status(200).json({
      notices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notices", error: error.message });
  }
};

const getAllNotices = async (req, res) => {
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

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    res.status(200).json({
      notices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notices", error: error.message });
  }
};

const createNotice = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { title, excerpt, content, category, isPinned, attachmentUrl, attachmentName, postedBy } = req.body;
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: "title, excerpt, and content are required" });
    }

    const notice = new Notice({
      title,
      excerpt,
      content,
      category: category || "general",
      isPinned: isPinned || false,
      attachmentUrl: attachmentUrl || "",
      attachmentName: attachmentName || "",
      postedBy: postedBy || "Administration",
    });

    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notice", error: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const notice = await Notice.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notice", error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.status(200).json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notice", error: error.message });
  }
};

module.exports = {
  getNoticeById,
  getPublicNotices,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
};
