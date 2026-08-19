"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyBidsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/contracts?tab=my-bids");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans text-xs">
      Redirecting to My Submitted Bids…
    </div>
  );
}
