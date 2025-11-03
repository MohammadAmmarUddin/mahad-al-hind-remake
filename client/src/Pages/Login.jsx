import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { FcGoogle } from "react-icons/fc";
import { FaAngleLeft } from "react-icons/fa6";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from "../firebase/firebase";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, error: loginError, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail || !sanitizedPassword) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const userData = await login(sanitizedEmail, sanitizedPassword);
      if (userData) {
        if (userData.user.role === "student") {
          navigate("/dashboard/user");
        } else if (userData.user.role === "admin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(DOMPurify.sanitize(err.message || "Login failed. Please try again."));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) throw new Error("Google login failed: Email is missing");

      const randomPhone = Math.floor(Math.random() * 9000000000) + 1000000000;

      const userData = {
        firstname: user.displayName?.split(" ")[0] || "Unknown",
        lastname: user.displayName?.split(" ")[1] || "Unknown",
        email: user.email,
        phone: user.phoneNumber || randomPhone.toString(),
        role: "user",
        prevRole: "user",
        img: user.photoURL || "",
      };

      await googleLogin(userData);
    } catch (error) {
      console.error("Google login error:", error);
      setError(DOMPurify.sanitize(error.message || "Google login failed. Please try again."));
    }
  };

  return (
    <div className="mt-20">
      <Link
        to={"/"}
        className="flex items-center gap-2 font-semibold lg:w-3/4 md:11/12 mx-auto text-xl pb-10"
      >
        <FaAngleLeft />
        <p>Go back to home</p>
      </Link>

      <h2 className="text-center text-4xl font-semibold text-primary pb-5">LOGIN</h2>

      <motion.form
        onSubmit={handleSubmit}
        whileHover={{
          backgroundColor: "rgba(20, 184, 166, 0.1)", // teal-500 background on hover
        }}
        transition={{ duration: 0.3 }}
        className="md:w-1/4 w-11/12 mx-auto border rounded-md p-10 bg-white shadow-md"
      >
        {(error || loginError) && (
          <p
            className="text-red-500 mb-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(error || loginError),
            }}
          />
        )}

        <div className="form-control">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
            required
          />
        </div>

        <div className="form-control mt-4">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
            required
          />
          <label className="mt-4">
            <Link to="/forgetPassword">Forgot password?</Link>
          </label>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          whileHover={{ backgroundColor: "#059669", color: "#ffffff" }} // Emerald hover
          className={`mt-6 py-3 rounded-lg w-full font-semibold transition-all duration-300 ${isLoading
              ? "bg-emerald-300 cursor-not-allowed text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
            }`}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </motion.button>


        <p className="text-center pt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-[#0a4a6f] hover:underline transition-all"
          >
            Sign up
          </Link>
        </p>

        <motion.button
          onClick={handleGoogleLogin}
          type="button"
          whileTap={{ scale: 0.97 }}
          whileHover={{
            backgroundColor: "#0a4a6f",
            color: "#ffffff",
          }}
          className="border border-primary py-3 rounded-md w-full mt-4 flex items-center justify-center transition-all"
          disabled={isLoading}
        >
          <FcGoogle className="text-3xl mr-3" />
          <span>{isLoading ? "Logging in with Google..." : "Login with Google"}</span>
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Login;
