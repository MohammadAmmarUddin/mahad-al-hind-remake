import { useState } from "react";

const CertificateAdd = () => {
    const [formData, setFormData] = useState({
        certificateId: "",
        studentName: "",
        courseName: "",
        issueDate: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${baseUrl}/api/certificate/createCertificate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.exists) {
                    setMessage({ type: "error", text: "❌ Certificate already exists." });
                } else {
                    setMessage({
                        type: "success",
                        text: "✅ Certificate successfully created.",
                    });
                    setFormData({
                        certificateId: "",
                        studentName: "",
                        courseName: "",
                        issueDate: "",
                    });
                }
            } else {
                setMessage({
                    type: "error",
                    text: data.message || "❌ Something went wrong.",
                });
            }
        } catch (error) {
            setMessage({ type: "error", text: "❌ Server error. Please try again." });
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#047857]"></div>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#065f46] via-[#047857] to-[#ecfccb] p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-emerald-800 mb-6 text-center">Certificate Submission</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Certificate ID</label>
                        <input
                            type="text"
                            name="certificateId"
                            value={formData.certificateId}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Student Name</label>
                        <input
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Course Name</label>
                        <input
                            type="text"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">Issue Date</label>
                        <input
                            type="date"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md font-semibold shadow-md transition-all duration-300"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>

                {message && (
                    <div
                        className={`mt-4 p-4 rounded-md text-center font-semibold ${message.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateAdd;
