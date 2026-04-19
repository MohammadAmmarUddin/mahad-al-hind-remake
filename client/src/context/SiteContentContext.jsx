import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";

const SiteContentContext = createContext(null);

const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";

const fallbackContent = {
  theme: "current-default",
  navbar: {
    home: { en: "Home", bn: "হোম" },
    dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    courses: { en: "Courses", bn: "কোর্সসমূহ" },
    certificateChecker: { en: "Certificate Checker", bn: "সার্টিফিকেট যাচাই" },
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
    heroTitle: { en: "Ma’hadul Qira’at Al Hind", bn: "মা'হাদুল কিরা'আত আল হিন্দ" },
    heroSubtitle: { en: "Qira'at Academy In the World", bn: "বিশ্বমানের কিরা'আত একাডেমি" },
    heroDescription: {
      en: "Welcome to Ma’hadul Qira’at Al Hind.",
      bn: "মা'হাদুল কিরা'আত আল হিন্দে স্বাগতম।",
    },
    heroCta: { en: "Get Started", bn: "শুরু করুন" },
    loading: { en: "Loading homepage...", bn: "হোমপেজ লোড হচ্ছে..." },
  },
  breakingNews: {
    label: { en: "Breaking News", bn: "জরুরি ঘোষণা" },
    message: { en: "Admissions are open.", bn: "ভর্তি চলছে।" },
  },
  videoSection: {
    badge: { en: "Video Gallery", bn: "ভিডিও গ্যালারি" },
    loading: { en: "Loading videos...", bn: "ভিডিও লোড হচ্ছে..." },
    error: { en: "There was a problem loading videos.", bn: "ভিডিও লোড করতে সমস্যা হয়েছে।" },
    emptyTitle: { en: "No videos found", bn: "কোনো ভিডিও পাওয়া যায়নি" },
    emptySubtitle: {
      en: "Please add videos from the admin dashboard.",
      bn: "অ্যাডমিন ড্যাশবোর্ড থেকে ভিডিও যোগ করুন।",
    },
    clickToWatch: { en: "Click to watch", bn: "ক্লিক করে দেখুন" },
  },
  gallerySection: {
    studentTitle: { en: "Our Students Gallery", bn: "আমাদের শিক্ষার্থীদের গ্যালারি" },
    fareginTitle: { en: "Faregin Gallery", bn: "ফারেগিন গ্যালারি" },
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
};

export const SiteContentProvider = ({ children }) => {
  const { user, dispatch } = useAuthContext();
  const [content, setContent] = useState(fallbackContent);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const initialLanguage =
      user?.user?.preferredLanguage ||
      localStorage.getItem("site-language") ||
      "en";
    setLanguageState(initialLanguage);
  }, [user?.user?.preferredLanguage]);

  useEffect(() => {
    const loadSiteContent = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/site-content/public`);
        const result = await response.json();

        if (response.ok && result.data) {
          setContent(result.data);
        }
      } catch (error) {
        console.error("Failed to load site content:", error);
      } finally {
        setContentLoaded(true);
      }
    };

    loadSiteContent();
  }, []);

  const setLanguage = async (nextLanguage) => {
    if (!["en", "bn"].includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);
    localStorage.setItem("site-language", nextLanguage);

    if (!user?.user?._id) {
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/user/languagePreference/${user.user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferredLanguage: nextLanguage }),
        },
      );

      const updatedUser = await response.json();

      if (!response.ok) {
        throw new Error(updatedUser.error || "Failed to update language");
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const nextStoredUser = {
        ...storedUser,
        user: {
          ...storedUser.user,
          preferredLanguage: updatedUser.preferredLanguage,
        },
      };

      localStorage.setItem("user", JSON.stringify(nextStoredUser));
      dispatch({ type: "LOGIN", payload: nextStoredUser });
    } catch (error) {
      console.error("Failed to persist language:", error);
    }
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
      contentLoaded,
      language,
      setLanguage,
      translate,
      theme: content?.theme || "current-default",
    }),
    [content, contentLoaded, language],
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
