"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { getApiSettings, ApiSettings } from "@/lib/firestoreService";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Users2,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  Sliders,
  ShieldAlert,
  Pencil,
  X,
  Check,
  Info,
  Music2,
  HelpCircle,
} from "lucide-react";

interface GroupMember {
  id: string;
  name: string;
  signals: string;
  veto: string;
}

interface Archetype {
  id: string;
  label: string;
  icon: string;
  signals: string;
  veto: string;
}

const ARCHETYPES: Archetype[] = [
  {
    id: "audiophile",
    label: "The Audiophile",
    icon: "🎧",
    signals: "Vinyl Hi-Fi, Ambient Techno, Japanese Jazz Kissa",
    veto: "Loud compressed pop & sports bars",
  },
  {
    id: "sommelier",
    label: "The Sommelier",
    icon: "🍷",
    signals: "Low-Intervention Natural Wine, Biodynamic Cellars, Charcuterie",
    veto: "Overpriced generic cocktails & chain restaurants",
  },
  {
    id: "cinephile",
    label: "The Cinephile",
    icon: "🎬",
    signals: "French New Wave, Neon Noir Lounges, 35mm Celluloid",
    veto: "Sports bars with blaring television screens",
  },
  {
    id: "mixologist",
    label: "The Mixologist",
    icon: "🍸",
    signals: "Artisanal Mezcal, Rare Japanese Whisky, Speakeasy Sanctuary",
    veto: "Crowded commercial tourist traps",
  },
  {
    id: "brutalist",
    label: "The Brutalist",
    icon: "🏛️",
    signals: "Brutalist Architecture, Dark Ambient, Micro-roasteries",
    veto: "Harsh bright fluorescent lighting",
  },
  {
    id: "bohemian",
    label: "The Bohemian",
    icon: "☕",
    signals: "Ceremonial Matcha, Acoustic Indie, Independent Art Bookstores",
    veto: "Rowdy chain dining & EDM clubs",
  },
];

const QUICK_TASTE_CHIPS = [
  "+ Vinyl Hi-Fi",
  "+ Natural Wine",
  "+ Japanese Jazz Kissa",
  "+ Speakeasy",
  "+ Arthouse Cinema",
  "+ Brutalist Design",
  "+ Craft Microbrews",
  "+ Low-Lit Ambient",
];

const QUICK_VETO_CHIPS = [
  "+ Zero Loud EDM",
  "+ No Tourist Traps",
  "+ No Bright Lighting",
  "+ No Overpriced Drinks",
  "+ No Sports TV Bars",
  "+ No Chain Restaurants",
];

