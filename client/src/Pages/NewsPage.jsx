import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiX, FiCalendar, FiUser, FiDownload } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { API } from "../config/api";
import DOMPurify from "dompurify";

const categoryColors = {
  announcement: "bg-blue-50 text-blue-700 ring-blue-600/10",
  event: "bg-purple-50 text-purple-700 ring-purple-600/10",
  academic: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  general: "bg-slate-50 text-slate-700 ring-slate-600/10",
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const NewsCard = ({ item }) => {
  const colorClass = categoryColors[item.category] || categoryColors.general;
  const isNew = (() => {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    return diff / (1000 * 60 * 60 * 24) <= 5;
  })();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {item.isPinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
            Pinned
          </span>
        )}
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
          {item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}
        </span>
        {isNew && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-500/10">
            New
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold text-slate-800 transition-colors group-hover:text-emerald-700 line-clamp-2">
        {item.title}
      </h3>

      <p
        className="mb-4 text-sm leading-relaxed text-slate-600 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.excerpt) }}
      />

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="h-3.5 w-3.5" />
            {formatDate(item.createdAt)}
          </span>
          {item.postedBy && (
            <span className="flex items-center gap-1.5">
              <FiUser className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{item.postedBy}</span>
            </span>
          )}
        </div>

        <Link
          to={`/news/${item._id}`}
          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          Read More
        </Link>
      </div>
    </motion.article>
  );
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append("search", search);
      if (selectedCategory !== "all") params.append("category", selectedCategory);

      const res = await fetch(`${API}/api/news/public?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.notices || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  useEffect(() => {
    fetch(`${API}/api/news/public?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.notices || [];
        const cats = [...new Set(items.map((n) => n.category).filter(Boolean))];
        setCategories([
          { key: "all", label: "All" },
          ...cats.map((c) => ({ key: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
        ]);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              <span className="text-base">&#x1F4F0;</span>
              News
            </div>
            <h1 className="mt-3 text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl">
              Latest News & Updates
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 md:text-base">
              Stay informed with the latest news, events, and updates from Ma'hadul Qira'at Al Hind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto w-11/12 lg:w-3/4">
          {/* Search & Filters */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search news..."
                  className="w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                {searchInput && (
                  <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                Search
              </button>
            </form>

            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setSelectedCategory(cat.key); setPage(1); }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      selectedCategory === cat.key
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-emerald-100 bg-white p-5">
                  <div className="mb-3 h-4 w-20 rounded-full bg-slate-200" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mb-4 h-12 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">No news found</p>
              <p className="mt-2 text-sm text-slate-600">
                {search ? "Try adjusting your search." : "No news articles have been posted yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <NewsCard key={item._id} item={item} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                        page === p ? "bg-emerald-600 text-white shadow-sm" : "border border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-slate-500">
                Showing {news.length} of {total} articles
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
