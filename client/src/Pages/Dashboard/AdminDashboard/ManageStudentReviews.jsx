import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaStar, FaExternalLinkAlt } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;

const extractVideoId = (url) => {
  const match = url?.match(YOUTUBE_REGEX);
  return match?.[1] || null;
};

const initialForm = {
  studentName: "",
  youtubeUrl: "",
  caption: "",
  program: "",
  isFeatured: false,
  status: "published",
  order: 0,
};

const ManageStudentReviews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/student-video-reviews`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (form.youtubeUrl) {
      const id = extractVideoId(form.youtubeUrl);
      setVideoPreview(id ? `https://www.youtube.com/embed/${id}` : null);
    } else {
      setVideoPreview(null);
    }
  }, [form.youtubeUrl]);

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
    setShowForm(false);
    setVideoPreview(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      studentName: item.studentName,
      youtubeUrl: item.youtubeUrl,
      caption: item.caption || "",
      program: item.program || "",
      isFeatured: item.isFeatured,
      status: item.status,
      order: item.order || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentName.trim()) {
      Swal.fire({ icon: "error", title: "Student name is required", confirmButtonColor: "#047857" });
      return;
    }
    if (!form.youtubeUrl.trim()) {
      Swal.fire({ icon: "error", title: "YouTube URL is required", confirmButtonColor: "#047857" });
      return;
    }
    if (!extractVideoId(form.youtubeUrl)) {
      Swal.fire({ icon: "error", title: "Invalid YouTube URL", text: "Please enter a valid YouTube video link", confirmButtonColor: "#047857" });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `${API}/api/student-video-reviews/${editing._id}` : `${API}/api/student-video-reviews`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (res.ok) {
        Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 2000, showConfirmButton: false });
        resetForm();
        fetchItems();
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: data.message || "Failed", confirmButtonColor: "#047857" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#047857" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "Delete this review?",
      text: `"${item.studentName}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/student-video-reviews/${item._id}`, { method: "DELETE", headers: authHeaders() });
          if (res.ok) {
            Swal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
            fetchItems();
          }
        } catch {
          Swal.fire({ icon: "error", title: "Failed to delete", confirmButtonColor: "#047857" });
        }
      }
    });
  };

  const handleToggleFeatured = async (item) => {
    try {
      const res = await fetch(`${API}/api/student-video-reviews/${item._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });
      if (res.ok) fetchItems();
    } catch {}
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`${API}/api/student-video-reviews/${item._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchItems();
    } catch {}
  };

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Student Video Reviews</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5">
          <FaPlus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Order</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Video</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Student</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Program</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Featured</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-400">No student reviews yet. Click "Add Review" to create one.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                    <td className="px-4 py-3 text-neutral-600">{item.order}</td>
                    <td className="px-4 py-3">
                      <img
                        src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                        alt={item.studentName}
                        className="h-12 w-20 rounded object-cover"
                        onError={(e) => { e.target.src = `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`; }}
                      />
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-neutral-800">{item.studentName}</td>
                    <td className="px-4 py-3 text-neutral-500">{item.program || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`rounded-full p-1 transition-colors ${
                          item.isFeatured ? "text-amber-400 hover:text-amber-500" : "text-neutral-300 hover:text-amber-400"
                        }`}
                        title={item.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <FaStar className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          item.status === "published"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        {item.status === "published" ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                          title="Watch on YouTube"
                        >
                          <FaExternalLinkAlt className="h-4 w-4" />
                        </a>
                        <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                          <RiDeleteBin5Line className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                {editing ? "Edit Student Review" : "Add Student Review"}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Student Name *</label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="Enter student name"
                  className="input-base"
                  maxLength={100}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">YouTube URL *</label>
                <input
                  type="url"
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-base"
                  required
                />
                <p className="mt-1 text-xs text-neutral-400">Paste a YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...)</p>
              </div>

              {videoPreview && (
                <div className="overflow-hidden rounded-lg border border-neutral-200">
                  <iframe
                    src={videoPreview}
                    className="h-48 w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Caption / Quote (optional)</label>
                <textarea
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="A short quote from the student..."
                  className="input-base resize-none"
                  rows={2}
                  maxLength={300}
                />
                <p className="mt-1 text-xs text-neutral-400">{form.caption.length}/300</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Program / Class (optional)</label>
                <input
                  type="text"
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  placeholder="e.g. Hifz, Alim, Qira'at"
                  className="input-base"
                  maxLength={100}
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="input-base w-24"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="checkbox-sm checkbox border-neutral-300 text-amber-400"
                    id="isFeatured"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-neutral-700">Featured</label>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-base"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="modal-action gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary px-5 py-2.5">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5">
                  {submitting ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={resetForm}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default ManageStudentReviews;
