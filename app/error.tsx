"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-khmer p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        មានបញ្ហាបច្ចេកទេសមួយចំនួនបានកើតឡើង
      </h2>
      <p className="text-xs text-rose-600 font-mono max-w-md mb-6">
        {error.message || "Something went wrong!"}
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>ព្យាយាមម្តងទៀត (Reload)</span>
      </button>
    </div>
  );
}
