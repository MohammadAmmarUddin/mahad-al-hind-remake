import Swal from "sweetalert2";
import useAuthContext from "../../../hooks/useAuthContext";
import { useState } from "react";
import axios from "axios";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

const AddReview = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user } = useAuthContext();
  const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      Swal.fire("Oops!", "Please provide a rating.", "warning");
      return;
    }

    const name = user?.displayName || user?.user?.firstname || "Anonymous";
    const image = user?.photoURL || user?.user?.img || "";
    const data = { name, image, rating, comment };
    console.log("data", data);
    try {
      const res = await axios.post(`${baseUrl}/api/review/create`, data);

      console.log(res);
      if (res.ok || res.status === 200 || res.status === 201) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your review has been submitted",
          showConfirmButton: false,
          timer: 1500,
        });
        setRating(0);
        setComment("");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to submit review. Try again.", "error");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border-2 border-emerald-700">
        <h2 className="text-center font-bold text-3xl text-emerald-800 mb-6">
          Rate Us!
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mx-auto flex justify-center">
            <Rating
              style={{ maxWidth: 200 }}
              className="mx-auto my-2"
              value={rating}
              onChange={setRating}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Comment (Optional)
            </label>
            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              rows={4}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md font-semibold shadow-md transition-all duration-300 disabled:opacity-50"
            disabled={rating === 0}
          >
            {rating === 0 ? "Please provide a rating" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReview;
