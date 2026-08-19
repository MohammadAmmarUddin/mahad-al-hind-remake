import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { FcGoogle } from "react-icons/fc";
import { FaAngleLeft } from "react-icons/fa6";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from "../firebase/firebase";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { startTransition } from "react";

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
          startTransition(() => navigate("/dashboard/user"));
        } else if (userData.user.role === "admin") {
          startTransition(() => navigate("/dashboard/admin"));
        } else {
          startTransition(() => navigate("/"));
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

      const idToken = await user.getIdToken();

      await googleLogin({ idToken, provider: "firebase" });
    } catch (error) {
      console.error("Google login error:", error);
      setError(DOMPurify.sanitize(error.message || "Google login failed. Please try again."));
    }
  };

  return (
    <div className="py-10 sm:py-16 lg:py-20">
      <div className="container-main mb-6 sm:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md active:scale-95"
        >
          <FaAngleLeft className="h-4 w-4" />
          Home
        </Link>
      </div>

      <h2 className="mb-6 sm:mb-8 text-center font-heading text-display-sm font-bold text-neutral-900">
        Login
      </h2>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-base mx-auto max-w-sm p-5 sm:p-8"
      >
        {(error || loginError) && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
            <p
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(error || loginError),
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              required
            />
            <Link to="/forgetPassword" className="mt-2 block text-xs font-medium text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={`btn-primary mt-6 w-full py-3 ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-5 text-center text-body-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign up
          </Link>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-neutral-400">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="btn-secondary w-full py-3"
          disabled={isLoading}
        >
          <FcGoogle className="text-xl" />
          <span>{isLoading ? "Logging in with Google..." : "Login with Google"}</span>
        </button>
      </motion.form>
    </div>
  );
};

export default Login;
