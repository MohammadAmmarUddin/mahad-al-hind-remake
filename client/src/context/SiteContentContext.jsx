import { createContext, useContext, useMemo, useState } from "react";

const SiteContentContext = createContext(null);

const fallbackContent = {
  theme: "current-default",
  navbar: {
    home: { en: "Home", bn: "Home" },
    dashboard: { en: "Dashboard", bn: "Dashboard" },
    courses: { en: "Courses", bn: "Courses" },
    certificateChecker: { en: "Certificate Checker", bn: "Certificate Checker" },
    admissionHelp: { en: "Admission Help", bn: "Admission Help" },
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
    fareginTitle: { en: "Gallery", bn: "গ্যালারি" },
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
  const [content] = useState(fallbackContent);
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("site-language") || "en",
  );

  const setLanguage = (nextLanguage) => {
    if (!["en", "bn"].includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);
    localStorage.setItem("site-language", nextLanguage);
  };

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
      theme: content?.theme || "current-default",
    }),
    [content, language],
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
