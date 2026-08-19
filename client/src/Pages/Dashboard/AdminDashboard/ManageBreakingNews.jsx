import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaGripVertical } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";

const ManageBreakingNews = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ text: "", link: "", isActive: true, order: 0 });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/breaking-news`, { headers: authHeaders() });
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

  const resetForm = () => {
    setForm({ text: "", link: "", isActive: true, order: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ text: item.text, link: item.link || "", isActive: item.isActive, order: item.order || 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      Swal.fire({ icon: "error", title: "Text is required", confirmButtonColor: "#047857" });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `${API}/api/breaking-news/${editing._id}` : `${API}/api/breaking-news`;
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
    } catch (err) {
      Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#047857" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete this item?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/breaking-news/${id}`, { method: "DELETE", headers: authHeaders() });
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

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`${API}/api/breaking-news/${item._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) fetchItems();
    } catch {}
  };

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Manage Breaking News</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5">
          <FaPlus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Order</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Text</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Link</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No breaking news items yet. Click "Add Item" to create one.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                    <td className="px-4 py-3 text-neutral-600">{item.order}</td>
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-neutral-800">{item.text}</td>
                    <td className="px-4 py-3 text-neutral-500">{item.link || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" title="Delete">
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
          <div className="modal-box max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                {editing ? "Edit Breaking News" : "Add Breaking News"}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Text *</label>
                <input
                  type="text"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Enter breaking news text"
                  className="input-base"
                  maxLength={300}
                  autoFocus
                  required
                />
                <p className="mt-1 text-xs text-neutral-400">{form.text.length}/300</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Link (optional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="input-base"
                />
              </div>

              <div className="flex items-center gap-6">
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
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="checkbox-sm checkbox border-neutral-300 text-primary-600"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">Active</label>
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

export default ManageBreakingNews;
