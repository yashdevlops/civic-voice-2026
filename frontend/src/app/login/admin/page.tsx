"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <Loader2 className="h-6 w-6 animate-spin text-amber-600 mr-2" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
        Redirecting to secure login…
      </span>
    </div>
  );
}
