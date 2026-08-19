const StudentVideoReview = require("../Models/studentVideoReviewModel");

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;

const extractVideoId = (url) => {
  const match = url?.match(YOUTUBE_REGEX);
  return match?.[1] || null;
};

const getPublicReviews = async (req, res) => {
  try {
    const items = await StudentVideoReview.find({ status: "published" })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const items = await StudentVideoReview.find()
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const { studentName, youtubeUrl, caption, program, isFeatured, status, order } = req.body;
    if (!studentName || !youtubeUrl) {
      return res.status(400).json({ message: "studentName and youtubeUrl are required" });
    }
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const item = await StudentVideoReview.create({
      studentName,
      youtubeUrl,
      videoId,
      caption: caption || "",
      program: program || "",
      thumbnailUrl,
      isFeatured: isFeatured || false,
      status: status || "published",
      order: order || 0,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.youtubeUrl) {
      const videoId = extractVideoId(updateData.youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
      updateData.videoId = videoId;
      updateData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    const item = await StudentVideoReview.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const { id } = req.params;
    const item = await StudentVideoReview.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

module.exports = { getPublicReviews, getAllReviews, createReview, updateReview, deleteReview };
