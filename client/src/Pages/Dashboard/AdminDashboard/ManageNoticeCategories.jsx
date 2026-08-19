import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaTag } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";

const CATEGORY_COLORS = [
  "#059669", "#dc2626", "#2563eb", "#d97706", "#7c3aed",
  "#0891b2", "#be123c", "#65a30d", "#9333ea", "#ea580c",
];

const ManageNoticeCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", color: "#059669", description: "", isActive: true, order: 0 });
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
      const res = await fetch(`${API}/api/notice-categories`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => { setForm({ name: "", color: "#059669", description: "", isActive: true, order: 0 }); setEditing(null); setShowForm(false); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, color: item.color || "#059669", description: item.description || "", isActive: item.isActive, order: item.order || 0 }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { Swal.fire({ icon: "error", title: "Name is required", confirmButtonColor: "#047857" }); return; }
    setSubmitting(true);
    try {
      const url = editing ? `${API}/api/notice-categories/${editing._id}` : `${API}/api/notice-categories`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (res.ok) {
        Swal.fire({ icon: "success", title: editing ? "Updated!" : "Created!", timer: 2000, showConfirmButton: false });
        resetForm(); fetchItems();
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: data.message || "Failed", confirmButtonColor: "#047857" });
      }
    } catch { Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#047857" }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: `Delete "${item.name}"?`,
      text: "Notices using this category will not be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/notice-categories/${item._id}`, { method: "DELETE", headers: authHeaders() });
          const data = await res.json();
          if (res.ok) {
            Swal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
            fetchItems();
          } else {
            Swal.fire({ icon: "error", title: data.message || "Failed", confirmButtonColor: "#047857" });
          }
        } catch { Swal.fire({ icon: "error", title: "Failed to delete", confirmButtonColor: "#047857" }); }
      }
    });
  };

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Manage Notice Categories</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5"><FaPlus className="h-4 w-4" /> Add Category</button>
      </div>

      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Color</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Name</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Description</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Status</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No categories yet. Click "Add Category" to create one.</td></tr>
              ) : items.map((item) => (
                <tr key={item._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                  <td className="px-4 py-3"><span className="inline-block h-5 w-5 rounded-full" style={{ backgroundColor: item.color }} /></td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{item.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-neutral-500">{item.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"><FaEdit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"><RiDeleteBin5Line className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">{editing ? "Edit Category" : "Add Category"}</h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"><RxCross2 className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Exam, Holiday..." className="input-base" maxLength={50} autoFocus required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-neutral-400" : ""}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description (optional)</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="input-base" maxLength={200} />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-base w-24" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="checkbox-sm checkbox border-neutral-300 text-primary-600" id="catActive" />
                  <label htmlFor="catActive" className="text-sm font-medium text-neutral-700">Active</label>
                </div>
              </div>
              <div className="modal-action gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary px-5 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5">{submitting ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={resetForm}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

export default ManageNoticeCategories;
