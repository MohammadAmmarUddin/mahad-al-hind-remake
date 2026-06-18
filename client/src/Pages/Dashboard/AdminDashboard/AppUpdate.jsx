import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const AppUpdate = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedField, setSavedField] = useState(null);
  const [form, setForm] = useState({
    latestVersion: "",
    minVersion: "",
    apkUrl: "",
    releaseNotes: "",
    forceUpdate: false,
    updateEnabled: true,
    showUpdateToOutdatedUsers: false,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await axiosSecure.get("/api/app-update");
      if (data.success && data.data) {
        setForm({
          latestVersion: data.data.latestVersion || "",
          minVersion: data.data.minVersion || "",
          apkUrl: data.data.apkUrl || "",
          releaseNotes: data.data.releaseNotes || "",
          forceUpdate: data.data.forceUpdate || false,
          updateEnabled: data.data.updateEnabled !== false,
          showUpdateToOutdatedUsers: data.data.showUpdateToOutdatedUsers || false,
        });
      }
    } catch (err) {
      console.error("Failed to load config:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSaved = useCallback((field) => {
    setSavedField(field);
    setTimeout(() => setSavedField((prev) => (prev === field ? null : prev)), 2000);
  }, []);

  // Instant toggle save — only sends toggle fields
  const handleToggle = async (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaving(true);
    try {
      await axiosSecure.patch("/api/app-update/toggles", {
        [field]: value,
      });
      showSaved(field);
    } catch (err) {
      console.error("Toggle save failed:", err);
      setForm((prev) => ({ ...prev, [field]: !value }));
    } finally {
      setSaving(false);
    }
  };

  // Full form save (version, apkUrl, notes)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latestVersion.trim()) return;
    if (!form.apkUrl.trim()) return;

    setSaving(true);
    try {
      const { data } = await axiosSecure.patch("/api/app-update", {
        latestVersion: form.latestVersion.trim(),
        minVersion: form.minVersion.trim() || form.latestVersion.trim(),
        apkUrl: form.apkUrl.trim(),
        releaseNotes: form.releaseNotes.trim(),
        forceUpdate: form.forceUpdate,
        updateEnabled: form.updateEnabled,
        showUpdateToOutdatedUsers: form.showUpdateToOutdatedUsers,
      });
      if (data.success) {
        showSaved("versionConfig");
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const SavedBadge = ({ field }) =>
    savedField === field ? (
      <span className="badge badge-success badge-sm gap-1 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Saved
      </span>
    ) : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">App Update Management</h1>

      {/* Status Banner */}
      <div className={`alert mb-6 ${form.updateEnabled ? "alert-success" : "alert-warning"}`}>
        <span>
          {form.updateEnabled
            ? `Update check is active. Latest version: v${form.latestVersion || "?"}`
            : "Update check is currently disabled — no update prompts will be shown."}
        </span>
      </div>

      {/* ─── LIVE TOGGLES (auto-save) ─── */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title gap-2">
              <span className="text-primary text-xl">⚡</span> Live Settings
            </h2>
            <span className="badge badge-success badge-outline gap-1">
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saving ? "Saving..." : "Auto-save"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Changes apply instantly across all devices — no publish required</p>

          {/* Update Enabled */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                checked={form.updateEnabled}
                onChange={(e) => handleToggle("updateEnabled", e.target.checked)}
                className="toggle toggle-primary"
              />
              <div className="flex-1">
                <span className="label-text font-semibold">Update Enabled</span>
                <SavedBadge field="updateEnabled" />
                <p className="text-sm text-gray-500">
                  {form.updateEnabled
                    ? "Active — users will be notified of new versions"
                    : "Disabled — app behaves normally, no update checks"}
                </p>
              </div>
            </label>
          </div>
          <div className="divider my-0"></div>

          {/* Show to outdated users */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                checked={form.showUpdateToOutdatedUsers}
                onChange={(e) => handleToggle("showUpdateToOutdatedUsers", e.target.checked)}
                className="toggle toggle-secondary"
              />
              <div className="flex-1">
                <span className="label-text font-semibold">Show to Outdated Users</span>
                <SavedBadge field="showUpdateToOutdatedUsers" />
                <p className="text-sm text-gray-500">
                  {form.showUpdateToOutdatedUsers
                    ? "Only users running an older version will see update prompts"
                    : "No update prompts shown even if newer version exists"}
                </p>
              </div>
            </label>
          </div>
          <div className="divider my-0"></div>

          {/* Force Update */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                checked={form.forceUpdate}
                onChange={(e) => handleToggle("forceUpdate", e.target.checked)}
                className="toggle toggle-error"
              />
              <div className="flex-1">
                <span className="label-text font-semibold">Force Update</span>
                <SavedBadge field="forceUpdate" />
                <p className="text-sm text-gray-500">
                  {form.forceUpdate
                    ? "Blocks access on next launch until user updates (never interrupts active sessions)"
                    : "Optional update — users may choose Later"}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ─── VERSION CONFIG (manual save) ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Version Config</h2>
              <SavedBadge field="versionConfig" />
            </div>
            <p className="text-sm text-gray-500">Set version, APK link, and release notes</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Latest Version *</span>
                </label>
                <input
                  type="text"
                  name="latestVersion"
                  value={form.latestVersion}
                  onChange={(e) => setForm((prev) => ({ ...prev, latestVersion: e.target.value }))}
                  placeholder="e.g. 1.3.0"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Min Version</span>
                </label>
                <input
                  type="text"
                  name="minVersion"
                  value={form.minVersion}
                  onChange={(e) => setForm((prev) => ({ ...prev, minVersion: e.target.value }))}
                  placeholder="e.g. 1.0.0"
                  className="input input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">Users below this will be forced to update</span>
                </label>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">APK Download URL *</span>
              </label>
              <input
                type="url"
                name="apkUrl"
                value={form.apkUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, apkUrl: e.target.value }))}
                placeholder="https://github.com/.../releases/download/v1.3.0/app-release.apk"
                className="input input-bordered w-full"
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">Paste your GitHub Release APK link here</span>
              </label>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Release Notes</span>
              </label>
              <textarea
                name="releaseNotes"
                value={form.releaseNotes}
                onChange={(e) => setForm((prev) => ({ ...prev, releaseNotes: e.target.value }))}
                placeholder={"- Improved performance\n- Fixed login issue\n- New course feature"}
                className="textarea textarea-bordered w-full h-32"
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">One change per line. Each line becomes a bullet point.</span>
              </label>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-4 ${saving ? "loading" : ""}`}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Version Config"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppUpdate;
