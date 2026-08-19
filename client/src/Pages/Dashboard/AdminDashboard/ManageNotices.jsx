import { useState, useEffect, useCallback, useRef } from "react";
import { FaPlus, FaEdit, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import Swal from "sweetalert2";
import JoditEditor from "jodit-react";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";
import { uploadFilesToBackend, validateFile, DEFAULT_ALLOWED_DOCUMENT_TYPES } from "../../../utils/uploadMedia";

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const debounceRef = useRef(null);
  const editor = useRef(null);
  const perPage = 15;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "general", isPinned: false, postedBy: "Administration", attachmentUrl: "", attachmentName: "" });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 500 });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterCategory !== "all") params.append("category", filterCategory);
      const res = await fetch(`${API}/api/notices?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [debouncedSearch, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/notice-categories`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const filteredNotices = notices.filter((n) => {
    if (filterCategory !== "all" && n.category !== filterCategory) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredNotices.length / perPage);
  const paginatedNotices = filteredNotices.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setForm({ title: "", excerpt: "", content: "", category: "general", isPinned: false, postedBy: "Administration", attachmentUrl: "", attachmentName: "" });
    setAttachmentFile(null);
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = async (notice) => {
    setEditing(notice);
    setForm({
      title: notice.title, excerpt: notice.excerpt, content: notice.content,
      category: notice.category, isPinned: notice.isPinned,
      postedBy: notice.postedBy || "Administration",
      attachmentUrl: notice.attachmentUrl || "", attachmentName: notice.attachmentName || "",
    });
    setShowForm(true);
  };

  const handleAttachmentChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      validateFile(f, { allowedTypes: DEFAULT_ALLOWED_DOCUMENT_TYPES, maxSize: 20 * 1024 * 1024 });
      setUploadingAttachment(true);
      const result = await uploadFilesToBackend({ files: f, folder: "notices/attachments", resourceType: "raw" });
      setForm((prev) => ({
        ...prev,
        attachmentUrl: result.url || result.secureUrl || "",
        attachmentName: f.name,
      }));
      Swal.fire({ icon: "success", title: "Attachment uploaded!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: err.message, confirmButtonColor: "#047857" });
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      Swal.fire({ icon: "error", title: "Title, excerpt, and content are required", confirmButtonColor: "#047857" });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `${API}/api/notices/${editing._id}` : `${API}/api/notices`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (res.ok) {
        Swal.fire({ icon: "success", title: editing ? "Notice updated!" : "Notice created!", timer: 2000, showConfirmButton: false });
        resetForm();
        fetchNotices();
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: data.message || "Failed", confirmButtonColor: "#047857" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#047857" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = (notice) => {
    Swal.fire({
      title: "Delete this notice?",
      text: `"${notice.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/notices/${notice._id}`, { method: "DELETE", headers: authHeaders() });
          if (res.ok) {
            Swal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
            fetchNotices();
          }
        } catch { Swal.fire({ icon: "error", title: "Failed to delete", confirmButtonColor: "#047857" }); }
      }
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Manage Notices</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5"><FaPlus className="h-4 w-4" /> Post Notice</button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search notices..." className="input-base pl-10" />
        </div>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="input-base w-auto">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Title</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Category</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Pinned</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Date</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : paginatedNotices.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No notices found.</td></tr>
              ) : paginatedNotices.map((notice) => (
                <tr key={notice._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-neutral-800">{notice.title}</p>
                    <p className="truncate text-xs text-neutral-400">{notice.excerpt}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700">{notice.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    {notice.isPinned ? <span className="text-amber-500 text-xs font-medium">Pinned</span> : <span className="text-neutral-300 text-xs">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{formatDate(notice.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(notice)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit"><FaEdit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(notice)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" title="Delete"><RiDeleteBin5Line className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40">
            <FaChevronLeft className="h-3 w-3" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? "bg-primary-600 text-white shadow-sm" : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40">
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">{editing ? "Edit Notice" : "Post Notice"}</h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"><RxCross2 className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notice title" className="input-base" maxLength={200} autoFocus required />
                <p className="mt-1 text-xs text-neutral-400">{form.title.length}/200</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Short Description *</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary shown on notice cards" className="input-base" rows={2} maxLength={500} required />
                <p className="mt-1 text-xs text-neutral-400">{form.excerpt.length}/500</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full Content *</label>
                <div className="custom-class -z-50 no-tailwind custom-ul custom-ol">
                  <JoditEditor ref={editor} value={form.content} onChange={(newContent) => setForm({ ...form, content: newContent })} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category *</label>
                  {showNewCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name"
                        className="input-base flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newCategoryName.trim()) return;
                          try {
                            const res = await fetch(`${API}/api/notice-categories`, {
                              method: "POST",
                              headers: authHeaders(),
                              body: JSON.stringify({ name: newCategoryName.trim() }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCategories((prev) => [...prev, data]);
                              setForm((prev) => ({ ...prev, category: data.slug }));
                              setNewCategoryName("");
                              setShowNewCategory(false);
                              Swal.fire({ icon: "success", title: "Category created!", timer: 1500, showConfirmButton: false });
                            } else {
                              const err = await res.json();
                              Swal.fire({ icon: "error", title: err.message || "Failed", confirmButtonColor: "#047857" });
                            }
                          } catch {
                            Swal.fire({ icon: "error", title: "Failed to create category", confirmButtonColor: "#047857" });
                          }
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={form.category}
                        onChange={(e) => {
                          if (e.target.value === "__add_new__") {
                            setShowNewCategory(true);
                          } else {
                            setForm({ ...form, category: e.target.value });
                          }
                        }}
                        className="input-base flex-1"
                      >
                        {categories.length > 0 ? (
                          categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)
                        ) : (
                          <>
                            <option value="general">General</option>
                            <option value="exam">Exam</option>
                            <option value="admission">Admission</option>
                            <option value="holiday">Holiday</option>
                            <option value="result">Result</option>
                          </>
                        )}
                        <option value="__add_new__">+ Add new category</option>
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Posted By</label>
                  <input type="text" value={form.postedBy} onChange={(e) => setForm({ ...form, postedBy: e.target.value })} className="input-base" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="checkbox-sm checkbox border-neutral-300 text-primary-600" id="noticePinned" />
                <label htmlFor="noticePinned" className="text-sm font-medium text-neutral-700">Pin to top</label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Attachment (optional)</label>
                {form.attachmentUrl ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <FiDownload className="h-4 w-4 text-emerald-600" />
                    <span className="flex-1 truncate text-sm text-emerald-700">{form.attachmentName || "Attachment"}</span>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, attachmentUrl: "", attachmentName: "" }))} className="text-red-500 hover:text-red-700"><RxCross2 className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleAttachmentChange} className="file-input file-input-bordered w-full" disabled={uploadingAttachment} />
                )}
                {uploadingAttachment && <p className="mt-1 text-xs text-neutral-400">Uploading attachment...</p>}
              </div>

              <div className="modal-action gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary px-5 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting || uploadingAttachment} className="btn-primary px-5 py-2.5">
                  {submitting ? "Saving..." : editing ? "Update Notice" : "Post Notice"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={resetForm}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

export default ManageNotices;
