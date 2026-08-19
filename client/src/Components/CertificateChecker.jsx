import { useState } from "react";
import { safeFetchJson } from "../config/api";

const CertificateChecker = () => {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!certificateId) return;

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-800 via-primary-600 to-primary-50 p-4">
      <div className="card-base grid w-full max-w-4xl grid-cols-1 gap-0 overflow-hidden p-0 md:grid-cols-2">
        {/* Left: Form */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <h2 className="mb-6 text-center font-heading text-display-sm font-bold text-neutral-900">
            Certificate Authentication
          </h2>

          <input
            type="text"
            placeholder="Enter Certificate ID/UID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            className="input-base mb-4"
          />

          <button
            onClick={handleCheck}
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        {/* Right: Result */}
        <div className="flex min-h-[200px] flex-col justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100/30 p-8 text-center">
          {result ? (
            <div
              className={`rounded-card p-6 font-semibold ${
                result.status === "valid"
                  ? "bg-success/10 text-success"
                  : result.status === "invalid"
                  ? "bg-error/10 text-error"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <p className="mb-4 font-heading text-lg">{result.message}</p>

              {result.status === "valid" && result.certificate && (
                <div className="space-y-2 text-left text-sm text-neutral-700">
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
            <p className="text-body-sm text-neutral-400">
              Result will appear here after authentication
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateChecker;
