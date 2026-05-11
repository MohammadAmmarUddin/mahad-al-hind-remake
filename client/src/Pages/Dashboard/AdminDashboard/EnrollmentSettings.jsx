import { useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  ENROLLMENT_STORAGE_KEY,
  defaultEnrollmentWidget,
  readLocalJson,
  writeLocalJson,
} from "../../../config/localContent";

const EnrollmentSettings = () => {
  const [form, setForm] = useState(
    () => readLocalJson(ENROLLMENT_STORAGE_KEY, defaultEnrollmentWidget),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      writeLocalJson(ENROLLMENT_STORAGE_KEY, form);
      setMessage("Enrollment settings saved locally.");
    } catch {
      setMessage("Failed to save enrollment settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Enrollment Notice</h1>
          <p className="mt-2 text-sm text-slate-600">
            Control the enrollment widget locally without depending on the backend.
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
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="text"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full outline-none"
                  placeholder="Start date"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="text"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full outline-none"
                  placeholder="End date"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaSave />
                {saving ? "Saving..." : "Save locally"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentSettings;
