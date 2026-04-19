import { useState } from "react";

const API_URL = import.meta.env.VITE_MAHAD_baseUrl || "http://localhost:4000";

/**
 * ImageUpload Component
 * 
 * @param {Object} props
 * @param {function} props.onUploadSuccess - Callback receiving the uploaded image data
 * @param {string} props.label - Button label
 * @param {boolean} props.multiple - Allow multiple uploads
 * @param {string} props.className - Additional CSS classes
 */
export default function ImageUpload({
  onUploadSuccess,
  label = "Upload Image",
  multiple = false,
  className = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const field = multiple ? "images" : "image";
      
      if (multiple) {
        Array.from(files).forEach((file) => formData.append(field, file));
      } else {
        formData.append(field, files[0]);
      }

      const endpoint = multiple ? "/api/upload/images" : "/api/upload/image";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      // Set preview for single image
      if (!multiple && result.data?.url) {
        setPreview(`${API_URL}${result.data.url}`);
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      // Reset file input
      e.target.value = "";
    } catch (err) {
      setError(err.message || "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onUploadSuccess) {
      onUploadSuccess(null);
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <div className="flex flex-col gap-3">
        {/* File Input */}
        <label className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer transition-colors">
            {uploading ? "Uploading..." : label}
          </span>
        </label>

        {/* Error Message */}
        {error && (
          <div className="rounded bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-w-xs rounded-lg border-2 border-gray-200"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
