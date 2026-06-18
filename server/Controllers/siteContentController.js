const SiteContent = require("../Models/siteContentModel");

const defaultContent = {
  key: "public-site",
  theme: "current-default",
  navbar: {
    home: { en: "Home", bn: "হোম" },
    dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    courses: { en: "Courses", bn: "কোর্সসমূহ" },
    certificateChecker: {
      en: "Certificate Checker",
      bn: "সার্টিফিকেট যাচাই",
    },
    admissionHelp: { en: "Admission Help", bn: "ভর্তি সহায়তা" },
    login: { en: "Login", bn: "লগইন" },
    signup: { en: "Signup", bn: "সাইন আপ" },
    profile: { en: "Profile", bn: "প্রোফাইল" },
    settings: { en: "Settings", bn: "সেটিংস" },
    logout: { en: "Logout", bn: "লগআউট" },
    language: { en: "Language", bn: "ভাষা" },
    english: { en: "English", bn: "ইংরেজি" },
    bengali: { en: "Bengali", bn: "বাংলা" },
  },
  home: {
    heroTitle: {
      en: "Ma’hadul Qira’at Al Hind",
      bn: "মা'হাদুল কিরা'আত আল হিন্দ",
    },
    heroSubtitle: {
      en: "Qira'at Academy In the World",
      bn: "বিশ্বমানের কিরা'আত একাডেমি",
    },
    heroDescription: {
      en: "Welcome to Ma’hadul Qira’at Al Hind. Established in 2022, the institute has quickly emerged as a distinguished center for Quranic education and advanced Qira'at studies.",
      bn: "মা'হাদুল কিরা'আত আল হিন্দে স্বাগতম। ২০২২ সালে প্রতিষ্ঠার পর থেকে প্রতিষ্ঠানটি কুরআনিক শিক্ষা ও উচ্চতর কিরা'আত অধ্যয়নের একটি স্বনামধন্য কেন্দ্র হিসেবে দ্রুত পরিচিতি লাভ করেছে।",
    },
    heroCta: { en: "Get Started", bn: "শুরু করুন" },
    loading: { en: "Loading homepage...", bn: "হোমপেজ লোড হচ্ছে..." },
  },
  breakingNews: {
    label: { en: "Breaking News", bn: "জরুরি ঘোষণা" },
    message: {
      en: "Admissions are open for online and offline programs at Ma'hadul Qira'at Al Hind. Contact: +919365262648 | +8801883128299",
      bn: "মা'হাদুল কিরা'আত আল হিন্দে অনলাইন ও অফলাইন প্রোগ্রামে ভর্তি চলছে। যোগাযোগ: +919365262648 | +8801883128299",
    },
  },
  videoSection: {
    badge: { en: "Video Gallery", bn: "ভিডিও গ্যালারি" },
    loading: { en: "Loading videos...", bn: "ভিডিও লোড হচ্ছে..." },
    error: {
      en: "There was a problem loading videos.",
      bn: "ভিডিও লোড করতে সমস্যা হয়েছে।",
    },
    emptyTitle: { en: "No videos found", bn: "কোনো ভিডিও পাওয়া যায়নি" },
    emptySubtitle: {
      en: "Please add videos from the admin dashboard.",
      bn: "অ্যাডমিন ড্যাশবোর্ড থেকে ভিডিও যোগ করুন।",
    },
    clickToWatch: { en: "Click to watch", bn: "ক্লিক করে দেখুন" },
  },
  gallerySection: {
    studentTitle: { en: "Our Students Gallery", bn: "আমাদের শিক্ষার্থীদের গ্যালারি" },
    fareginTitle: { en: "Gallery", bn: "গ্যালারি" },
  },
  enrollmentWidget: {
    isVisible: true,
    title: { en: "Enrollment Open", bn: "ভর্তি চলছে" },
    startLabel: { en: "Enrollment starts", bn: "এনরোলমেন্ট শুরু" },
    endLabel: { en: "Enrollment ends", bn: "এনরোলমেন্ট শেষ" },
    reopenLabel: { en: "Enrollment Info", bn: "ভর্তির তথ্য" },
    startDate: "1 February, 2026",
    endDate: "10 Ramadan, 2026",
  },
  heroBanners: [],
  heroBannerSettings: {
    slideshow: false,
    imagesOnly: false,
  },
};

const getContentDocument = async () => {
  let content = await SiteContent.findOne({ key: "public-site" });

  if (!content) {
    content = await SiteContent.create(defaultContent);
  }

  return content;
};

const getPublicSiteContent = async (req, res) => {
  try {
    const content = await getContentDocument();

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load site content",
      error: error.message,
    });
  }
};

const updatePublicSiteContent = async (req, res) => {
  try {
    const updates = req.body || {};

    const content = await SiteContent.findOneAndUpdate(
      { key: "public-site" },
      { $set: updates },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Site content updated successfully",
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update site content",
      error: error.message,
    });
  }
};

module.exports = {
  getPublicSiteContent,
  updatePublicSiteContent,
};
