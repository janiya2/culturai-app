"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import {
  Sparkles,
  ChevronDown,
  Moon,
  Compass,
  Users,
  Film,
  ShoppingBag,
  Share2,
  Mail,
  MapPin,
  LogOut,
  Key,
  Layers,
  Activity,
  Check,
  ExternalLink,
  User,
  Menu,
  X,
  Search,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Bookmark,
} from "lucide-react";
import CityMapModal from "./CityMapModal";
import { resolveCityMetadata } from "@/lib/cityData";
import CountryFlag from "./CountryFlag";

export default function GlobalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout, updateTaste } = useAuth();

  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const modulesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Monitor Window Scroll to elevate navbar glass & shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modulesRef.current && !modulesRef.current.contains(event.target as Node)) {
        setModulesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setModulesOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const MODULES = [
    { href: "/night-out", label: "Night-Out Curator", icon: Moon, color: "text-cyan-400", badge: "Nocturnal", desc: "4-Part bespoke nightlife sequence" },
    { href: "/travel", label: "Subculture Travel", icon: Compass, color: "text-purple-400", badge: "3-Day", desc: "3-Day underground immersion itinerary" },
    { href: "/duosync", label: "DuoSync Couple Match", icon: Users, color: "text-pink-400", badge: "Bilateral", desc: "Mathematical compromise engine for 2" },
    { href: "/cultural-dna", label: "Cultural DNA Persona", icon: Sparkles, color: "text-emerald-400", badge: "5-D Radar", desc: "5-Dimensional lifestyle radar identity" },
    { href: "/filmmaker", label: "Screenplay Moodboard", icon: Film, color: "text-amber-400", badge: "Auteur", desc: "Auteur cinematography & sonic matching" },
    { href: "/tastematch", label: "TasteMatch Gear", icon: ShoppingBag, color: "text-rose-400", badge: "Commerce", desc: "Archival fashion & design discovery" },
    { href: "/hangout", label: "Group Hangout Solver", icon: Share2, color: "text-indigo-400", badge: "Centroid", desc: "Multi-friend taste consensus solver" },
    { href: "/digest", label: "Weekly Taste Digest", icon: Mail, color: "text-cyan-400", badge: "Editorial", desc: "Bespoke underground dispatch" },
    { href: "/library", label: "Saved Itineraries Vault", icon: Bookmark, color: "text-cyan-300", badge: "Library", desc: "Your personal saved AI itineraries" },
  ];

  const filteredModules = MODULES.filter((m) =>
    `${m.label} ${m.badge} ${m.desc}`.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  const taste = userProfile?.tasteProfile;
  const currentCity = taste?.city || "Tokyo, Japan";
  const cityMeta = resolveCityMetadata(currentCity);

  // Dynamic Profile Health for Navbar
  const navbarProfileHealth = React.useMemo(() => {
    let completed = 0;
    const isMockMusic =
      (taste?.music?.length === 2 && taste.music[0] === "Radiohead" && taste.music[1] === "Daft Punk") ||
      (taste?.music?.length === 1 && taste.music[0] === "Radiohead");
    const isMockCinema = taste?.cinema?.length === 1 && taste.cinema[0] === "Christopher Nolan";
    const isMockDining = taste?.dining?.length === 1 && taste.dining[0] === "Speakeasy Cocktails";
    const isMockFashion = taste?.fashion?.length === 1 && taste.fashion[0] === "Brutalist Architecture";

    if (taste?.music && taste.music.length > 0 && !isMockMusic) completed++;
    if (taste?.cinema && taste.cinema.length > 0 && !isMockCinema) completed++;
    if (taste?.dining && taste.dining.length > 0 && !isMockDining) completed++;
    if (taste?.fashion && taste.fashion.length > 0 && !isMockFashion) completed++;
    if (taste?.city?.trim()) completed++;

    const percent = Math.min(100, Math.round((completed / 5) * 100));
    return {
      percent,
      completed,
      isComplete: percent === 100,
    };
  }, [taste]);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 100% FIXED ULTRA-ADVANCED FROSTED CYBERNETIC NAVBAR */}
      {/* ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300 ${
          isScrolled
            ? "bg-[#040409]/95 backdrop-blur-2xl border-b border-cyan-500/25 shadow-2xl shadow-cyan-950/30 py-0"
            : "bg-[#040409]/85 backdrop-blur-xl border-b border-white/10 py-0"
        }`}
      >
        {/* Top Glowing Micro-Laser Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 via-indigo-500 via-purple-500 to-transparent opacity-85" />

        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* ======================================================== */}
          {/* LEFT: BRAND IDENTITY & FEATURE MODULES SWITCHER */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02] shrink-0"
              title="Return to Command Center Dashboard"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-600/20 to-purple-600/20 border border-cyan-400/40 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
                  <img src="/culturai_logo.png" alt="CulturAI Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#040409] animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white font-sans">
                    CULTUR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">AI</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    AuraTaste
                  </span>
                </div>
              </div>
            </Link>

            {/* Modules Quick Switcher Dropdown */}
            <div className="relative" ref={modulesRef}>
              <button
                type="button"
                onClick={() => {
                  setModulesOpen(!modulesOpen);
                  setModuleSearch("");
                }}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  modulesOpen
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-gray-300 hover:text-white"
                }`}
                title="Explore 8 Autonomous Cultural AI Concierges"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="hidden md:inline font-medium">Feature Modules</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold hidden lg:inline">
                  8 Engines
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform text-gray-400 ${modulesOpen ? "rotate-180" : ""}`} />
              </button>

              {modulesOpen && (
                <div className="absolute left-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#080b18]/95 border border-cyan-500/30 shadow-2xl p-2.5 z-50 backdrop-blur-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Search inside modules */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                      placeholder="Search engines (e.g. Travel, Night-Out, Film)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="px-2 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider border-b border-white/5 flex items-center justify-between">
                    <span>Autonomous AI Suites</span>
                    <span>Qloo 575M+</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1 pr-1 scrollbar-none">
                    {filteredModules.map((m) => {
                      const Icon = m.icon;
                      const active = pathname === m.href;
                      return (
                        <Link
                          key={m.href}
                          href={m.href}
                          onClick={() => setModulesOpen(false)}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                            active
                              ? "bg-cyan-500/20 text-white border border-cyan-400/30"
                              : "text-gray-300 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                              <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold truncate">{m.label}</div>
                              <div className="text-[10px] text-gray-400 truncate">{m.desc}</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 shrink-0 ml-2">
                            {m.badge}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CENTER: DESKTOP DIRECT QUICK NAV SHORTCUTS */}
          {/* ======================================================== */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
            <Link
              href="/dashboard"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/dashboard"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Hub</span>
            </Link>
            <Link
              href="/night-out"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/night-out"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Night-Out</span>
            </Link>
            <Link
              href="/travel"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/travel"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Travel</span>
            </Link>
            <Link
              href="/duosync"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/duosync"
                  ? "bg-pink-500/20 text-pink-200 border border-pink-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>DuoSync</span>
            </Link>
            <Link
              href="/cultural-dna"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/cultural-dna"
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>DNA Radar</span>
            </Link>
            <Link
              href="/library"
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                pathname === "/library"
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Library</span>
            </Link>
          </nav>

          {/* ======================================================== */}
          {/* RIGHT: TELEMETRY + CITY ANCHOR + USER PROFILE */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Qloo Status Capsule */}
            <Link
              href="/admin/keys"
              className={`hidden md:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#080a14] hover:bg-white/[0.08] border text-xs font-mono transition-all group shadow-sm ${
                isQlooLiveConnected ? "border-emerald-500/30" : "border-amber-500/30"
              }`}
              title="Click to view API Keys & Diagnostics Console"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isQlooLiveConnected
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                    : "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"
                }`}
              />
              <img src="/qloo_logo.svg" alt="Qloo Logo" className="h-3 w-auto object-contain" />
              <span className="text-[10px] text-gray-400 border-l border-white/10 pl-1.5 hidden lg:inline">
                {isQlooLiveConnected ? "Live Graph" : "Qloo: Standby"}
              </span>
              <span className="text-[9px] text-cyan-400/70 group-hover:text-cyan-300">⚙</span>
            </Link>

            {/* City Anchor Button with Real Vector Flag & Country Badge */}
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-gray-300 flex items-center gap-2 transition-all cursor-pointer group shadow-sm"
              title="Click to switch Cultural Anchor Metropolis via Interactive World Map"
            >
              <CountryFlag code={cityMeta.code} size="sm" />
              <span className="max-w-[90px] sm:max-w-[130px] truncate font-bold text-white">
                {cityMeta.city}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold hidden sm:inline">
                {cityMeta.country} [{cityMeta.code}]
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* User Profile Hub Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group"
                title="User Profile & Account Menu"
              >
                <span className="text-xs font-mono font-medium text-white hidden sm:inline max-w-[85px] truncate">
                  {userProfile?.displayName || user?.displayName || "Janitha"}
                </span>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  {(userProfile?.displayName || user?.displayName || "J").charAt(0).toUpperCase()}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#090b16]/95 border border-cyan-500/30 shadow-2xl p-3 z-50 backdrop-blur-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="pb-2 border-b border-white/10 space-y-2">
                    <div>
                      <div className="text-xs font-bold text-white truncate">
                        {userProfile?.displayName || user?.displayName || "Janitha Dilshan"}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 truncate">
                        {user?.email || "architect@innoxpert.com"}
                      </div>
                    </div>

                    {/* Profile Health Progress Capsule */}
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all group/ph"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-gray-300 flex items-center gap-1.5 group-hover/ph:text-cyan-300">
                          <Activity className="w-3 h-3 text-cyan-400" />
                          <span>Profile Health:</span>
                        </span>
                        <span
                          className={`font-bold ${
                            navbarProfileHealth.isComplete ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {navbarProfileHealth.percent}% ({navbarProfileHealth.completed}/5)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            navbarProfileHealth.isComplete
                              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                              : navbarProfileHealth.percent >= 80
                              ? "bg-gradient-to-r from-cyan-400 to-blue-400"
                              : "bg-gradient-to-r from-amber-400 to-orange-400"
                          }`}
                          style={{ width: `${navbarProfileHealth.percent}%` }}
                        />
                      </div>
                    </Link>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white bg-white/[0.04] hover:bg-cyan-500/15 hover:text-cyan-300 transition-colors font-medium border border-white/5"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Profile & Taste Identity</span>
                    </Link>

                    <Link
                      href="/library"
                      onClick={() => setProfileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
                        pathname === "/library"
                          ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 font-bold"
                          : "text-gray-300 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                        <span>My Saved Library</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Vault
                      </span>
                    </Link>

                    <Link
                      href="/cultural-dna"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Cultural DNA Persona</span>
                    </Link>

                    <Link
                      href="/admin/keys"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>API Settings & Diagnostics</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <div className="relative lg:hidden" ref={mobileRef}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-[#090b16]/95 border border-cyan-500/30 shadow-2xl p-3 z-50 backdrop-blur-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider pb-1 border-b border-white/5">
                    Navigation & Concierges
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-white hover:bg-white/10 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Command Center Dashboard</span>
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        pathname === "/library"
                          ? "text-cyan-300 bg-cyan-500/15 font-bold"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Saved Library</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Vault
                      </span>
                    </Link>
                    {MODULES.map((m) => {
                      const Icon = m.icon;
                      return (
                        <Link
                          key={m.href}
                          href={m.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                            <span>{m.label}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 text-gray-400">
                            {m.badge}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* INVISIBLE LAYOUT SPACER (Preserves natural flow behind fixed header) */}
      {/* ======================================================== */}
      <div className="h-16 shrink-0 w-full" aria-hidden="true" />

      {/* Global Interactive World Map City Switcher Modal */}
      <CityMapModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        currentCity={currentCity}
        onSelectCity={async (selectedCityString) => {
          await updateTaste({ city: selectedCityString });
        }}
      />

      {/* ======================================================== */}
      {/* ULTRA-SLEEK CYBERNETIC MOBILE FOOTER DOCK (BOTTOM ICONS) */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden select-none bg-[#060814]/94 backdrop-blur-2xl border-t border-cyan-500/25 shadow-[0_-12px_40px_rgba(0,0,0,0.9)]"
      >
        {/* Top Glowing Laser Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 via-indigo-500 via-purple-500 to-transparent opacity-85" />

        <div className="max-w-md mx-auto px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-end justify-around gap-1">
          {/* 1. Hub / Dashboard */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              pathname === "/dashboard"
                ? "text-cyan-300 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {pathname === "/dashboard" && (
              <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
            <div
              className={`p-1 rounded-lg transition-transform ${
                pathname === "/dashboard"
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 scale-110 shadow-sm"
                  : ""
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Hub</span>
          </Link>

          {/* 2. Night-Out Curator */}
          <Link
            href="/night-out"
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              pathname === "/night-out"
                ? "text-cyan-300 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {pathname === "/night-out" && (
              <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
            <div
              className={`p-1 rounded-lg transition-transform ${
                pathname === "/night-out"
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 scale-110 shadow-sm"
                  : ""
              }`}
            >
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Night-Out</span>
          </Link>

          {/* 3. CENTER FLOATING JEWEL: Cultural DNA Radar */}
          <Link
            href="/cultural-dna"
            className="flex flex-col items-center justify-center flex-1 -mt-4 relative group"
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 border-2 ${
                pathname === "/cultural-dna"
                  ? "bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 border-white shadow-cyan-500/50 scale-105"
                  : "bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 border-white/20 shadow-cyan-500/30 hover:scale-105"
              }`}
            >
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span
              className={`text-[10px] font-mono font-bold tracking-tight mt-1 ${
                pathname === "/cultural-dna" ? "text-cyan-300" : "text-gray-300"
              }`}
            >
              Radar
            </span>
          </Link>

          {/* 4. Subculture Travel */}
          <Link
            href="/travel"
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              pathname === "/travel"
                ? "text-purple-300 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {pathname === "/travel" && (
              <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            )}
            <div
              className={`p-1 rounded-lg transition-transform ${
                pathname === "/travel"
                  ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 scale-110 shadow-sm"
                  : ""
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Travel</span>
          </Link>

          {/* 5. Profile & Taste Health */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              pathname === "/profile"
                ? "text-emerald-300 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {pathname === "/profile" && (
              <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
            <div className="relative">
              <div
                className={`p-1 rounded-lg transition-transform ${
                  pathname === "/profile"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 scale-110 shadow-sm"
                    : ""
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              {/* Dynamic Health Pill Mini Badge */}
              <span
                className={`absolute -top-1.5 -right-3 text-[8px] font-mono font-black px-1 py-0.2 rounded-full border shadow-sm ${
                  navbarProfileHealth.isComplete
                    ? "bg-emerald-500 text-black border-emerald-300"
                    : "bg-amber-500 text-black border-amber-300"
                }`}
              >
                {navbarProfileHealth.percent}%
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
