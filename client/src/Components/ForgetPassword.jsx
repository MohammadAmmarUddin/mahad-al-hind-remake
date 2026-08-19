import axios from "axios";
import { FaAngleLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API } from "../config/api";
import { startTransition } from "react";

const ForgetPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;

    axios
      .post(`${API}/api/user/forgetPassword`, { email }, { withCredential: true })
      .then((res) => {
        Swal.fire({
          position: "top-middle",
          icon: "success",
          title: "Reset Email Sent!",
          showConfirmButton: true,
        });
        if (res.data.status) {
          startTransition(() => navigate("/login"));
        }
      });
  };

  return (
    <div className="section-padding">
      <Link
        to="/"
        className="container-main mb-8 flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
      >
        <FaAngleLeft className="h-4 w-4" />
        Go back to home
      </Link>

      <h2 className="mb-8 text-center font-heading text-display-sm font-bold text-neutral-900">
        Forgot Password
      </h2>

      <form onSubmit={handleSubmit} className="card-base mx-auto max-w-sm p-8">
        <div>
          <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="input-base"
          />
        </div>

        <button type="submit" className="btn-primary mt-6 w-full py-3">
          Send Reset Link
        </button>

        <p className="mt-5 text-center text-body-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgetPassword;
