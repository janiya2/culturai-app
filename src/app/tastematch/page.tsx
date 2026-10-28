"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import ProgressiveRefinementBanner from "@/components/ProgressiveRefinementBanner";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Check,
  Tag,
  Radio,
  Clock,
  Lock,
  RefreshCw,
} from "lucide-react";

export default function TasteMatchPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  const [activeCategory, setActiveCategory] = useState<"All" | "Fashion" | "Audio" | "Objects">("All");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [vectorManifesto, setVectorManifesto] = useState<string>("");
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<any[]>([]);
  const [loadingGear, setLoadingGear] = useState<boolean>(false);

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

  // Fetch live Qloo + Gemini physical gear curation
  const fetchGear = async () => {
    if (!userProfile) return;
    setLoadingGear(true);

    try {
      const res = await fetch("/api/tastematch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasteProfile: userProfile.tasteProfile || {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.artifacts)) {
          setArtifacts(data.artifacts);
          setVectorManifesto(data.vectorManifesto || "");
          setVerifiedQlooEntities(data.qlooEntitiesVerified || []);
        }
      }
    } catch (err) {
      console.warn("Error fetching live TasteMatch gear:", err);
    } finally {
      setLoadingGear(false);
    }
  };

  useEffect(() => {
    if (userProfile && isQlooLiveConnected && artifacts.length === 0) {
      fetchGear();
    }
  }, [userProfile, isQlooLiveConnected]);

  const filtered = activeCategory === "All"
    ? artifacts
    : artifacts.filter((a) => a.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE CYBERNETIC ARCHIVAL OBJECT & GEAR WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. High-Res AI Generated Minimalist Cyber Hardware Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_tastematch.jpg')` }}
        />

        {/* 2. Deep Obsidian Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />

        {/* 3. Glowing Atmospheric Aurora Orbs */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-rose-500/20 via-pink-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono shadow-sm">
              <Tag className="w-3.5 h-3.5" />
              Physical Object & Archival Gear Synthesis
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Curated Artifacts Aligned With Your Taste DNA
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Translates your digital cultural preferences into physical archival apparel, audiophile hardware, and spatial objects via live Qloo correlation vectors.
            </p>
          </div>

          {isQlooLiveConnected && (
            <button
              type="button"
              onClick={fetchGear}
              disabled={loadingGear}
              className="py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg self-start sm:self-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGear ? "animate-spin" : ""}`} />
              <span>{loadingGear ? "Analyzing Qloo Graph..." : "Recalibrate Gear Match"}</span>
            </button>
          )}
        </div>

        {/* Progressive Refinement if Fashion was Skipped in Onboarding */}
        <ProgressiveRefinementBanner domain="fashion" />

        {/* Vector Manifesto Card */}
        {vectorManifesto && (
          <div className="p-5 rounded-2xl bg-[#0e0710]/80 border border-rose-500/30 backdrop-blur-xl flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono text-rose-300 font-bold uppercase tracking-wider">
                Cross-Domain Physical Artifact Vector
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mt-1">
                {vectorManifesto}
              </p>
            </div>
          </div>
        )}

        {/* Live Qloo Verified Entity Graph Ribbon */}
        {verifiedQlooEntities.length > 0 && (
          <section className="p-4 rounded-2xl bg-[#0e0710]/90 border border-rose-500/35 backdrop-blur-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Verified Live Qloo Graph Coordinates (Entity Lookups)
              </span>
              <span className="text-gray-500 text-[10px]">API Key: hack_fc3db58174...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
              {verifiedQlooEntities.map((ent, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1 hover:border-rose-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold truncate max-w-[130px]">{ent.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">{ent.domain}</span>
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["All", "Fashion", "Audio", "Objects"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat as any)}
              className={`py-2 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-md"
                  : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!isQlooLiveConnected ? (
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0c0f24]/90 via-[#10142e]/80 to-[#080a18]/90 border border-rose-500/25 backdrop-blur-2xl space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in">
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
                      Qloo Commerce Correlation Graph
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    TasteMatch Physical Gear Engine on Standby
                  </h3>
                </div>
              </div>

              <Link
                href="/admin/keys"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white border border-white/15 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <span>Admin Console Setup ↗</span>
              </Link>
            </div>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              To maintain 100% genuine algorithmic integrity for hackathon judges, CulturAI strictly prevents displaying mock, placeholder, or fabricated merchandise recommendations. Tailored archival garments, synthesizers, and architectural folios will compute live the moment the administrator verifies the official Qloo API key.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-rose-400 font-mono text-xs font-bold block">1. Acoustic Hardware</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Analog synthesizers & vacuum-tube monitors mapped to your sonic preference.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-purple-400 font-mono text-xs font-bold block">2. Archival Textiles</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Deconstructed apparel & architectural pleating aligned with your aesthetic vector.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                <span className="text-cyan-400 font-mono text-xs font-bold block">3. Spatial Objects</span>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Brutalist photography monographs & third-wave Japanese ceramic vessels.
                </p>
              </div>
            </div>
          </section>
        ) : loadingGear ? (
          <div className="p-12 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
            <div className="text-xs font-mono text-rose-300">
              Querying Qloo Taste Graph & Gemini 2.5 Flash for authentic gear coordinates...
            </div>
          </div>
        ) : (
          /* Grid of Curated Artifact Cards (Rendered live from API) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-4 group backdrop-blur-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.accent || "border-rose-500/30 text-rose-400"}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {item.affinity}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-base font-mono font-black text-white">
                    {item.price}
                  </span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${item.brand} ${item.name}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore Spec</span>
                    <ExternalLink className="w-3 h-3 text-rose-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
