import { useState } from "react";
import { uploadFilesToBackend, validateFile } from "../utils/uploadMedia";

export default function ImageUpload({
  onUploadSuccess,
  label = "Upload Image",
  multiple = false,
  className = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      files.forEach((file) => {
        validateFile(file, {
          allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
          maxSize: 10 * 1024 * 1024,
        });
      });

      const previewUrls = files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      setPreview(previewUrls);

      const uploaded = await uploadFilesToBackend({
        files,
        folder: "admin/uploads",
        resourceType: "image",
        onProgress: setProgress,
      });

      if (onUploadSuccess) {
        onUploadSuccess(uploaded);
      }

      e.target.value = "";
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview([]);
    setProgress(0);
    if (onUploadSuccess) {
      onUploadSuccess(null);
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <span className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400">
            {uploading ? "Uploading..." : label}
          </span>
        </label>

        {progress > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <div className="rounded bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {preview.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((item) => (
              <div key={item.url} className="relative inline-block">
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-40 w-full rounded-lg border-2 border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                  title="Remove image"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
