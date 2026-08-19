import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNotices } from "../hooks/useNotices";
import NoticeCard from "./NoticeCard";
import NoticeSkeleton from "./NoticeSkeleton";
import NoticeDetailModal from "./NoticeDetailModal";
import { useSiteContent } from "../context/SiteContentContext";
import { API } from "../config/api";

const NoticeBoard = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [categories, setCategories] = useState([]);
  const { translate } = useSiteContent();

  useEffect(() => {
    fetch(`${API}/api/notice-categories/public`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCategories([
          { key: "all", label: translate("noticeBoard", "all") || "All", color: null },
          ...list.map((c) => ({ key: c.slug, label: c.name, color: c.color })),
        ]);
      })
      .catch(() => {
        setCategories([
          { key: "all", label: "All", color: null },
          { key: "general", label: "General", color: null },
          { key: "exam", label: "Exam", color: null },
          { key: "admission", label: "Admission", color: null },
          { key: "holiday", label: "Holiday", color: null },
          { key: "result", label: "Result", color: null },
        ]);
      });
  }, [translate]);

  const { data, isLoading, isError } = useNotices({
    page,
    limit: 9,
    category: selectedCategory,
    search,
  });

  const notices = data?.notices || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <section id="notice-board" className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-16 sm:py-20">
      <div className="mx-auto w-11/12 lg:w-3/4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            <span className="text-base">&#x1F4CC;</span>
            {translate("noticeBoard", "badge") || "Notice Board"}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl">
            {translate("noticeBoard", "title") || "Academic Notices & Announcements"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 md:text-base">
            {translate("noticeBoard", "subtitle") || "Stay updated with the latest notices, exam schedules, admission info, and important announcements."}
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={translate("noticeBoard", "searchPlaceholder") || "Search notices..."}
                className="w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                aria-label="Search notices"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 sm:px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <span className="hidden sm:inline">Search</span>
              <FiSearch className="sm:hidden h-4 w-4" />
            </button>
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
                style={
                  selectedCategory === cat.key
                    ? { backgroundColor: cat.color || "#059669", color: "#fff" }
                    : cat.color
                      ? { borderColor: cat.color, color: cat.color, borderWidth: 1 }
                      : {}
                }
                aria-pressed={selectedCategory === cat.key}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <NoticeSkeleton count={6} />
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {translate("noticeBoard", "error") || "Failed to load notices. Please try again later."}
            </p>
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">{translate("noticeBoard", "noNotices") || "No notices found"}</p>
            <p className="mt-2 text-sm text-slate-600">
              {search
                ? (translate("noticeBoard", "noResults") || "Try adjusting your search or filter criteria.")
                : (translate("noticeBoard", "noNoticesSub") || "No notices have been posted yet. Check back soon!")}
            </p>
            {(search || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  clearSearch();
                  setSelectedCategory("all");
                }}
                className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                {translate("noticeBoard", "clearFilters") || "Clear all filters"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onClick={() => setSelectedNotice(notice)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-emerald-200 bg-white px-2.5 sm:px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <FaChevronLeft className="sm:hidden h-3.5 w-3.5" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.totalPages <= 5) return true;
                    if (p === 1 || p === pagination.totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                          page === p
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="rounded-lg border border-emerald-200 bg-white px-2.5 sm:px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Next</span>
                  <FaChevronRight className="sm:hidden h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Result count */}
            <p className="mt-4 text-center text-xs text-slate-500">
              Showing {notices.length} of {pagination.total} notices
            </p>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </section>
  );
};

export default NoticeBoard;
