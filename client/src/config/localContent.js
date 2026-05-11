export const HOME_SECTIONS_STORAGE_KEY = "mahad-home-sections";
export const ENROLLMENT_STORAGE_KEY = "mahad-enrollment-widget";

export const defaultHomeSections = {
  hero: true,
  breakingNews: true,
  statsBanner: true,
  videos: true,
  gallery: true,
};

export const defaultEnrollmentWidget = {
  isVisible: true,
  titleEn: "Enrollment Open",
  titleBn: "Enrollment Open",
  startLabelEn: "Enrollment starts",
  startLabelBn: "Enrollment starts",
  endLabelEn: "Enrollment ends",
  endLabelBn: "Enrollment ends",
  reopenLabelEn: "Enrollment Info",
  reopenLabelBn: "Enrollment Info",
  startDate: "",
  endDate: "",
};

export const readLocalJson = (key, fallbackValue) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    return { ...fallbackValue, ...JSON.parse(raw) };
  } catch {
    return fallbackValue;
  }
};

export const writeLocalJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
