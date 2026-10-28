"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import {
  getUserItineraries,
  deleteItinerary,
  ItineraryRecord,
} from "@/lib/firestoreService";
import GlobalNavbar from "@/components/GlobalNavbar";
import CountryFlag from "@/components/CountryFlag";
import { findDestination } from "@/lib/globalDestinations";
import {
  Bookmark,
  Sparkles,
  Moon,
  Compass,
  Users,
  Clock,
  MapPin,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Layers,
  Volume2,
  Share2,
  X,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState<"all" | "night-out" | "travel-concierge" | "duo-alignment">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load User's Itineraries
  const fetchLibrary = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const records = await getUserItineraries(user.uid, user.email || undefined);
      setItineraries(records);
    } catch (err) {
      console.error("Failed to load user library:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLibrary();
    }
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this itinerary from your library?")) return;
    setDeletingId(id);
    try {
      const ok = await deleteItinerary(id);
      if (ok) {
        setItineraries((prev) => prev.filter((it) => it.id !== id));
        if (selectedItinerary?.id === id) {
          setSelectedItinerary(null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (it: ItineraryRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `${it.title}\n\n${it.summary}\n\n` +
      it.items.map((i) => `• [${i.time || i.day || ""}] ${i.name} (${i.category})\n  ${i.description}`).join("\n\n");
    navigator.clipboard.writeText(text);
    if (it.id) {
      setCopiedId(it.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Distinct cities from saved items
  const savedCities = Array.from(
    new Set(
      itineraries
        .map((it) => it.destCity || it.signals?.[0])
        .filter((c): c is string => Boolean(c && c.trim().length > 0))
    )
  );

  // Filter logic
  const filteredItineraries = itineraries.filter((it) => {
    if (agentFilter !== "all" && it.agentType !== agentFilter) return false;
    if (cityFilter !== "all") {
      const itCity = (it.destCity || it.signals?.[0] || "").toLowerCase();
      if (!itCity.includes(cityFilter.toLowerCase())) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = it.title.toLowerCase().includes(q);
      const inSummary = it.summary.toLowerCase().includes(q);
      const inCity = (it.destCity || "").toLowerCase().includes(q);
      const inItems = it.items?.some((i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
      return inTitle || inSummary || inCity || inItems;
    }
    return true;
  });

  const getAgentBadge = (type: string) => {
    switch (type) {
      case "night-out":
        return {
          label: "Night-Out Curation",
          icon: Moon,
          color: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
        };
      case "travel-concierge":
        return {
          label: "Subculture Travel (3-Day)",
          icon: Compass,
          color: "text-purple-300 bg-purple-500/15 border-purple-500/30",
        };
      case "duo-alignment":
        return {
          label: "DuoSync Alignment",
          icon: Users,
          color: "text-pink-300 bg-pink-500/15 border-pink-500/30",
        };
      default:
        return {
          label: "Cultural Concierge",
          icon: Sparkles,
          color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
        };
    }
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
      {/* Background Wallpaper Stack */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35"
          style={{ backgroundImage: `url('/bg_profile.jpg')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.65)_0%,rgba(4,4,9,0.88)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/80 via-transparent to-[#040409]/95" />
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/15 via-pink-600/10 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      <GlobalNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* ======================================================== */}
        {/* HERO HEADER */}
        {/* ======================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0a0d1d]/90 via-[#0e1227]/80 to-[#070914]/90 border border-cyan-500/35 backdrop-blur-3xl shadow-2xl shadow-cyan-950/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 shadow-sm flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Personal Taste Vault</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                User: {user?.displayName || user?.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              My Saved Cultural Itineraries
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Your bespoke nocturnal experiences, 3-day subculture immersions, and duo alignment syntheses preserved in Cloud Firestore.
            </p>
          </div>

          {/* Quick Counter Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-cyan-300 block">
                {itineraries.length}
              </span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Saved Curations
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FILTER & SEARCH CONTROLS */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved titles, venues, summaries, or cities..."
                className="w-full pl-10 pr-9 py-2.5 bg-black/60 border border-white/10 hover:border-cyan-400/40 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchLibrary}
              disabled={fetching}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-2 self-start md:self-auto transition-all cursor-pointer"
              title="Reload from Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh Vault</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400 uppercase flex items-center gap-1.5 mr-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Filter:</span>
            </span>

            {[
              { id: "all", label: `All Items (${itineraries.length})` },
              { id: "night-out", label: `Night-Out (${itineraries.filter((i) => i.agentType === "night-out").length})` },
              { id: "travel-concierge", label: `Travel (3-Day) (${itineraries.filter((i) => i.agentType === "travel-concierge").length})` },
              { id: "duo-alignment", label: `DuoSync (${itineraries.filter((i) => i.agentType === "duo-alignment").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAgentFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                  agentFilter === tab.id
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50 font-bold shadow-sm"
                    : "bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.06] border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* City Filter Pills */}
            {savedCities.length > 1 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] font-mono text-gray-500 uppercase">City:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-2.5 py-1 bg-black/70 border border-white/10 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Cities</option>
                  {savedCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SAVED ITINERARIES GRID OR EMPTY STATE */}
        {/* ======================================================== */}
        {fetching ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-gray-400">Accessing User Taste Vault from Firestore...</span>
          </div>
        ) : filteredItineraries.length === 0 ? (
          /* Empty State */
          <div className="p-10 sm:p-14 rounded-3xl bg-black/60 border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl backdrop-blur-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mx-auto shadow-lg">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">
                {itineraries.length === 0 ? "Your Library is Currently Empty" : "No Itineraries Match Your Filter"}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                {itineraries.length === 0
                  ? "Whenever you synthesize a Night-Out, Subculture Travel plan, or DuoSync compromise, click 'Save Itinerary' to keep it here permanently."
                  : "Try clearing your search query or selecting 'All Items' to view your saved curations."}
              </p>
            </div>

            {itineraries.length === 0 && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/night-out"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-400 transition-all shadow-md"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Curate a Night-Out ↗</span>
                </Link>
                <Link
                  href="/travel"
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 hover:bg-purple-400 transition-all shadow-md"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Plan 3-Day Travel ↗</span>
                </Link>
                <Link
                  href="/duosync"
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 hover:bg-pink-400 transition-all shadow-md"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Sync Duo Taste ↗</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItineraries.map((it) => {
              const badge = getAgentBadge(it.agentType);
              const Icon = badge.icon;
              const cityName = it.destCity || it.signals?.[0] || "Global";
              const destMeta = findDestination(cityName);

              return (
                <div
                  key={it.id}
                  onClick={() => setSelectedItinerary(it)}
                  className="p-5 rounded-3xl bg-gradient-to-br from-[#080d1a]/85 via-[#0c1226]/80 to-[#050814]/85 border border-white/10 hover:border-cyan-400/50 backdrop-blur-2xl shadow-xl transition-all duration-300 space-y-4 group cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Agent Type & City Flag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 font-bold ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {/* City Badge with Vector Flag */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
                        {destMeta && <CountryFlag code={destMeta.code} size="xs" />}
                        <span className="text-white font-bold text-[11px] truncate max-w-[100px]">
                          {cityName}
                        </span>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {it.title}
                      </h3>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mt-1">
                        {it.summary}
                      </p>
                    </div>

                    {/* Timeline Venues Mini Pill Stack */}
                    <div className="space-y-1.5 pt-1 border-t border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        Included Stops ({it.items?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {it.items?.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-gray-300 truncate max-w-[180px] border border-white/5"
                          >
                            {item.name}
                          </span>
                        ))}
                        {(it.items?.length || 0) > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-cyan-400">
                            +{it.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>{it.createdAt ? "Saved" : "Archived"}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(it, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                        title="Copy Itinerary Text"
                      >
                        {copiedId === it.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => it.id && handleDelete(it.id, e)}
                        disabled={deletingId === it.id}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove from Library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform font-bold text-xs flex items-center gap-1 pl-1">
                        View ↗
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* DETAILED ITINERARY INSPECTOR MODAL */}
      {/* ======================================================== */}
      {selectedItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090d1c] border border-cyan-500/35 shadow-2xl shadow-cyan-950/40 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-r from-cyan-950/30 via-black to-purple-950/20">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${getAgentBadge(selectedItinerary.agentType).color}`}>
                    {getAgentBadge(selectedItinerary.agentType).label}
                  </span>
                  {selectedItinerary.destCity && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{selectedItinerary.destCity}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedItinerary.title}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {selectedItinerary.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedItinerary)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Copy Full Itinerary"
                >
                  {copiedId === selectedItinerary.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItinerary(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Timeline Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sequential Journey Timeline ({selectedItinerary.items?.length || 0} Stops)</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Verified by Qloo Taste AI™ Graph
                </span>
              </div>

              <div className="space-y-3">
                {selectedItinerary.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-cyan-400/30 transition-all space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-300">
                          {idx + 1}
                        </span>
                        <span>{item.time || item.day || `Phase 0${idx + 1}`}</span>
                      </span>
                      {item.affinityScore && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
                          {Math.round(item.affinityScore * 100)}% Match
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {item.name}
                      </h4>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {item.description}
                    </p>

                    {item.matchReason && (
                      <div className="text-[11px] font-mono text-cyan-300/90 bg-cyan-950/30 p-2 rounded-xl border border-cyan-900/40">
                        ✦ <span className="text-gray-400">Why Qloo Picked This:</span> {item.matchReason}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs font-mono">
                      {item.spotifyTrack ? (
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(item.spotifyTrack)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span className="truncate max-w-[200px]">{item.spotifyTrack}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span />}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${selectedItinerary.destCity || ""}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors ml-auto"
                      >
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Maps <ExternalLink className="w-3 h-3" /></span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-gray-400">
                User: {selectedItinerary.userName || user?.email}
              </span>
              <button
                type="button"
                onClick={() => setSelectedItinerary(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
