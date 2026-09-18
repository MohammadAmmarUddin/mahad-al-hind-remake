const Faq = require("../Models/faqModel");

const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Faq.findById(id).lean();
    if (!item) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQ", error: error.message });
  }
};

const getPublicFaqs = async (req, res) => {
  try {
    const { category = "" } = req.query;

    const filter = { isVisible: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    const items = await Faq.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const categories = await Faq.distinct("category", { isVisible: true });

    res.status(200).json({
      faqs: items,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error: error.message });
  }
};

const getAllFaqs = async (req, res) => {
  try {
    const { category = "", search = "" } = req.query;

    const filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Faq.find(filter)
      .sort({ category: 1, order: 1, createdAt: 1 })
      .lean();

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error: error.message });
  }
};

const createFaq = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { question, answer, category, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }

    const item = new Faq({
      question,
      answer,
      category: category || "general",
      order: order || 0,
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create FAQ", error: error.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await Faq.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update FAQ", error: error.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const item = await Faq.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete FAQ", error: error.message });
  }
};

module.exports = {
  getFaqById,
  getPublicFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};
