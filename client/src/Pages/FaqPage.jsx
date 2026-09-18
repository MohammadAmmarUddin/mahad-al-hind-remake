import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import { API } from "../config/api";
import DOMPurify from "dompurify";

const FaqItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white transition-all duration-200 hover:border-emerald-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-slate-800">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400"
        >
          <FiChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">
              <div
                className="text-sm leading-relaxed text-slate-600"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.answer) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
    fetch(`${API}/api/faqs/public${params}`)
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || []);
        if (data.categories) {
          setCategories([
            { key: "all", label: "All" },
            ...data.categories.map((c) => ({
              key: c,
              label: c.charAt(0).toUpperCase() + c.slice(1),
            })),
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-12 sm:py-16">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              <FiHelpCircle className="text-base" />
              FAQ
            </div>
            <h1 className="mt-3 text-2xl font-bold text-emerald-800 sm:text-3xl md:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 md:text-base">
              Find answers to common questions about our courses, admission process, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto w-11/12 max-w-3xl">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat.key); setOpenId(null); }}
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

          {/* FAQ Items */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-emerald-100 p-5">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">No FAQs found</p>
              <p className="mt-2 text-sm text-slate-600">
                No frequently asked questions have been added yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FaqItem
                  key={faq._id}
                  item={faq}
                  isOpen={openId === faq._id}
                  onToggle={() => toggleFaq(faq._id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
