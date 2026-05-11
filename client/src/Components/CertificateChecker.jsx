import { useState } from "react";
import { safeFetchJson } from "../config/api";

const CertificateChecker = () => {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!certificateId) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await safeFetchJson(`/api/certificate/check/${certificateId}`, {}, null);

      if (data?.valid) {
        setResult({
          status: "valid",
          message: "Certificate is authentic",
          certificate: data.certificate,
        });
      } else if (data) {
        setResult({
          status: "invalid",
          message: data.message || "Certificate is invalid",
        });
      } else {
        setResult({
          status: "error",
          message: "Certificate lookup is unavailable right now.",
        });
      }
    } catch {
      setResult({
        status: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-[#047857]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#065f46] via-[#047857] to-[#ecfccb] p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 rounded-lg bg-white p-8 shadow-lg md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h2 className="mb-6 text-center text-3xl font-bold text-emerald-800">
            Certificate Authentication
          </h2>

          <input
            type="text"
            placeholder="Enter Certificate ID/UID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <button
            onClick={handleCheck}
            className="w-full rounded-md bg-emerald-600 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        <div className="flex min-h-[200px] w-full flex-col justify-center rounded-lg bg-gradient-to-br from-emerald-100 via-emerald-50 to-white p-6 text-center shadow-inner">
          {result ? (
            <div
              className={`w-full rounded-md p-6 font-semibold ${
                result.status === "valid"
                  ? "bg-green-100 text-green-700"
                  : result.status === "invalid"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              <p className="mb-4 text-xl">{result.message}</p>

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
            <p className="text-center text-gray-500">
              Result will appear here after authentication
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateChecker;
