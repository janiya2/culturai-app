"use client";

import React, { useState, useEffect } from "react";
import { getRecentItineraries, ItineraryRecord } from "@/lib/firestoreService";
import {
  Layers,
  Sparkles,
  Calendar,
  MapPin,
  Music,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const records = await getRecentItineraries(50);
      setItineraries(records);
      if (records.length > 0 && !selectedItinerary) {
        setSelectedItinerary(records[0]);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = itineraries.filter((item) => {
    const matchesAgent = filterAgent === "all" || item.agentType === filterAgent;
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.signals?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.destCity && item.destCity.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAgent && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5" />
            Cloud Firestore Itinerary Stream
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Generated Cultural Itineraries
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time audit log of autonomous curations generated across all 3 agent pipelines.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, artist, city, or aesthetic..."
            className="glass-input w-full pl-10 pr-4 py-2 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="glass-input py-2 px-3 rounded-lg text-xs"
          >
            <option value="all" className="bg-[#0b0e1e]">All Agents</option>
            <option value="night-out" className="bg-[#0b0e1e]">Agent 1: Night-Out</option>
            <option value="travel-concierge" className="bg-[#0b0e1e]">Agent 2: Travel Concierge</option>
            <option value="duo-alignment" className="bg-[#0b0e1e]">Agent 3: Duo Alignment</option>
          </select>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs">
              No itineraries found matching your search.
            </div>
          ) : (
            filtered.map((itin, idx) => {
              const isSelected = selectedItinerary?.id === itin.id || (!selectedItinerary && idx === 0);
              return (
                <div
                  key={itin.id || idx}
                  onClick={() => setSelectedItinerary(itin)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "glass-panel-glow border-cyan-500/40 text-white"
                      : "glass-panel border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-cyan-400 capitalize">
                      {itin.agentType?.replace("-", " ")}
                    </span>
                    <span className="text-gray-500">
                      {itin.items?.length || 4} stops
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1">
                    {itin.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-1">
                    {itin.signals ? itin.signals.join(" • ") : itin.destCity || "Aesthetic"}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-2">
          {selectedItinerary ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-mono uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  {selectedItinerary.agentType.replace("-", " ")}
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedItinerary.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {selectedItinerary.summary}
                </p>
              </div>

              {/* Signals */}
              {selectedItinerary.signals && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItinerary.signals.map((sig, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              )}

              {/* Stops list */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                  Curated Chronology ({selectedItinerary.items?.length || 0} stops)
                </h3>
                <div className="space-y-2.5">
                  {selectedItinerary.items?.map((stop, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                            {sIdx + 1}
                          </span>
                          {stop.name}
                        </span>
                        {stop.time && (
                          <span className="text-[10px] font-mono text-gray-400">
                            {stop.time}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed pl-7">
                        {stop.description}
                      </p>
                      {stop.spotifyTrack && (
                        <div className="pl-7 pt-1 flex items-center gap-1.5 text-[11px] font-mono text-violet-300">
                          <Music className="w-3 h-3 text-emerald-400" />
                          <span>Sonic Track: {stop.spotifyTrack}</span>
                        </div>
                      )}
                      {stop.matchReason && (
                        <div className="pl-7 pt-0.5 text-[10px] text-cyan-400 font-mono">
                          Affinity Match: {stop.matchReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-gray-400 text-xs">
              Select an itinerary from the list to view its complete cultural timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
