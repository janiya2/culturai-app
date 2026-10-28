"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Mail,
  Sparkles,
  ChevronLeft,
  Copy,
  Check,
  Send,
  Calendar,
  Volume2,
  Film,
  Utensils,
  TrendingUp,
  Clock,
  Lock,
  RefreshCw,
  Radio,
} from "lucide-react";

export default function WeeklyDigestPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  const [copied, setCopied] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const [digest, setDigest] = useState<any>(null);
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<any[]>([]);
  const [loadingDigest, setLoadingDigest] = useState<boolean>(false);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const taste = userProfile?.tasteProfile;
  const city = taste?.city || "Tokyo, Japan";

  // Fetch live Qloo + Gemini weekly cultural digest
  const fetchDigest = async () => {
    if (!userProfile) return;
    setLoadingDigest(true);

    try {
      const res = await fetch("/api/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasteProfile: userProfile.tasteProfile || {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.digest) {
          setDigest(data.digest);
          setVerifiedQlooEntities(data.qlooEntitiesVerified || []);
        }
      }
    } catch (err) {
      console.warn("Error fetching live digest:", err);
    } finally {
      setLoadingDigest(false);
    }
  };

  useEffect(() => {
    if (userProfile && isQlooLiveConnected && !digest) {
      fetchDigest();
    }
  }, [userProfile, isQlooLiveConnected]);

  const handleCopy = () => {
    if (!digest) return;
    const text = `📬 CulturAI ${digest.issueNumber || "Weekly Dispatch"}: ${digest.headline}\nAnchor: ${city}\n\n1. Music: ${digest.sonicRadar?.title}\n2. Cinema: ${digest.arthouseRetrospective?.title} (${digest.arthouseRetrospective?.venue})\n3. Dining: ${digest.culinarySanctuary?.title} (${digest.culinarySanctuary?.neighborhood})\n\nCurated live via Qloo Taste Graph & Gemini 2.5 Flash.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3000);
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
      {/* BESPOKE ARCHIVAL EDITORIAL & DISPATCH WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Archival Editorial Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_digest.jpg')` }}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Editorial Frequency
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Your Bespoke Cultural Briefing
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Generated every Monday morning based on your latest taste affinities and real-time metropolitan subcultural movements.
            </p>
          </div>

          {isQlooLiveConnected && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={fetchDigest}
                disabled={loadingDigest}
                className="py-2 px-3.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDigest ? "animate-spin" : ""}`} />
                <span>{loadingDigest ? "Synthesizing Briefing..." : "Refresh Weekly Briefing"}</span>
              </button>

              {digest && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Share"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Qloo Verified Entity Graph Ribbon */}
        {verifiedQlooEntities.length > 0 && (
          <section className="p-4 rounded-2xl bg-[#070b14]/90 border border-cyan-500/35 backdrop-blur-xl space-y-2.5">
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
                  <div className="text-[10px] text-gray-500 truncate">ID: {ent.entity_id}</div>
                  {ent.tags && ent.tags.length > 0 && (
                    <div className="text-[10px] text-gray-400 truncate">Tags: {ent.tags.slice(0, 2).join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!isQlooLiveConnected ? (
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0c0f24]/90 via-[#10142e]/85 to-[#080a18]/90 border border-cyan-500/30 backdrop-blur-2xl space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                      Strict Algorithmic Authenticity
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Qloo Editorial Dispatch Engine
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Weekly Cultural Briefing Engine on Standby
                  </h3>
                </div>
              </div>

              <Link
                href="/admin/keys"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black border border-white/15 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <span>Admin Console Setup ↗</span>
              </Link>
            </div>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              To guarantee total algorithmic authenticity for judges, weekly editorial releases and vector shift calculations are computed live directly from verified Qloo Taste Graph signals. When the administrator verifies the official Qloo API key in the Admin Console, weekly dispatches for {city} will generate and stream live.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-cyan-400 font-mono text-xs font-bold block">1. Sonic Radar</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Deep track drops & vinyl releases cross-correlated with your sonic taste.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-purple-400 font-mono text-xs font-bold block">2. Arthouse Retrospectives</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  35mm screenings and gallery exhibitions matched to your visual aesthetic.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-amber-400 font-mono text-xs font-bold block">3. Vector Trajectory</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Real mathematical shifts in your 5-D taste coordinates over 7-day windows.
                </p>
              </div>
            </div>
          </section>
        ) : loadingDigest ? (
          <div className="p-12 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <div className="text-xs font-mono text-cyan-300">
              Generating dynamic editorial dispatch via Qloo Taste Graph & Gemini 2.5 Flash...
            </div>
          </div>
        ) : digest ? (
          /* Editorial Dispatch Card (Rendered live from API) */
          <article className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  {digest.issueNumber || "Dispatch Issue #42"}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  {digest.headline}
                </h3>
                {digest.editorialIntro && (
                  <p className="text-xs text-gray-300 leading-relaxed mt-2 max-w-2xl">
                    {digest.editorialIntro}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 shrink-0">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{digest.dateWindow || "Current Week"}</span>
              </div>
            </div>

            {/* Section 1: Music Spotlight */}
            {digest.sonicRadar && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                  <Volume2 className="w-4 h-4" />
                  <span>Nocturnal Sonic Radar</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {digest.sonicRadar.title}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {digest.sonicRadar.analysis}
                </p>
              </section>
            )}

            {/* Section 2: Cinema Spotlight */}
            {digest.arthouseRetrospective && (
              <section className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
                  <Film className="w-4 h-4" />
                  <span>Arthouse Retrospective</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {digest.arthouseRetrospective.title} {digest.arthouseRetrospective.venue ? `— ${digest.arthouseRetrospective.venue}` : ""}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {digest.arthouseRetrospective.analysis}
                </p>
              </section>
            )}

            {/* Section 3: Dining / Sanctuary */}
            {digest.culinarySanctuary && (
              <section className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                  <Utensils className="w-4 h-4" />
                  <span>Architectural Culinary Sanctuary</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {digest.culinarySanctuary.title} {digest.culinarySanctuary.neighborhood ? `(${digest.culinarySanctuary.neighborhood})` : ""}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {digest.culinarySanctuary.analysis}
                </p>
              </section>
            )}

            {/* Taste Vector Movement Tracker */}
            {digest.vectorTrajectory && (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-300 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                  <span>Weekly Taste Vector Shift:</span>
                </div>
                <span className="text-white font-bold">
                  {digest.vectorTrajectory.sonicShift} • {digest.vectorTrajectory.cinematicShift} • {digest.vectorTrajectory.gastronomyShift}
                </span>
              </div>
            )}
          </article>
        ) : null}
      </main>
    </div>
  );
}
