import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiBriefcase, FiClock, FiArrowLeft, FiDownload } from "react-icons/fi";
import { API } from "../config/api";
import DOMPurify from "dompurify";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CareerDetailPage = () => {
  const { id } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/careers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setCareer(data))
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

  if (error || !career) {
    return (
      <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
        <div className="container-narrow px-4 text-center">
          <p className="text-lg font-semibold text-slate-800">Position not found</p>
          <Link to="/career" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
            &larr; Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  const passed = new Date(career.deadline) < new Date();

  return (
    <div className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
      <div className="container-narrow px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/career" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
            <FiArrowLeft className="h-4 w-4" />
            Back to Careers
          </Link>

          <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {career.department && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  {career.department}
                </span>
              )}
              {career.employmentType && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                  {career.employmentType}
                </span>
              )}
              {passed && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  Application Closed
                </span>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">{career.title}</h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {career.location && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="h-4 w-4" />
                  {career.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <FiClock className="h-4 w-4" />
                Deadline: {formatDate(career.deadline)}
              </span>
              {career.salary && (
                <span className="flex items-center gap-1.5">
                  <FiBriefcase className="h-4 w-4" />
                  {career.salary}
                </span>
              )}
            </div>

            <div className="prose prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(career.description) }} />

            {career.attachmentUrl && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <a
                  href={career.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <FiDownload className="h-4 w-4" />
                  {career.attachmentName || "Download Attachment"}
                </a>
              </div>
            )}

            {!passed && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <Link
                  to="/apply"
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 shadow-sm"
                >
                  Apply Now &rarr;
                </Link>
              </div>
            )}
          </article>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerDetailPage;
