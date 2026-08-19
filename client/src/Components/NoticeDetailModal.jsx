import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiCalendar, FiUser } from "react-icons/fi";
import DOMPurify from "dompurify";

const categoryColors = {
  exam: "bg-red-50 text-red-700 ring-red-600/10",
  admission: "bg-blue-50 text-blue-700 ring-blue-600/10",
  holiday: "bg-amber-50 text-amber-700 ring-amber-600/10",
  result: "bg-purple-50 text-purple-700 ring-purple-600/10",
  general: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NoticeDetailModal = ({ notice, onClose }) => {
  if (!notice) return null;

  const colorClass = categoryColors[notice.category] || categoryColors.general;

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Notice: ${notice.title}`}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 p-5 pb-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                        </svg>
                        Pinned
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}
                    >
                      {notice.category?.charAt(0).toUpperCase() + notice.category?.slice(1)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{notice.title}</h2>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close modal"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-4">
              {/* Meta */}
              <div className="mb-5 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="h-4 w-4" />
                  {formatDate(notice.createdAt)}
                </span>
                {notice.postedBy && (
                  <span className="flex items-center gap-1.5">
                    <FiUser className="h-4 w-4" />
                    Posted by {notice.postedBy}
                  </span>
                )}
              </div>

              {/* Body */}
              <div
                className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.content) }}
              />

              {/* Attachment */}
              {notice.attachmentUrl && (
                <div className="mt-6">
                  <a
                    href={notice.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiDownload className="h-4 w-4" />
                    {notice.attachmentName || "Download Notice"}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoticeDetailModal;
