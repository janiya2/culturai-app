"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import ProgressiveRefinementBanner from "@/components/ProgressiveRefinementBanner";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Film,
  Sparkles,
  Music,
  MapPin,
  Palette,
  ArrowRight,
  ChevronLeft,
  Copy,
  Check,
  Volume2,
  Sliders,
  Layers,
  Clock,
  Lock,
  AlertTriangle,
} from "lucide-react";

const SAMPLE_PRESETS = [
  {
    label: "🍸 Tokyo Vinyl Noir",
    concept: "A melancholic jazz pianist in 1950s Shinjuku discovers a subterranean vinyl listening bar where an exiled diplomat trades secrets for analog recordings.",
    tone: "Neo-Noir Cyberpunk",
  },
  {
    label: "🌾 A24 Folk Horror",
    concept: "A lone ethnographer arrives at an isolated Swedish birch commune during midsummer solstice, only to realize the festival dances conceal pagan sacrificial rites.",
    tone: "Raw Monolithic Concrete",
  },
  {
    label: "🏨 Wes Anderson Hotel",
    concept: "An eccentric concierge and a disciplined pastry chef navigate symmetrical pastel corridors of a grand alpine sanatorium to recover a stolen Renaissance painting.",
    tone: "Symmetrical Pastel",
  },
  {
    label: "🌧️ Wong Kar-wai Rain",
    concept: "Two quiet strangers wearing trench coats share a cramped noodle bar in 1960s Hong Kong, listening to rain drumming on neon awnings while unspoken desires linger.",
    tone: "Step-Printed Melancholy",
  },
  {
    label: "🏜️ Dune Desert Monument",
    concept: "A desert cartographer stands before a towering obsidian pyramid at dawn as twin suns bleach the sand dunes, recording seismic vibrations from the deep crust.",
    tone: "Raw Monolithic Concrete",
  },
  {
    label: "⚡ Cyberpunk 2049",
    concept: "A cybernetic bounty hunter sits in a drenched noodle stand beneath towering holographic billboards in 2049 Neo-Tokyo, waiting for an artificial memory broker.",
    tone: "Neo-Noir Cyberpunk",
  },
  {
    label: "🔍 Fincher Precision",
    concept: "A reclusive forensic auditor in a cold fluorescent basement in Zurich deciphers encrypted microfilms tracking offshore art vaults across wartime Europe.",
    tone: "Clinical Precision Noir",
  },
  {
    label: "🎺 Paris New Wave",
    concept: "A wandering trumpet player walks the misty cobblestone banks of the Seine at 3 AM, smoking a cigarette while rehearsing a lost modal melody heard in an underground cellar.",
    tone: "Step-Printed Melancholy",
  },
  {
    label: "🏢 Berlin Brutalist Bunker",
    concept: "An architectural photographer enters a decommissioned power station in East Berlin where analog modular synthesizers reverberate through 40-foot raw concrete vaults.",
    tone: "Raw Monolithic Concrete",
  },
  {
    label: "🥀 Victorian Gothic",
    concept: "A botanist is summoned to a crumbling cliffside glasshouse on the Scottish coast to preserve a carnivorous nocturnal orchid that only blooms during oceanic storms.",
    tone: "Clinical Precision Noir",
  },
];

