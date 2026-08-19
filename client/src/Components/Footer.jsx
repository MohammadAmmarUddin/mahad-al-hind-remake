import { Link } from "react-router-dom";
import logo from "/logo.png";
import { FaTelegramPlane, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Footer = () => {
  return (
    <footer className="mt-12 sm:mt-16 lg:mt-24 overflow-hidden bg-gradient-to-br from-white via-primary-50/40 to-primary-100/30 px-4 sm:px-6 pt-12 sm:pt-16 pb-8 font-medium text-neutral-800">
      <div className="container-main grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
        {/* Logo & About */}
        <motion.div
          custom={0.1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-4 text-center md:text-left"
        >
          <img src={logo} className="mx-auto h-16 w-auto md:mx-0" alt="Logo" />
          <h3 className="font-heading text-lg font-bold text-neutral-900">Mahadul Qira'at Al Hind</h3>
          <p className="text-sm leading-relaxed text-neutral-500">Providing Knowledge Since 2022</p>
        </motion.div>

        {/* Services */}
        <motion.div
          custom={0.2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-4 text-center md:text-left"
        >
          <h4 className="font-heading text-base font-semibold text-primary-700">Services</h4>
          <ul className="space-y-2.5 text-sm">
            {["Quran Course", "Maqamat", "Rewayat", "Higher Qira'at Course"].map((item) => (
              <li key={item}>
                <Link to="#" className="text-neutral-500 transition-colors duration-200 hover:text-primary-600">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Academy */}
        <motion.div
          custom={0.3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-4 text-center md:text-left"
        >
          <h4 className="font-heading text-base font-semibold text-primary-700">Our Academy</h4>
          <ul className="space-y-2.5 text-sm">
            {["About Us", "Contact"].map((item) => (
              <li key={item}>
                <Link to="#" className="text-neutral-500 transition-colors duration-200 hover:text-primary-600">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Social & Subscribe */}
        <motion.div
          custom={0.4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-4 text-center md:text-left"
        >
          <h4 className="font-heading text-base font-semibold text-primary-700">Stay Connected</h4>
          <p className="text-sm leading-relaxed text-neutral-500">
            Follow us on social media and subscribe for updates.
          </p>
          <div className="flex justify-center gap-3 md:justify-start">
            {[
              { icon: FaTelegramPlane, href: "https://t.me/+919365262648", label: "Telegram" },
              { icon: FaWhatsapp, href: "https://api.whatsapp.com/send?phone=919365262648", label: "WhatsApp" },
              { icon: FaFacebookF, href: "https://www.facebook.com/profile.php?id=61552346161606", label: "Facebook" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 shadow-sm transition-all duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Your Email"
              className="input-base flex-1"
            />
            <button className="btn-primary">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-400"
      >
        &copy; {new Date().getFullYear()} Mahad Al Hind. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
