import { useRouteError, useNavigate } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = error?.status === 404;

  if (!is404) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vintage-50 via-vintage-100 to-primary-50 px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <span className="text-8xl sm:text-9xl font-heading font-bold text-primary-200 select-none">
            {is404 ? "404" : "500"}
          </span>
        </div>

        <div className="card-base p-8 sm:p-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 mb-3">
            {is404 ? "পৃষ্ঠাটি খুঁজে পাওয়া যায়নি" : "সাইটে সমস্যা রয়েছে"}
          </h1>

          <p className="text-neutral-500 mb-2 text-sm sm:text-base">
            {is404
              ? "আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি বিদ্যমান নেই বা সরানো হয়েছে।"
              : "আমরা ক্ষমাপ্রার্থী, আমাদের সাইটে এখন কিছু সমস্যা রয়েছে।"}
          </p>

          <p className="text-neutral-400 text-xs sm:text-sm mb-8">
            {is404
              ? "দয়া করে URL যাচাই করুন অথবা হোমপেজে ফিরে যান।"
              : "আমরা সমস্যাটি সমাধান করার চেষ্টা করছি। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/")} className="btn-primary">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              হোমপেজে ফিরে যান
            </button>

            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                />
              </svg>
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>

        <p className="mt-6 text-neutral-400 text-xs">
          Ma'hadul Qira'at Al Hind
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;
