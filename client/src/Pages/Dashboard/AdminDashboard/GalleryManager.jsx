import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaSave, FaTrashAlt } from "react-icons/fa";
import { resolveMediaUrl, toStoredMediaPath } from "../../../utils/media";

const baseUrl = import.meta.env.VITE_MAHAD_baseUrl || "";

const galleryConfig = {
  student: {
    title: "Student Gallery",
    description: "Manage public student gallery images shown on the home page.",
  },
  faregin: {
    title: "Faregin Gallery",
    description: "Manage public faregin gallery images shown on the home page.",
  },
};

const GalleryManager = ({ galleryType }) => {
  const config = galleryConfig[galleryType];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const loadItems = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${baseUrl}/api/galleries/${galleryType}?admin=true`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load gallery items");
      }

      setItems(result.data || []);
    } catch (error) {
      setMessage(error.message || "Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [galleryType]);

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSaveItem = async (item) => {
    setSavingId(item._id);
    setMessage("");

    try {
      const response = await fetch(
        `${baseUrl}/api/galleries/${galleryType}/${item._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            imageUrl: toStoredMediaPath(item.imageUrl),
            sortOrder: Number(item.sortOrder) || 0,
            isVisible: item.isVisible,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update gallery item");
      }

      setItems((prev) =>
        prev
          .map((entry) => (entry._id === item._id ? result.data : entry))
          .sort(
            (a, b) => a.sortOrder - b.sortOrder || new Date(b.createdAt) - new Date(a.createdAt),
          ),
      );
      setMessage("Gallery item updated.");
    } catch (error) {
      setMessage(error.message || "Failed to update gallery item");
    } finally {
      setSavingId("");
    }
  };

  const handleDeleteItem = async (id) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(
        `${baseUrl}/api/galleries/${galleryType}/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete gallery item");
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
      setMessage("Gallery item deleted.");
    } catch (error) {
      setMessage(error.message || "Failed to delete gallery item");
    } finally {
      setDeletingId("");
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{config.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            Only visible items are returned to public users. Hidden items stay in
            the database but do not appear on the homepage.
          </p>
        </div>

        {message && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Existing Items
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            Upload files from the main File Uploader page, then manage visibility,
            naming, ordering, and deletion here.
          </p>

          {loading ? (
            <p className="text-sm text-slate-500">Loading gallery items...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No gallery items found.</p>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[220px_1fr]"
                >
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt={item.name || config.title}
                    className="h-48 w-full rounded-xl object-cover"
                  />

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={item.name || ""}
                          onChange={(e) =>
                            handleItemChange(item._id, "name", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          value={item.sortOrder ?? 0}
                          onChange={(e) =>
                            handleItemChange(item._id, "sortOrder", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) =>
                          handleItemChange(item._id, "imageUrl", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleItemChange(item._id, "isVisible", !item.isVisible)
                        }
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                          item.isVisible
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {item.isVisible ? <FaEyeSlash /> : <FaEye />}
                        {item.isVisible ? "Hide" : "Expose"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveItem(item)}
                        disabled={savingId === item._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        <FaSave />
                        {savingId === item._id ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item._id)}
                        disabled={deletingId === item._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        <FaTrashAlt />
                        {deletingId === item._id ? "Deleting..." : "Delete"}
                      </button>
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

export default GalleryManager;
