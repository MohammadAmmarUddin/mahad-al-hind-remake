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
    <footer className="bg-gradient-to-br from-white via-lime-50 to-emerald-100 mt-32 px-6 py-12 text-gray-800 font-medium overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & About */}
        <motion.div
          custom={0.1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-4 text-center md:text-left"
        >
          <img src={logo} className="w-20 mx-auto md:mx-0" alt="Logo" />
          <h3 className="text-lg font-bold">Mahadul Qira'at Al Hind</h3>
          <p className="text-sm text-gray-600">Providing Knowledge Since 2022</p>
        </motion.div>

        {/* Services */}
        <motion.div
          custom={0.2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-3 text-center md:text-left"
        >
          <h4 className="text-xl font-semibold text-primary">Services</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><Link to="#" className="hover:text-primary">Quran Course</Link></li>
            <li><Link to="#" className="hover:text-primary">Maqamat</Link></li>
            <li><Link to="#" className="hover:text-primary">Rewayat</Link></li>
            <li><Link to="#" className="hover:text-primary">Higher Qira'at Course</Link></li>
          </ul>
        </motion.div>

        {/* Academy */}
        <motion.div
          custom={0.3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-3 text-center md:text-left"
        >
          <h4 className="text-xl font-semibold text-primary">Our Academy</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><Link to="#" className="hover:text-primary">About Us</Link></li>
            <li><Link to="#" className="hover:text-primary">Contact</Link></li>
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
          <h4 className="text-xl font-semibold text-primary">Stay Connected</h4>
          <p className="text-sm text-gray-600">
            Follow us on social media and subscribe for updates.
          </p>
          <div className="flex justify-center md:justify-start gap-5 text-2xl text-primary">
            <Link to="https://t.me/+919365262648" target="_blank"><FaTelegramPlane /></Link>
            <Link to="https://api.whatsapp.com/send?phone=919365262648" target="_blank"><FaWhatsapp /></Link>
            <Link to="https://www.facebook.com/profile.php?id=61552346161606" target="_blank"><FaFacebookF /></Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <input
              type="email"
              placeholder="Your Email"
              className="input input-bordered bg-white text-gray-700 w-full sm:w-auto flex-grow"
            />
            <button className="btn bg-primary text-white hover:bg-emerald-600 transition-all rounded-md">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center pt-10 mt-10 border-t border-gray-300 text-sm text-gray-600"
      >
        © {new Date().getFullYear()} Mahad Al Hind. All rights reserved.
      </motion.div>
    </footer>
  );
};

export default Footer;
