"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Compass, Sparkles } from "lucide-react";

export default function SmartAppRouter() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (userProfile?.tasteProfile?.onboarded) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [user, userProfile, loading, router]);

  return (
    <main className="min-h-screen bg-[#040409] flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/20 to-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" />

      {/* Brand Terminal Loading State */}
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 animate-bounce">
          <Compass className="w-6 h-6 text-white" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-xl font-black tracking-tight font-sans">
            Cultur<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">AI</span>
          </h1>
          <p className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Connecting to Taste AI™ Graph...
          </p>
        </div>

        {/* Minimalist Spinner */}
        <div className="w-6 h-6 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mt-2" />
      </div>
    </main>
  );
}
