import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaUpload,
  FaEdit,
  FaTrashAlt,
  FaImage,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { resolveMediaUrl } from "../../../utils/media";
import {
  useUploadGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
} from "../../../hooks/useGallery";
import { useQuery } from "@tanstack/react-query";
import { fetchGalleryItems } from "../../../utils/galleryApi";

const GalleryManager = () => {
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [message, setMessage] = useState(null);

  const showMessage = useCallback((text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["gallery", "admin"],
    queryFn: () => fetchGalleryItems({ admin: true, limit: 200 }),
    staleTime: 1000 * 30,
  });

  const items = data?.data || [];

  const uploadMutation = useUploadGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const handleUploadSuccess = useCallback(() => {
    showMessage("Image uploaded successfully");
  }, [showMessage]);

  const handleUploadError = useCallback(
    (err) => showMessage(err.message || "Upload failed", "error"),
    [showMessage],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">
            Gallery Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload, edit, and manage gallery images. Changes sync instantly.
          </p>
        </div>

        <InlineUpload
          mutation={uploadMutation}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />

        {message && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message.type === "error" ? (
              <FaExclamationTriangle />
            ) : (
              <FaCheckCircle />
            )}
            {message.text}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {isLoading ? (
            <GallerySkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <GalleryCard
                  key={item._id}
                  item={item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => setDeletingItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            showMessage("Gallery item updated");
          }}
          onError={(err) =>
            showMessage(err.message || "Update failed", "error")
          }
          mutation={updateMutation}
        />
      )}

      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          onClose={() => setDeletingItem(null)}
          onSuccess={() => {
            setDeletingItem(null);
            showMessage("Gallery item deleted");
          }}
          onError={(err) =>
            showMessage(err.message || "Delete failed", "error")
          }
          mutation={deleteMutation}
        />
      )}
    </div>
  );
};

const InlineUpload = ({ mutation, onSuccess, onError }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const reset = () => {
    setTitle("");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setProgress(0);
    setIsPublic(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      await mutation.mutateAsync(
        {
          file,
          title: title.trim(),
          isVisible: isPublic,
          onProgress: setProgress,
        },
        {
          onSuccess: () => {
            reset();
            onSuccess();
          },
          onError,
        },
      );
    } catch {}
  };

  const isVideo = file?.type?.startsWith("video/");

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FaUpload className="text-emerald-700" />
          Upload Image
        </div>

        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50/60">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm font-medium text-slate-700">
            Select an image
          </span>
          <p className="mt-1 text-xs text-slate-500">
            PNG, JPG, WEBP (max 10MB)
          </p>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            placeholder="Image title"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Visible on homepage
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !file}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? `Uploading ${progress}%` : "Upload Image"}
        </button>

        {mutation.isPending && progress > 0 && (
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="text-lg font-semibold text-slate-900">Preview</div>
        {file ? (
          <>
            {isVideo ? (
              <video
                controls
                src={preview}
                className="h-72 w-full rounded-2xl bg-slate-100 object-cover"
              />
            ) : (
              <img
                src={preview}
                alt={file.name}
                className="h-72 w-full rounded-2xl object-cover"
              />
            )}
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Select a file to preview it here.
          </div>
        )}
      </div>
    </form>
  );
};

const GalleryCard = ({ item, onEdit, onDelete }) => {
  const displayName = item.title || item.name || "Untitled";
  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={resolveMediaUrl(item.imageUrl)}
          alt={displayName}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <h3 className="truncate text-sm font-semibold text-slate-900">
          {displayName}
        </h3>
        {createdDate && (
          <p className="text-xs text-slate-500">{createdDate}</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <FaEdit />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            <FaTrashAlt />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const GallerySkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[1, 2, 3, 4].map((n) => (
      <div key={n} className="animate-pulse rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="aspect-[4/3] rounded-t-2xl bg-slate-200" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-slate-200" />
            <div className="h-8 flex-1 rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
    <FaImage className="mb-4 text-5xl text-slate-300" />
    <h3 className="text-lg font-semibold text-slate-700">No images yet</h3>
    <p className="mt-1 text-sm text-slate-500">
      Upload your first gallery image using the form above.
    </p>
  </div>
);

const EditModal = ({ item, onClose, onSuccess, onError, mutation }) => {
  const [title, setTitle] = useState(item.title || item.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title: title.trim() };
    if (file) payload.file = file;

    try {
      await mutation.mutateAsync(
        { id: item._id, ...payload },
        { onSuccess, onError },
      );
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            Edit Gallery Item
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Replace Image{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 transition hover:border-emerald-300 hover:bg-emerald-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="text-center">
                  <FaImage className="mx-auto mb-2 text-2xl text-slate-400" />
                  <span className="text-sm text-slate-500">
                    Click to select new image
                  </span>
                </div>
              )}
            </label>
          </div>

          {!file && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img
                src={resolveMediaUrl(item.imageUrl)}
                alt="Current"
                className="h-40 w-full object-cover"
              />
              <p className="bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                Current image
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ item, onClose, onSuccess, onError, mutation }) => {
  const displayName = item.title || item.name || "this image";

  const handleDelete = async () => {
    try {
      await mutation.mutateAsync(item._id, { onSuccess, onError });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-2xl text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            Delete Gallery Item
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{displayName}</span>?
          </p>
          <p className="mt-1 text-xs text-red-600">
            This action cannot be undone. The image will be permanently removed.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <img
            src={resolveMediaUrl(item.imageUrl)}
            alt={displayName}
            className="h-40 w-full object-cover"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