export default function GroupHangoutPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);

  const [members, setMembers] = useState<GroupMember[]>([
    { id: "1", name: "Janitha", signals: "Radiohead, Brutalist Architecture, Speakeasy", veto: "Crowded tourist bars" },
    { id: "2", name: "Elena", signals: "Natural Wine, Wong Kar-wai, Ambient Jazz", veto: "Overpriced generic cocktails" },
    { id: "3", name: "Marcus", signals: "Industrial Soundscapes, Rare Mezcal, Underground", veto: "Bright clinical lighting" },
  ]);

  const [city, setCity] = useState("Tokyo");
  const [calculating, setCalculating] = useState(false);
  const [consensus, setConsensus] = useState<any>(null);
  const [verifiedQlooEntities, setVerifiedQlooEntities] = useState<any[]>([]);

  // Modal State for Adding a Custom Member
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalSignals, setModalSignals] = useState(ARCHETYPES[0].signals);
  const [modalVeto, setModalVeto] = useState(ARCHETYPES[0].veto);
  const [selectedArchId, setSelectedArchId] = useState<string>("audiophile");

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  // Load user's profile taste defaults & active city
  useEffect(() => {
    if (userProfile?.tasteProfile?.city) {
      const detectedCity = userProfile.tasteProfile.city.split(",")[0].trim();
      if (detectedCity) setCity(detectedCity);
    }
    if (userProfile?.displayName) {
      setMembers((prev) => {
        if (prev.length > 0 && prev[0].id === "1") {
          const userSignals = [
            ...(userProfile?.tasteProfile?.music || []),
            ...(userProfile?.tasteProfile?.dining || []),
            ...(userProfile?.tasteProfile?.cinema || []),
          ].slice(0, 3).join(", ");
          return [
            {
              ...prev[0],
              name: userProfile.displayName || prev[0].name,
              signals: userSignals || prev[0].signals,
            },
            ...prev.slice(1),
          ];
        }
        return prev;
      });
    }
  }, [userProfile]);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const removeMember = (id: string) => {
    if (members.length <= 2) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, field: keyof GroupMember, val: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const applyArchetypeToModal = (arch: Archetype) => {
    setSelectedArchId(arch.id);
    setModalSignals(arch.signals);
    setModalVeto(arch.veto);
  };

  const appendSignalTag = (tag: string) => {
    const clean = tag.replace(/^\+\s*/, "");
    if (!modalSignals.toLowerCase().includes(clean.toLowerCase())) {
      setModalSignals(modalSignals ? `${modalSignals}, ${clean}` : clean);
    }
  };

  const appendVetoTag = (tag: string) => {
    const clean = tag.replace(/^\+\s*/, "");
    if (!modalVeto.toLowerCase().includes(clean.toLowerCase())) {
      setModalVeto(modalVeto ? `${modalVeto}, ${clean}` : clean);
    }
  };

  const handleAddMemberSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = modalName.trim() || `Friend ${members.length + 1}`;
    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name,
        signals: modalSignals.trim() || "Vinyl Hi-Fi, Craft Ales, Minimalist",
        veto: modalVeto.trim() || "Loud EDM clubs",
      },
    ]);
    setModalName("");
    setIsAddModalOpen(false);
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setConsensus(null);

    try {
      const res = await fetch("/api/hangout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          members,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.consensus) {
          setConsensus(data.consensus);
          setVerifiedQlooEntities(data.qlooEntitiesVerified || []);
        }
      }
    } catch (err) {
      console.warn("Error calculating hangout consensus:", err);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BESPOKE NOCTURNAL METROPOLIS & GROUP SOCIAL WALLPAPER */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_hangout.jpg')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-indigo-500/20 via-violet-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Page Title & Explanation */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-sm">
            <Users2 className="w-3.5 h-3.5" />
            Social Dynamics Multi-Vector Solver
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Stop Endless Group Chat Indecision
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Add friends with distinct aesthetics. Qloo computes the multidimensional mathematical centroid of everyone&apos;s preferences while strictly honoring all individual vetoes.
          </p>
        </div>

        {/* Host Metropolis Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#080a18]/70 border border-indigo-500/25 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Host Metropolis</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Tokyo, Berlin, Paris, New York, Colombo..."
                  className="text-sm font-bold text-white bg-transparent border-b border-indigo-500/40 hover:border-indigo-400 focus:border-indigo-400 focus:outline-none transition-colors w-44 sm:w-60"
                />
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Live Qloo Geocoding
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-500 mr-1 hidden sm:inline">QUICK SELECT:</span>
            {["Tokyo", "Berlin", "Paris", "New York", "Milan", "Colombo"].map((presetCity) => (
              <button
                key={presetCity}
                type="button"
                onClick={() => setCity(presetCity)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  city.toLowerCase() === presetCity.toLowerCase()
                    ? "bg-indigo-500 text-white shadow-sm font-bold"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {presetCity}
              </button>
            ))}
          </div>
        </div>

        {/* Educational Architecture Banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-gray-300">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-indigo-300">How Qloo Analyzes Group Consensus:</span>{" "}
              Every member requires positive <span className="text-cyan-300 font-mono">Taste Seeds</span> (music, architecture, drinks) and a strict <span className="text-rose-300 font-mono">Dealbreaker Veto</span>. Edit any card below or add custom friends!
            </div>
          </div>
        </div>

        {/* Group Member Cards List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Group Roster ({members.length} Members)
            </span>

            {/* Modal Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setModalName("");
                setIsAddModalOpen(true);
              }}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Friend with Custom Taste</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {members.map((m, idx) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#080a18]/90 border border-indigo-500/25 backdrop-blur-2xl shadow-xl hover:border-indigo-400/50 hover:shadow-indigo-950/30 space-y-3.5 relative group transition-all"
              >
                {/* Member Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="relative flex items-center flex-1">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateMember(m.id, "name", e.target.value)}
                        placeholder="Friend's Name"
                        className="font-bold text-sm bg-transparent border-b border-indigo-500/20 hover:border-indigo-400 focus:border-indigo-400 text-white outline-none w-full py-0.5 transition-colors"
                      />
                      <Pencil className="w-3 h-3 text-gray-500 absolute right-1 pointer-events-none opacity-40 group-hover:opacity-100" />
                    </div>
                  </div>

                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-gray-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Archetype Switcher */}
                <div className="flex items-center justify-between bg-white/[0.02] p-1.5 rounded-lg border border-white/5">
                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Persona Preset:
                  </span>
                  <select
                    onChange={(e) => {
                      const found = ARCHETYPES.find((a) => a.id === e.target.value);
                      if (found) {
                        updateMember(m.id, "signals", found.signals);
                        updateMember(m.id, "veto", found.veto);
                      }
                    }}
                    defaultValue=""
                    className="text-[10px] font-mono bg-black/70 border border-white/10 rounded-md text-indigo-300 px-2 py-0.5 focus:outline-none focus:border-indigo-400 cursor-pointer max-w-[130px]"
                  >
                    <option value="" disabled>Switch Persona...</option>
                    {ARCHETYPES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.icon} {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aesthetic Signals Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-indigo-300 uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Taste Seeds (Qloo Vectors)
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={m.signals}
                    onChange={(e) => updateMember(m.id, "signals", e.target.value)}
                    placeholder="e.g. Radiohead, Natural Wine, Speakeasy..."
                    className="w-full text-xs text-indigo-200 bg-black/60 border border-indigo-500/30 rounded-xl p-2.5 focus:border-indigo-400 focus:bg-indigo-950/20 focus:outline-none transition-all resize-none font-sans"
                  />
                  <div className="text-[9px] font-mono text-gray-500">
                    Qloo searches entities matching these tastes
                  </div>
                </div>

                {/* Veto / Dealbreaker Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-rose-300 uppercase font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      Strict Dealbreaker (Veto)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={m.veto}
                    onChange={(e) => updateMember(m.id, "veto", e.target.value)}
                    placeholder="e.g. Crowded tourist bars, loud EDM..."
                    className="w-full text-xs text-rose-200 bg-black/60 border border-rose-500/30 rounded-xl px-2.5 py-2 focus:border-rose-400 focus:bg-rose-950/20 focus:outline-none transition-all font-sans"
                  />
                  <div className="text-[9px] font-mono text-gray-500">
                    Qloo strictly eliminates places with this vibe
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Launch Centroid Solver */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {calculating ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Computing {city} Centroid Vector via Qloo + Gemini...</span>
                </>
              ) : (
                <>
                  <Users2 className="w-4 h-4 text-indigo-200" />
                  <span>Calculate Group Equilibrium in {city}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        {consensus && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Live Qloo Verified Entity Graph Ribbon */}
            {verifiedQlooEntities.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#090b1c]/90 border border-indigo-500/35 backdrop-blur-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    Verified Live Qloo Graph Coordinates (Entity Lookups)
                  </span>
                  <span className="text-gray-500 text-[10px]">API Key: hack_fc3db58174...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                  {verifiedQlooEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono space-y-1 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold truncate max-w-[130px]">{ent.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">{ent.domain}</span>
                      </div>
                      {ent.matched_seed && (
                        <div className="text-[10px] text-indigo-300/90 truncate flex items-center gap-1 font-mono">
                          <span className="text-gray-500">Seed:</span>
                          <span className="text-indigo-200 font-semibold truncate">&quot;{ent.matched_seed}&quot;</span>
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 truncate">ID: {ent.entity_id}</div>
                      {ent.tags && ent.tags.length > 0 && (
                        <div className="text-[10px] text-gray-400 truncate">Tags: {ent.tags.slice(0, 2).join(", ")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-black to-cyan-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {consensus.compatibilityScore}
                </span>
                {consensus.backupVenue && (
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                    Alt: {consensus.backupVenue}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {consensus.venueName}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                {consensus.summary}
              </p>
            </div>

            {/* Individual Satisfaction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {consensus.details.map((d: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{d.member}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{d.rating} Fit</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {d.verdict}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ======================================================== */}
      {/* ADD MEMBER MODAL WITH TASTE SEEDS & STRICT VETO BUILDER */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b0e24] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Users2 className="w-3 h-3" />
                New Group Member Profile
              </div>
              <h3 className="text-xl font-black text-white">Add Friend with Cultural Taste Vectors</h3>
              <p className="text-xs text-gray-400">
                Define your friend&apos;s positive taste seeds and strict veto constraints for Qloo analysis.
              </p>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-gray-300 uppercase">Friend&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Kasun, Sarah, Liam..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* 1-Click Archetype Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-gray-300 uppercase flex items-center justify-between">
                  <span>Quick Persona Archetypes (1-Click Fill)</span>
                  <span className="text-[10px] text-gray-500 lowercase">select to auto-fill</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => applyArchetypeToModal(arch)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedArchId === arch.id
                          ? "bg-indigo-500/20 border-indigo-400 text-white shadow-md shadow-indigo-500/10"
                          : "bg-white/[0.03] border-white/10 text-gray-300 hover:border-indigo-500/40"
                      }`}
                    >
                      <div className="text-base">{arch.icon}</div>
                      <div className="text-xs font-bold truncate mt-1">{arch.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aesthetic Taste Seeds */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-indigo-300 uppercase font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Aesthetic Taste Seeds (Qloo Positive Vector)
                </label>
                <textarea
                  rows={2}
                  value={modalSignals}
                  onChange={(e) => setModalSignals(e.target.value)}
                  placeholder="e.g. Radiohead, Natural Wine, Speakeasy, Minimalist..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-indigo-500/30 text-indigo-200 text-xs focus:outline-none focus:border-indigo-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_TASTE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => appendSignalTag(chip)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dealbreaker / Veto Constraint */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-rose-300 uppercase font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Strict Dealbreaker / Veto (Qloo Negative Constraint)
                </label>
                <input
                  type="text"
                  value={modalVeto}
                  onChange={(e) => setModalVeto(e.target.value)}
                  placeholder="e.g. Crowded tourist bars, loud commercial EDM..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-rose-200 text-xs focus:outline-none focus:border-rose-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_VETO_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => appendVetoTag(chip)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/30 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  Add Member to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