export default function FilmmakerMoodboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  const [sceneConcept, setSceneConcept] = useState(
    SAMPLE_PRESETS[0].concept
  );
  const [visualTone, setVisualTone] = useState(SAMPLE_PRESETS[0].tone);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  // Result & Error state
  const [moodboard, setMoodboard] = useState<any>(null);
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSynthesize = async () => {
    setGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/filmmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: sceneConcept,
          visualTone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMoodboard(null);
        setVerifiedQlooEntities([]);
        setErrorMessage(
          data.message || data.error || "Input unrecognized. Please enter a valid descriptive scene premise."
        );
        return;
      }

      if (data.success && data.moodboard) {
        setMoodboard(data.moodboard);
        setVerifiedQlooEntities(data.qlooEntitiesVerified || []);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage("Network error during synthesis. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!moodboard) return;
    const text = `🎬 CulturAI Scene Moodboard: ${moodboard.title}\n\nConcept: ${sceneConcept}\n\nSoundtrack: ${moodboard.soundtrackPairings.map((s: any) => `${s.artist} - ${s.track}`).join(", ")}\n\nLocations: ${moodboard.locationScout.venueArchetype}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE AUTEUR CINEMA & 35MM STUDIO WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Auteur Cinema Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_filmmaker.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-rose-600/20 via-purple-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-sm">
            <Film className="w-3.5 h-3.5" />
            Cinematographic Cross-Domain Audio Visualizer
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Synthesize Soundtracks & Color Palettes for Creative Concepts
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Input a scene concept, script premise, or aesthetic vision. Qloo’s correlation engine pairs it with ideal music composers, color grading palettes, and real-world brutalist locations.
          </p>
        </div>

        {/* Progressive Refinement if Cinema was Skipped in Onboarding */}
        <ProgressiveRefinementBanner
          domain="cinema"
          onRefined={(newItems) => {
            if (newItems.length > 0) {
              setSceneConcept((prev) => `${prev} Inspired by the visual framing of ${newItems[0]}.`);
            }
          }}
        />

        {/* Input Form */}
        <div className="p-6 rounded-3xl bg-[#0f0c08]/85 border border-amber-500/25 backdrop-blur-2xl shadow-2xl shadow-amber-950/20 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider">
                Scene Concept / Script Excerpt
              </label>
              <span className="text-[10px] font-mono text-amber-400/90">
                ⚡ 10 Auteur Sample Scripts Available
              </span>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 py-1 no-scrollbar">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSceneConcept(preset.concept);
                    setVisualTone(preset.tone);
                    setErrorMessage(null);
                    setMoodboard(null);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-[10px] font-mono text-gray-300 hover:text-amber-200 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={sceneConcept}
              onChange={(e) => setSceneConcept(e.target.value)}
              placeholder="Describe your scene concept, characters, tone, or visual vision..."
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-white text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Visual & Cinematography Tone
              </label>
              <select
                value={visualTone}
                onChange={(e) => setVisualTone(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="Neo-Noir Cyberpunk">Neo-Noir Cyberpunk (Blade Runner / Inception)</option>
                <option value="Symmetrical Pastel">Symmetrical Pastel & Whimsy (Wes Anderson)</option>
                <option value="Step-Printed Melancholy">Step-Printed Neon Melancholy (Wong Kar-wai)</option>
                <option value="Raw Monolithic Concrete">Raw Monolithic Sci-Fi (Denis Villeneuve)</option>
                <option value="Clinical Precision Noir">Clinical Precision Thriller (David Fincher)</option>
              </select>
            </div>

            <div className="flex items-end">
              {!isQlooLiveConnected ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-left">
                  <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Auteur Engine on Standby</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Live aesthetic mapping between soundtracks and cinematography requires verified Qloo API access. Configure keys in the Admin Console.
                  </p>
                  <Link
                    href="/admin/keys"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-white underline font-semibold cursor-pointer"
                  >
                    Admin Setup ↗
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSynthesize}
                  disabled={generating}
                  className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Mapping Harmonic Vectors to Visual Palettes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Generate Creative Moodboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error / Validation Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-rose-200">Input Unrecognized / Insufficient Cultural Density</div>
              <div className="mt-1 text-xs text-rose-300/80 leading-relaxed font-sans">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Moodboard Results */}
        {moodboard && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Live Qloo Verified Entity Graph Ribbon */}
            {verifiedQlooEntities.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0e0a05]/90 border border-amber-500/35 backdrop-blur-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Verified Live Qloo Graph Coordinates (Entity Lookups)
                  </span>
                  <span className="text-gray-500 text-[10px]">API Key: hack_fc3db58174...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                  {verifiedQlooEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold truncate max-w-[130px]">{ent.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">{ent.domain}</span>
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

            {/* Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-black to-orange-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {moodboard.aestheticTag}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-2">
                  {moodboard.title}
                </h3>
                <p className="text-xs text-amber-300 font-mono mt-1">
                  Resonance: {moodboard.auteurResonance}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Moodboard" : "Copy Moodboard"}</span>
              </button>
            </div>

            {/* Grid of 3 Pillars: Palette, Soundtracks, Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Cinematography & Palette */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                  <Palette className="w-4 h-4" />
                  <span>Color & Aspect Ratio</span>
                </div>

                <div className="flex items-center gap-1.5 h-12 rounded-xl overflow-hidden border border-white/10 p-1 bg-black/40">
                  {(
                    moodboard.cinematography?.palette ||
                    moodboard.palette ||
                    ["#050811", "#0b1b3d", "#00d2d3", "#ff6b6b", "#e0e6ed"]
                  ).map((color: string, i: number) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded-lg transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-mono text-gray-400">
                    Aspect Ratio: <span className="text-white">{moodboard.cinematography.aspectRatio}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {moodboard.cinematography.lighting}
                  </p>
                </div>
              </div>

              {/* Pillar 2: Harmonic Soundtracks */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
                  <Music className="w-4 h-4" />
                  <span>Qloo Harmonic Soundtracks</span>
                </div>

                <div className="space-y-2.5">
                  {(moodboard.soundtrackPairings || []).map((st: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{st.artist}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{st.score}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{st.track}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar 3: Location Scout */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Real-World Location Scout</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-mono text-gray-400">
                    City Archetype: <span className="text-emerald-300">{moodboard.locationScout?.realMetropolis || "Tokyo / Berlin Borderline"}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {moodboard.locationScout?.venueArchetype || "Elevated Sky-Bridge connecting raw concrete structures."}
                  </p>
                  {moodboard.locationScout?.lightingOpportunity && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                      💡 {moodboard.locationScout.lightingOpportunity}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
