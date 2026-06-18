import { useState, useEffect } from "react";
import { API } from "../../../config/api";
import useAuthContext from "../../../hooks/useAuthContext";
import Swal from "sweetalert2";

const AppUpdate = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    latestVersion: "",
    minVersion: "",
    apkUrl: "",
    releaseNotes: "",
    forceUpdate: false,
    updateEnabled: true,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API}/api/app-update`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          latestVersion: data.data.latestVersion || "",
          minVersion: data.data.minVersion || "",
          apkUrl: data.data.apkUrl || "",
          releaseNotes: data.data.releaseNotes || "",
          forceUpdate: data.data.forceUpdate || false,
          updateEnabled: data.data.updateEnabled !== false,
        });
      }
    } catch (err) {
      console.error("Failed to load config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.latestVersion.trim()) {
      Swal.fire("Error", "Version is required", "error");
      return;
    }
    if (!form.apkUrl.trim()) {
      Swal.fire("Error", "APK URL is required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/app-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          latestVersion: form.latestVersion.trim(),
          minVersion: form.minVersion.trim() || form.latestVersion.trim(),
          apkUrl: form.apkUrl.trim(),
          releaseNotes: form.releaseNotes.trim(),
          forceUpdate: form.forceUpdate,
          updateEnabled: form.updateEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Success", "App update config published!", "success");
        fetchConfig();
      } else {
        Swal.fire("Error", data.error || "Failed to update", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to save: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

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

      {/* Status Card */}
      <div
        className={`alert mb-6 ${
          form.updateEnabled ? "alert-success" : "alert-warning"
        }`}
      >
        <span>
          {form.updateEnabled
            ? `Update check is active. Latest version: v${form.latestVersion || "?"}`
            : "Update check is currently disabled."}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Version Fields */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Version Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Latest Version *
                  </span>
                </label>
                <input
                  type="text"
                  name="latestVersion"
                  value={form.latestVersion}
                  onChange={handleChange}
                  placeholder="e.g. 1.2.0"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Min Version
                  </span>
                </label>
                <input
                  type="text"
                  name="minVersion"
                  value={form.minVersion}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                  className="input input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Users below this will be forced to update
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* APK URL */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">APK Download</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  APK Download URL *
                </span>
              </label>
              <input
                type="url"
                name="apkUrl"
                value={form.apkUrl}
                onChange={handleChange}
                placeholder="https://github.com/.../releases/download/v1.2.0/app-release.apk"
                className="input input-bordered w-full"
                required
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Paste your GitHub Release APK link here
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Release Notes</h2>
            <div className="form-control">
              <textarea
                name="releaseNotes"
                value={form.releaseNotes}
                onChange={handleChange}
                placeholder={"- Improved performance\n- Fixed login issue\n- New course feature"}
                className="textarea textarea-bordered w-full h-32"
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  One change per line. Each line becomes a bullet point.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Settings</h2>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="forceUpdate"
                  checked={form.forceUpdate}
                  onChange={handleChange}
                  className="checkbox checkbox-error"
                />
                <div>
                  <span className="label-text font-semibold">
                    Force Update
                  </span>
                  <p className="text-sm text-gray-500">
                    Block app usage until user updates
                  </p>
                </div>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="updateEnabled"
                  checked={form.updateEnabled}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <div>
                  <span className="label-text font-semibold">
                    Update Enabled
                  </span>
                  <p className="text-sm text-gray-500">
                    Active: users will see update prompts
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`btn btn-primary w-full ${saving ? "loading" : ""}`}
          disabled={saving}
        >
          {saving ? "Publishing..." : "Save & Publish Update"}
        </button>
      </form>
    </div>
  );
};

export default AppUpdate;
