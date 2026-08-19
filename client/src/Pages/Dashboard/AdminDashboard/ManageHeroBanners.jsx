import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaEdit, FaImage } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";
import { uploadFilesToBackend, validateFile, DEFAULT_ALLOWED_IMAGE_TYPES } from "../../../utils/uploadMedia";

const ManageHeroBanners = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ imageUrl: "", publicId: "", alt: "", link: "", isActive: true, order: 0 });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/hero-banners`, { headers: authHeaders() });
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
    setForm({ imageUrl: "", publicId: "", alt: "", link: "", isActive: true, order: 0 });
    setFile(null);
    setPreview("");
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ imageUrl: item.imageUrl, publicId: item.publicId || "", alt: item.alt || "", link: item.link || "", isActive: item.isActive, order: item.order || 0 });
    setPreview(item.imageUrl);
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      validateFile(f, { allowedTypes: DEFAULT_ALLOWED_IMAGE_TYPES, maxSize: 10 * 1024 * 1024 });
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } catch (err) {
      Swal.fire({ icon: "error", title: err.message, confirmButtonColor: "#047857" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = form.imageUrl;
    let publicId = form.publicId;

    if (file) {
      setUploading(true);
      try {
        const result = await uploadFilesToBackend({
          files: file,
          folder: "hero-banners",
          resourceType: "image",
          onProgress: setUploadProgress,
        });
        imageUrl = result.url || result.secureUrl || result.image || "";
        publicId = result.publicId || result.public_id || "";
      } catch (err) {
        setUploading(false);
        Swal.fire({ icon: "error", title: "Upload failed", text: err.message, confirmButtonColor: "#047857" });
        return;
      }
      setUploading(false);
    }

    if (!imageUrl) {
      Swal.fire({ icon: "error", title: "Please select an image", confirmButtonColor: "#047857" });
      return;
    }

    const payload = { ...form, imageUrl, publicId };

    try {
      const url = editing ? `${API}/api/hero-banners/${editing._id}` : `${API}/api/hero-banners`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
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
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete this banner?",
      text: "The image will be removed from Cloudinary.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/hero-banners/${id}`, { method: "DELETE", headers: authHeaders() });
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
      const res = await fetch(`${API}/api/hero-banners/${item._id}`, {
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
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Manage Hero Banners</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5">
          <FaPlus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="py-12 text-center text-neutral-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card-base py-12 text-center">
          <FaImage className="mx-auto mb-3 text-4xl text-neutral-300" />
          <p className="text-neutral-500">No hero banners yet. Click "Add Banner" to upload one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card-base overflow-hidden">
              <div className="relative aspect-video">
                <img src={item.imageUrl} alt={item.alt || "Hero banner"} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 flex gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {item.isActive ? "Active" : "Hidden"}
                  </span>
                  <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
                    Order: {item.order}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-800">{item.alt || "No description"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => handleToggleActive(item)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${item.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                    {item.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"><FaEdit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(item._id)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"><RiDeleteBin5Line className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">{editing ? "Edit Banner" : "Add Banner"}</h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"><RxCross2 className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Image *</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
                {preview && <img src={preview} alt="Preview" className="mt-3 h-40 w-full rounded-xl object-cover" />}
                {uploading && (
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Alt Text</label>
                <input type="text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Describe the image" className="input-base" maxLength={200} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Link (optional)</label>
                <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." className="input-base" />
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input-base w-24" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="checkbox-sm checkbox border-neutral-300 text-primary-600" id="heroActive" />
                  <label htmlFor="heroActive" className="text-sm font-medium text-neutral-700">Active</label>
                </div>
              </div>

              <div className="modal-action gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary px-5 py-2.5">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary px-5 py-2.5">{uploading ? "Uploading..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={resetForm}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

export default ManageHeroBanners;
