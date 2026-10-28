"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings, getRecentItineraries, ItineraryRecord } from "@/lib/firestoreService";
import { calculateTasteDNA } from "@/lib/qlooService";
import { resolveCityMetadata } from "@/lib/cityData";
import GlobalNavbar from "@/components/GlobalNavbar";
import CityMapModal from "@/components/CityMapModal";
import CountryFlag from "@/components/CountryFlag";
import CulturalAutocompleteInput from "@/components/CulturalAutocompleteInput";
import {
  User,
  Sparkles,
  Music,
  Film,
  Utensils,
  Shirt,
  MapPin,
  Check,
  Edit3,
  Plus,
  Trash2,
  Bookmark,
  Share2,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  Globe2,
  Clock,
  Compass,
  Lock,
} from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const { user, userProfile, updateTaste, updateDisplayName, loading } = useAuth();

  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [recentItineraries, setRecentItineraries] = useState<ItineraryRecord[]>([]);

  // Editing Name State
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
    getRecentItineraries(4).then(setRecentItineraries).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  const taste = userProfile?.tasteProfile;
  const userName = userProfile?.displayName || user?.displayName || "Janitha Dilshan";
  const userEmail = user?.email || "architect@innoxpert.com";
  const currentCity = taste?.city || "Tokyo, Japan";
  const cityMeta = resolveCityMetadata(currentCity);

  // Active Seeds per Domain (Excluding legacy mock defaults)
  const isLegacyMockMusic =
    (taste?.music?.length === 2 && taste.music[0] === "Radiohead" && taste.music[1] === "Daft Punk") ||
    (taste?.music?.length === 1 && taste.music[0] === "Radiohead");
  const isLegacyMockCinema =
    taste?.cinema?.length === 1 && taste.cinema[0] === "Christopher Nolan";
  const isLegacyMockDining =
    taste?.dining?.length === 1 && taste.dining[0] === "Speakeasy Cocktails";
  const isLegacyMockFashion =
    taste?.fashion?.length === 1 && taste.fashion[0] === "Brutalist Architecture";

  const musicList = useMemo(() => (isLegacyMockMusic ? [] : taste?.music || []), [taste, isLegacyMockMusic]);
  const cinemaList = useMemo(() => (isLegacyMockCinema ? [] : taste?.cinema || []), [taste, isLegacyMockCinema]);
  const diningList = useMemo(() => (isLegacyMockDining ? [] : taste?.dining || []), [taste, isLegacyMockDining]);
  const fashionList = useMemo(() => (isLegacyMockFashion ? [] : taste?.fashion || []), [taste, isLegacyMockFashion]);

  // Dynamic Profile Health Score (%)
  const profileHealth = useMemo(() => {
    let completedSteps = 0;
    const totalSteps = 5;
    if (musicList.length > 0) completedSteps++;
    if (cinemaList.length > 0) completedSteps++;
    if (diningList.length > 0) completedSteps++;
    if (fashionList.length > 0) completedSteps++;
    if (currentCity?.trim()) completedSteps++;
    const percent = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
    return {
      percent,
      completedSteps,
      totalSteps,
      skippedCount: totalSteps - completedSteps,
      isComplete: percent === 100,
      hasMusic: musicList.length > 0,
      hasCinema: cinemaList.length > 0,
      hasDining: diningList.length > 0,
      hasFashion: fashionList.length > 0,
      hasCity: Boolean(currentCity?.trim()),
    };
  }, [musicList, cinemaList, diningList, fashionList, currentCity]);

  // Check skipped / incomplete categories
  const incompleteDomains = useMemo(() => {
    const list: Array<{
      id: "music" | "cinema" | "dining" | "fashion";
      label: string;
      icon: any;
      color: string;
      suggestions: string[];
    }> = [];

    if (musicList.length === 0) {
      list.push({
        id: "music",
        label: "Sonic & Acoustic Taste (Skipped)",
        icon: Music,
        color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        suggestions: ["Radiohead", "Daft Punk", "Miles Davis", "Aphex Twin", "Brian Eno", "Floating Points"],
      });
    }

    if (cinemaList.length === 0) {
      list.push({
        id: "cinema",
        label: "Cinematic & Visual Aesthetic (Skipped)",
        icon: Film,
        color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
        suggestions: ["Christopher Nolan", "Denis Villeneuve", "Wong Kar-wai", "David Fincher", "Blade Runner", "Andrei Tarkovsky"],
      });
    }

    if (diningList.length === 0) {
      list.push({
        id: "dining",
        label: "Gastronomy & Sanctuary Den (Skipped)",
        icon: Utensils,
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        suggestions: ["Speakeasy Cocktails", "Natural Wine Bars", "Omakase Counter", "Third-Wave Coffee", "Subterranean Mezcal"],
      });
    }

    if (fashionList.length === 0) {
      list.push({
        id: "fashion",
        label: "Architecture & Apparel Form (Skipped)",
        icon: Shirt,
        color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
        suggestions: ["Brutalist Architecture", "Issey Miyake", "Minimalist Raw Concrete", "Archive Japanese Denim", "Maison Margiela"],
      });
    }

    return list;
  }, [musicList, cinemaList, diningList, fashionList]);

  // Consolidated Signal Count
  const allSignals = useMemo(() => {
    return Array.from(new Set([...musicList, ...cinemaList, ...diningList, ...fashionList]));
  }, [musicList, cinemaList, diningList, fashionList]);

  // Dynamic Radar
  const radar = useMemo(() => {
    if (allSignals.length > 0) {
      return calculateTasteDNA(allSignals);
    }
    return (
      taste?.radarVectors || {
        sonicDepth: 94,
        cinematicAesthetic: 90,
        gastronomyCuriosity: 82,
        urbanSubculture: 88,
        literaryResonance: 75,
      }
    );
  }, [allSignals, taste]);

  // Handlers for Add / Remove Seeds
  const handleAddSeed = async (domain: "music" | "cinema" | "dining" | "fashion", val: string) => {
    if (!val.trim()) return;
    const current = (taste?.[domain] as string[]) || [];
    if (current.includes(val.trim())) return;

    const next = [...current, val.trim()];
    const ok = await updateTaste({ [domain]: next });
    if (ok) {
      setSaveSuccess(`Added "${val.trim()}" to ${domain}`);
      setTimeout(() => setSaveSuccess(null), 2500);
    }
  };

  const handleRemoveSeed = async (domain: "music" | "cinema" | "dining" | "fashion", val: string) => {
    const current = (taste?.[domain] as string[]) || [];
    const next = current.filter((x) => x !== val);
    await updateTaste({ [domain]: next });
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateDisplayName(nameInput.trim());
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE CYBERNETIC CULTURAL ARCHIVAL IDENTITY WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Glass Sanctuary & Skyline Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-40 sm:opacity-55"
          style={{ backgroundImage: `url('/bg_profile.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/80 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-cyan-500/20 via-indigo-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/20 via-pink-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* PROFILE HERO & IDENTITY HEADER */}
        {/* ======================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0a0d1d]/90 via-[#0e1227]/80 to-[#070914]/90 border border-cyan-500/35 backdrop-blur-3xl shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Identity Avatar & Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-wrap sm:flex-nowrap">
              {/* Avatar Pill */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-2xl shadow-cyan-500/30 border-2 border-white/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#040409] animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 shadow-sm">
                    Verified Taste DNA Hub
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    UID: {user?.uid.slice(0, 8)}...
                  </span>
                </div>

                {/* Display Name with inline edit */}
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-3 py-1 bg-black/80 border border-cyan-400 rounded-xl text-lg font-bold text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={savingName}
                      className="px-3 py-1 rounded-xl bg-cyan-500 text-black text-xs font-mono font-bold"
                    >
                      {savingName ? "..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="px-2 py-1 rounded-xl bg-white/10 text-xs font-mono"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {userName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(userName);
                        setEditingName(true);
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-cyan-300 transition-colors"
                      title="Edit Display Name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs font-mono text-gray-400">{userEmail}</p>

                {/* Active Anchor Pill with Vector Country Flag & Badge */}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCityModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-xs font-mono transition-all cursor-pointer group shadow-sm"
                  >
                    <CountryFlag code={cityMeta.code} size="xs" />
                    <span className="text-white font-bold">{cityMeta.fullName}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                      {cityMeta.country} [{cityMeta.code}]
                    </span>
                    <span className="text-[10px] text-cyan-400 group-hover:translate-x-0.5 transition-transform ml-1">
                      Change on Map ↗
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Persona & Profile Health Diagnostic Card */}
            <div className="p-4 rounded-2xl bg-black/75 border border-cyan-500/35 backdrop-blur-xl space-y-3 shrink-0 md:max-w-xs text-left shadow-xl shadow-cyan-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profile Health</span>
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  profileHealth.isComplete
                    ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/30"
                    : "text-amber-300 bg-amber-500/20 border-amber-500/30"
                }`}>
                  {profileHealth.percent}% ({profileHealth.completedSteps}/5)
                </span>
              </div>

              {/* Visual Health Track */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    profileHealth.isComplete
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_#34d399]"
                      : profileHealth.percent >= 80
                      ? "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_8px_#38bdf8]"
                      : "bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_#fbbf24]"
                  }`}
                  style={{ width: `${profileHealth.percent}%` }}
                />
              </div>

              <div className="pt-0.5 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">
                    {profileHealth.isComplete ? "100% Calibrated" : `${profileHealth.skippedCount} Skipped Dimension${profileHealth.skippedCount === 1 ? "" : "s"}`}
                  </span>
                  <span className={`text-[10px] font-mono ${isQlooLiveConnected ? "text-cyan-400" : "text-amber-400"}`}>
                    {isQlooLiveConnected ? "Live Graph" : "Staged Profile"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  {allSignals.length} active taste seeds mapped into Qloo's 575M+ entity neural graph.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PROGRESSIVE CALIBRATION: INCOMPLETE / SKIPPED DOMAINS */}
        {/* ======================================================== */}
        {incompleteDomains.length > 0 ? (
          <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#0a0d1d]/85 to-purple-950/25 border border-amber-500/35 backdrop-blur-3xl space-y-4 shadow-2xl shadow-amber-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Complete Your Taste Profile ({incompleteDomains.length} Skipped Dimensions Detected)
                  </h3>
                  <p className="text-xs text-gray-300">
                    You skipped these cultural dimensions during initial onboarding. Calibrate them now to maximize the algorithmic precision of all 8 concierges!
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold shrink-0 self-start sm:self-auto">
                {allSignals.length} / 12 Recommended Seeds
              </span>
            </div>

            {/* Incomplete Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incompleteDomains.map((inc) => {
                const Icon = inc.icon;
                return (
                  <div
                    key={inc.id}
                    className="p-4 rounded-2xl bg-black/70 border border-white/10 hover:border-amber-400/30 backdrop-blur-xl space-y-3 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${inc.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">{inc.label}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        Quick Add Recommended Seeds:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inc.suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddSeed(inc.id, sug)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          /* Profile 100% Calibrated Banner */
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Taste Profile 100% Calibrated: All 4 lifestyle domains (Music, Cinema, Dining, Fashion) are active.</span>
            </div>
            <Link href="/dashboard" className="text-emerald-300 hover:text-white underline font-bold shrink-0">
              Launch Dashboard ↗
            </Link>
          </div>
        )}

        {/* Success Alert Toast */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-cyan-300" />
            <span>{saveSuccess} • Profile Synced to Cloud Firestore</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* DOMAIN BREAKDOWN MATRIX: SEEDS BY CATEGORY WITH ADD/REMOVE */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-4 h-4" />
              </span>
              <span>Active Cultural Seed Matrix ({allSignals.length} Total Nodes)</span>
            </h3>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Click × to prune taste seeds in real time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Music Domain */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#080d1a]/85 via-[#0c1328]/75 to-[#050914]/85 border border-cyan-500/35 backdrop-blur-2xl shadow-xl shadow-cyan-950/25 space-y-3.5 group hover:border-cyan-400/50 transition-all">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-xs uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <span>Sonic & Musical Palate ({musicList.length})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Audio Vectors
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {musicList.length === 0 ? (
                  <span className="text-xs text-gray-500 italic flex items-center">No artists added yet. Type below to seed.</span>
                ) : (
                  musicList.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/35 hover:border-cyan-400 text-xs font-mono text-cyan-200 flex items-center gap-2 backdrop-blur-md shadow-sm transition-all"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeed("music", m)}
                        className="hover:text-white transition-colors text-cyan-400 hover:scale-125 cursor-pointer font-bold"
                        title={`Remove ${m}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Autocomplete Seed Input for Music */}
              <div className="pt-1">
                <CulturalAutocompleteInput
                  domain="music"
                  placeholder="Search artist, band or album (e.g. Aphex Twin, Miles Davis)..."
                  onAddSeed={(val) => handleAddSeed("music", val)}
                  buttonText="Add"
                />
              </div>
            </div>

            {/* 2. Cinema Domain */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0f091a]/85 via-[#180e2b]/75 to-[#0a0514]/85 border border-purple-500/35 backdrop-blur-2xl shadow-xl shadow-purple-950/25 space-y-3.5 group hover:border-purple-400/50 transition-all">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-purple-300 font-bold text-xs uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                    <Film className="w-3.5 h-3.5" />
                  </div>
                  <span>Cinema & Visual Aesthetic ({cinemaList.length})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  Visual Vectors
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {cinemaList.length === 0 ? (
                  <span className="text-xs text-gray-500 italic flex items-center">No directors or films added yet. Type below to seed.</span>
                ) : (
                  cinemaList.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/35 hover:border-purple-400 text-xs font-mono text-purple-200 flex items-center gap-2 backdrop-blur-md shadow-sm transition-all"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeed("cinema", c)}
                        className="hover:text-white transition-colors text-purple-400 hover:scale-125 cursor-pointer font-bold"
                        title={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Autocomplete Seed Input for Cinema */}
              <div className="pt-1">
                <CulturalAutocompleteInput
                  domain="cinema"
                  placeholder="Search director or visual movement (e.g. Wong Kar-wai, Nolan)..."
                  onAddSeed={(val) => handleAddSeed("cinema", val)}
                  buttonText="Add"
                />
              </div>
            </div>

            {/* 3. Dining & Speakeasy Domain */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#140d08]/85 via-[#23150d]/75 to-[#0c0805]/85 border border-amber-500/35 backdrop-blur-2xl shadow-xl shadow-amber-950/25 space-y-3.5 group hover:border-amber-400/50 transition-all">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-amber-300 font-bold text-xs uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <span>Gastronomy & Sanctuary ({diningList.length})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Culinary Vectors
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {diningList.length === 0 ? (
                  <span className="text-xs text-gray-500 italic flex items-center">No dining preferences added yet. Type below to seed.</span>
                ) : (
                  diningList.map((d) => (
                    <span
                      key={d}
                      className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 hover:border-amber-400 text-xs font-mono text-amber-200 flex items-center gap-2 backdrop-blur-md shadow-sm transition-all"
                    >
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeed("dining", d)}
                        className="hover:text-white transition-colors text-amber-400 hover:scale-125 cursor-pointer font-bold"
                        title={`Remove ${d}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Autocomplete Seed Input for Dining */}
              <div className="pt-1">
                <CulturalAutocompleteInput
                  domain="dining"
                  placeholder="Search dining, speakeasy or culinary style (e.g. Omakase, Natural Wine)..."
                  onAddSeed={(val) => handleAddSeed("dining", val)}
                  buttonText="Add"
                />
              </div>
            </div>

            {/* 4. Architecture & Fashion Domain */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#140810]/85 via-[#240e1c]/75 to-[#0c050a]/85 border border-rose-500/35 backdrop-blur-2xl shadow-xl shadow-rose-950/25 space-y-3.5 group hover:border-rose-400/50 transition-all">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2.5 text-rose-300 font-bold text-xs uppercase font-mono">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                    <Shirt className="w-3.5 h-3.5" />
                  </div>
                  <span>Architecture & Fashion ({fashionList.length})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  Spatial Vectors
                </span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {fashionList.length === 0 ? (
                  <span className="text-xs text-gray-500 italic flex items-center">No architectural preferences added yet. Type below to seed.</span>
                ) : (
                  fashionList.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/35 hover:border-rose-400 text-xs font-mono text-rose-200 flex items-center gap-2 backdrop-blur-md shadow-sm transition-all"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeed("fashion", f)}
                        className="hover:text-white transition-colors text-rose-400 hover:scale-125 cursor-pointer font-bold"
                        title={`Remove ${f}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Autocomplete Seed Input for Fashion */}
              <div className="pt-1">
                <CulturalAutocompleteInput
                  domain="fashion"
                  placeholder="Search architecture or designer (e.g. Brutalist Architecture, Issey Miyake)..."
                  onAddSeed={(val) => handleAddSeed("fashion", val)}
                  buttonText="Add"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5-D TASTE VECTOR BREAKDOWN */}
        {/* ======================================================== */}
        <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#080d1a]/85 via-[#0b1224]/80 to-[#050814]/85 border border-cyan-500/30 backdrop-blur-3xl shadow-2xl shadow-cyan-950/20 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">5-D Cultural Radar Dimensions</h3>
                <p className="text-xs text-gray-400">Algorithmic calibration score across lifestyle axes</p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-3 py-1 rounded-full border self-start sm:self-auto ${
              isQlooLiveConnected ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]" : "text-amber-300 bg-amber-500/20 border-amber-500/30"
            }`}>
              {isQlooLiveConnected ? "● Live Graph Synchronized" : "○ Staged Profile • Awaiting Live Key"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Sonic Depth", val: isQlooLiveConnected ? radar.sonicDepth : 0, color: "from-cyan-400 to-blue-500" },
              { label: "Cinematic Aesthetic", val: isQlooLiveConnected ? radar.cinematicAesthetic : 0, color: "from-purple-400 to-indigo-500" },
              { label: "Gastronomy Curiosity", val: isQlooLiveConnected ? radar.gastronomyCuriosity : 0, color: "from-amber-400 to-orange-500" },
              { label: "Urban Subculture", val: isQlooLiveConnected ? radar.urbanSubculture : 0, color: "from-rose-400 to-pink-500" },
              { label: "Literary Resonance", val: isQlooLiveConnected ? radar.literaryResonance : 0, color: "from-emerald-400 to-teal-500" },
            ].map((dim, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-cyan-400/35 backdrop-blur-xl transition-all space-y-2.5 shadow-md hover:shadow-cyan-950/30">
                <span className="text-[11px] font-medium text-gray-300 block truncate">{dim.label}</span>
                <span className="text-xl font-black font-mono text-cyan-300 block">
                  {isQlooLiveConnected ? `${dim.val}%` : "Staged (0%)"}
                </span>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-500`}
                    style={{ width: `${dim.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* RECENT ITINERARIES & ACTIONS */}
        {/* ======================================================== */}
        {recentItineraries.length > 0 && (
          <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0a0e1c]/80 via-[#0e1428]/75 to-[#060914]/80 border border-cyan-500/25 backdrop-blur-3xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Bookmark className="w-4 h-4" />
              </span>
              <span>Saved Itineraries for {userName} ({recentItineraries.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {recentItineraries.map((it, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl transition-all space-y-2 group cursor-pointer shadow-md hover:shadow-cyan-950/30"
                >
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    {it.agentType}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{it.title}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{it.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Global Interactive World Map City Switcher Modal */}
      <CityMapModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        currentCity={currentCity}
        onSelectCity={async (selectedCityString) => {
          await updateTaste({ city: selectedCityString });
        }}
      />
    </div>
  );
}
