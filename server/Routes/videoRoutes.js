const express = require("express");
const router = express.Router();
const Video = require("../Models/videoModel");

// GET all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch videos", error: error.message });
  }
});

// POST add new video
router.post("/", async (req, res) => {
  try {
    const { title, tag, desc, embedUrl } = req.body;
    if (!title || !embedUrl) {
      return res
        .status(400)
        .json({ message: "Title and embedUrl are required" });
    }
    const video = new Video({ title, tag, desc, embedUrl });
    const saved = await video.save();
    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save video", error: error.message });
  }
});

// DELETE video by id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Video.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Video not found" });
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete video", error: error.message });
  }
});

module.exports = router;
