import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";
import { FaAngleLeft } from "react-icons/fa6";
import { useState } from "react";
import DOMPurify from "dompurify"; // For sanitizing inputs
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

  // Function to sanitize all inputs
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input.trim());  // Trim and sanitize to remove any unwanted content
  };

  const onSubmit = async (data) => {
    // Sanitize all user inputs to prevent XSS attacks
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
  const retypePassword = watch("retypePassword");

  return (
    <div className="pt-10 pb-24">
      <Link
        to={"/"}
        className="flex items-center gap-2 font-semibold lg:w-3/4 md:11/12 mx-auto text-xl pb-10"
      >
        <FaAngleLeft />
        <p>Go back to home</p>
      </Link>
      <h2 className="text-center text-4xl font-semibold text-primary pb-5">
        SIGNUP
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="md:w-1/4 w-11/12 mx-auto border rounded-md p-10"
      >
        {/* Form Fields */}
        <div className="form-control pb-4">
          <label className="">First Name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            {...register("firstname", { required: true })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
        </div>
        <div className="form-control pb-4">
          <label className="">Last Name</label>
          <input
            type="text"
            placeholder="Enter your last name"
            {...register("lastname", { required: true })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
        </div>
        <div className="form-control pb-4">
          <label className="">Email</label>
          <input
            type="email"
            placeholder="email"
            {...register("email", { required: true })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
        </div>
        <div className="form-control pb-4">
          <label className="">Phone</label>
          <input
            type="text"
            placeholder="phone"
            {...register("phone", { required: true })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
        </div>
        {/* Image Upload Field */}
        <div className="form-control w-full mb-4">
          <div className="flex justify-between">
            <label><span>Upload your img</span></label>
            <p>{uploadPerc}%</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="file-input w-full file-input-bordered"
            onChange={handleImageChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Selected preview"
              className="mt-3 h-40 w-40 rounded-xl object-cover"
            />
          )}
        </div>
        <div className="form-control pb-4">
          <label className="">Password</label>
          <input
            type="password"
            placeholder="password"
            {...register("password", { required: true })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
        </div>
        <div className="form-control pb-4">
          <label className="">Retype Password</label>
          <input
            type="password"
            placeholder="Retype password"
            {...register("retypePassword", {
              required: true,
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            className="input input-bordered focus:ring-2 focus:ring-primary focus:border-primary rounded-md border hover:border-primary transition-all"
          />
          {errors.retypePassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.retypePassword.message}
            </p>
          )}
        </div>
        <div className="form-control mt-10">
          <button type="submit" className="bg-primary py-3 rounded-md text-white">
            Signup
          </button>
        </div>
        <p className="text-center pt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:text-white hover:underline hover:bg-primary px-1 py-0.5 rounded-md transition-all"
          >
            Login
          </Link>{" "}
        </p>
      </form>
    </div>
  );
};

export default Signup;
