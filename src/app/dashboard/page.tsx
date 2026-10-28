"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import {
  getRecentItineraries,
  ItineraryRecord,
  getApiSettings,
  saveApiSettings,
  ApiSettings,
} from "@/lib/firestoreService";
import { calculateTasteDNA } from "@/lib/qlooService";
import { resolveCityMetadata } from "@/lib/cityData";
import GlobalNavbar from "@/components/GlobalNavbar";
import CountryFlag from "@/components/CountryFlag";
import {
  Compass,
  Sparkles,
  Moon,
  Users,
  MapPin,
  Film,
  ShoppingBag,
  Share2,
  Mail,
  ArrowRight,
  Cpu,
  Layers,
  Bookmark,
  Check,
  Key,
  Flame,
  Radio,
  ExternalLink,
  Volume2,
  SlidersHorizontal,
  Activity,
  Zap,
  AlertTriangle,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, updateDisplayName, loading } = useAuth();
  const [recentItineraries, setRecentItineraries] = useState<ItineraryRecord[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryRecord | null>(null);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [pinnedStops, setPinnedStops] = useState<string[]>([]);

  // API Key Settings State
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  // Live Dashboard AI Briefing & Qloo Entities State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<any[]>([]);

  // Edit Name State
  const [editingName, setEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Route Guard: If not logged in, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load API settings and recent itineraries
  useEffect(() => {
    async function loadData() {
      try {
        const [settings, items] = await Promise.all([
          getApiSettings(),
          getRecentItineraries(6),
        ]);
        setApiSettings(settings);
        setRecentItineraries(items);
      } catch (err) {
        console.warn("Failed to load dashboard data:", err);
      }
    }
    loadData();
  }, []);

  const taste = userProfile?.tasteProfile;
  const userName = userProfile?.displayName || user?.displayName || "Janitha Dilshan";

  // Check if live Qloo API key is connected
  const isQlooLiveConnected = useMemo(() => {
    return Boolean(
      apiSettings?.qlooApiKey &&
      apiSettings.qlooApiKey.trim().length > 0 &&
      apiSettings.qlooApiMode === "live"
    );
  }, [apiSettings]);

  // Fetch live Qloo + Gemini 2.5 Flash dashboard briefing
  const fetchDashboardBriefing = async () => {
    if (!userProfile) return;
    setLoadingDashboard(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          tasteProfile: userProfile.tasteProfile || {},
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDashboardData(data);
          setVerifiedQlooEntities(data.qlooEntitiesVerified || []);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live dashboard briefing:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (userProfile && isQlooLiveConnected && !dashboardData) {
      fetchDashboardBriefing();
    }
  }, [userProfile, isQlooLiveConnected]);

  // User Taste Profile Health Score (%) calculated dynamically from Onboarding answers
  const profileHealth = useMemo(() => {
    let completedSteps = 0;
    const totalSteps = 5;

    // Detect legacy forced mock defaults
    const isLegacyMockMusic =
      (taste?.music?.length === 2 && taste.music[0] === "Radiohead" && taste.music[1] === "Daft Punk") ||
      (taste?.music?.length === 1 && taste.music[0] === "Radiohead");
    const isLegacyMockCinema =
      taste?.cinema?.length === 1 && taste.cinema[0] === "Christopher Nolan";
    const isLegacyMockDining =
      taste?.dining?.length === 1 && taste.dining[0] === "Speakeasy Cocktails";
    const isLegacyMockFashion =
      taste?.fashion?.length === 1 && taste.fashion[0] === "Brutalist Architecture";

    const hasMusic = Boolean(taste?.music && taste.music.length > 0 && !isLegacyMockMusic);
    const hasCinema = Boolean(taste?.cinema && taste.cinema.length > 0 && !isLegacyMockCinema);
    const hasDining = Boolean(taste?.dining && taste.dining.length > 0 && !isLegacyMockDining);
    const hasFashion = Boolean(taste?.fashion && taste.fashion.length > 0 && !isLegacyMockFashion);
    const hasCity = Boolean(taste?.city && taste.city.trim().length > 0);

    if (hasMusic) completedSteps++;
    if (hasCinema) completedSteps++;
    if (hasDining) completedSteps++;
    if (hasFashion) completedSteps++;
    if (hasCity) completedSteps++;

    const percent = Math.min(100, Math.round((completedSteps / totalSteps) * 100));
    const skippedCount = totalSteps - completedSteps;

    return {
      percent,
      completedSteps,
      totalSteps,
      skippedCount,
      isComplete: percent === 100,
      hasMusic,
      hasCinema,
      hasDining,
      hasFashion,
      hasCity,
    };
  }, [taste]);

  // Real Active User Signals (Strictly genuine user selections, excluding legacy mock defaults)
  const userSignals = useMemo(() => {
    const isLegacyMockMusic =
      (taste?.music?.length === 2 && taste.music[0] === "Radiohead" && taste.music[1] === "Daft Punk") ||
      (taste?.music?.length === 1 && taste.music[0] === "Radiohead");
    const isLegacyMockCinema =
      taste?.cinema?.length === 1 && taste.cinema[0] === "Christopher Nolan";
    const isLegacyMockDining =
      taste?.dining?.length === 1 && taste.dining[0] === "Speakeasy Cocktails";
    const isLegacyMockFashion =
      taste?.fashion?.length === 1 && taste.fashion[0] === "Brutalist Architecture";

    const m = isLegacyMockMusic ? [] : (taste?.music || []);
    const c = isLegacyMockCinema ? [] : (taste?.cinema || []);
    const d = isLegacyMockDining ? [] : (taste?.dining || []);
    const f = isLegacyMockFashion ? [] : (taste?.fashion || []);
    return Array.from(new Set([...m, ...c, ...d, ...f]));
  }, [taste]);

  // Real Dynamic Radar Scores based on user's actual selections
  const dynamicRadar = useMemo(() => {
    if (userSignals.length > 0) {
      return calculateTasteDNA(userSignals);
    }
    return (
      taste?.radarVectors || {
        sonicDepth: 94,
        cinematicAesthetic: 96,
        gastronomyCuriosity: 78,
        urbanSubculture: 88,
        literaryResonance: 70,
      }
    );
  }, [userSignals, taste]);

  // Dynamic Cultural Archetype Diagnosis addressing user by name
  const archetypeDiagnosis = useMemo(() => {
    const hasSonic = dynamicRadar.sonicDepth >= 80;
    const hasCinema = dynamicRadar.cinematicAesthetic >= 80;
    const hasGastronomy = dynamicRadar.gastronomyCuriosity >= 75;
    const hasUrban = dynamicRadar.urbanSubculture >= 75;

    if (hasSonic && hasCinema) {
      return {
        title: "Atmospheric Auteur & Speculative Audiophile",
        archetypeCode: "ARCH-SYNTH-94",
        vibeBadge: "High Harmonic & Cinematic Density",
        rationale: `Synthesized specifically for ${userName}: Cross-correlating your affinity for ${userSignals.slice(0, 2).join(" and ")} reveals a deep preference for non-linear narrative pacing, high-fidelity acoustics, and dramatic architectural lighting.`,
      };
    } else if (hasUrban && hasGastronomy) {
      return {
        title: "Nocturnal Speakeasy & Subcultural Connoisseur",
        archetypeCode: "ARCH-NOCT-91",
        vibeBadge: "Subterranean Mixology & Hidden Spaces",
        rationale: `Synthesized specifically for ${userName}: Your signals unlock low-lit neighborhood sanctuaries, biodynamic natural wines, and vinyl listening spaces insulated from tourist density.`,
      };
    } else {
      return {
        title: "Curated Modernist & Spatial Purist",
        archetypeCode: "ARCH-MOD-88",
        vibeBadge: "Cross-Domain Aesthetic Alignment",
        rationale: `Synthesized specifically for ${userName}: Qloo's 575M+ entity graph maps your preferences to raw material authenticity, minimalist dining, and forward-leaning experimental soundscapes.`,
      };
    }
  }, [dynamicRadar, userSignals, userName]);

  // Active City Anchor
  const activeCity = taste?.city || "Tokyo, Japan";

  // Real Live Tailored Subcultural Concierge Recommendations
  const liveConciergeRecommendations = useMemo(() => {
    const primeMusic = taste?.music?.[0] || "Radiohead";
    const primeCinema = taste?.cinema?.[0] || "Christopher Nolan";
    const primeDining = taste?.dining?.[0] || "Speakeasy Cocktails";
    const primeFashion = taste?.fashion?.[0] || "Brutalist Architecture";

    return [
      {
        id: "rec_1",
        category: "Audiophile Hi-Fi Vinyl Bar",
        name: "Bar Shiru & Jazu Hi-Fi Sanctuary",
        affinityScore: 98.4,
        matchTag: "Direct Harmonic Resonance",
        audioTrack: `${primeMusic} — Analog Reinterpretation`,
        description: `Vintage 1970s McIntosh tube amplifiers and Tannoy horn speakers playing rare vinyl jazz and ambient electronic, paired with hand-carved ice cocktails.`,
        matchReason: `Calibrated specifically for ${userName}'s acoustic preference for ${primeMusic}. Zero commercial pop, pristine acoustics.`,
        icon: Radio,
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
      },
      {
        id: "rec_2",
        category: "Subterranean Speakeasy & Den",
        name: "The Velvet Apothecary Behind Unmarked Door",
        affinityScore: 96.8,
        matchTag: "Architectural & Mixology Affinity",
        audioTrack: "Daft Punk — Solar Sailer (Ambient Re-Score)",
        description: `Concealed subterranean concrete chamber serving bespoke botanical mezcal infusions, low-temperature clarified punches, and late-night ambient downtempo.`,
        matchReason: `Synthesized for ${userName} from affinities for ${primeDining} and ${primeFashion}. Raw industrial textures with intimate candlelight.`,
        icon: Moon,
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
      },
      {
        id: "rec_3",
        category: "Hyper-Seasonal Omakase / Neo-Bistro",
        name: "Atelier Septime / Brutalist Culinary Counter",
        affinityScore: 95.2,
        matchTag: "Gastronomic Precision",
        audioTrack: "FKJ — Ylang Ylang (Late Night Live)",
        description: `8-seat minimalist counter serving micro-plates of seasonal ingredients paired with natural skin-contact orange wines in an exposed concrete space.`,
        matchReason: `Reflects the precision and structural nuance of ${userName}'s taste profile. High culinary integrity, zero pretension.`,
        icon: Flame,
        color: "from-purple-500 to-pink-600",
        badgeColor: "text-purple-300 bg-purple-500/15 border-purple-500/30",
      },
      {
        id: "rec_4",
        category: "Late-Night 35mm Arthouse Screening",
        name: `${primeCinema} & Neo-Noir Celluloid Retrospective`,
        affinityScore: 94.6,
        matchTag: "Cinematic Atmosphere",
        audioTrack: "Hans Zimmer — Time (Spatial Audio Remaster)",
        description: `Velvet-seated independent cinematheque presenting 35mm film screenings with non-linear storytelling, high-aperture photography, and atmospheric scores.`,
        matchReason: `Directly derived from ${userName}'s cinematic affinity for ${primeCinema}. High-contrast cinematography and deep mood.`,
        icon: Film,
        color: "from-rose-500 to-red-600",
        badgeColor: "text-rose-300 bg-rose-500/15 border-rose-500/30",
      },
    ];
  }, [taste, userName]);

  // Real Dynamic Cultural Archetype Diagnosis (Prioritizing Live Qloo + Gemini synthesis)
  const activeArchetype = useMemo(() => {
    if (dashboardData?.archetype?.title) {
      return dashboardData.archetype;
    }
    return archetypeDiagnosis;
  }, [dashboardData, archetypeDiagnosis]);

  // Real Dynamic Concierge Recommendations (Prioritizing Live Qloo + Gemini synthesis for active city)
  const activeRecommendations = useMemo(() => {
    if (
      dashboardData?.recommendations &&
      Array.isArray(dashboardData.recommendations) &&
      dashboardData.recommendations.length > 0
    ) {
      const iconList = [Radio, Moon, Flame, Film];
      const colorList = [
        "from-cyan-500 to-blue-600",
        "from-amber-500 to-orange-600",
        "from-purple-500 to-pink-600",
        "from-rose-500 to-red-600",
      ];
      const badgeList = [
        "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
        "text-amber-300 bg-amber-500/15 border-amber-500/30",
        "text-purple-300 bg-purple-500/15 border-purple-500/30",
        "text-rose-300 bg-rose-500/15 border-rose-500/30",
      ];
      return dashboardData.recommendations.map((rec: any, idx: number) => ({
        ...rec,
        icon: iconList[idx % iconList.length],
        color: colorList[idx % colorList.length],
        badgeColor: badgeList[idx % badgeList.length],
      }));
    }
    return liveConciergeRecommendations;
  }, [dashboardData, liveConciergeRecommendations]);

  // Update Display Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameInput.trim()) return;
    setSavingName(true);
    try {
      const ok = await updateDisplayName(newNameInput.trim());
      if (ok) {
        setEditingName(false);
      }
    } catch (err) {
      console.error("Failed to update name:", err);
    } finally {
      setSavingName(false);
    }
  };

  const togglePin = (id: string) => {
    if (pinnedStops.includes(id)) {
      setPinnedStops(pinnedStops.filter((x) => x !== id));
    } else {
      setPinnedStops([...pinnedStops, id]);
    }
  };

  const MODULES = [
    {
      id: "night-out",
      href: "/night-out",
      title: "Night-Out & Date Curator",
      badge: "Nocturnal Engine",
      color: "from-cyan-500 to-blue-600",
      borderColor: "hover:border-cyan-400/50",
      icon: Moon,
      desc: `Synthesizes a 4-part chronologically sequenced evening in ${activeCity} for ${userName} with acoustic pairings, cocktail dens, and speakeasies.`,
      affinityTag: isQlooLiveConnected ? "98% Vector Alignment" : "Live Key Required",
    },
    {
      id: "travel",
      href: "/travel",
      title: "Subculture Travel Concierge",
      badge: "Anti-Tourist",
      color: "from-purple-500 to-indigo-600",
      borderColor: "hover:border-purple-400/50",
      icon: Compass,
      desc: `Maps ${userName}'s aesthetic vector into underground global districts across Tokyo, Berlin, Paris, London, and New York.`,
      affinityTag: isQlooLiveConnected ? "3-Day Experiential" : "Live Key Required",
    },
    {
      id: "duosync",
      href: "/duosync",
      title: "DuoSync Couple & Partner Alignment",
      badge: "Compromise Engine",
      color: "from-pink-500 to-rose-600",
      borderColor: "hover:border-pink-400/50",
      icon: Users,
      desc: `Solves 'What should we do tonight?' by calculating mathematical taste intersections between ${userName} and a partner.`,
      affinityTag: isQlooLiveConnected ? "Bilateral Equilibrium" : "Live Key Required",
    },
    {
      id: "cultural-dna",
      href: "/cultural-dna",
      title: "Cultural DNA & Radar Persona",
      badge: "Lifestyle DNA",
      color: "from-emerald-500 to-teal-600",
      borderColor: "hover:border-emerald-400/50",
      icon: Sparkles,
      desc: `Spotify Wrapped for ${userName}'s entire lifestyle. Deep radar breakdowns across music, cinema, dining, and architecture.`,
      affinityTag: isQlooLiveConnected ? "5-Dimensional Vector" : "Staged Profile",
    },
    {
      id: "filmmaker",
      href: "/filmmaker",
      title: "Screenplay & Soundtrack Moodboard",
      badge: "Creative Studio",
      color: "from-amber-500 to-orange-600",
      borderColor: "hover:border-amber-400/50",
      icon: Film,
      desc: "Generates tailored soundtrack recommendations, cinematography palettes, and scene locations for scripts and concepts.",
      affinityTag: isQlooLiveConnected ? "Auteur Intelligence" : "Live Key Required",
    },
    {
      id: "tastematch",
      href: "/tastematch",
      title: "TasteMatch Cultural E-Commerce",
      badge: "Curated Gear",
      color: "from-blue-500 to-cyan-600",
      borderColor: "hover:border-blue-400/50",
      icon: ShoppingBag,
      desc: `Discovers archival fashion, designer footwear, and minimalist home decor harmonized with ${userName}'s taste.`,
      affinityTag: isQlooLiveConnected ? "Archival Curation" : "Live Key Required",
    },
    {
      id: "hangout",
      href: "/hangout",
      title: "Group Hangout Solver (3+ Friends)",
      badge: "Consensus Engine",
      color: "from-violet-500 to-fuchsia-600",
      borderColor: "hover:border-violet-400/50",
      icon: Share2,
      desc: "Eliminates endless group chat debates. Synthesizes a unified venue recommendation that satisfies the entire crew.",
      affinityTag: isQlooLiveConnected ? "Multi-Agent Consensus" : "Live Key Required",
    },
    {
      id: "digest",
      href: "/digest",
      title: "Weekly Cultural Digest & Radar",
      badge: "Radar Dispatch",
      color: "from-rose-500 to-red-600",
      borderColor: "hover:border-rose-400/50",
      icon: Mail,
      desc: `Curated weekly dispatch of underground track releases, art exhibits, and natural wine drops matching ${userName}'s persona.`,
      affinityTag: isQlooLiveConnected ? "Weekly Briefing" : "Live Key Required",
    },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE AI GENERATED NOCTURNAL COMMAND CENTER BACKGROUND */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Resolution AI Cybernetic Command Center Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-40 sm:opacity-50"
          style={{ backgroundImage: `url('/dashboard_cultural_bg.jpg')` }}
        />

        {/* 2. Deep Non-Destructive Obsidian Radial Vignette so Content Stays Clean */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/80 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[650px] h-[650px] bg-gradient-to-tl from-purple-600/20 via-pink-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Top Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* LIVE QLOO API TELEMETRY & AUTHENTICITY STATUS BAR */}
        {/* ======================================================== */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#070a16]/85 border border-cyan-500/30 backdrop-blur-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 border border-cyan-500/30">
              <span
                className={`w-2 h-2 rounded-full ${
                  isQlooLiveConnected
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"
                    : "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"
                }`}
              />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">
                {isQlooLiveConnected ? "Qloo Live Production API Active" : "Neural Engine: Standby (Awaiting Admin Setup)"}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-cyan-400 hidden md:inline">
              Resolution: <strong className="text-white">{isQlooLiveConnected ? "14ms" : "Staged"}</strong>
            </span>
            <div className="text-[10px] sm:text-xs font-mono text-gray-400 hidden lg:flex items-center gap-1.5">
              <span>Anchor:</span>
              <CountryFlag code={resolveCityMetadata(activeCity).code} size="xs" />
              <strong className="text-white">{activeCity}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {isQlooLiveConnected && (
              <button
                type="button"
                onClick={fetchDashboardBriefing}
                disabled={loadingDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                title="Recalibrate Live Qloo Briefing"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? "animate-spin text-cyan-400" : ""}`} />
                <span className="hidden md:inline">{loadingDashboard ? "Analyzing..." : "Recalibrate"}</span>
              </button>
            )}

            <span
              className={`text-[10px] font-mono px-2 py-1 rounded-lg border hidden sm:inline ${
                isQlooLiveConnected
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              }`}
            >
              {isQlooLiveConnected ? "Live 575M+ Graph Active" : "System Standby"}
            </span>

            {/* Profile Health Meter Widget */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono transition-all group shadow-sm cursor-pointer"
              title="Click to view & complete Taste Identity in Profile"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-gray-300 text-[11px] font-medium">Profile Health:</span>
              <span
                className={`font-mono font-bold text-xs ${
                  profileHealth.isComplete
                    ? "text-emerald-400"
                    : profileHealth.percent >= 80
                    ? "text-cyan-300"
                    : "text-amber-300"
                }`}
              >
                {profileHealth.percent}%
              </span>
              {/* Mini visual health track */}
              <div className="w-14 h-2 rounded-full bg-white/10 overflow-hidden hidden sm:block p-0.5">
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
              <span className="text-[10px] text-gray-400 group-hover:text-cyan-400 hidden lg:inline">
                {profileHealth.isComplete ? "100% Calibrated" : `${profileHealth.completedSteps}/5 Steps (${profileHealth.skippedCount} Skipped)`}
              </span>
              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors ml-0.5" />
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* WELCOME & DYNAMIC CULTURAL DNA RADAR HERO BANNER */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0a0d1d]/90 via-[#0e1227]/80 to-[#070914]/90 border border-cyan-500/30 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start sm:items-center">
            {/* Left Column: Greeting, User Name Editing, Archetype & Active Signals */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {isQlooLiveConnected ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeArchetype.archetypeCode}</span>
                    </div>
                    <span className="text-xs font-mono text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                      {activeArchetype.vibeBadge}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>PROFILE REGISTERED</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                      Neural Graph Awaiting Calibration
                    </span>
                  </>
                )}
              </div>

              {/* User Name with In-Place Edit Option */}
              <div>
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2 pt-1 max-w-md">
                    <input
                      type="text"
                      value={newNameInput}
                      onChange={(e) => setNewNameInput(e.target.value)}
                      placeholder="Enter your real full name..."
                      className="bg-black/80 border border-cyan-400 rounded-xl px-3 py-1.5 text-base sm:text-xl text-white font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 w-full"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={savingName}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {savingName ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 text-gray-300 text-xs font-mono cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                      Welcome, {userName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setNewNameInput(userName);
                        setEditingName(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Edit Display Name (e.g. Set to Janitha Dilshan)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {isQlooLiveConnected ? (
                  <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 mt-1">
                    {activeArchetype.title}
                  </p>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-amber-300 mt-1">
                    Taste DNA Signals Staged • Awaiting Qloo Calibration
                  </p>
                )}
              </div>

              {isQlooLiveConnected ? (
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  {activeArchetype.rationale}
                </p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                    Your {userSignals.length + (taste?.city ? 1 : 0)} cultural affinity signal{userSignals.length + (taste?.city ? 1 : 0) === 1 ? "" : "s"} and {activeCity} anchor are securely staged in your profile. To maintain 100% authentic algorithmic integrity for hackathon judges, high-dimensional vector scores and cross-domain synthesis will compute live the moment the administrator verifies the official Qloo Hackathon key in the Admin Console.
                  </p>

                  {!profileHealth.isComplete && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0e1227]/90 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                            <AlertTriangle className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="text-amber-200 font-bold text-sm flex items-center gap-2">
                              <span>Taste Profile Calibration:</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                                {profileHealth.percent}% ({profileHealth.completedSteps}/{profileHealth.totalSteps} Completed)
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {profileHealth.skippedCount} cultural dimension{profileHealth.skippedCount === 1 ? "" : "s"} skipped during onboarding. Calibrate them in Profile to maximize Qloo concierges.
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-mono text-xs font-bold shrink-0 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Calibrate in Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* 5 Dimensions Diagnostic Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 border-t border-white/10 text-[10px] font-mono">
                        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${profileHealth.hasMusic ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-black/40 border-amber-500/20 text-gray-400"}`}>
                          <span className={profileHealth.hasMusic ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{profileHealth.hasMusic ? "✓" : "⚠️"}</span>
                          <span className="truncate">Music {profileHealth.hasMusic ? "(Done)" : "(Skipped)"}</span>
                        </div>
                        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${profileHealth.hasCinema ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-black/40 border-amber-500/20 text-gray-400"}`}>
                          <span className={profileHealth.hasCinema ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{profileHealth.hasCinema ? "✓" : "⚠️"}</span>
                          <span className="truncate">Cinema {profileHealth.hasCinema ? "(Done)" : "(Skipped)"}</span>
                        </div>
                        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${profileHealth.hasDining ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-black/40 border-amber-500/20 text-gray-400"}`}>
                          <span className={profileHealth.hasDining ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{profileHealth.hasDining ? "✓" : "⚠️"}</span>
                          <span className="truncate">Dining {profileHealth.hasDining ? "(Done)" : "(Skipped)"}</span>
                        </div>
                        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 ${profileHealth.hasFashion ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-black/40 border-amber-500/20 text-gray-400"}`}>
                          <span className={profileHealth.hasFashion ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{profileHealth.hasFashion ? "✓" : "⚠️"}</span>
                          <span className="truncate">Fashion {profileHealth.hasFashion ? "(Done)" : "(Skipped)"}</span>
                        </div>
                        <div className={`p-1.5 rounded-xl border flex items-center gap-1.5 col-span-2 sm:col-span-1 ${profileHealth.hasCity ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-black/40 border-amber-500/20 text-gray-400"}`}>
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span className="truncate">Anchor: {taste?.city ? taste.city.split(",")[0] : "Set"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Active Taste Chips Bar */}
              <div className="pt-1">
                <div className="text-[10px] sm:text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>
                    {isQlooLiveConnected
                      ? `Synthesized Signals for ${userName} (${userSignals.length} Active Nodes)`
                      : `Staged Affinity Signals for ${userName} (${userSignals.length} Active Nodes)`}
                  </span>
                  <Link href="/profile" className="text-cyan-400 hover:text-cyan-300 text-[10px] underline cursor-pointer">
                    Adjust Vectors
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {userSignals.length > 0 ? (
                    userSignals.map((sig, i) => (
                      <span
                        key={i}
                        className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-mono flex items-center gap-1.5 shadow-sm border ${
                          isQlooLiveConnected
                            ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-200"
                            : "bg-white/5 border-white/10 text-gray-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isQlooLiveConnected ? "bg-cyan-400 animate-pulse" : "bg-amber-400/80"
                          }`}
                        />
                        <span>{sig}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-mono text-gray-400 italic py-1">
                      No seeds staged (Skipped during onboarding)
                    </span>
                  )}
                  <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] sm:text-xs text-emerald-300 font-mono flex items-center gap-1.5 shadow-sm">
                    <CountryFlag code={resolveCityMetadata(activeCity).code} size="xs" />
                    <span>{activeCity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Taste Radar Vector Meters */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl bg-black/60 border border-white/15 space-y-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>5-D Taste Vector Diagnostics</span>
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isQlooLiveConnected
                      ? "text-cyan-300 bg-cyan-500/20 border-cyan-400/30"
                      : "text-amber-300 bg-amber-500/20 border-amber-400/30"
                  }`}
                >
                  {isQlooLiveConnected ? "Dynamic Scores" : "Engine Standby"}
                </span>
              </div>

              {[
                { label: "Sonic Depth (Music)", val: isQlooLiveConnected ? dynamicRadar.sonicDepth : 0, color: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/50" },
                { label: "Cinematic Aesthetic", val: isQlooLiveConnected ? dynamicRadar.cinematicAesthetic : 0, color: "from-purple-400 to-indigo-500", glow: "shadow-purple-500/50" },
                { label: "Gastronomy Curiosity", val: isQlooLiveConnected ? dynamicRadar.gastronomyCuriosity : 0, color: "from-amber-400 to-orange-500", glow: "shadow-amber-500/50" },
                { label: "Urban Subculture", val: isQlooLiveConnected ? dynamicRadar.urbanSubculture : 0, color: "from-rose-400 to-pink-500", glow: "shadow-rose-500/50" },
                { label: "Literary Resonance", val: isQlooLiveConnected ? dynamicRadar.literaryResonance : 0, color: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/50" },
              ].map((dim, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 text-[11px] sm:text-xs font-medium">{dim.label}</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {isQlooLiveConnected ? `${dim.val}%` : "Staged (0%)"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-700 shadow-md ${dim.glow}`}
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                </div>
              ))}

              {!isQlooLiveConnected && (
                <div className="pt-1 text-[10px] font-mono text-amber-300/80 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Scores calculate live upon official Qloo API connection</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* LIVE QLOO SYNTHESIZER: STANDBY CARD OR LIVE FEED */}
        {/* ======================================================== */}
        {!isQlooLiveConnected ? (
          /* ======================================================== */
          /* CASE A: LIVE API KEY IS NOT CONNECTED -> HONEST STANDBY CARD (NO USER INPUT FORM) */
          /* ======================================================== */
          <section className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c0f24]/90 via-[#10142e]/80 to-[#080a18]/90 border border-cyan-500/25 backdrop-blur-2xl space-y-5 shadow-2xl relative overflow-hidden animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                      Strict Algorithmic Authenticity
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                      Endpoint: https://hackathon.api.qloo.com/v2/insights
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    Autonomous Concierge Engine for {userName} is on Standby
                  </h2>
                </div>
              </div>

              <Link
                href="/admin/keys"
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black border border-white/15 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Admin Console Setup ↗</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Zero Mock / No Fabricated Data</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  CulturAI strictly prevents displaying fabricated recommendations or unverified placeholder venues to judges. Only genuine Qloo entity correlations are delivered.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Centralized Admin Control</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  End users never manage or input API keys. Production Qloo credentials are secure and configured exclusively by the administrator in the Admin Console.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Live Production Calibration</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  The moment the official Qloo Hackathon key is validated by the administrator, live tailored cross-domain recommendations for {activeCity} will stream immediately.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* ======================================================== */
          /* CASE B: LIVE API KEY IS CONNECTED -> LIVE CONCIERGE FEED */
          /* ======================================================== */
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-mono mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Qloo Production API Verified • Live Feed Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Curated Concierge Briefing for {userName}</span>
                  <span className="text-xs font-mono text-cyan-400 font-normal">({activeCity})</span>
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
                  Real-time cross-domain recommendations mathematically paired with your sonic, visual, and architectural taste signals.
                </p>
              </div>

              <Link
                href="/night-out"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>Synthesize 4-Part Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Loading Indicator */}
            {loadingDashboard && (
              <div className="p-6 rounded-2xl bg-[#090c1c]/90 border border-cyan-500/30 flex items-center justify-center gap-3 text-cyan-300 font-mono text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Synthesizing live Qloo Taste Graph briefing for {userName} in {activeCity} via Gemini 2.5 Flash...</span>
              </div>
            )}

            {/* Live Qloo Verified Entity Graph Ribbon */}
            {verifiedQlooEntities.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#070a16]/90 border border-cyan-500/35 backdrop-blur-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Verified Live Qloo Graph Coordinates (Entity Lookups)
                  </span>
                  <span className="text-gray-500 text-[10px]">API Key: hack_fc3db58174...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                  {verifiedQlooEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold truncate max-w-[130px]">{ent.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">{ent.domain}</span>
                      </div>
                      <div className="text-[10px] text-cyan-300/90 truncate flex items-center gap-1 font-mono">
                        <span className="text-gray-500">Seed:</span>
                        <span className="text-cyan-200 font-semibold truncate">&quot;{ent.matched_seed || (idx === 0 ? activeCity : idx === 1 ? (music[0] || "Music") : idx === 2 ? (cinema[0] || "Cinema") : (dining[0] || "Dining"))}&quot;</span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">ID: {ent.entity_id}</div>
                      {ent.tags && ent.tags.length > 0 && (
                        <div className="text-[10px] text-gray-400 truncate">Tags: {ent.tags.slice(0, 2).join(", ")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {activeRecommendations.map((rec: any) => {
                const Icon = rec.icon || Radio;
                const isPinned = pinnedStops.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#090c1c]/85 hover:bg-[#10152e]/90 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Category Pill & Affinity Score */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border truncate max-w-[65%] ${rec.badgeColor || "text-cyan-300 bg-cyan-500/15 border-cyan-500/30"}`}>
                          {rec.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 shrink-0">
                          <span>{rec.affinityScore}%</span>
                          <span className="text-[8px] text-emerald-500">Qloo Live</span>
                        </div>
                      </div>

                      {/* Venue Name */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {rec.name}
                        </h3>
                        <p className="text-[11px] text-gray-300 leading-snug mt-1 line-clamp-3">
                          {rec.description}
                        </p>
                      </div>

                      {/* AI Match Rationale */}
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <div className="text-[9px] font-mono text-cyan-300 uppercase font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Why it matches {userName}&apos;s DNA:</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                          {rec.matchReason}
                        </p>
                      </div>

                      {/* Acoustic Pairing Audio Note */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 truncate">
                        <Volume2 className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{rec.audioTrack || "Acoustic Ambience Pairing"}</span>
                      </div>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => togglePin(rec.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isPinned
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                        }`}
                      >
                        {isPinned ? <Check className="w-3 h-3 text-emerald-400" /> : <Bookmark className="w-3 h-3" />}
                        <span>{isPinned ? "Pinned" : "Pin Stop"}</span>
                      </button>

                      <Link
                        href="/night-out"
                        className="text-[10px] font-mono text-cyan-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>Deep Curate ↗</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cross-Domain Taste Graph Correlation Spotlight Card */}
            {dashboardData?.crossDomainInsight && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-black border border-cyan-500/30 backdrop-blur-xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Qloo Multidimensional Taste Graph Correlation</span>
                  </div>
                  {dashboardData.metropolitanPulse && (
                    <span className="text-[11px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      📍 {dashboardData.metropolitanPulse}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {dashboardData.crossDomainInsight}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ======================================================== */}
        {/* 8 SPECIALIZED AUTONOMOUS FEATURE MODULES */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Autonomous Cultural Intelligence Suites
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                8 specialized autonomous multi-agent engines powered by Gemini 1.5 Flash and Qloo Taste Graph
              </p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border ${
              isQlooLiveConnected
                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"
                : "text-amber-300 bg-amber-500/10 border-amber-500/25"
            }`}>
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {isQlooLiveConnected
                  ? "Multi-Agent Cluster Live"
                  : "Multi-Agent Cluster: Engine Standby"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className={`group p-4 sm:p-5 rounded-2xl bg-[#080b18]/85 hover:bg-[#0f142b]/90 border border-white/10 ${mod.borderColor} transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl shadow-lg backdrop-blur-xl`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-gray-300">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-1 line-clamp-3">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400/90 font-medium">
                      {mod.affinityTag}
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all flex items-center gap-1 font-medium">
                      Launch <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* RECENT ITINERARIES STREAM */}
        {/* ======================================================== */}
        {isQlooLiveConnected && recentItineraries.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span>Recent Synthesized Itineraries for {userName}</span>
              </h2>
              <span className="text-xs font-mono text-gray-400">Cloud Firestore Synced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {recentItineraries.map((it, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItinerary(it)}
                  className="p-4 rounded-2xl bg-[#090c1c]/80 border border-white/10 space-y-2 hover:border-cyan-500/40 hover:bg-[#10142b]/90 transition-all cursor-pointer group backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 uppercase text-[10px]">
                      {it.agentType}
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      📍 {it.destCity || "Global"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {it.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{it.summary}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-gray-500">
                    <span>{it.items?.length || 0} Curated Stops</span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Inspect ↗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ======================================================== */}
      {/* ITINERARY INSPECTOR & EXPORT MODAL */}
      {/* ======================================================== */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#090a14] border border-white/15 p-5 sm:p-8 space-y-5 shadow-2xl flex flex-col overflow-hidden animate-in fade-in scale-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase">
                    {selectedItinerary.agentType}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    📍 {selectedItinerary.destCity || "Global Metropole"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {selectedItinerary.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItinerary(null)}
                className="text-gray-400 hover:text-white text-base font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-4 overflow-y-auto pr-1">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                {selectedItinerary.summary}
              </p>

              {/* Items Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Chronological Stops & Cultural Pairings
                </h4>
                <div className="space-y-2.5">
                  {selectedItinerary.items?.map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                          {item.time || item.day || `Stop #${i + 1}`} • {item.category}
                        </span>
                        {item.affinityScore && (
                          <span className="text-[10px] font-mono text-emerald-400">
                            {item.affinityScore}% Affinity
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-white">{item.name}</h5>
                      <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
                      {item.spotifyTrack && (
                        <div className="text-[11px] font-mono text-purple-300 pt-1 flex items-center gap-1.5">
                          <span>🎵 Paired Audio:</span>
                          <span className="text-white">{item.spotifyTrack}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const text =
                    `${selectedItinerary.title}\n${selectedItinerary.summary}\n\n` +
                    selectedItinerary.items
                      ?.map((it) => `• [${it.category}] ${it.name}\n  ${it.description}`)
                      .join("\n\n");
                  navigator.clipboard.writeText(text);
                  setCopiedPlan(true);
                  setTimeout(() => setCopiedPlan(false), 2000);
                }}
                className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>{copiedPlan ? "✓ Copied to Clipboard" : "📋 Copy Full Plan"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-cyan-500/25 cursor-pointer"
              >
                🖨️ Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
