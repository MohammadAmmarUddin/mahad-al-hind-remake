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

const ManageCareers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);
  const editor = useRef(null);
  const perPage = 15;

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    deadline: "",
    description: "",
    location: "",
    employmentType: "full-time",
    salary: "",
    attachmentUrl: "",
    attachmentName: "",
    isVisible: true,
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 500 });
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await fetch(`${API}/api/careers?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCareers(data.careers || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [debouncedSearch]);

  useEffect(() => { fetchCareers(); }, [fetchCareers]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const totalPages = Math.ceil(careers.length / perPage);
  const paginatedCareers = careers.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetForm = () => {
    setForm({
      title: "",
      department: "",
      deadline: "",
      description: "",
      location: "",
      employmentType: "full-time",
      salary: "",
      attachmentUrl: "",
      attachmentName: "",
      isVisible: true,
    });
    setAttachmentFile(null);
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = async (career) => {
    setEditing(career);
    setForm({
      title: career.title || "",
      department: career.department || "",
      deadline: career.deadline ? new Date(career.deadline).toISOString().split("T")[0] : "",
      description: career.description || "",
      location: career.location || "",
      employmentType: career.employmentType || "full-time",
      salary: career.salary || "",
      attachmentUrl: career.attachmentUrl || "",
      attachmentName: career.attachmentName || "",
      isVisible: career.isVisible !== undefined ? career.isVisible : true,
    });
    setShowForm(true);
  };

  const handleAttachmentChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      validateFile(f, { allowedTypes: DEFAULT_ALLOWED_DOCUMENT_TYPES, maxSize: 20 * 1024 * 1024 });
      setUploadingAttachment(true);
      const result = await uploadFilesToBackend({ files: f, folder: "careers/attachments", resourceType: "raw" });
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
    if (!form.title.trim() || !form.department.trim() || !form.description.trim()) {
      Swal.fire({ icon: "error", title: "Title, department, and description are required", confirmButtonColor: "#047857" });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `${API}/api/careers/${editing._id}` : `${API}/api/careers`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) });
      if (res.ok) {
        Swal.fire({ icon: "success", title: editing ? "Career updated!" : "Career created!", timer: 2000, showConfirmButton: false });
        resetForm();
        fetchCareers();
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: data.message || "Failed", confirmButtonColor: "#047857" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#047857" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = (career) => {
    Swal.fire({
      title: "Delete this career?",
      text: `"${career.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/careers/${career._id}`, { method: "DELETE", headers: authHeaders() });
          if (res.ok) {
            Swal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
            fetchCareers();
          }
        } catch { Swal.fire({ icon: "error", title: "Failed to delete", confirmButtonColor: "#047857" }); }
      }
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">Manage Careers</h1>
        <button onClick={openCreate} className="btn-primary gap-2 px-5 py-2.5"><FaPlus className="h-4 w-4" /> Post Career</button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search careers..." className="input-base pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Title</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Department</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Deadline</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Published</th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">Loading...</td></tr>
              ) : paginatedCareers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-neutral-400">No careers found.</td></tr>
              ) : paginatedCareers.map((career) => (
                <tr key={career._id} className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-neutral-800">{career.title}</p>
                    <p className="truncate text-xs text-neutral-400">{career.location}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700">{career.department}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{career.deadline ? formatDate(career.deadline) : "—"}</td>
                  <td className="px-4 py-3">
                    {career.isVisible ? <span className="text-emerald-500 text-xs font-medium">Visible</span> : <span className="text-neutral-300 text-xs">Hidden</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(career)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" title="Edit"><FaEdit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(career)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600" title="Delete"><RiDeleteBin5Line className="h-4 w-4" /></button>
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
              <h3 className="font-heading text-lg font-bold text-neutral-900">{editing ? "Edit Career" : "Post Career"}</h3>
              <button onClick={resetForm} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"><RxCross2 className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Career title" className="input-base" maxLength={200} autoFocus required />
                <p className="mt-1 text-xs text-neutral-400">{form.title.length}/200</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Department *</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. IT, Administration" className="input-base" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-base" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. On-site, Remote, Hybrid" className="input-base" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="input-base">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Salary</label>
                <input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. $50,000 - $70,000 or Negotiable" className="input-base" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description *</label>
                <div className="custom-class -z-50 no-tailwind custom-ul custom-ol">
                  <JoditEditor ref={editor} value={form.description} onChange={(newContent) => setForm({ ...form, description: newContent })} />
                </div>
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

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="checkbox-sm checkbox border-neutral-300 text-primary-600" id="careerVisible" />
                <label htmlFor="careerVisible" className="text-sm font-medium text-neutral-700">Visible to public</label>
              </div>

              <div className="modal-action gap-3">
                <button type="button" onClick={resetForm} className="btn-secondary px-5 py-2.5">Cancel</button>
                <button type="submit" disabled={submitting || uploadingAttachment} className="btn-primary px-5 py-2.5">
                  {submitting ? "Saving..." : editing ? "Update Career" : "Post Career"}
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

export default ManageCareers;
