import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiUser, FiDownload, FiArrowLeft } from "react-icons/fi";
import { API } from "../config/api";
import DOMPurify from "dompurify";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/news/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setNews(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
        <div className="container-narrow px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-48 rounded bg-slate-100" />
            <div className="h-64 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
        <div className="container-narrow px-4 text-center">
          <p className="text-lg font-semibold text-slate-800">News article not found</p>
          <Link to="/news" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
            &larr; Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
      <div className="container-narrow px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/news" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
            <FiArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {news.category && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  {news.category?.charAt(0).toUpperCase() + news.category?.slice(1)}
                </span>
              )}
              {news.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Pinned
                </span>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">{news.title}</h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="h-4 w-4" />
                {formatDate(news.createdAt)}
              </span>
              {news.postedBy && (
                <span className="flex items-center gap-1.5">
                  <FiUser className="h-4 w-4" />
                  {news.postedBy}
                </span>
              )}
            </div>

            <div className="prose prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }} />

            {news.attachmentUrl && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <a
                  href={news.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <FiDownload className="h-4 w-4" />
                  {news.attachmentName || "Download Attachment"}
                </a>
              </div>
            )}
          </article>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
