"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { runDuoAlignmentAgent, AgentResult } from "@/lib/agentOrchestrator";
import { saveItinerary, getApiSettings, ApiSettings } from "@/lib/firestoreService";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Users,
  Sparkles,
  Heart,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  Copy,
  ExternalLink,
  Volume2,
  Film,
  Moon,
  Compass,
  Clock,
  Lock,
} from "lucide-react";

export default function DuoSyncPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  // Person A (Current User)
  const [userAName, setUserAName] = useState("Janitha");
  const [userASignals, setUserASignals] = useState("Radiohead, Christopher Nolan, Brutalist Architecture");

  // Person B (Partner / Friend)
  const [userBName, setUserBName] = useState("Elena");
  const [userBSignals, setUserBSignals] = useState("Miles Davis, Natural Wine Bars, Wong Kar-wai");

  const [medium, setMedium] = useState<"night-out" | "film-night" | "weekend-trip">("night-out");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [verifiedEntities, setVerifiedEntities] = useState<Array<{ name: string; entity_id: string; type: string; domain: string }>>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  // Pre-fill user A with profile details
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setUserAName(userProfile.displayName);
      const tp = userProfile.tasteProfile;
      if (tp) {
        const combined = [...(tp.music || []), ...(tp.cinema || []), ...(tp.dining || [])];
        if (combined.length > 0) {
          setUserASignals(combined.join(", "));
        }
      }
    }
  }, [userProfile]);

  const handleGenerate = async () => {
    setGenerating(true);
    setSavedId(null);
    setVerifiedEntities([]);
    try {
      const sigA = userASignals.split(",").map((s) => s.trim()).filter(Boolean);
      const sigB = userBSignals.split(",").map((s) => s.trim()).filter(Boolean);

      // Call dedicated server-side API with live Qloo and Gemini integration
      const res = await fetch("/api/duosync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userA: { name: userAName || "You", signals: sigA.length ? sigA : ["Radiohead"] },
          userB: { name: userBName || "Partner", signals: sigB.length ? sigB : ["Miles Davis"] },
          medium,
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
        // Fallback to client agent
        const fallbackRes = await runDuoAlignmentAgent({
          userA: { name: userAName || "You", signals: sigA.length ? sigA : ["Radiohead"] },
          userB: { name: userBName || "Partner", signals: sigB.length ? sigB : ["Miles Davis"] },
          medium,
        });
        setResult(fallbackRes);
      }
    } catch (err) {
      console.error("Duo alignment failed, falling back:", err);
      const sigA = userASignals.split(",").map((s) => s.trim()).filter(Boolean);
      const sigB = userBSignals.split(",").map((s) => s.trim()).filter(Boolean);
      const fallbackRes = await runDuoAlignmentAgent({
        userA: { name: userAName || "You", signals: sigA.length ? sigA : ["Radiohead"] },
        userB: { name: userBName || "Partner", signals: sigB.length ? sigB : ["Miles Davis"] },
        medium,
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
      userName: user?.displayName || userProfile?.displayName || user?.email || "CulturAI Duo",
      agentType: "duo-alignment",
      title: result.title,
      signals: [userAName, userBName, medium],
      summary: result.summary,
      items: result.itinerary,
      tasteVectors: result.radarVectors,
    });
    if (docId) setSavedId(docId);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n${result.subtitle}\n\n${result.summary}\n\n` +
      result.itinerary.map((i) => `• [${i.category}] ${i.name}\n  ${i.description}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-pink-500/30 selection:text-pink-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE DUOSYNC ACOUSTIC LOUNGE & SANCTUARY WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Acoustic Listening Sanctuary Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_duosync.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-pink-500/20 via-rose-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/20 via-cyan-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono shadow-sm">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Zero-Compromise Mathematical Intersection
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Solve &quot;What Should We Do Tonight?&quot;
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Input two distinct taste profiles. Qloo computes the mathematical intersection in the cultural vector space so neither person feels they made a sacrifice.
          </p>
        </div>

        {/* Dual Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User A Card */}
          <div className="p-6 rounded-3xl bg-[#080d1a]/85 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                  Person A (You)
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Profile Linked</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={userAName}
                onChange={(e) => setUserAName(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Taste Seeds (Comma separated)
              </label>
              <textarea
                rows={3}
                value={userASignals}
                onChange={(e) => setUserASignals(e.target.value)}
                placeholder="e.g. Radiohead, Christopher Nolan, Brutalist Architecture"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* User B Card */}
          <div className="p-6 rounded-3xl bg-[#140816]/85 border border-pink-500/30 backdrop-blur-2xl shadow-2xl shadow-pink-950/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <span className="text-xs font-mono font-bold text-pink-300 uppercase">
                  Person B (Partner / Friend)
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Counterpart</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Partner&apos;s Name
              </label>
              <input
                type="text"
                value={userBName}
                onChange={(e) => setUserBName(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Partner&apos;s Taste Seeds
              </label>
              <textarea
                rows={3}
                value={userBSignals}
                onChange={(e) => setUserBSignals(e.target.value)}
                placeholder="e.g. Miles Davis, Natural Wine Bars, Wong Kar-wai"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-400 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Medium Selector & Launch */}
        <div className="p-6 rounded-3xl bg-[#080d1a]/85 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Select Activity Medium
              </span>
              <div className="flex items-center gap-2 mt-2">
                {[
                  { id: "night-out", label: "Evening Night-Out", icon: Moon },
                  { id: "film-night", label: "Cozy Film Night", icon: Film },
                  { id: "weekend-trip", label: "Weekend Getaway", icon: Compass },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = medium === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMedium(m.id as any)}
                      className={`py-2 px-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                        active
                          ? "bg-pink-500/25 border-pink-400 text-white shadow-md shadow-pink-500/20"
                          : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isQlooLiveConnected ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 max-w-sm">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Qloo Bilateral Engine on Standby</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Authentic mutual taste compromise requires verified Qloo API access. Configure keys in the Admin Console.
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
                onClick={handleGenerate}
                disabled={generating}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Computing Bilateral Intersection...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-pink-200" />
                    <span>Calculate Mutual Equilibrium</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Output Results */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pt-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-black to-indigo-950/40 border border-pink-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {result.subtitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Qloo Graph & Gemini
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mt-2">
                  {result.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!!savedId}
                  className={`py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-2 transition-all border ${
                    savedId
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/10 hover:bg-white/15 text-white border-white/15"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedId ? "Saved in Cloud" : "Save Plan"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono transition-colors"
                  title="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Live Qloo Verified Entity Ribbon */}
            {verifiedEntities.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#070b14]/90 border border-emerald-500/30 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Qloo Entities Grounding This Compromise
                  </span>
                  <span className="text-gray-500">{verifiedEntities.length} Live Graph Nodes</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {verifiedEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-1.5"
                    >
                      <span className="text-pink-400 font-bold">{ent.name}</span>
                      <span className="text-gray-500 text-[10px]">({ent.entity_id.slice(0, 8)}...)</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300">{ent.domain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Intersecting Common Ground Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-pink-500/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 font-semibold">
                        {Math.round(item.affinityScore * 100)}% Harmony
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">
                      {item.name}
                    </h4>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] font-mono text-pink-400/80 bg-pink-950/30 p-2.5 rounded-xl border border-pink-900/40">
                      💡 {item.matchReason}
                    </div>
                  </div>

                  {item.spotifyTrack && (
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-mono">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.spotifyTrack}</span>
                      </div>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(item.spotifyTrack)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-gray-400 hover:text-white"
                      >
                        Listen ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.aiCommentary && (
              <div className="p-5 rounded-2xl bg-black/60 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Zero-Compromise Bilateral Synthesis</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
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
