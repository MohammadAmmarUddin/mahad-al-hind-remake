import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

const StudentReviewCard = ({ item }) => {
    const { name, comment, image, rating } = item;

    return (
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 border border-emerald-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center">
                <img
                    src={image || "/default-profile.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{name}</h3>
                <Rating className="max-w-32 mx-auto mb-3" value={rating} readOnly />
                <p className="text-gray-600 text-center">{comment}</p>
            </div>
        </div>
    );
};

export default StudentReviewCard;
