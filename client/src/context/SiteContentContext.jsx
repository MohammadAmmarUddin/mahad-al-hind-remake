import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../config/api";

const SiteContentContext = createContext(null);

const fallbackContent = {
  theme: "current-default",
  navbar: {
    home: { en: "Home", bn: "Home" },
    dashboard: { en: "Dashboard", bn: "Dashboard" },
    courses: { en: "Courses", bn: "Courses" },
    certificateChecker: { en: "Certificate Checker", bn: "Certificate Checker" },
    admissionHelp: { en: "Admission Help", bn: "Admission Help" },
    notice: { en: "Notice", bn: "Notice" },
    login: { en: "Login", bn: "Login" },
    signup: { en: "Signup", bn: "Signup" },
    profile: { en: "Profile", bn: "Profile" },
    settings: { en: "Settings", bn: "Settings" },
    logout: { en: "Logout", bn: "Logout" },
    language: { en: "Language", bn: "Language" },
    english: { en: "English", bn: "English" },
    bengali: { en: "Bengali", bn: "Bengali" },
  },
  home: {
    heroTitle: { en: "Ma'hadul Qira'at Al Hind", bn: "Ma'hadul Qira'at Al Hind" },
    heroSubtitle: { en: "Qira'at Academy in the World", bn: "Qira'at Academy in the World" },
    heroDescription: {
      en: "Welcome to Ma'hadul Qira'at Al Hind.",
      bn: "Welcome to Ma'hadul Qira'at Al Hind.",
    },
    heroCta: { en: "Get Started", bn: "Get Started" },
  },
  breakingNews: {
    label: { en: "Breaking News", bn: "Breaking News" },
    message: { en: "Admissions are open.", bn: "Admissions are open." },
  },
  videoSection: {
    badge: { en: "Video Gallery", bn: "Video Gallery" },
    loading: { en: "Loading videos...", bn: "Loading videos..." },
    emptyTitle: { en: "No videos found", bn: "No videos found" },
    emptySubtitle: {
      en: "Please add videos from the admin dashboard.",
      bn: "Please add videos from the admin dashboard.",
    },
    clickToWatch: { en: "Click to watch", bn: "Click to watch" },
  },
  gallerySection: {
    studentTitle: { en: "Our Students Gallery", bn: "Our Students Gallery" },
    justMemoriesTitle: { en: "Just Memories", bn: "Just Memories" },
  },
  noticeBoard: {
    badge: { en: "Notice Board", bn: "Notice Board" },
    title: { en: "Academic Notices & Announcements", bn: "একাডেমিক নোটিশ ও ঘোষণা" },
    subtitle: {
      en: "Stay updated with the latest notices, exam schedules, admission info, and important announcements.",
      bn: "সর্বশেষ নোটিশ, পরীক্ষার সময়সূচী, ভর্তি তথ্য এবং গুরুত্বপূর্ণ ঘোষণা সম্পর্কে আপডেট থাকুন।",
    },
    searchPlaceholder: { en: "Search notices...", bn: "নোটিশ খুঁজুন..." },
    search: { en: "Search", bn: "খুঁজুন" },
    all: { en: "All", bn: "সব" },
    noNotices: { en: "No notices found", bn: "কোনো নোটিশ পাওয়া যায়নি" },
    noNoticesSub: {
      en: "No notices have been posted yet. Check back soon!",
      bn: "এখনো কোনো নোটিশ পোস্ট করা হয়নি। শীঘ্রই আবার দেখুন!",
    },
    noResults: {
      en: "Try adjusting your search or filter criteria.",
      bn: "আপনার অনুসন্ধান বা ফিল্টার মানদণ্ড সামঞ্জস্য করার চেষ্টা করুন।",
    },
    clearFilters: { en: "Clear all filters", bn: "সব ফিল্টার ম�ছুন" },
    postedBy: { en: "Posted by", bn: "পোস্ট করেছেন" },
    downloadNotice: { en: "Download Notice", bn: "নোটিশ ডাউনলোড করুন" },
    loading: { en: "Loading notices...", bn: "নোটিশ লোড হচ্ছে..." },
    error: { en: "Failed to load notices. Please try again later.", bn: "নোটিশ লোড করতে ব্যর্থ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।" },
  },
  enrollmentWidget: {
    isVisible: true,
    title: { en: "Enrollment Open", bn: "Enrollment Open" },
    startLabel: { en: "Enrollment starts", bn: "Enrollment starts" },
    endLabel: { en: "Enrollment ends", bn: "Enrollment ends" },
    reopenLabel: { en: "Enrollment Info", bn: "Enrollment Info" },
    startDate: "1 February, 2026",
    endDate: "10 Ramadan, 2026",
  },
};

export const SiteContentProvider = ({ children }) => {
  const [content, setContent] = useState(fallbackContent);
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("site-language") || "en",
  );

  useEffect(() => {
    fetch(`${API}/api/site-content/public`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setContent((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (nextLanguage) => {
    if (!["en", "bn"].includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);
    localStorage.setItem("site-language", nextLanguage);
  };

  const updateContent = useCallback((updates) => {
    setContent((prev) => ({ ...prev, ...updates }));
  }, []);

  const translate = (group, key) => {
    const entry = content?.[group]?.[key];

    if (!entry) {
      return "";
    }

    return entry[language] || entry.en || "";
  };

  const value = useMemo(
    () => ({
      content,
      language,
      setLanguage,
      translate,
      updateContent,
      theme: content?.theme || "current-default",
    }),
    [content, language, updateContent],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);

  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }

  return context;
};
