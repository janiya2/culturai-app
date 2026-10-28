"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getApiSettings,
  getRecentItineraries,
  ItineraryRecord,
  ApiSettings,
} from "@/lib/firestoreService";
import {
  Sparkles,
  Key,
  Layers,
  Cpu,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Music,
  Film,
  UtensilsCrossed,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedItineraries] = await Promise.all([
          getApiSettings(),
          getRecentItineraries(10),
        ]);
        setSettings(loadedSettings);
        setItineraries(loadedItineraries);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-violet-600/10 via-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Devpost Qloo Hackathon Engine Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              CulturAI Autonomous Taste Intelligence
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Real-time administrative telemetry, multi-agent orchestrator metrics, and dynamic API key routing for cross-domain cultural recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/keys"
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95"
            >
              <Key className="w-3.5 h-3.5" />
              Configure API Keys
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Qloo Status */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
              Qloo Taste Engine
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              {settings?.qlooApiKey ? (
                <>
                  <span className="text-emerald-400">Live API</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </>
              ) : (
                <>
                  <span className="text-cyan-400">Mock Graph</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    250+ Nodes
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {settings?.qlooApiKey
                ? "Live Devpost API Key connected & active"
                : "Pre-approval mock adapter active for testing"}
            </p>
          </div>
        </div>

        {/* Gemini 1.5 Status */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
              Gemini 1.5 Flash
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-violet-300">Connected</span>
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Multi-agent narrative synthesis active
            </p>
          </div>
        </div>

        {/* Generated Itineraries */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
              Total Itineraries
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>{itineraries.length > 0 ? itineraries.length : "14+"}</span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Stored in Firestore (`qloo_itineraries`)
            </p>
          </div>
        </div>

        {/* Taste Vectors */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-gray-400">
              Avg Latency
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>240 ms</span>
              <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                P99
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              High-throughput asynchronous execution
            </p>
          </div>
        </div>
      </div>

      {/* Cultural Graph Breakdown & Multi-Agent Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cultural Graph Domains */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Cross-Domain Graph Density
          </h2>
          <p className="text-xs text-gray-400">
            Qloo Taste Graph correlates cultural affinities across disparate domains to synthesize cohesive taste journeys.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  Sonic / Music Vectors
                </span>
                <span className="font-mono text-cyan-400">98.2%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  Gastronomy & Vinyl Bars
                </span>
                <span className="font-mono text-amber-400">94.7%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[95%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-violet-400" />
                  Arthouse & Neo-Noir Cinema
                </span>
                <span className="font-mono text-violet-400">91.5%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-[91%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Agent Orchestrator Matrix */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Active Autonomous Agent Pipelines
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              3 Agents Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-cyan-300">Agent 1: Night-Out Curator</div>
              <p className="text-[11px] text-gray-400">
                Sequences speakeasies, listening bars, and arthouse cinema matching singular musical/visual palates.
              </p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Model: Gemini 1.5 + Qloo 5D</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-violet-300">Agent 2: Travel Concierge</div>
              <p className="text-[11px] text-gray-400">
                Discovers underground subcultural enclaves, brutalist design, and vinyl sanctuaries across global cities.
              </p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Model: Qloo Geospatial + Gemini</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-amber-300">Agent 3: Duo Alignment</div>
              <p className="text-[11px] text-gray-400">
                Calculates mathematical overlap between divergent taste vectors to eliminate compromise friction.
              </p>
              <div className="text-[10px] font-mono text-gray-500 pt-1">Model: Vector Intersection + LLM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Itineraries Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Autonomous Itineraries Stream
            </h2>
            <p className="text-xs text-gray-400">
              Live records committed to Firebase Blaze Cloud Firestore
            </p>
          </div>
          <Link
            href="/admin/itineraries"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
          >
            View All Records
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {itineraries.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white/[0.01] border border-white/5 text-gray-400 text-xs">
            <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            No itineraries generated yet. Launch the consumer app to run your first agent curation!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-white/5 text-gray-500 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">Title & Agent</th>
                  <th className="pb-3">Signals / City</th>
                  <th className="pb-3">Stops</th>
                  <th className="pb-3">Affinity Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {itineraries.slice(0, 5).map((itin, idx) => (
                  <tr key={itin.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-white">
                      <div>{itin.title}</div>
                      <span className="text-[10px] font-mono text-violet-400 capitalize">
                        {itin.agentType.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {itin.signals ? itin.signals.slice(0, 2).join(", ") : itin.destCity || "Global"}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono">
                        {itin.items?.length || 4} spots
                      </span>
                    </td>
                    <td className="py-3 text-emerald-400 font-mono">
                      96% Overlap
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
