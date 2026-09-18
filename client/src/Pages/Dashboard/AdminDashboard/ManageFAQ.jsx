import { useState, useEffect, useCallback, useRef } from "react";
import { FaPlus, FaEdit, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import Swal from "sweetalert2";
import JoditEditor from "jodit-react";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";

const ManageFAQ = () => {
  const [faqs, setFaqs] = useState([]);
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
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "general",
    order: 0,
    isVisible: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const categories = ["general", "admission", "exams", "fees", "rules", "hostel", "other"];

  const authHeaders = () => {
    const token = getStoredAuthToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" };
  };

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 500 });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterCategory !== "all") params.append("category", filterCategory);
      const res = await fetch(`${API}/api/faqs?${params}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterCategory]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const filteredFaqs = faqs.filter((f) => {
    if (filterCategory !== "all" && f.category !== filterCategory) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredFaqs.length / perPage);
  const paginatedFaqs = filteredFaqs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const resetForm = () => {
    setForm({
      question: "",
      answer: "",
      category: "general",
      order: 0,
      isVisible: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "general",
      order: faq.order || 0,
      isVisible: faq.isVisible !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      Swal.fire({
        icon: "error",
        title: "Question and answer are required",
        confirmButtonColor: "#047857",
      });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing
        ? `${API}/api/faqs/${editing._id}`
        : `${API}/api/faqs`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: editing ? "FAQ updated!" : "FAQ created!",
          timer: 2000,
          showConfirmButton: false,
        });
        resetForm();
        fetchFaqs();
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: data.message || "Failed",
          confirmButtonColor: "#047857",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        confirmButtonColor: "#047857",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (faq) => {
    Swal.fire({
      title: "Delete this FAQ?",
      text: `"${faq.question}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/faqs/${faq._id}`, {
            method: "DELETE",
            headers: authHeaders(),
          });
          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              timer: 2000,
              showConfirmButton: false,
            });
            fetchFaqs();
          }
        } catch {
          Swal.fire({
            icon: "error",
            title: "Failed to delete",
            confirmButtonColor: "#047857",
          });
        }
      }
    });
  };

  return (
    <div className="p-4 pt-6 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-display-sm font-bold text-neutral-900">
          Manage FAQs
        </h1>
        <button
          onClick={openCreate}
          className="btn-primary gap-2 px-5 py-2.5"
        >
          <FaPlus className="h-4 w-4" /> Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs..."
            className="input-base pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="input-base w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">
                  Question
                </th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">
                  Category
                </th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">
                  Order
                </th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">
                  Published
                </th>
                <th className="px-4 py-3 text-meta font-semibold text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-neutral-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedFaqs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-neutral-400"
                  >
                    No FAQs found.
                  </td>
                </tr>
              ) : (
                paginatedFaqs.map((faq) => (
                  <tr
                    key={faq._id}
                    className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-neutral-800">
                        {faq.question}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700">
                        {faq.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                      {faq.order}
                    </td>
                    <td className="px-4 py-3">
                      {faq.isVisible ? (
                        <span className="text-emerald-600 text-xs font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(faq)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft className="h-3 w-3" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === i + 1
                  ? "bg-primary-600 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                {editing ? "Edit FAQ" : "Add FAQ"}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Question *
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  placeholder="Enter the question"
                  className="input-base"
                  maxLength={300}
                  autoFocus
                  required
                />
                <p className="mt-1 text-xs text-neutral-400">
                  {form.question.length}/300
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Answer *
                </label>
                <div className="custom-class -z-50 no-tailwind custom-ul custom-ol">
                  <JoditEditor
                    ref={editor}
                    value={form.answer}
                    onChange={(newContent) =>
                      setForm({ ...form, answer: newContent })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Category
                  </label>
                  {showNewCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category"
                        className="input-base flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCategoryName.trim()) return;
                          setForm((prev) => ({
                            ...prev,
                            category: newCategoryName.trim().toLowerCase(),
                          }));
                          setNewCategoryName("");
                          setShowNewCategory(false);
                          Swal.fire({
                            icon: "success",
                            title: "Category set!",
                            timer: 1500,
                            showConfirmButton: false,
                          });
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName("");
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select
                      value={form.category}
                      onChange={(e) => {
                        if (e.target.value === "__add_new__") {
                          setShowNewCategory(true);
                        } else {
                          setForm({ ...form, category: e.target.value });
                        }
                      }}
                      className="input-base"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                      <option value="__add_new__">+ Add new category</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-base"
                    min={0}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Visibility
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) =>
                        setForm({ ...form, isVisible: e.target.checked })
                      }
                      className="checkbox-sm checkbox border-neutral-300 text-primary-600"
                      id="faqVisible"
                    />
                    <label
                      htmlFor="faqVisible"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Published
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-action gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2.5"
                >
                  {submitting
                    ? "Saving..."
                    : editing
                    ? "Update FAQ"
                    : "Add FAQ"}
                </button>
              </div>
            </form>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={resetForm}
          >
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default ManageFAQ;
