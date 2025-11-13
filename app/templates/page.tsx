"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TemplatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home with templates hash
    router.push("/#templates");
  }, [router]);

  return (
    <div className="min-h-screen bg-zk-darker flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">⚡</div>
        <p className="text-white">Redirecting to templates...</p>
      </div>
    </div>
  );
}

