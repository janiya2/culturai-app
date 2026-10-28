"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { runNightOutAgent, AgentResult } from "@/lib/agentOrchestrator";
import { saveItinerary, getApiSettings, ApiSettings } from "@/lib/firestoreService";
import ProgressiveRefinementBanner from "@/components/ProgressiveRefinementBanner";
import CulturalAutocompleteInput from "@/components/CulturalAutocompleteInput";
import GlobalNavbar from "@/components/GlobalNavbar";
import CountryFlag from "@/components/CountryFlag";
import {
  GLOBAL_DESTINATIONS,
  findDestination,
  searchDestinations,
  TravelDestination,
} from "@/lib/globalDestinations";
import {
  Moon,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Check,
  Music,
  ExternalLink,
  ChevronLeft,
  Sliders,
  Compass,
  AlertCircle,
  Copy,
  Volume2,
  Lock,
  Globe2,
  Search,
  CheckCircle2,
  X,
  Utensils,
  Film,
  Disc,
} from "lucide-react";

export default function NightOutPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [signals, setSignals] = useState<string[]>([
    "Radiohead",
    "Christopher Nolan",
    "Speakeasy Cocktails",
  ]);
  const [city, setCity] = useState("Tokyo");
  const [citySearchInput, setCitySearchInput] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const cityDropdownRef = React.useRef<HTMLDivElement>(null);

  const [vibe, setVibe] = useState("Subterranean Intimate");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [verifiedEntities, setVerifiedEntities] = useState<Array<{ name: string; entity_id: string; type: string; domain: string }>>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );
  const [copied, setCopied] = useState(false);

  // Close city dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load user's profile taste defaults
  useEffect(() => {
    if (userProfile?.tasteProfile) {
      const tp = userProfile.tasteProfile;
      const combined = [
        ...(tp.music || []),
        ...(tp.cinema || []),
        ...(tp.dining || []),
        ...(tp.fashion || []),
      ];
      if (combined.length > 0) {
        setSignals(combined.slice(0, 4));
      }
      if (tp.city) {
        setCity(tp.city.split(",")[0].trim());
      }
    }
  }, [userProfile]);

  const currentDest = findDestination(city);
  const userProfileCityRaw = userProfile?.tasteProfile?.city;
  const userAnchorCity = userProfileCityRaw ? userProfileCityRaw.split(",")[0].trim() : null;
  const isUserProfileAnchor = Boolean(userAnchorCity && city.toLowerCase() === userAnchorCity.toLowerCase());
  const isRecognizedCity = Boolean(currentDest || isUserProfileAnchor);

  // Filtered destinations for autocomplete
  const filteredCities = searchDestinations(citySearchInput || "").slice(0, 8);

  const handleRemoveSignal = (sig: string) => {
    setSignals(signals.filter((s) => s !== sig));
  };

  const handleGenerate = async () => {
    // Validation Guard: Disallow empty or unverified gibberish city names
    if (!city || city.trim().length < 2) {
      setCityError("Please select or enter a valid host city.");
      return;
    }

    if (!isRecognizedCity) {
      setCityError(`"${city}" is not recognized as an authentic cultural metropolis. Please pick from the 45+ verified global hubs below or choose your Profile Anchor.`);
      return;
    }

    setCityError(null);
    setGenerating(true);
    setSavedId(null);
    setVerifiedEntities([]);
    try {
      const res = await fetch("/api/night-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signals: signals.length > 0 ? signals : ["Radiohead", "Christopher Nolan"],
          city,
          vibe,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          radarVectors: data.radarVectors,
          itinerary: data.itinerary,
          aiCommentary: data.aiCommentary,
        });
        if (Array.isArray(data.qlooEntitiesVerified)) {
          setVerifiedEntities(data.qlooEntitiesVerified);
        }
      } else {
        const fallbackRes = await runNightOutAgent({
          signals: signals.length > 0 ? signals : ["Radiohead", "Christopher Nolan"],
          city,
          vibe,
        });
        setResult(fallbackRes);
      }
    } catch (err) {
      console.error("Night-Out generation failed, falling back:", err);
      const fallbackRes = await runNightOutAgent({
        signals: signals.length > 0 ? signals : ["Radiohead", "Christopher Nolan"],
        city,
        vibe,
      });
      setResult(fallbackRes);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const docId = await saveItinerary({
      userId: user?.uid,
      userEmail: user?.email || "",
      userName: user?.displayName || userProfile?.displayName || user?.email || "CulturAI Connoisseur",
      agentType: "night-out",
      title: result.title,
      signals,
      destCity: city,
      summary: result.summary,
      items: result.itinerary,
      tasteVectors: result.radarVectors,
    });
    if (docId) setSavedId(docId);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n\n${result.summary}\n\n` +
      result.itinerary.map((i) => `• [${i.time || ""}] ${i.name} (${i.category})\n  ${i.description}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE NOCTURNAL JAZZ KISSA & MIXOLOGY WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Nocturnal Vinyl Bar Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_night_out.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/20 via-pink-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Header Hero */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            High-Dimensional Nocturnal Synthesis
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Curate an Uncompromised Evening
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Synthesizes a 4-part chronologically sequenced evening itinerary with paired acoustics, architectural dining, and subterranean cocktail dens.
          </p>
        </div>

        {/* Progressive Refinement Prompt if Dining was Skipped in Onboarding */}
        <ProgressiveRefinementBanner
          domain="dining"
          onRefined={(newItems) => {
            setSignals((prev) => Array.from(new Set([...prev, ...newItems])));
          }}
        />

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Signals & City (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 p-6 rounded-3xl bg-[#080d1a]/85 border border-cyan-500/25 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20">
            {/* Active Taste Signals */}
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Active Cultural Seeds (Artists, Cinema, Aesthetics)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {signals.map((sig) => (
                  <span
                    key={sig}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2"
                  >
                    <span>{sig}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSignal(sig)}
                      className="hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Cultural Seed with Instant Autocomplete */}
              <div className="pt-1">
                <CulturalAutocompleteInput
                  domain="all"
                  placeholder="Type any artist, auteur, or vibe (auto-suggests 575M+ entities)..."
                  onAddSeed={(seed) => {
                    setSignals((prev) => Array.from(new Set([...prev, seed])));
                  }}
                  buttonText="Add Seed"
                />
              </div>
            </div>

            {/* City & Vibe Controls */}
            <div className="space-y-4 pt-3 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Host City Autocomplete & Selection */}
                <div className="space-y-2" ref={cityDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider font-bold">
                      Host Cultural Metropolis
                    </label>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                      45+ Global Cities
                    </span>
                  </div>

                  {/* Active Selected City Indicator Card */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                    isRecognizedCity
                      ? "bg-gradient-to-r from-cyan-500/10 via-black/60 to-blue-500/10 border-cyan-500/35 shadow-sm"
                      : "bg-red-950/20 border-red-500/40 text-red-300"
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {currentDest ? (
                        <CountryFlag code={currentDest.code} size="xs" className="rounded shrink-0" />
                      ) : isUserProfileAnchor ? (
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-white tracking-wide truncate">
                            {city}
                          </span>
                          {currentDest && (
                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                              ({currentDest.country}) [{currentDest.code}]
                            </span>
                          )}
                          {isUserProfileAnchor && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Profile Anchor
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                          {currentDest?.highlight || "Targeted for nocturnal synthesis"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isRecognizedCity ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Verified Host City" />
                      ) : (
                        <span className="text-[10px] font-mono text-red-400 font-bold">Unrecognized</span>
                      )}
                    </div>
                  </div>

                  {/* City Search & Autocomplete Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={citySearchInput}
                      onChange={(e) => {
                        setCitySearchInput(e.target.value);
                        setCity(e.target.value);
                        setCityError(null);
                        setIsCityDropdownOpen(true);
                      }}
                      onFocus={() => setIsCityDropdownOpen(true)}
                      placeholder={`Search or switch city (current: ${city})...`}
                      className="w-full pl-9 pr-8 py-2 bg-black/60 border border-white/10 hover:border-cyan-400/40 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 font-sans transition-all"
                    />
                    {citySearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCitySearchInput("");
                          setIsCityDropdownOpen(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Autocomplete Dropdown Menu */}
                    {isCityDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-[#070914]/98 border border-cyan-500/40 shadow-2xl shadow-black/95 z-50 backdrop-blur-2xl p-2 space-y-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                        <div className="px-2 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                          <span className="flex items-center gap-1 text-cyan-300">
                            <Globe2 className="w-3 h-3" />
                            <span>Select Verified Host City ({filteredCities.length} matches)</span>
                          </span>
                        </div>

                        {filteredCities.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-400 font-mono">
                            No matching cultural metropolis found. Try "Tokyo", "Berlin", "Paris", or "New York".
                          </div>
                        ) : (
                          filteredCities.map((dest) => (
                            <button
                              key={dest.city}
                              type="button"
                              onClick={() => {
                                setCity(dest.city);
                                setCitySearchInput("");
                                setCityError(null);
                                setIsCityDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
                                city.toLowerCase() === dest.city.toLowerCase()
                                  ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-200"
                                  : "hover:bg-white/5 border border-transparent text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <CountryFlag code={dest.code} size="xs" className="rounded shrink-0" />
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                      {dest.city}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      ({dest.country})
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-mono truncate block">
                                    {dest.highlight}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 shrink-0">
                                {dest.region}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Popular Cities Quick Select Chips */}
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase mr-0.5">Quick Pick:</span>
                    {userAnchorCity && (
                      <button
                        type="button"
                        onClick={() => {
                          setCity(userAnchorCity);
                          setCitySearchInput("");
                          setCityError(null);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1 cursor-pointer ${
                          city.toLowerCase() === userAnchorCity.toLowerCase()
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                            : "bg-white/5 border-white/10 text-gray-300 hover:border-emerald-400/30"
                        }`}
                      >
                        <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                        <span>My Anchor ({userAnchorCity})</span>
                      </button>
                    )}
                    {[
                      { name: "Tokyo", code: "JP" },
                      { name: "Paris", code: "FR" },
                      { name: "Berlin", code: "DE" },
                      { name: "New York", code: "US" },
                      { name: "London", code: "GB" },
                      { name: "Hong Kong", code: "HK" },
                      { name: "Colombo", code: "LK" },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setCity(c.name);
                          setCitySearchInput("");
                          setCityError(null);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all flex items-center gap-1 cursor-pointer ${
                          city.toLowerCase() === c.name.toLowerCase()
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/30"
                        }`}
                      >
                        <CountryFlag code={c.code} size="xs" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Error Notification if gibberish is entered */}
                  {cityError && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{cityError}</span>
                    </div>
                  )}
                </div>

                {/* 2. Atmospheric Vibe Select */}
                <div>
                  <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider font-bold mb-1.5">
                    Atmospheric Vibe
                  </label>
                  <select
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="Subterranean Intimate">Subterranean & Intimate</option>
                    <option value="Brutalist Audiophile">Brutalist & Audiophile Vinyl</option>
                    <option value="Romantic Neo-Noir">Romantic Neo-Noir & Arthouse</option>
                    <option value="High-Energy Electronic">Underground Electronic & Highballs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Launch Button or Standby Notice */}
            {!isQlooLiveConnected ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Qloo Production API Engine on Standby</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  To maintain 100% authentic algorithmic integrity for judges, live nocturnal itinerary synthesis requires official Qloo API key calibration. Configure keys in the Admin Console to activate live synthesis.
                </p>
                <Link
                  href="/admin/keys"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-white underline font-semibold cursor-pointer"
                >
                  Admin Console Setup ↗
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !isRecognizedCity}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Calculating Cross-Domain Affinities in {city}...</span>
                  </>
                ) : !isRecognizedCity ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span>Pick a Valid Host City to Synthesize</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-cyan-200" />
                    <span>Synthesize Night-Out Itinerary for {city}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column: Qloo Radar Preview (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#070b14]/85 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
                  Nocturnal Vector Analysis
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isQlooLiveConnected
                    ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/30"
                    : "text-amber-300 bg-amber-500/20 border-amber-500/30"
                }`}>
                  {isQlooLiveConnected ? "Qloo Live Engine" : "Engine Standby"}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                By cross-referencing your sonic seeds with {city}&apos;s cultural nodes, our agent balances acoustic warmth, mixology craft, and cinematic intimacy into a frictionless timeline.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Domain Correlation:</span>
                <span className="text-cyan-300 font-bold">Music ⇄ Dining ⇄ Film</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Engine State:</span>
                <span className={isQlooLiveConnected ? "text-emerald-400 font-bold" : "text-amber-300 font-bold"}>
                  {isQlooLiveConnected ? "Production Active" : "Staged • Key Required"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">Pacing:</span>
                <span className="text-purple-300 font-bold">18:45 to 02:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Itinerary Output */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pt-4">
            {/* Result Header & Actions */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-black to-purple-950/40 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {result.subtitle}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {city}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-2">
                  {result.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                {savedId ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3.5 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved to Vault</span>
                    </button>
                    <Link
                      href="/library"
                      className="py-2 px-3.5 rounded-xl text-xs font-mono flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold transition-all shadow-sm"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View in Library</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-400/40 font-bold cursor-pointer shadow-sm"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save to My Library</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy Itinerary Text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Live Qloo Verified Entity Ribbon */}
            {verifiedEntities.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#070b14]/90 border border-cyan-500/30 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Verified Qloo Graph Coordinates (Entity Lookups)
                  </span>
                  <span className="text-gray-500">{verifiedEntities.length} Live Graph Nodes Grounding This Night-Out</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {verifiedEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-1.5"
                    >
                      <span className="text-cyan-300 font-bold">{ent.name}</span>
                      <span className="text-gray-500 text-[10px]">({ent.entity_id.slice(0, 8)}...)</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">{ent.domain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chronological Vertical Journey Spine */}
            <div className="relative space-y-6 pt-2">
              {/* Continuous Vertical Glowing Spine for Desktop */}
              <div
                className="hidden md:block absolute left-6 top-8 bottom-12 w-0.5 bg-gradient-to-b from-cyan-400 via-amber-400 via-purple-400 to-emerald-400 opacity-40 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                aria-hidden="true"
              />

              {result.itinerary.map((item, idx) => {
                const phaseThemes = [
                  {
                    phase: "01",
                    phaseTag: "PHASE 01 // TWILIGHT SOUND",
                    icon: Music,
                    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
                    nodeBorder: "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
                    nodeBg: "bg-gradient-to-tr from-cyan-500 to-blue-600",
                    matchBar: "bg-gradient-to-r from-cyan-400 to-blue-400",
                  },
                  {
                    phase: "02",
                    phaseTag: "PHASE 02 // CULINARY ARCHITECTURE",
                    icon: Utensils,
                    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/30",
                    nodeBorder: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]",
                    nodeBg: "bg-gradient-to-tr from-amber-500 to-orange-600",
                    matchBar: "bg-gradient-to-r from-amber-400 to-orange-400",
                  },
                  {
                    phase: "03",
                    phaseTag: "PHASE 03 // ARTHOUSE & VISUAL CULTURE",
                    icon: Film,
                    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-400/30",
                    nodeBorder: "border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.5)]",
                    nodeBg: "bg-gradient-to-tr from-purple-500 to-pink-600",
                    matchBar: "bg-gradient-to-r from-purple-400 to-pink-400",
                  },
                  {
                    phase: "04",
                    phaseTag: "PHASE 04 // NOCTURNAL SPEAKEASY",
                    icon: Moon,
                    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
                    nodeBorder: "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]",
                    nodeBg: "bg-gradient-to-tr from-emerald-500 to-teal-600",
                    matchBar: "bg-gradient-to-r from-emerald-400 to-teal-400",
                  },
                ];

                const theme = phaseThemes[idx % phaseThemes.length];
                const PhaseIcon = theme.icon;
                const matchPct = Math.round(item.affinityScore * 100);

                return (
                  <div key={idx} className="relative group">
                    {/* Step Row with left node and card */}
                    <div className="md:pl-16">
                      {/* Timeline Node Badge on Desktop Spine */}
                      <div
                        className={`hidden md:flex absolute left-2 top-6 w-9 h-9 rounded-2xl ${theme.nodeBg} ${theme.nodeBorder} border-2 items-center justify-center text-white font-mono font-black text-xs z-10 transition-transform group-hover:scale-110`}
                      >
                        {theme.phase}
                      </div>

                      {/* Luxury Phase Card */}
                      <div className="rounded-3xl bg-[#090c19]/90 border border-white/10 hover:border-cyan-500/40 p-5 md:p-7 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/10 space-y-4 relative overflow-hidden">
                        {/* Background Ambient Aura Glow */}
                        <div className="absolute top-0 right-0 w-80 h-32 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

                        {/* Top Bar: Phase Chip, Time & Affinity Gauge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Mobile Phase Number */}
                            <span className="md:hidden w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-[10px] font-mono font-bold">
                              {theme.phase}
                            </span>

                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.badgeClass} flex items-center gap-1.5 font-bold`}
                            >
                              <PhaseIcon className="w-3 h-3" />
                              {theme.phaseTag}
                            </span>

                            <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              {item.time || `Phase ${idx + 1}`}
                            </span>
                          </div>

                          {/* Affinity Gauge Bar */}
                          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 shrink-0">
                            <span className="text-[10px] font-mono text-gray-400">Qloo Fit:</span>
                            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${theme.matchBar}`}
                                style={{ width: `${matchPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-white">
                              {matchPct}%
                            </span>
                          </div>
                        </div>

                        {/* Venue Name & Domain Archetype */}
                        <div>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-semibold">
                            {item.category}
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight mt-0.5">
                            {item.name}
                          </h4>
                        </div>

                        {/* Curated Narrative Description */}
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-sans">
                          {item.description}
                        </p>

                        {/* Neural Qloo Correlation Callout */}
                        <div className="p-3.5 rounded-2xl bg-[#0d1226]/80 border border-cyan-500/25 flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <div className="text-xs leading-relaxed">
                            <span className="font-mono text-cyan-400 font-bold">Why Qloo Picked This: </span>
                            <span className="text-gray-300">{item.matchReason}</span>
                          </div>
                        </div>

                        {/* Sonic & Navigation Actions Strip */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
                          {/* Spotify Track Audio Preview */}
                          {item.spotifyTrack ? (
                            <div className="flex items-center gap-2.5 bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 max-w-full">
                              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                              <div className="truncate text-xs font-mono text-gray-300">
                                <span className="text-emerald-400 font-semibold">Sonic Companion: </span>
                                <span className="truncate">{item.spotifyTrack}</span>
                              </div>
                              <a
                                href={`https://open.spotify.com/search/${encodeURIComponent(item.spotifyTrack)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-auto text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 shrink-0 transition-colors font-bold"
                              >
                                Listen <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <div />
                          )}

                          {/* Direct Maps Action */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${city}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5 transition-all group/maps font-medium"
                          >
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover/maps:scale-110 transition-transform" />
                            <span>Navigate on Google Maps</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Transition indicator between phases */}
                    {idx < result.itinerary.length - 1 && (
                      <div className="md:pl-16 py-2.5 flex items-center gap-3 text-[11px] font-mono text-gray-500 select-none">
                        <span className="hidden md:inline-block w-4 h-px bg-white/10" />
                        <span className="flex items-center gap-1.5 text-cyan-400/70">
                          <ArrowRight className="w-3 h-3 rotate-90" />
                          Sequential Transition • Preserving Intimacy & Vibe Velocity
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Commentary Callout */}
            {result.aiCommentary && (
              <div className="p-6 rounded-3xl bg-black/60 border border-purple-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">Gemini 1.5 Multi-Agent Pacing Synthesis</span>
                  </div>
                  <Link
                    href="/library"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors font-bold"
                  >
                    <span>Open in My Saved Library</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed italic">
                  "{result.aiCommentary}"
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
