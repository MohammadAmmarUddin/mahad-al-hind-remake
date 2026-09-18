import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FiPhone, FiMail, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteContent } from "../context/SiteContentContext";

const UtilityBar = () => {
  const { content } = useSiteContent();
  const [mobileOpen, setMobileOpen] = useState(false);

  const utilityBar = content?.utilityBar || {};
  const socialLinks = utilityBar.socialLinks || {};
  const contact = utilityBar.contact || {};
  const ctaButtons = utilityBar.ctaButtons || [
    { label: "Notice", path: "/#notice-board", order: 0 },
    { label: "News", path: "/news", order: 1 },
    { label: "Career", path: "/career", order: 2 },
    { label: "FAQ", path: "/faq", order: 3 },
    { label: "Apply Online", path: "/apply", order: 4 },
  ];

  const sortedButtons = [...ctaButtons].sort((a, b) => (a.order || 0) - (b.order || 0));

  const socialItems = [
    { icon: FaFacebookF, href: socialLinks.facebook, label: "Facebook" },
    { icon: FaYoutube, href: socialLinks.youtube, label: "YouTube" },
    { icon: FaLinkedinIn, href: socialLinks.linkedin, label: "LinkedIn" },
    { icon: FaInstagram, href: socialLinks.instagram, label: "Instagram" },
  ].filter((s) => s.href);

  const phone = contact.phone || "+919365262648";
  const email = contact.email || "info@mahad-al-hind.net";

  return (
    <div className="relative z-[51] w-full border-b border-white/10 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white shadow-sm">
      {/* Desktop */}
      <div className="container-main hidden items-center justify-between py-2 text-xs lg:flex">
        {/* Left: Social + Contact */}
        <div className="flex items-center gap-4">
          {socialItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              {socialItems.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Icon className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          <span className="h-3 w-px bg-white/20" />

          <div className="flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 text-white/85 transition-colors hover:text-white"
              >
                <FiPhone className="h-3 w-3" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-white/85 transition-colors hover:text-white"
              >
                <FiMail className="h-3 w-3" />
                <span>{email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: CTA Buttons */}
        <div className="flex items-center gap-0.5">
          {sortedButtons.map((btn) => (
            <Link
              key={btn.path}
              to={btn.path}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-between px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-xs text-white/85"
            >
              <FiPhone className="h-3 w-3" />
              <span>{phone}</span>
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 text-xs text-white/85"
            >
              <FiMail className="h-3 w-3" />
              <span className="max-w-[140px] truncate">{email}</span>
            </a>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-1 text-xs font-medium text-white/85 transition-colors hover:text-white"
          aria-label="Toggle menu"
        >
          Menu
          {mobileOpen ? <FiX className="h-3.5 w-3.5" /> : <FiMenu className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {/* Social */}
              {socialItems.length > 0 && (
                <div className="mb-2 flex items-center gap-2">
                  {socialItems.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}

              {/* Contact */}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/85 transition-colors hover:bg-white/10"
                >
                  <FiPhone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/85 transition-colors hover:bg-white/10"
                >
                  <FiMail className="h-3.5 w-3.5" />
                  {email}
                </a>
              )}

              <span className="block h-px bg-white/10 my-1" />

              {/* CTA Buttons */}
              {sortedButtons.map((btn) => (
                <Link
                  key={btn.path}
                  to={btn.path}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
                >
                  {btn.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UtilityBar;
