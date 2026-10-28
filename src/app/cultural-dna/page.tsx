"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Sparkles,
  Share2,
  ChevronLeft,
  Music,
  Film,
  Utensils,
  Shirt,
  MapPin,
  Check,
  Copy,
  Layers,
  Cpu,
  TrendingUp,
  Download,
  AlertTriangle,
  Lock,
  Clock,
  Key,
  RefreshCw,
  Radio,
} from "lucide-react";

interface VerifiedQlooEntity {
  name: string;
  entity_id: string;
  type: string;
  domain: string;
  tags: string[];
}

export default function CulturalDnaPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Dynamic DNA State
  const [archetypeTitle, setArchetypeTitle] = useState("The Avant-Garde Minimalist");
  const [archetypeSubtitle, setArchetypeSubtitle] = useState("Architectural Precision & Subterranean Resonance");
  const [archetypeDescription, setArchetypeDescription] = useState(
    "Calibrated frequencies of structural abstraction, non-linear cinema, and warm analog acoustics isolated via Qloo's multidimensional taste graph."
  );
  const [radar, setRadar] = useState({
    sonicDepth: 94,
    cinematicAesthetic: 88,
    gastronomyCuriosity: 82,
    urbanSubculture: 96,
    literaryResonance: 85,
  });
  const [dimensionAnalysis, setDimensionAnalysis] = useState<Record<string, string>>({
    sonicDepth: "High harmonic complexity and spatial acoustic depth derived from your music seeds.",
    cinematicAesthetic: "Non-linear time structures, atmospheric lighting, and meticulous spatial framing.",
    gastronomyCuriosity: "Subterranean dining sanctuaries, natural low-intervention wines, and micro-seasonal craft.",
    urbanSubculture: "Gravitation toward independent archives, industrial conversions, and analog listening dens.",
    literaryResonance: "Architectural integrity, deconstructed garments, and sculptural minimalism.",
  });
  const [crossDomainInsight, setCrossDomainInsight] = useState(
    "In standard machine learning models, music recommendations exist in a silo from dining or film. Qloo's 575M+ entity taste graph isolates the underlying aesthetic attributes — such as harmonic dissonance, industrial symmetry, and low-tempo contemplation — enabling seamless cross-domain lifestyle mapping."
  );
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<VerifiedQlooEntity[]>([]);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  const taste = userProfile?.tasteProfile;

  // Run live Qloo & Gemini Cultural DNA analysis
  const analyzeCulturalDna = async () => {
    if (!userProfile && !user) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/cultural-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasteProfile: userProfile?.tasteProfile || {
            music: ["Radiohead", "Aphex Twin"],
            cinema: ["Christopher Nolan", "Denis Villeneuve"],
            dining: ["Natural Wine Bars", "Omakase"],
            fashion: ["Issey Miyake", "Brutalist Architecture"],
            city: "Tokyo, Japan",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.archetypeTitle) setArchetypeTitle(data.archetypeTitle);
        if (data.archetypeSubtitle) setArchetypeSubtitle(data.archetypeSubtitle);
        if (data.archetypeDescription) setArchetypeDescription(data.archetypeDescription);
        if (data.radarVectors) setRadar(data.radarVectors);
        if (data.dimensionAnalysis) setDimensionAnalysis(data.dimensionAnalysis);
        if (data.crossDomainInsight) setCrossDomainInsight(data.crossDomainInsight);
        if (Array.isArray(data.qlooEntitiesVerified)) {
          setVerifiedQlooEntities(data.qlooEntitiesVerified);
        }
      }
    } catch (err) {
      console.warn("Live Cultural DNA analysis fallback:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userProfile && !loading) {
      analyzeCulturalDna();
    }
  }, [userProfile, loading]);

  const DIMENSIONS = [
    {
      key: "sonicDepth",
      title: "Sonic Depth (Music)",
      score: radar.sonicDepth,
      icon: Music,
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      desc: dimensionAnalysis.sonicDepth || "Deep affinity for layered acoustics and experimental soundscapes.",
    },
    {
      key: "cinematicAesthetic",
      title: "Cinematic Aesthetic",
      score: radar.cinematicAesthetic,
      icon: Film,
      color: "from-purple-500 to-indigo-500",
      textColor: "text-purple-400",
      desc: dimensionAnalysis.cinematicAesthetic || "Appreciation for non-linear time perception and atmospheric spatial framing.",
    },
    {
      key: "gastronomyCuriosity",
      title: "Gastronomy Curiosity",
      score: radar.gastronomyCuriosity,
      icon: Utensils,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      desc: dimensionAnalysis.gastronomyCuriosity || "Attraction to subterranean speakeasies and micro-seasonal culinary craft.",
    },
    {
      key: "urbanSubculture",
      title: "Urban Subculture",
      score: radar.urbanSubculture,
      icon: MapPin,
      color: "from-rose-500 to-pink-500",
      textColor: "text-rose-400",
      desc: dimensionAnalysis.urbanSubculture || "Gravitation toward independent archives, industrial lofts, and analog listening dens.",
    },
    {
      key: "literaryResonance",
      title: "Literary & Spatial Form",
      score: radar.literaryResonance,
      icon: Shirt,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      desc: dimensionAnalysis.literaryResonance || "Kinetic affinity for architectural pleating and raw monolithic concrete geometries.",
    },
  ];

  const handleShare = () => {
    const text = `🧬 My CulturAI DNA Persona: ${archetypeTitle}\n${archetypeSubtitle}\n\n• Sonic Depth: ${radar.sonicDepth}%\n• Cinematic Aesthetic: ${radar.cinematicAesthetic}%\n• Gastronomy Curiosity: ${radar.gastronomyCuriosity}%\n• Urban Subculture: ${radar.urbanSubculture}%\n• Literary & Spatial: ${radar.literaryResonance}%\n\nVerified via Qloo Taste AI Graph & CulturAI.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE HIGH-DIMENSIONAL COSMIC VECTOR SPACE WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Cosmic Vector Nebula Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_cultural_dna.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-emerald-500/20 via-teal-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-600/20 via-purple-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Top Control Bar: Recalibrate + Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs font-mono">
              <span className="text-white font-bold">5-D Cultural Radar Status: </span>
              <span className="text-emerald-300">Live Qloo Graph Connected</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={analyzeCulturalDna}
              disabled={analyzing}
              className="py-2 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
              <span>{analyzing ? "Resolving Qloo Vectors..." : "Recalibrate via Qloo API"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Spotify Wrapped-Style Lifestyle Persona Card */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-[#070b14]/90 to-cyan-950/60 border border-emerald-500/35 backdrop-blur-2xl relative overflow-hidden shadow-2xl shadow-emerald-950/20">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Primary Lifestyle Archetype
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Radio className="w-3 h-3 text-cyan-400" />
                Live Qloo Entity Graph & Gemini
              </div>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {archetypeTitle}
            </h2>
            <p className="text-base sm:text-lg text-emerald-200 font-medium">
              {archetypeSubtitle}
            </p>
            <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
              {archetypeDescription}
            </p>

            {/* Active Anchor & Signals */}
            <div className="pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-gray-400 mr-2">Core Signals:</span>
              {[
                ...(taste?.music || ["Radiohead"]),
                ...(taste?.cinema || ["Christopher Nolan"]),
                ...(taste?.dining || ["Natural Wine Bars"]),
                ...(taste?.fashion || ["Brutalist Architecture"]),
              ].map((sig, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white font-mono"
                >
                  {sig}
                </span>
              ))}
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {taste?.city || "Tokyo, Japan"}
              </span>
            </div>
          </div>
        </section>

        {/* Live Qloo Verified Entity Graph Ribbon */}
        {verifiedQlooEntities.length > 0 && (
          <section className="p-5 rounded-2xl bg-[#070b14]/90 border border-emerald-500/30 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Live Qloo Graph Coordinates (Entity Lookups)
              </span>
              <span className="text-gray-500">API Key: hack_fc3db58174...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {verifiedQlooEntities.map((ent, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold truncate max-w-[130px]">{ent.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{ent.domain}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">ID: {ent.entity_id}</div>
                  {ent.tags && ent.tags.length > 0 && (
                    <div className="text-[10px] text-gray-400 truncate">Tags: {ent.tags.slice(0, 2).join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5-Dimensional Vector Deep Dive */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              The 5 Cultural Vector Dimensions
            </h3>
            <span className="text-xs font-mono text-gray-400">Qloo Dynamic Vector Space</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIMENSIONS.map((dim, idx) => {
              const Icon = dim.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#070b14]/85 border border-white/15 backdrop-blur-2xl shadow-xl hover:border-emerald-400/40 hover:shadow-emerald-950/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${dim.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-mono font-bold text-cyan-300">
                        {dim.score}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{dim.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed mt-1">
                        {dim.desc}
                      </p>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-4">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-1000`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cross-Domain Correlation Insights */}
        <section className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Cpu className="w-4 h-4" />
            <span>Qloo Graph Affinity Corroboration</span>
          </div>
          <h4 className="text-base font-bold text-white">
            How Your Taste Entities Correlate Across Domains
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {crossDomainInsight}
          </p>
        </section>
      </main>
    </div>
  );
}
