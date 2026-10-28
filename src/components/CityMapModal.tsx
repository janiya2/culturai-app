"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Globe2,
  Check,
  Compass,
  Navigation,
  X,
  Sparkles,
} from "lucide-react";
import { CULTURAL_CITIES, CulturalCity, resolveCityMetadata } from "@/lib/cityData";
import CountryFlag from "./CountryFlag";
import type { SelectedLocation } from "./InteractiveCulturalMap";

// Dynamically import InteractiveCulturalMap to prevent Leaflet SSR issues
const InteractiveCulturalMap = dynamic(
  () => import("./InteractiveCulturalMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[380px] rounded-2xl bg-[#03050c] border border-cyan-500/25 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyan-400">Loading Real Interactive World Map Canvas...</span>
      </div>
    ),
  }
);

interface CityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (selectedCityString: string) => Promise<void>;
}

export default function CityMapModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
}: CityMapModalProps) {
  const initialMeta = useMemo(() => resolveCityMetadata(currentCity), [currentCity]);
  const [selectedCity, setSelectedCity] = useState<string>(initialMeta.fullName);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentMeta = resolveCityMetadata(selectedCity);

  // Compute Initial Lat/Lng for Leaflet
  const initialLoc: SelectedLocation = {
    city: currentMeta.city,
    country: currentMeta.country,
    countryCode: currentMeta.code,
    flag: currentMeta.flag,
    lat:
      currentMeta.city.toLowerCase().includes("sichuan") || currentMeta.city.toLowerCase().includes("chengdu")
        ? 30.5728
        : currentMeta.city.toLowerCase().includes("tokyo")
        ? 35.6762
        : currentMeta.city.toLowerCase().includes("london")
        ? 51.5074
        : currentMeta.city.toLowerCase().includes("paris")
        ? 48.8566
        : currentMeta.city.toLowerCase().includes("berlin")
        ? 52.52
        : currentMeta.city.toLowerCase().includes("new york")
        ? 40.7128
        : currentMeta.city.toLowerCase().includes("seoul")
        ? 37.5665
        : 35.6762,
    lng:
      currentMeta.city.toLowerCase().includes("sichuan") || currentMeta.city.toLowerCase().includes("chengdu")
        ? 104.0668
        : currentMeta.city.toLowerCase().includes("tokyo")
        ? 139.6503
        : currentMeta.city.toLowerCase().includes("london")
        ? -0.1278
        : currentMeta.city.toLowerCase().includes("paris")
        ? 2.3522
        : currentMeta.city.toLowerCase().includes("berlin")
        ? 13.405
        : currentMeta.city.toLowerCase().includes("new york")
        ? -74.006
        : currentMeta.city.toLowerCase().includes("seoul")
        ? 126.978
        : 139.6503,
  };

  const activeCityObj =
    CULTURAL_CITIES.find(
      (c) =>
        selectedCity.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase() === selectedCity.toLowerCase()
    ) || null;

  const handleConfirm = async () => {
    if (!selectedCity.trim()) return;
    setSaving(true);
    try {
      await onSelectCity(selectedCity.trim());
      onClose();
    } catch (err) {
      console.error("Failed to update anchor city:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMetropolisClick = (city: CulturalCity) => {
    setSelectedCity(`${city.name}, ${city.country}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[94vh] rounded-3xl bg-[#080a16] border border-cyan-500/30 p-4 sm:p-6 space-y-4 shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden relative">
        {/* Ambient Corner Glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                  Global Proximity Engine
                </span>
                <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                  Interactive Leaflet World Map
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                Switch Cultural Anchor Metropolis
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Map & Content */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Active Anchor Summary Ribbon */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-black/70 to-purple-950/50 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-3">
              <CountryFlag
                code={currentMeta.code}
                size="md"
                className="shadow-md shadow-black/50"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-white tracking-tight">
                    {currentMeta.city}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1">
                    <span>{currentMeta.country}</span>
                    <span className="text-cyan-400 font-mono">[{currentMeta.code}]</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug mt-0.5">
                  {activeCityObj?.vibe || "Selected Custom Cultural Node • Re-anchors all 8 AI Concierge engines"}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20 shrink-0">
              {activeCityObj?.qlooNodeCount || "1.2M+ Entities"}
            </span>
          </div>

          {/* ======================================================== */}
          {/* REAL LEAFLET CYBER MAP WITH CLICK-TO-DROP PIN SYSTEM */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
            <InteractiveCulturalMap
              initialLocation={initialLoc}
              heightClassName="h-[270px] sm:h-[350px]"
              onLocationSelect={(loc) => {
                const fullStr = `${loc.city}, ${loc.country}`;
                setSelectedCity(fullStr);
              }}
            />
          </div>

          {/* Quick Cultural Metropolises Fast Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Featured Cultural Metropolises ({CULTURAL_CITIES.length} Global Nodes)</span>
              </span>
              <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
                Click any city to teleport pin
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CULTURAL_CITIES.map((city) => {
                const isSelected = selectedCity.toLowerCase().includes(city.name.toLowerCase());
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleMetropolisClick(city)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 group ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/30 ring-1 ring-cyan-400/40"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <CountryFlag code={city.code} size="xs" />
                        <span className="text-xs font-bold text-white font-sans truncate">
                          {city.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/5 border border-white/10 text-cyan-300 font-bold">
                          {city.code}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 group-hover:text-gray-400 truncate">
                      {city.qlooNodeCount}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-gray-400 flex items-center gap-2 truncate">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <CountryFlag code={currentMeta.code} size="xs" />
            <span className="truncate">
              Target: <strong className="text-white">{selectedCity}</strong>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold hidden sm:inline">
              {currentMeta.country} [{currentMeta.code}]
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-bold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Locking...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Lock Cultural Anchor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
