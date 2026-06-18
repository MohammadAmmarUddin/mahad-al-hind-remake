const AudioCategory = require("../Models/audioCategoryModel");
const Audio = require("../Models/audioModel");
const { destroyCloudinaryAsset } = require("../Utils/cloudinary");

// ─── CATEGORIES ────────────────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (parentId === "null" || parentId === "root") filter.parentId = null;
    else if (parentId) filter.parentId = parentId;

    const categories = await AudioCategory.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    // Attach audio count to each category
    const catsWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Audio.countDocuments({ categoryId: cat._id, isVisible: true });
        const subCount = await AudioCategory.countDocuments({ parentId: cat._id });
        return { ...cat, audioCount: count, subCategoryCount: subCount };
      })
    );

    res.status(200).json({ success: true, data: catsWithCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await AudioCategory.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ error: "Category not found" });

    const audioCount = await Audio.countDocuments({ categoryId: category._id, isVisible: true });
    const children = await AudioCategory.find({ parentId: category._id }).sort({ order: 1 }).lean();

    res.status(200).json({ success: true, data: { ...category, audioCount, children } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, description, image, parentId, order } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }
    const category = await AudioCategory.create({
      name: name.trim(),
      type,
      description: description || "",
      image: image || "",
      parentId: parentId || null,
      order: order || 0,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await AudioCategory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await AudioCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Check for child categories
    const childCount = await AudioCategory.countDocuments({ parentId: category._id });
    if (childCount > 0) {
      return res.status(400).json({ error: "Cannot delete category with subcategories. Delete children first." });
    }

    // Check for audio in this category
    const audioCount = await Audio.countDocuments({ categoryId: category._id });
    if (audioCount > 0) {
      return res.status(400).json({ error: `Cannot delete category with ${audioCount} audio files. Remove them first.` });
    }

    // Delete image from Cloudinary if present
    if (category.image) {
      destroyCloudinaryAsset(category.image, "image").catch(() => {});
    }

    await AudioCategory.findByIdAndDelete(category._id);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── AUDIO ─────────────────────────────────────────────────

exports.getAudios = async (req, res) => {
  try {
    const { categoryId, search, reciter, sort = "order", limit = 50, skip = 0 } = req.query;
    const filter = { isVisible: true };

    if (categoryId) filter.categoryId = categoryId;
    if (reciter) filter.reciter = { $regex: reciter, $options: "i" };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { reciter: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = sort === "newest" ? { createdAt: -1 } : sort === "popular" ? { playCount: -1 } : { order: 1, createdAt: -1 };

    const [audios, total] = await Promise.all([
      Audio.find(filter).sort(sortObj).skip(Number(skip)).limit(Number(limit)).lean(),
      Audio.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, data: audios, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAudioById = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id).lean();
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    res.status(200).json({ success: true, data: audio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAudio = async (req, res) => {
  try {
    const { title, description, audioUrl, thumbnail, categoryId, duration, reciter, order } = req.body;
    if (!title || !audioUrl || !categoryId) {
      return res.status(400).json({ error: "title, audioUrl, and categoryId are required" });
    }
    const audio = await Audio.create({
      title: title.trim(),
      description: description || "",
      audioUrl,
      thumbnail: thumbnail || "",
      categoryId,
      duration: duration || 0,
      reciter: reciter || "",
      order: order || 0,
    });
    res.status(201).json({ success: true, data: audio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAudio = async (req, res) => {
  try {
    const audio = await Audio.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    res.status(200).json({ success: true, data: audio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAudio = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ error: "Audio not found" });

    // Clean up Cloudinary assets
    if (audio.audioUrl) {
      destroyCloudinaryAsset(audio.audioUrl, "video").catch(() => {});
    }
    if (audio.thumbnail) {
      destroyCloudinaryAsset(audio.thumbnail, "image").catch(() => {});
    }

    await Audio.findByIdAndDelete(audio._id);
    res.status(200).json({ success: true, message: "Audio deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.incrementPlayCount = async (req, res) => {
  try {
    await Audio.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── BULK / SEED ───────────────────────────────────────────

exports.bulkReorder = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) return res.status(400).json({ error: "items array required" });

    await Promise.all(
      items.map((item) =>
        Audio.findByIdAndUpdate(item.id, { order: item.order })
      )
    );
    res.status(200).json({ success: true, message: "Reordered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
