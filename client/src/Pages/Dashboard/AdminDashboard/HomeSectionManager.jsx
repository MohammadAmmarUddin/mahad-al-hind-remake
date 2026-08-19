import { useState } from "react";
import { FaEye, FaEyeSlash, FaSave } from "react-icons/fa";
import {
  HOME_SECTIONS_STORAGE_KEY,
  defaultHomeSections,
  readLocalJson,
  writeLocalJson,
} from "../../../config/localContent";

const sectionMeta = [
  {
    key: "hero",
    title: "Hero Section",
    description: "Top intro section with banner and Get Started button.",
  },
  {
    key: "breakingNews",
    title: "Breaking News",
    description: "Headline strip displayed at the top of the home page.",
  },
  {
    key: "noticeBoard",
    title: "Notice Board",
    description: "Academic notices and announcements section on the home page.",
  },
  {
    key: "statsBanner",
    title: "Stats Banner",
    description: "Community numbers and highlights section.",
  },
  {
    key: "videos",
    title: "Video Section",
    description: "Featured videos shown on the home page.",
  },
  {
    key: "studentReviews",
    title: "Student Video Reviews",
    description: "Student testimonial videos section on the home page.",
  },
  {
    key: "gallery",
    title: "Gallery",
    description: "Photo gallery grid shown on the home page.",
  },
];

const HomeSectionManager = () => {
  const [sections, setSections] = useState(() =>
    readLocalJson(HOME_SECTIONS_STORAGE_KEY, defaultHomeSections),
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaving(true);
    setStatus("");

    try {
      writeLocalJson(HOME_SECTIONS_STORAGE_KEY, sections);
      setStatus("Homepage section settings saved locally.");
    } catch {
      setStatus("Failed to save section settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-emerald-900">Homepage Sections</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hide or expose each section of the home page locally.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sectionMeta.map((section) => {
            const enabled = sections[section.key];

            return (
              <div
                key={section.key}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-emerald-900">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {enabled ? "Visible" : "Hidden"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                    enabled ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {enabled ? <FaEyeSlash /> : <FaEye />}
                  {enabled ? "Hide Section" : "Expose Section"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className={`text-sm ${status.includes("saved") ? "text-emerald-700" : "text-gray-600"}`}>
            {status || "Changes are stored locally and used by the homepage."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaSave />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSectionManager;
