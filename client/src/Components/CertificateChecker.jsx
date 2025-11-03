import { useState } from "react";

const CertificateChecker = () => {
    const [certificateId, setCertificateId] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_MAHAD_baseUrl;

    const handleCheck = async () => {
        if (!certificateId) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(`${baseUrl}/api/certificate/check/${certificateId}`);
            const data = await res.json();

            if (res.ok) {
                if (data.valid) {
                    setResult({
                        status: "valid",
                        message: "✅ Certificate is Authentic",
                        certificate: data.certificate,
                    });
                } else {
                    setResult({
                        status: "invalid",
                        message: "❌ Certificate is Invalid",
                    });
                }
            } else {
                setResult({
                    status: "error",
                    message: data.message || "❌ Certificate not found",
                });
            }
        } catch (error) {
            setResult({
                status: "error",
                message: "❌ Something went wrong. Please try again.",
            });
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
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Part - Input */}
                <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-emerald-800 mb-6 text-center">
                        Certificate Authentication
                    </h2>

                    <input
                        type="text"
                        placeholder="Enter Certificate ID/UID"
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />

                    <button
                        onClick={handleCheck}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md font-semibold shadow-md transition-all duration-300"
                        disabled={loading}
                    >
                        {loading ? "Checking..." : "Check"}
                    </button>
                </div>

                {/* Right Part - Result */}
                <div className="flex flex-col justify-center items-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-white rounded-lg p-6 shadow-inner min-h-[200px] w-full">
                    {result ? (
                        <div
                            className={`p-6 rounded-md text-center font-semibold w-full ${result.status === "valid"
                                ? "bg-green-100 text-green-700"
                                : result.status === "invalid"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            <p className="text-xl mb-4">{result.message}</p>

                            {result.status === "valid" && result.certificate && (
                                <div className="text-left text-gray-800">
                                    <p>
                                        <strong>Student:</strong> {result.certificate.studentName}
                                    </p>
                                    <p>
                                        <strong>Course:</strong> {result.certificate.courseName}
                                    </p>
                                    <p>
                                        <strong>Issue Date:</strong>{" "}
                                        {new Date(result.certificate.issueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">
                            Result will appear here after authentication
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CertificateChecker;
