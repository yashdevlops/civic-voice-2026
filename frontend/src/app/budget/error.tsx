"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Budget page error captured by Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white shadow-card-lg rounded-card border border-slate-100 p-8 text-center space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 font-display">Something went wrong</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            An unexpected error occurred while rendering the budgeting page.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="btn-primary w-full justify-center py-2.5 text-sm flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
