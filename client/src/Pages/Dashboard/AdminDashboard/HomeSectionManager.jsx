import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaSave } from "react-icons/fa";

const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";

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
    key: "studentGallery",
    title: "Student Gallery",
    description: "Student photos slider section.",
  },
  {
    key: "pagriGallery",
    title: "Faregin Gallery",
    description: "Pagri and graduation gallery slider.",
  },
];

const defaultSections = sectionMeta.reduce((acc, section) => {
  acc[section.key] = true;
  return acc;
}, {});

const HomeSectionManager = () => {
  const [sections, setSections] = useState(defaultSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`${baseUrl}/api/site-settings/home-page`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load settings");
      }

      setSections({
        ...defaultSections,
        ...(result.data?.homeSections || {}),
      });
    } catch (error) {
      setStatus(error.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`${baseUrl}/api/site-settings/home-page`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homeSections: sections }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save settings");
      }

      setSections({
        ...defaultSections,
        ...(result.data?.homeSections || {}),
      });
      setStatus("Homepage section settings saved.");
    } catch (error) {
      setStatus(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-emerald-900">
            Homepage Sections
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hide or expose each section of the home page from the admin
            dashboard.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
            Loading section settings...
          </div>
        ) : (
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
                      <p className="mt-1 text-sm text-gray-600">
                        {section.description}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {enabled ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      enabled
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {enabled ? <FaEyeSlash /> : <FaEye />}
                    {enabled ? "Hide Section" : "Expose Section"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <p
            className={`text-sm ${
              status.includes("saved") ? "text-emerald-700" : "text-gray-600"
            }`}
          >
            {status || "Changes are stored in the database and used by the home page."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            <FaSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSectionManager;
