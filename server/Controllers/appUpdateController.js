const AppUpdate = require("../Models/appUpdateModel");

// GET /api/app-version — Public: return current config
exports.getAppVersion = async (req, res) => {
  try {
    const config = await AppUpdate.getConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error("Get app version error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/app-update — Admin: return current config
exports.getUpdateConfig = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const config = await AppUpdate.getConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Get update config error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/app-update — Admin: update config
exports.updateConfig = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      latestVersion,
      minVersion,
      forceUpdate,
      apkUrl,
      releaseNotes,
      updateEnabled,
    } = req.body || {};

    if (!latestVersion || latestVersion.trim() === "") {
      return res.status(400).json({ error: "latestVersion is required" });
    }
    if (!apkUrl || apkUrl.trim() === "") {
      return res.status(400).json({ error: "apkUrl is required" });
    }

    const updates = {};
    if (latestVersion !== undefined) updates.latestVersion = latestVersion.trim();
    if (minVersion !== undefined) updates.minVersion = minVersion.trim();
    if (forceUpdate !== undefined) updates.forceUpdate = !!forceUpdate;
    if (apkUrl !== undefined) updates.apkUrl = apkUrl.trim();
    if (releaseNotes !== undefined) updates.releaseNotes = releaseNotes.trim();
    if (updateEnabled !== undefined) updates.updateEnabled = !!updateEnabled;

    const config = await AppUpdate.updateConfig(updates);
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
