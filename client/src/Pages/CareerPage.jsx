import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiX, FiMapPin, FiClock, FiBriefcase } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { API } from "../config/api";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isDeadlinePassed = (deadline) => {
  return new Date(deadline) < new Date();
};

const CareerCard = ({ item }) => {
  const passed = isDeadlinePassed(item.deadline);

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
        {item.department && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            {item.department}
          </span>
        )}
        {item.employmentType && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
            {item.employmentType}
          </span>
        )}
        {passed && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
            Expired
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold text-slate-800 transition-colors group-hover:text-emerald-700 line-clamp-2">
        {item.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {item.location && (
          <span className="flex items-center gap-1">
            <FiMapPin className="h-3.5 w-3.5" />
            {item.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FiClock className="h-3.5 w-3.5" />
          Deadline: {formatDate(item.deadline)}
        </span>
        {item.salary && (
          <span className="flex items-center gap-1">
            <FiBriefcase className="h-3.5 w-3.5" />
            {item.salary}
          </span>
        )}
      </div>

      <Link
        to={`/career/${item._id}`}
        className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        View Details &rarr;
      </Link>
    </motion.article>
  );
};

const CareerPage = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append("search", search);

      const res = await fetch(`${API}/api/careers/public?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCareers(data.careers || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCareers(); }, [fetchCareers]);

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
              <FiBriefcase className="text-base" />
              Careers
            </div>
            <h1 className="mt-3 text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl">
              Career Opportunities
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 md:text-base">
              Join our team and be part of a growing educational institution dedicated to Quranic education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto w-11/12 lg:w-3/4">
          {/* Search */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search positions..."
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
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-emerald-100 bg-white p-5">
                  <div className="mb-3 h-4 w-20 rounded-full bg-slate-200" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mb-4 h-8 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : careers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">No positions available</p>
              <p className="mt-2 text-sm text-slate-600">
                {search ? "Try adjusting your search." : "There are no open positions at this time. Check back soon!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {careers.map((item) => (
                  <CareerCard key={item._id} item={item} />
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
                Showing {careers.length} of {total} positions
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CareerPage;
