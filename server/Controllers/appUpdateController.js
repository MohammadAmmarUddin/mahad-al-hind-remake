const crypto = require("crypto");
const AppUpdate = require("../Models/appUpdateModel");

// Shape sent to the app. Only the fields the update flow needs, so the
// response stays small and can be cached at the edge for a long time.
const toPublicConfig = (config) => ({
  latestVersion: config.latestVersion,
  minVersion: config.minVersion,
  latestVersionCode: config.latestVersionCode,
  minSupportedVersionCode: config.minSupportedVersionCode,
  forceUpdate: config.forceUpdate,
  apkUrl: config.apkUrl,
  apkSha256: config.apkSha256,
  apkSizeBytes: config.apkSizeBytes,
  releaseNotes: config.releaseNotes,
  releaseNotesBn: config.releaseNotesBn,
  releaseNotesEn: config.releaseNotesEn,
  publishedAt: config.publishedAt,
  updateEnabled: config.updateEnabled,
  showUpdateToOutdatedUsers: config.showUpdateToOutdatedUsers,
  updatedAt: config.updatedAt,
});

// The app may send the version it already runs. When nothing changed since
// the last poll we answer 304 so thousands of devices cost one origin read.
const etagFor = (config) =>
  `"${crypto
    .createHash("sha1")
    .update(
      [
        config.latestVersion,
        config.minVersion,
        config.latestVersionCode,
        config.minSupportedVersionCode,
        config.forceUpdate,
        config.apkUrl,
        config.apkSha256,
        config.apkSizeBytes,
        config.releaseNotes,
        config.releaseNotesBn,
        config.releaseNotesEn,
        config.updateEnabled,
        config.showUpdateToOutdatedUsers,
        config.updatedAt,
      ]
        .join("|")
        .toString(),
    )
    .digest("hex")}"`;

// GET /api/app-version — Public: return current config
exports.getAppVersion = async (req, res) => {
  try {
    const config = await AppUpdate.getConfig();

    // The edge caches this for 10 minutes and serves a stale copy for a day,
    // so a release rollout never needs a cache purge.
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600, stale-while-revalidate=86400");
    res.setHeader("ETag", etagFor(config));

    if (req.headers["if-none-match"] === etagFor(config)) {
      return res.status(304).end();
    }

    res.status(200).json(toPublicConfig(config));
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

// PATCH /api/app-update — Admin: full update (version, apkUrl, notes + toggles)
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
      showUpdateToOutdatedUsers,
      showToUpdated,
      latestVersionCode,
      minSupportedVersionCode,
      apkSha256,
      apkSizeBytes,
      releaseNotesBn,
      releaseNotesEn,
      publishedAt,
    } = req.body || {};

    const updates = {};
    if (latestVersion !== undefined) updates.latestVersion = latestVersion.trim();
    if (minVersion !== undefined) updates.minVersion = minVersion.trim();
    if (forceUpdate !== undefined) updates.forceUpdate = !!forceUpdate;
    if (apkUrl !== undefined) updates.apkUrl = apkUrl.trim();
    if (releaseNotes !== undefined) updates.releaseNotes = releaseNotes.trim();
    if (updateEnabled !== undefined) updates.updateEnabled = !!updateEnabled;
    if (showUpdateToOutdatedUsers !== undefined) updates.showUpdateToOutdatedUsers = !!showUpdateToOutdatedUsers;
    // Backward compat: accept old field name
    if (showToUpdated !== undefined && showUpdateToOutdatedUsers === undefined) {
      updates.showUpdateToOutdatedUsers = !!showToUpdated;
    }
    if (releaseNotesBn !== undefined) updates.releaseNotesBn = releaseNotesBn.trim();
    if (releaseNotesEn !== undefined) updates.releaseNotesEn = releaseNotesEn.trim();

    if (latestVersionCode !== undefined) {
      const value = Number(latestVersionCode);
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({ error: "latestVersionCode must be a positive integer" });
      }
      updates.latestVersionCode = value;
    }

    if (minSupportedVersionCode !== undefined) {
      const value = Number(minSupportedVersionCode);
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({ error: "minSupportedVersionCode must be a positive integer" });
      }
      updates.minSupportedVersionCode = value;
    }

    if (apkSizeBytes !== undefined) {
      const value = Number(apkSizeBytes);
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({ error: "apkSizeBytes must be a positive integer" });
      }
      updates.apkSizeBytes = value;
    }

    if (apkSha256 !== undefined) {
      const value = String(apkSha256).trim().toLowerCase();
      if (value && !/^[0-9a-f]{64}$/.test(value)) {
        return res.status(400).json({ error: "apkSha256 must be a 64 character hex SHA-256 digest" });
      }
      updates.apkSha256 = value;
    }

    if (publishedAt !== undefined) {
      const date = new Date(publishedAt);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: "publishedAt must be a valid date" });
      }
      updates.publishedAt = date;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const config = await AppUpdate.updateConfig(updates);
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
