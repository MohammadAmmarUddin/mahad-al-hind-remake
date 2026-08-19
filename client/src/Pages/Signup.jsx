import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";
import { FaAngleLeft } from "react-icons/fa6";
import { useState } from "react";
import DOMPurify from "dompurify";
import { fileToDataUrl, validateFile } from "../utils/uploadMedia";

const Signup = () => {
  const { signup } = useSignup();
  const [uploadPerc, setUploadPerc] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());

  const onSubmit = async (data) => {
    const { firstname, lastname, email, phone, password } = data;

    const sanitizedFirstname = sanitizeInput(firstname);
    const sanitizedLastname = sanitizeInput(lastname);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedPassword = sanitizeInput(password);
    const role = "user";
    const prevRole = role;

    try {
      let imgPayload = "";

      if (selectedImage) {
        validateFile(selectedImage, {
          allowedTypes: ["image/jpeg", "image/png", "image/webp"],
          maxSize: 5 * 1024 * 1024,
        });
        imgPayload = await fileToDataUrl(selectedImage);
      }

      await signup(
        sanitizedFirstname,
        sanitizedLastname,
        sanitizedEmail,
        sanitizedPhone,
        role,
        prevRole,
        imgPayload,
        sanitizedPassword,
        {
          onProgress: (event) => {
            if (event.total) {
              setUploadPerc(Math.round((event.loaded * 100) / event.total));
            }
          },
        }
      );
    } catch (error) {
      console.error("Error in signup: ", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const password = watch("password");

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
        Signup
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card-base mx-auto max-w-sm p-5 sm:p-8"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">First Name</label>
              <input
                type="text"
                placeholder="First name"
                {...register("firstname", { required: true })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Last Name</label>
              <input
                type="text"
                placeholder="Last name"
                {...register("lastname", { required: true })}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              placeholder="email"
              {...register("email", { required: true })}
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Phone</label>
            <input
              type="text"
              placeholder="phone"
              {...register("phone", { required: true })}
              className="input-base"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-body-sm font-medium text-neutral-700">Profile Photo</label>
              {uploadPerc > 0 && <span className="text-xs text-primary-600">{uploadPerc}%</span>}
            </div>
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full rounded-lg text-sm"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 h-20 w-20 rounded-xl object-cover ring-2 ring-primary-100"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              placeholder="password"
              {...register("password", { required: true })}
              className="input-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-body-sm font-medium text-neutral-700">Retype Password</label>
            <input
              type="password"
              placeholder="Retype password"
              {...register("retypePassword", {
                required: true,
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="input-base"
            />
            {errors.retypePassword && (
              <p className="mt-1 text-xs text-error">
                {errors.retypePassword.message}
              </p>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6 w-full py-3">
          Signup
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

export default Signup;
