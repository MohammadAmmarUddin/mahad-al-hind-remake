import { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";

const EnrollmentSettings = () => {
  const [form, setForm] = useState({
    isVisible: true,
    titleEn: "",
    titleBn: "",
    startLabelEn: "",
    startLabelBn: "",
    endLabelEn: "",
    endLabelBn: "",
    reopenLabelEn: "",
    reopenLabelBn: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  useEffect(() => {
    fetch(`${API}/api/site-content/public`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.enrollmentWidget) {
          const w = res.data.enrollmentWidget;
          setForm({
            isVisible: w.isVisible ?? true,
            titleEn: w.title?.en ?? "",
            titleBn: w.title?.bn ?? "",
            startLabelEn: w.startLabel?.en ?? "",
            startLabelBn: w.startLabel?.bn ?? "",
            endLabelEn: w.endLabel?.en ?? "",
            endLabelBn: w.endLabel?.bn ?? "",
            reopenLabelEn: w.reopenLabel?.en ?? "",
            reopenLabelBn: w.reopenLabel?.bn ?? "",
            startDate: w.startDate ?? "",
            endDate: w.endDate ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      enrollmentWidget: {
        isVisible: form.isVisible,
        title: { en: form.titleEn, bn: form.titleBn },
        startLabel: { en: form.startLabelEn, bn: form.startLabelBn },
        endLabel: { en: form.endLabelEn, bn: form.endLabelBn },
        reopenLabel: { en: form.reopenLabelEn, bn: form.reopenLabelBn },
        startDate: form.startDate,
        endDate: form.endDate,
      },
    };

    try {
      const res = await fetch(`${API}/api/site-content/public`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("Enrollment settings saved to database.");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to save.");
      }
    } catch {
      setMessage("Failed to save enrollment settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Enrollment Notice</h1>
          <p className="mt-2 text-sm text-slate-600">
            Control the enrollment widget shown on the website and mobile app. Changes are saved to the database.
          </p>
        </div>

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
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
                {saving ? "Saving..." : "Save to database"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentSettings;
