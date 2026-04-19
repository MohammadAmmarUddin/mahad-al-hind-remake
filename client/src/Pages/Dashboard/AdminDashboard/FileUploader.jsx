import { useEffect, useState } from "react";
import {
  FaCopy,
  FaImage,
  FaImages,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import ImageUpload from "../../../Components/ImageUpload";
import { resolveMediaUrl, toStoredMediaPath } from "../../../utils/media";

const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";

const formatBytes = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const FileUploader = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyFile, setBusyFile] = useState("");
  const [galleryBusy, setGalleryBusy] = useState("");

  const loadImages = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/upload/images`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load images");
      }

      setImages(result.data || []);
    } catch (error) {
      setMessage(error.message || "Failed to load uploaded images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUploadSuccess = (uploaded) => {
    const uploadedFiles = Array.isArray(uploaded) ? uploaded : uploaded ? [uploaded] : [];

    if (!uploadedFiles.length) {
      return;
    }

    setImages((prev) => [...uploadedFiles.reverse(), ...prev]);
    setMessage("Upload complete. Copy an image URL and use it in gallery or other image fields.");
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Image URL copied.");
    } catch {
      setMessage("Copy failed. Please copy the URL manually.");
    }
  };

  const addToGallery = async (galleryType, image) => {
    const busyKey = `${galleryType}:${image.filename}`;
    setGalleryBusy(busyKey);
    setMessage("");

    try {
      const response = await fetch(`${baseUrl}/api/galleries/${galleryType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: image.originalName || image.filename,
          imageUrl: toStoredMediaPath(image.url || image.fullUrl),
          isVisible: true,
          sortOrder: 0,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add image to gallery");
      }

      setMessage(
        `Image added to ${
          galleryType === "student" ? "Student Gallery" : "Faregin Gallery"
        }.`,
      );
    } catch (error) {
      setMessage(error.message || "Failed to add image to gallery");
    } finally {
      setGalleryBusy("");
    }
  };

  const handleDelete = async (filename) => {
    setBusyFile(filename);
    setMessage("");

    try {
      const response = await fetch(`${baseUrl}/api/upload/image/${filename}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete image");
      }

      setImages((prev) => prev.filter((item) => item.filename !== filename));
      setMessage("Image deleted.");
    } catch (error) {
      setMessage(error.message || "Failed to delete image");
    } finally {
      setBusyFile("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">File Uploader</h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload images to the server file library. Use the copied URL in gallery
            items, cards, banners, and other image fields.
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Runtime uploads are served from <code>/uploads</code>. They are not stored in
            <code> src/assets</code>, because build-time asset folders are not suitable for live admin uploads.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-2 pb-4 text-lg font-semibold text-slate-900">
            <FaUpload className="text-emerald-700" />
            Upload New Images
          </div>
          <ImageUpload
            label="Select Images"
            multiple={true}
            onUploadSuccess={handleUploadSuccess}
          />
          <p className="mt-3 text-sm text-slate-500">
            Allowed types: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`. Max file size: 5MB.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FaImage className="text-emerald-700" />
            Uploaded Image Library
          </div>

          {message && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading uploaded images...</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-slate-500">No uploaded images found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.filename}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={resolveMediaUrl(image.url || image.fullUrl)}
                    alt={image.filename}
                    className="h-52 w-full object-cover"
                  />

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {image.filename}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(image.size)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3 text-xs text-slate-600 ring-1 ring-slate-200">
                      <p className="break-all">
                        {resolveMediaUrl(image.url || image.fullUrl)}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => addToGallery("student", image)}
                          disabled={galleryBusy === `student:${image.filename}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                        >
                          <FaImages />
                          {galleryBusy === `student:${image.filename}`
                            ? "Adding..."
                            : "Add To Student"}
                        </button>
                        <button
                          type="button"
                          onClick={() => addToGallery("faregin", image)}
                          disabled={galleryBusy === `faregin:${image.filename}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                        >
                          <FaImages />
                          {galleryBusy === `faregin:${image.filename}`
                            ? "Adding..."
                            : "Add To Faregin"}
                        </button>
                      </div>

                      <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(resolveMediaUrl(image.url || image.fullUrl))
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                      >
                        <FaCopy />
                        Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(image.filename)}
                        disabled={busyFile === image.filename}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        <FaTrashAlt />
                        {busyFile === image.filename ? "Deleting..." : "Delete"}
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
