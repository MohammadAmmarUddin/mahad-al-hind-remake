import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./Routes/Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "./context/AuthContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { Component, Suspense } from "react";
import RouteFallback from "./Layout/RouteFallback";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              The page failed to load. Please refresh and try again.
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    <SiteContentProvider>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </AppErrorBoundary>
      </QueryClientProvider>
    </SiteContentProvider>
  </AuthContextProvider>
);
