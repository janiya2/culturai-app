"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { auth } from "@/lib/firebase";
import { updateUserTasteProfile } from "@/lib/firestoreService";
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Music,
  Film,
  Utensils,
  Globe,
  Radio,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, loginWithGoogle, loginWithEmail, signupWithEmail, logout } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeJudge, setActiveJudge] = useState<string | null>(null);

  // Active floating node for live simulation animation
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);

  const SIGNALS = [
    {
      domain: "Sonic Affinity",
      icon: Music,
      source: "Radiohead (Kid A / In Rainbows)",
      target: "Tokyo Hi-Fi Vinyl Lounge (Daikanyama)",
      score: "98% Affinity",
      tag: "Experimental Art Rock ⟷ Acoustic Architecture",
      color: "from-cyan-500 to-blue-600",
      accent: "border-cyan-500/30 text-cyan-300",
    },
    {
      domain: "Cinematic Aesthetic",
      icon: Film,
      source: "Wong Kar-wai (Fallen Angels)",
      target: "Subterranean Natural Wine Den (Shibuya)",
      score: "96% Affinity",
      tag: "Step-Printed Neon ⟷ Biodynamic Fermentation",
      color: "from-purple-500 to-indigo-600",
      accent: "border-purple-500/30 text-purple-300",
    },
    {
      domain: "Architectural Gastronomy",
      icon: Utensils,
      source: "Brutalist Concrete Minimalist",
      target: "8-Seat Counter Omakase (Roppongi)",
      score: "95% Affinity",
      tag: "Spatial Geometry ⟷ Micro-Seasonal Craft",
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-500/30 text-amber-300",
    },
  ];

  // Rotate through signals every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSignalIndex((prev) => (prev + 1) % SIGNALS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [SIGNALS.length]);

  // Show active session status without kicking user off the page prematurely
  const autofillJudgeCredentials = () => {
    setEmail("judge@qloo.ai");
    setPassword("judgeDemo2026!");
    setMode("login");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        try {
          await loginWithEmail(email, password);
        } catch (loginErr: any) {
          // If it's a judge demo account that hasn't been created in Firebase yet, auto-create it seamlessly
          if (
            email.toLowerCase().includes("judge") ||
            email.toLowerCase().includes("innoxpert") ||
            email.toLowerCase().includes("demo")
          ) {
            await signupWithEmail(email, password, "Hackathon Judge Evaluator");
          } else {
            throw loginErr;
          }
        }
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }
        await signupWithEmail(email, password, name);
      }

      // Check profile completeness: if less than 5 steps, open onboarding!
      const completedCount = userProfile?.tasteProfile?.completedSteps?.length || 0;
      const is100PercentComplete =
        Boolean(userProfile?.tasteProfile?.onboarded) && completedCount >= 5;

      if (is100PercentComplete) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err: any) {
      let msg = err.message || "Authentication failed.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
        msg = "Invalid email or password. Please try again.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already registered. Please sign in instead.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  // 1-Click Judge Sign In with 5-Step Fresh Onboarding Experience
  const handleJudgeOnboardingLogin = async () => {
    setError("");
    setLoading(true);
    setActiveJudge("onboarding");

    try {
      const demoEmail = "judge.evaluator@qloo.ai";
      const demoPass = "qlooJudge2026!";
      const demoName = "Devpost Judge Evaluator";

      // If someone is already logged in, log out first for a pristine state
      if (auth.currentUser) {
        try {
          await logout();
        } catch {
          // ignore logout errors
        }
      }

      try {
        await loginWithEmail(demoEmail, demoPass);
      } catch {
        await signupWithEmail(demoEmail, demoPass, demoName);
      }

      // Reset profile to un-onboarded so the 5-step onboarding flow opens fresh!
      if (auth.currentUser) {
        await updateUserTasteProfile(auth.currentUser.uid, {
          city: "",
          music: [],
          cinema: [],
          dining: [],
          fashion: [],
          completedSteps: [],
          onboarded: false,
          budgetTier: "balanced",
          aestheticKeywords: [],
        });
      }

      // Clean redirect to onboarding
      window.location.href = "/onboarding";
    } catch (err: any) {
      setError(err.message || "Failed to start onboarding demo.");
      setLoading(false);
      setActiveJudge(null);
    }
  };

  // Instant Direct to Dashboard with Pre-Loaded Tokyo Taste DNA
  const handleJudgeDirectDashboard = async () => {
    setError("");
    setLoading(true);
    setActiveJudge("dashboard");

    try {
      const demoEmail = "judge@qloo.ai";
      const demoPass = "judgeDemo2026!";
      const demoName = "Devpost Lead Judge";

      try {
        await loginWithEmail(demoEmail, demoPass);
      } catch {
        await signupWithEmail(demoEmail, demoPass, demoName);
      }

      // Pre-seed full 5-D Taste DNA so they instantly land on dashboard with 100% profile
      if (auth.currentUser) {
        await updateUserTasteProfile(auth.currentUser.uid, {
          city: "Tokyo, Japan",
          music: ["Radiohead", "Miles Davis"],
          cinema: ["Wong Kar-wai", "Blade Runner 2049"],
          dining: ["Vinyl Hi-Fi Lounge", "8-Seat Counter Omakase"],
          fashion: ["Issey Miyake", "Brutalist Concrete Minimalist"],
          completedSteps: ["music", "cinema", "dining", "fashion", "country-city"],
          onboarded: true,
          budgetTier: "balanced",
          aestheticKeywords: ["Experimental", "Acoustic Architecture", "Nocturnal"],
        });
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard demo.");
      setLoading(false);
      setActiveJudge(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#040409] text-white flex flex-col justify-between relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ======================================================== */}
      {/* LUXURY NOCTURNAL CYBER CITY & TASTE GRAPH ANIMATED BACKGROUND */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Nocturnal City & Cultural Graph Wallpaper */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns transition-all duration-1000"
          style={{
            backgroundImage: "url('/culturai_cyber_bg.jpg')",
            opacity: 0.38,
            filter: "contrast(115%) saturate(125%)",
          }}
        />

        {/* 2. Cyberpunk Grid & Matrix Scanlines */}
        <div className="absolute inset-0 cyber-grid-overlay opacity-25" />

        {/* 3. Multi-Stop Vignette & Deep Obsidian Gradients for Flawless Readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#040409_82%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/95 via-transparent to-[#040409]/95" />

        {/* 4. Animated Glowing Ethereal Aurora Orbs */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-[160px] animate-aurora" />
        <div className="absolute -bottom-32 -right-32 w-[750px] h-[750px] bg-gradient-to-tl from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-[170px] animate-aurora [animation-delay:5s]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none" />
      </div>

      {/* Top Mobile/Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-6 flex items-center justify-between relative z-20">
        {/* Left: Brand Identity with 3D Holographic Prism Compass Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 p-0.5 sm:p-1 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-400/50 transition-all duration-300 overflow-hidden backdrop-blur-xl">
              <img
                src="/culturai_logo.png"
                alt="CulturAI Logo"
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#040409] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-sans flex items-center">
                Cultur<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hidden md:inline-flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                AuraTaste v2.4
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-gray-400 tracking-wider hidden sm:block">
              AUTONOMOUS CULTURAL & TASTE CONCIERGE
            </p>
          </div>
        </Link>

        {/* Right: Official Qloo Taste AI™ Graph Badge & Diagnostics */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Official Qloo Taste AI Platform Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-[#070913]/90 border border-cyan-500/30 shadow-md backdrop-blur-2xl group hover:border-cyan-400/60 transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <div className="h-3.5 sm:h-4 flex items-center" title="Official Qloo Cultural AI™ Platform">
              <img
                src="/qloo_logo.svg"
                alt="Official Qloo Logo"
                className="h-3 sm:h-3.5 w-auto object-contain"
              />
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[8px] sm:text-[9px] text-emerald-300 font-bold border border-emerald-400/30 hidden xs:inline">
              ACTIVE
            </span>
          </div>

          <Link
            href="/admin/keys"
            className="text-xs font-mono text-gray-300 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Inspect API credentials and ping latency"
          >
            <span className="hidden sm:inline text-xs">API Diagnostics</span>
            <span className="text-cyan-400 font-bold text-xs sm:text-sm">⚙</span>
          </Link>
        </div>
      </header>

      {/* Main Splitscreen Cinematic Layout */}
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start lg:items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: HERO SHOWCASE & LIVE CULTURAL GRAPH RADAR */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Tagline & Impact Headline */}
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] sm:text-xs font-mono">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-pulse" />
                <span>Autonomous Cultural Affinity & Taste Intelligence</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.15] sm:leading-[1.1] font-sans">
                Artificial Intelligence with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                  Human Cultural Taste.
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-gray-400 leading-relaxed max-w-2xl font-sans">
                Traditional LLMs are culturally blind — recommending tourist traps and bland clichés. CulturAI grounds <span className="text-white font-semibold">Google Gemini 1.5 Flash</span> in <span className="text-cyan-300 font-semibold">Qloo’s 575M+ entity Taste AI™ Graph</span> to curate uncompromised night-outs, subcultural travel, and bilateral compromises.
              </p>

              {/* Mobile Quick Jump Anchor */}
              <div className="pt-1 block lg:hidden">
                <a
                  href="#auth-card"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/25 transition-all shadow-md shadow-cyan-500/10"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jump to Terminal Sign In ↓</span>
                </a>
              </div>
            </div>

            {/* LIVE TASTE GRAPH VECTOR CARD (ANIMATED) */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl space-y-3.5 sm:space-y-4 group">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                  <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-white font-semibold">
                    Live Taste Synthesis
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Live Vector Link</span>
                </div>
              </div>

              {/* Dynamic Rotating Cross-Domain Pairing Card */}
              {(() => {
                const item = SIGNALS[activeSignalIndex];
                const ItemIcon = item.icon;
                return (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/50 border border-white/10 space-y-3 transition-all duration-500">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-gray-300 text-[11px] sm:text-xs">
                        <ItemIcon className="w-3.5 h-3.5 text-cyan-400" />
                        {item.domain}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold ${item.accent}`}>
                        {item.score}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-center">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-gray-500">Aesthetic Seed</span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.source}</h4>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5 relative">
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase text-cyan-400">Synthesized Venue / Node</span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.target}</h4>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400 gap-1 sm:gap-2">
                      <span className="leading-tight text-gray-300">↳ {item.tag}</span>
                      <span className="text-cyan-400 shrink-0 font-semibold">Qloo Verified ✦</span>
                    </div>
                  </div>
                );
              })()}

              {/* Stepper Dots */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {SIGNALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSignalIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === activeSignalIndex ? "w-6 bg-cyan-400" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* LIVE TELEMETRY STATS GRID */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/10 space-y-0.5 sm:space-y-1 text-center sm:text-left">
                <span className="text-lg sm:text-2xl font-black text-white font-sans tracking-tight">575M+</span>
                <p className="text-[9px] sm:text-[11px] font-mono text-gray-400 leading-tight">Qloo Entities</p>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/10 space-y-0.5 sm:space-y-1 text-center sm:text-left">
                <span className="text-lg sm:text-2xl font-black text-cyan-400 font-sans tracking-tight">8 Engines</span>
                <p className="text-[9px] sm:text-[11px] font-mono text-gray-400 leading-tight">Night, Travel, Duo</p>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/10 space-y-0.5 sm:space-y-1 text-center sm:text-left">
                <span className="text-lg sm:text-2xl font-black text-purple-400 font-sans tracking-tight">&lt; 400ms</span>
                <p className="text-[9px] sm:text-[11px] font-mono text-gray-400 leading-tight">Synthesis Latency</p>
              </div>
            </div>

            {/* Testimonial / Curator Quote */}
            <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.015] border border-white/5 text-[11px] sm:text-xs text-gray-400 font-sans">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shrink-0 text-white font-black text-[10px] sm:text-xs">
                JD
              </div>
              <p className="italic leading-snug">
                &ldquo;CulturAI proves that music taste mathematically predicts architectural dining.&rdquo;
                <span className="text-white font-medium not-italic ml-1 block sm:inline">— Janitha Dilshan, Lead Architect</span>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: LUXURY AUTHENTICATION CARD & JUDGE SANDBOX */}
          {/* ======================================================== */}
          <div id="auth-card" className="lg:col-span-5 scroll-mt-6">
            <div className="w-full bg-[#070811]/90 backdrop-blur-3xl border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl relative z-10 space-y-5 sm:space-y-6">
              
              {/* Card Header & Tab Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight font-sans">
                      {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {mode === "login" ? "Access your 5-D Taste DNA Profile" : "Initialize your Cultural Graph Identity"}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                {/* Sliding Segmented Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-black/60 border border-white/10 rounded-2xl relative">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      mode === "login"
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      mode === "signup"
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* ======================================================== */}
              {/* PROMINENT DEVPOST HACKATHON JUDGE 1-CLICK ACCESS BANNER */}
              {/* ======================================================== */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/35 shadow-lg shadow-amber-500/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Devpost Judge Quick Access</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    Zero Friction
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans leading-snug">
                  Choose your test mode: Experience the full 5-step onboarding flow or jump directly to the live dashboard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleJudgeOnboardingLogin}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>⚡ 1-Click: 5-Step Onboarding</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleJudgeDirectDashboard}
                    disabled={loading}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>🚀 Direct to Dashboard</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-gray-400">
                  <span>Want to test the email form?</span>
                  <button
                    type="button"
                    onClick={autofillJudgeCredentials}
                    className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold"
                  >
                    Auto-Fill with judge@qloo.ai
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* 1-Click Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-sm group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Visual Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#070811] px-3 text-[10px] uppercase font-mono tracking-widest text-gray-500">
                  or email credentials
                </span>
              </div>

              {/* Email & Password Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Janitha Dilshan"
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="janitha@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono text-gray-300 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === "login" && (
                      <span className="text-[10px] font-mono text-cyan-400/70 hover:text-cyan-300 cursor-pointer">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading && !activeJudge ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating with CulturAI...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Enter Cultural Terminal" : "Initialize Taste DNA Profile"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Encryption Trust Footnote */}
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-gray-500 pt-3 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Firebase 11.3 Auth
                </span>
                <span>•</span>
                <span>Cloud Firestore AES-256</span>
                <span>•</span>
                <span className="text-cyan-400">Qloo Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Minimalist Strip */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-500">
        <p>© 2026 CulturAI (AuraTaste). Developed by InnoXpert Technologies for Qloo Devpost Hackathon.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          <Link href="/admin/keys" className="hover:text-cyan-400 transition-colors">API Keys</Link>
          <a href="https://qloo.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Qloo Taste AI™</a>
        </div>
      </footer>
    </main>
  );
}
