const SiteSettings = require("../Models/siteSettingsModel");

const defaultHomeSections = {
  hero: true,
  breakingNews: true,
  statsBanner: true,
  videos: true,
  studentGallery: true,
  pagriGallery: true,
};

const getSettingsDocument = async () => {
  let settings = await SiteSettings.findOne({ key: "home-page" });

  if (!settings) {
    settings = await SiteSettings.create({
      key: "home-page",
      homeSections: defaultHomeSections,
    });
  }

  return settings;
};

const getHomePageSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load site settings",
      error: error.message,
    });
  }
};

const updateHomePageSettings = async (req, res) => {
  try {
    const incomingSections = req.body?.homeSections || {};

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "home-page" },
      {
        $set: {
          homeSections: {
            ...defaultHomeSections,
            ...incomingSections,
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Homepage settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update site settings",
      error: error.message,
    });
  }
};

module.exports = {
  getHomePageSettings,
  updateHomePageSettings,
};
