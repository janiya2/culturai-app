"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, RotateCcw, Home, Compass } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CulturAI Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#040409] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full bg-[#0a0d1d]/80 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 text-center relative z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400/80 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            CulturAI Concierge Restabilized
          </span>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
            Seamless Cultural Recovery
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            The multi-agent taste matrix encountered an instantaneous state transition. Your profile, taste vectors, and session credentials remain completely secure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-sync Concierge</span>
          </button>

          <Link
            href="/night-out"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 hover:text-white border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Night-Out Engine</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/5 text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5 text-purple-400" />
            <span>Command Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
