import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { resolveMediaUrl } from "../utils/media";

const StudentReviewCard = ({ item }) => {
  const { name, comment, image, rating } = item;

  return (
    <div className="card-base mx-auto max-w-sm overflow-hidden p-6">
      <div className="flex flex-col items-center text-center">
        <img
          src={resolveMediaUrl(image || "/default-profile.png")}
          alt={name || "Student"}
          className="mb-4 h-20 w-20 rounded-full object-cover ring-4 ring-primary-100"
        />
        <h3 className="font-heading text-heading-md font-semibold text-neutral-800">
          {name}
        </h3>
        <Rating className="mx-auto my-3 max-w-28" value={rating} readOnly />
        <p className="text-body-sm leading-relaxed text-neutral-600">{comment}</p>
      </div>
    </div>
  );
};

export default StudentReviewCard;
