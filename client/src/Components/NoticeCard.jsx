import { motion } from "framer-motion";
import { FiCalendar, FiUser } from "react-icons/fi";
import DOMPurify from "dompurify";

const categoryColors = {
  exam: "bg-red-50 text-red-700 ring-red-600/10",
  admission: "bg-blue-50 text-blue-700 ring-blue-600/10",
  holiday: "bg-amber-50 text-amber-700 ring-amber-600/10",
  result: "bg-purple-50 text-purple-700 ring-purple-600/10",
  general: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
};

const isNewNotice = (dateStr) => {
  const posted = new Date(dateStr);
  const now = new Date();
  const diffMs = now - posted;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 5;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const NoticeCard = ({ notice, onClick }) => {
  const isNew = isNewNotice(notice.createdAt);
  const colorClass = categoryColors[notice.category] || categoryColors.general;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px -4px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Notice: ${notice.title}`}
      className={`group cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-colors duration-200 hover:border-emerald-200 ${
        notice.isPinned
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : "border-emerald-100"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
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

        {isNew && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-500/10">
            New
          </span>
        )}
      </div>

      <h3 className="mb-2 text-base font-semibold text-slate-800 transition-colors group-hover:text-emerald-700 line-clamp-2">
        {notice.title}
      </h3>

      <p
        className="mb-4 text-sm leading-relaxed text-slate-600 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notice.excerpt) }}
      />

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <FiCalendar className="h-3.5 w-3.5" />
          {formatDate(notice.createdAt)}
        </span>
        {notice.postedBy && (
          <span className="flex items-center gap-1.5">
            <FiUser className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{notice.postedBy}</span>
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default NoticeCard;
