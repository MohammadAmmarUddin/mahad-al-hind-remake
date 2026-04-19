import { useEffect, useState } from "react";
import { FaCalendarAlt, FaSave } from "react-icons/fa";

const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";

const defaultForm = {
  isVisible: true,
  titleEn: "Enrollment Open",
  titleBn: "ভর্তি চলছে",
  startLabelEn: "Enrollment starts",
  startLabelBn: "এনরোলমেন্ট শুরু",
  endLabelEn: "Enrollment ends",
  endLabelBn: "এনরোলমেন্ট শেষ",
  reopenLabelEn: "Enrollment Info",
  reopenLabelBn: "ভর্তির তথ্য",
  startDate: "",
  endDate: "",
};

const EnrollmentSettings = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/site-content/public`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load enrollment settings");
        }

        const widget = result.data?.enrollmentWidget || {};

        setForm({
          isVisible: widget.isVisible ?? true,
          titleEn: widget.title?.en || defaultForm.titleEn,
          titleBn: widget.title?.bn || defaultForm.titleBn,
          startLabelEn: widget.startLabel?.en || defaultForm.startLabelEn,
          startLabelBn: widget.startLabel?.bn || defaultForm.startLabelBn,
          endLabelEn: widget.endLabel?.en || defaultForm.endLabelEn,
          endLabelBn: widget.endLabel?.bn || defaultForm.endLabelBn,
          reopenLabelEn: widget.reopenLabel?.en || defaultForm.reopenLabelEn,
          reopenLabelBn: widget.reopenLabel?.bn || defaultForm.reopenLabelBn,
          startDate: widget.startDate || "",
          endDate: widget.endDate || "",
        });
      } catch (error) {
        setMessage(error.message || "Failed to load enrollment settings");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${baseUrl}/api/site-content/public`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentWidget: {
            isVisible: form.isVisible,
            title: { en: form.titleEn, bn: form.titleBn },
            startLabel: { en: form.startLabelEn, bn: form.startLabelBn },
            endLabel: { en: form.endLabelEn, bn: form.endLabelBn },
            reopenLabel: { en: form.reopenLabelEn, bn: form.reopenLabelBn },
            startDate: form.startDate,
            endDate: form.endDate,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save enrollment settings");
      }

      setMessage("Enrollment settings saved.");
    } catch (error) {
      setMessage(error.message || "Failed to save enrollment settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Enrollment Notice
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Control the `Vorti Cholche` widget and update start/end dates from
            admin dashboard.
          </p>
        </div>

        {message && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          {loading ? (
            <p className="text-sm text-slate-500">Loading settings...</p>
          ) : (
            <div className="space-y-5">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => handleChange("isVisible", e.target.checked)}
                  className="h-4 w-4"
                />
                Show enrollment widget
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.titleEn}
                  onChange={(e) => handleChange("titleEn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Title (English)"
                />
                <input
                  value={form.titleBn}
                  onChange={(e) => handleChange("titleBn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Title (Bangla)"
                />
                <input
                  value={form.startLabelEn}
                  onChange={(e) => handleChange("startLabelEn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Start label (English)"
                />
                <input
                  value={form.startLabelBn}
                  onChange={(e) => handleChange("startLabelBn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Start label (Bangla)"
                />
                <input
                  value={form.endLabelEn}
                  onChange={(e) => handleChange("endLabelEn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="End label (English)"
                />
                <input
                  value={form.endLabelBn}
                  onChange={(e) => handleChange("endLabelBn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="End label (Bangla)"
                />
                <input
                  value={form.reopenLabelEn}
                  onChange={(e) => handleChange("reopenLabelEn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Collapsed button label (English)"
                />
                <input
                  value={form.reopenLabelBn}
                  onChange={(e) => handleChange("reopenLabelBn", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3"
                  placeholder="Collapsed button label (Bangla)"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Date Text
                  </span>
                  <input
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3"
                    placeholder="1 February, 2026"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    End Date Text
                  </span>
                  <input
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3"
                    placeholder="10 Ramadan, 2026"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Enrollment Settings"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnrollmentSettings;
