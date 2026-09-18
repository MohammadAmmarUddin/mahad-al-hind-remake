const Career = require("../Models/careerModel");

const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Career.findById(id).lean();
    if (!item) {
      return res.status(404).json({ message: "Career not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch career", error: error.message });
  }
};

const getPublicCareers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", department = "" } = req.query;

    const filter = { isVisible: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "all") {
      filter.department = department;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Career.find(filter)
        .sort({ deadline: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Career.countDocuments(filter),
    ]);

    res.status(200).json({
      careers: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch careers", error: error.message });
  }
};

const getAllCareers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", department = "" } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }
    if (department && department !== "all") {
      filter.department = department;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Career.find(filter)
        .sort({ deadline: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Career.countDocuments(filter),
    ]);

    res.status(200).json({
      careers: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch careers", error: error.message });
  }
};

const createCareer = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { title, department, deadline, description, location, employmentType, salary, attachmentUrl, attachmentName } = req.body;
    if (!title || !deadline || !description) {
      return res.status(400).json({ message: "title, deadline, and description are required" });
    }

    const item = new Career({
      title,
      department: department || "",
      deadline,
      description,
      location: location || "",
      employmentType: employmentType || "full-time",
      salary: salary || "",
      attachmentUrl: attachmentUrl || "",
      attachmentName: attachmentName || "",
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create career", error: error.message });
  }
};

const updateCareer = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await Career.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Career not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update career", error: error.message });
  }
};

const deleteCareer = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await Career.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Career not found" });
    }
    res.status(200).json({ message: "Career deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete career", error: error.message });
  }
};

module.exports = {
  getCareerById,
  getPublicCareers,
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
};
