const NoticeCategory = require("../Models/noticeCategoryModel");
const Notice = require("../Models/noticeModel");

const getPublicCategories = async (req, res) => {
  try {
    const items = await NoticeCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const items = await NoticeCategory.find()
      .sort({ order: 1, name: 1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { name, color, description, isActive, order } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await NoticeCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const item = await NoticeCategory.create({
      name: name.trim(),
      slug,
      color: color || "#059669",
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const { name, slug: newSlug } = req.body;

    if (name) {
      const slug = (newSlug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const existing = await NoticeCategory.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Category name already exists" });
      }
      req.body.slug = slug;
    }

    const item = await NoticeCategory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const category = await NoticeCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const noticeCount = await Notice.countDocuments({ category: category.slug });
    if (noticeCount > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${noticeCount} notice(s) use this category. Reassign them first.`,
      });
    }

    await NoticeCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
};

module.exports = {
  getPublicCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
