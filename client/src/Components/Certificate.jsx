import { useCallback, useRef, useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { API } from "../config/api";
import { FaDownload, FaShieldAlt } from "react-icons/fa";

const Certificate = () => {
  const ref = useRef(null);
  const { user } = useAuthContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const certId = searchParams.get("certId");
  const { courseTitle: stateTitle } = location.state || {};

  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(!!certId);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!certId) return;
    fetch(`${API}/api/certificate/check/${encodeURIComponent(certId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.certificate) setCertData(data.certificate);
        else setFetchError(true);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [certId]);

  const id = certData?.certificateId || certId || "";
  const name =
    certData?.studentName ||
    [user?.user?.firstname, user?.user?.lastname].filter(Boolean).join(" ") ||
    "Student";
  const course = certData?.courseName || stateTitle || "Course";
  const date = certData?.issueDate
    ? new Date(certData.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const handleDownload = useCallback(() => {
    if (!ref.current) return;
    toPng(ref.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `certificate-${id || "completion"}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(() => {});
  }, [ref, id]);

  if (!certId && !stateTitle) {
    return <Navigate to="/dashboard/user" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 py-10 px-4">
      {fetchError && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-6 py-4 text-amber-700 text-sm max-w-md text-center">
          Certificate preview based on your information.
        </div>
      )}

      <div
        ref={ref}
        className="relative h-[540px] w-[780px] max-w-full overflow-hidden bg-white"
        style={{
          background:
            "linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f0fdf4 100%)",
        }}
      >
        <div className="absolute inset-4 rounded-lg border-2 border-emerald-800/20" />
        <div className="absolute inset-5 rounded-lg border border-emerald-700/10" />
        <div
          className="absolute inset-[18px] rounded-lg border-[3px]"
          style={{
            borderColor: "#065f46",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.98))",
          }}
        />
        <div
          className="absolute top-[18px] left-[18px] right-[18px] h-2 rounded-t-lg"
          style={{
            background: "linear-gradient(90deg, #065f46, #10b981, #065f46)",
          }}
        />

        <div className="absolute top-[32px] left-[32px] h-16 w-16 opacity-20">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M0 80V0H80" stroke="#065f46" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#065f46" />
            <circle cx="68" cy="12" r="3" fill="#065f46" />
            <circle cx="12" cy="68" r="3" fill="#065f46" />
          </svg>
        </div>
        <div className="absolute top-[32px] right-[32px] h-16 w-16 opacity-20 rotate-90">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M0 80V0H80" stroke="#065f46" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#065f46" />
            <circle cx="68" cy="12" r="3" fill="#065f46" />
            <circle cx="12" cy="68" r="3" fill="#065f46" />
          </svg>
        </div>
        <div className="absolute bottom-[32px] left-[32px] h-16 w-16 opacity-20 -rotate-90">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M0 80V0H80" stroke="#065f46" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#065f46" />
            <circle cx="68" cy="12" r="3" fill="#065f46" />
            <circle cx="12" cy="68" r="3" fill="#065f46" />
          </svg>
        </div>
        <div className="absolute bottom-[32px] right-[32px] h-16 w-16 opacity-20 rotate-180">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M0 80V0H80" stroke="#065f46" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#065f46" />
            <circle cx="68" cy="12" r="3" fill="#065f46" />
            <circle cx="12" cy="68" r="3" fill="#065f46" />
          </svg>
        </div>

        <div
          className="absolute top-[40px] right-[50px] flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle, #fbbf24 0%, #d97706 100%)",
            boxShadow: "0 4px 20px rgba(217,119,6,0.3)",
          }}
        >
          <svg viewBox="0 0 60 60" className="h-12 w-12" fill="white">
            <path d="M30 5L36 22L55 22L39 33L45 50L30 40L15 50L21 33L5 22L24 22Z" />
          </svg>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-20 pt-10">
          <p className="text-sm font-semibold uppercase tracking-[6px] text-emerald-700">
            Certificate of Completion
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-16 bg-emerald-300" />
            <div className="h-2 w-2 rotate-45 bg-emerald-600" />
            <div className="h-px w-16 bg-emerald-300" />
          </div>
          <p className="mt-8 text-sm font-medium tracking-wider text-slate-500 uppercase">
            This certifies that
          </p>
          <h1
            className="mt-4 font-bold tracking-wide text-slate-900 text-center px-4"
            style={{
              fontSize: "clamp(24px, 5vw, 36px)",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {name}
          </h1>
          <p className="mt-6 text-sm text-slate-500">
            Has successfully completed the  course
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold text-emerald-700 text-center px-4">
            {course}
          </h2>
          <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-slate-400 px-4">
            This certificate acknowledges the dedication, hard work, and
            successful completion of all course requirements including video
            lessons and assessments.
          </p>
          <div className="mt-8 sm:mt-10 flex w-full items-end justify-between px-2 sm:px-4 gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date Issued
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{date}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-px w-20 sm:w-32 bg-slate-400" />
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Jabir Hussain Rahmani
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Authorized Signature
              </p>
            </div>
            {id && (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Certificate ID
                </p>
                <p className="mt-1 text-xs font-mono font-medium text-slate-500">
                  {id}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-[18px] left-[18px] right-[18px] h-2 rounded-b-lg"
          style={{
            background: "linear-gradient(90deg, #065f46, #10b981, #065f46)",
          }}
        />
      </div>

      <div className="mt-8 flex gap-4 flex-wrap justify-center">
        <button
          onClick={handleDownload}
          className="flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800"
        >
          <FaDownload />
          Download PNG
        </button>
        <a
          href="/certificate-checker"
          className="flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FaShieldAlt />
          Verify
        </a>
      </div>
    </div>
  );
};

export default Certificate;
