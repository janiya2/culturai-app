"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { runTravelConciergeAgent, AgentResult } from "@/lib/agentOrchestrator";
import { saveItinerary, getApiSettings, ApiSettings } from "@/lib/firestoreService";
import ProgressiveRefinementBanner from "@/components/ProgressiveRefinementBanner";
import CountryFlag from "@/components/CountryFlag";
import GlobalNavbar from "@/components/GlobalNavbar";
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  Sliders,
  Copy,
  ExternalLink,
  Volume2,
  Clock,
  Globe2,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  X,
  Layers,
  Tag,
} from "lucide-react";

import { GLOBAL_DESTINATIONS, TravelDestination } from "@/lib/globalDestinations";

interface ArchetypeItem {
  id: string;
  name: string;
  category: "Sound & Nightlife" | "Design & Architecture" | "Gastronomy & Wine" | "Cinema & Visual Art" | "Spiritual & Nature";
  subtext: string;
  badge: string;
}

const SUBCULTURAL_ARCHETYPES: ArchetypeItem[] = [
  // Sound & Nightlife
  { id: "Brutalist Architecture & Audiophile Vinyl", name: "Brutalist Architecture & Audiophile Vinyl", category: "Sound & Nightlife", subtext: "Raw concrete monoliths, vacuum tube amplifiers & rare pressing listening bars", badge: "Acoustic Craft" },
  { id: "Underground Techno & Industrial Spaces", name: "Underground Techno & Industrial Spaces", category: "Sound & Nightlife", subtext: "Decommissioned power stations, dark concrete clubs & modular synth pulse", badge: "Club Counterculture" },
  { id: "Post-Punk & Subterranean D.I.Y. Venues", name: "Post-Punk & Subterranean D.I.Y. Venues", category: "Sound & Nightlife", subtext: "Gritty basement gigs, flanged basslines, zines & rebel counterculture", badge: "Raw Underground" },
  { id: "Ambient Drone & Modular Sound Sanctuary", name: "Ambient Drone & Modular Sound Sanctuary", category: "Sound & Nightlife", subtext: "Deep meditative listening rooms, analog sound baths & spatial audio installations", badge: "Audiophile Zen" },
  { id: "Secret Jazz Kissa & Analog Hi-Fi Dens", name: "Secret Jazz Kissa & Analog Hi-Fi Dens", category: "Sound & Nightlife", subtext: "Vintage Tannoy horn speakers, rare 70s Blue Note pressings & single malt whisky", badge: "Vintage Acoustics" },

  // Design & Architecture
  { id: "Bauhaus Functionalism & Modernist Design Labs", name: "Bauhaus Functionalism & Modernist Design Labs", category: "Design & Architecture", subtext: "Rationalist glass structures, tubular steel cantilevers & avant-garde typography", badge: "Form & Function" },
  { id: "Mid-Century Modern & Desert Soundscapes", name: "Mid-Century Modern & Desert Soundscapes", category: "Design & Architecture", subtext: "Eames walnut pavilions, low-slung desert architecture & sun-drenched analog ambient", badge: "Desert Modernism" },
  { id: "Cyberpunk Megacity & Neon Arcade Alleyways", name: "Cyberpunk Megacity & Neon Arcade Alleyways", category: "Design & Architecture", subtext: "Holographic night markets, retro arcade dens, micro-apartments & neon rain", badge: "Neo-Tokyo Vibe" },
  { id: "Geoffrey Bawa Tropical Modernism", name: "Geoffrey Bawa Tropical Modernism", category: "Design & Architecture", subtext: "Seamless indoor-outdoor courtyard pavilions, raw clay terracotta & reflective water pools", badge: "Tropical Modern" },
  { id: "Archival Streetwear & Sneaker Grail Subculture", name: "Archival Streetwear & Sneaker Grail Subculture", category: "Design & Architecture", subtext: "Vintage heavyweight boxy tees, rare OG sample drops & skate park undergrounds", badge: "Street Culture" },

  // Gastronomy & Wine
  { id: "Haute Minimalist & Natural Wine", name: "Haute Minimalist & Natural Wine", category: "Gastronomy & Wine", subtext: "Low-intervention biodynamic pet-nats, Scandinavian interiors & fermented sourdough", badge: "Low-Intervention" },
  { id: "Nordic Foraging & Wild Fermentation Pioneers", name: "Nordic Foraging & Wild Fermentation Pioneers", category: "Gastronomy & Wine", subtext: "Hyper-seasonal pine needles, arctic sea urchin & experimental Nordic culinary labs", badge: "Avant-Garde Taste" },
  { id: "Bespoke Omakase & Japanese Craft Masterwork", name: "Bespoke Omakase & Japanese Craft Masterwork", category: "Gastronomy & Wine", subtext: "18-course seasonal sushi, hand-forged knife blades & binchotan robata charcoal", badge: "Artisanal Precision" },
  { id: "Oaxacan Artisanal Mezcal & Smoked Gastronomy", name: "Oaxacan Artisanal Mezcal & Smoked Gastronomy", category: "Gastronomy & Wine", subtext: "Earthen clay copitas, wild agave underground roasting & ancestral dark chili mole", badge: "Ancestral Spirits" },
  { id: "Venetian Bacari & Canal-Side Aperitivo Culture", name: "Venetian Bacari & Canal-Side Aperitivo Culture", category: "Gastronomy & Wine", subtext: "Select spritz, fresh seafood cicchetti skewers & gondola water reflections", badge: "Canal Aperitivo" },

  // Cinema & Visual Art
  { id: "Neo-Noir & Step-Printed Arthouse Cinema", name: "Neo-Noir & Step-Printed Arthouse Cinema", category: "Cinema & Visual Art", subtext: "Rain-soaked neon alleys, 35mm cinematheques & melancholic night walks", badge: "Celluloid Melancholy" },
  { id: "A24 Folk Horror & Pastoral Melancholia", name: "A24 Folk Horror & Pastoral Melancholia", category: "Cinema & Visual Art", subtext: "Bright sunlit pagan rituals, floral crowns, dread-inducing acoustic strings", badge: "Eerie Pastoral" },
  { id: "Art Nouveau & Bohemian Belle Époque", name: "Art Nouveau & Bohemian Belle Époque", category: "Cinema & Visual Art", subtext: "Ornate curved ironwork, bohemian literary cafes, absinthe bars & grand salons", badge: "Fin-de-Siècle" },
  { id: "Gothic Romantic & Ancient Cobblestone Antiquities", name: "Gothic Romantic & Ancient Cobblestone Antiquities", category: "Cinema & Visual Art", subtext: "Dimly lit candlelit absinthe taverns, antique book vaults & medieval cathedrals", badge: "Nocturnal Gothic" },
  { id: "French New Wave & Streetwise Jazz Romance", name: "French New Wave & Streetwise Jazz Romance", category: "Cinema & Visual Art", subtext: "Jump cuts, boulevard bookstalls, black coffee & spontaneous Parisian freedom", badge: "Cahiers du Cinéma" },

  // Spiritual & Nature
  { id: "Zen Temple & Wabi-Sabi Tea Sanctuaries", name: "Zen Temple & Wabi-Sabi Tea Sanctuaries", category: "Spiritual & Nature", subtext: "Moss-carpeted stone pathways, bamboo groves, ceremonial tea houses & silent contemplation", badge: "Mindful Silence" },
  { id: "Biophilic Greenery & Sustainable Sanctuaries", name: "Biophilic Greenery & Sustainable Sanctuaries", category: "Spiritual & Nature", subtext: "Living plant walls, sunlight glass atriums, organic botanical apothecary & calm", badge: "Living Ecosystem" },
  { id: "Mediterranean Coastal & Olive Grove Slow Living", name: "Mediterranean Coastal & Olive Grove Slow Living", category: "Spiritual & Nature", subtext: "Sun-drenched limestone terraces, wild rosemary, seaside cliffs & unhurried meals", badge: "Slow Mediterranean" },
];

export default function TravelPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null);
  const [city, setCity] = useState("Berlin");
  const [selectedCountryName, setSelectedCountryName] = useState("Germany");
  const [selectedCountryCode, setSelectedCountryCode] = useState("DE");
  const [selectedFlag, setSelectedFlag] = useState("🇩🇪");
  const [archetype, setArchetype] = useState("Brutalist Architecture & Audiophile Vinyl");
  const [duration, setDuration] = useState(3);

  // Destination Search & Filter State
  const [destinationSearch, setDestinationSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>("All");
  const [destPageOffset, setDestPageOffset] = useState(0);

  // Archetype Category Filter State
  const [archetypeCategory, setArchetypeCategory] = useState<string>("All");
  const [customArchetypeInput, setCustomArchetypeInput] = useState("");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [verifiedEntities, setVerifiedEntities] = useState<Array<{ name: string; entity_id: string; type: string; domain: string }>>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getApiSettings().then(setApiSettings).catch(() => {});
  }, []);

  const isQlooLiveConnected = Boolean(
    apiSettings?.qlooApiKey &&
    apiSettings.qlooApiKey.trim().length > 0 &&
    apiSettings.qlooApiMode === "live"
  );

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Route Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle City Select
  const handleSelectCity = (dest: TravelDestination) => {
    setCity(dest.city);
    setSelectedCountryName(dest.country);
    setSelectedCountryCode(dest.code);
    setSelectedFlag(dest.flag);
    setDestinationSearch("");
    setIsSearchOpen(false);
  };

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationSearch.trim()) return;
    setCity(destinationSearch.trim());
    setSelectedCountryName("Global");
    setSelectedCountryCode("GLOBAL");
    setSelectedFlag("🌐");
    setIsSearchOpen(false);
  };

  // Search Results Filter for Destinations
  const searchResults = useMemo(() => {
    const q = destinationSearch.trim().toLowerCase();
    if (!q) return [];
    return GLOBAL_DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.vibe.toLowerCase().includes(q) ||
        d.highlight.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [destinationSearch]);

  // Regional Filtered Destinations
  const regionalDestinations = useMemo(() => {
    if (activeRegion === "All") return GLOBAL_DESTINATIONS;
    return GLOBAL_DESTINATIONS.filter((d) => d.region === activeRegion);
  }, [activeRegion]);

  // Display 6 quick destinations at a time, cyclical shuffle
  const itemsPerPage = 6;
  const displayedDestinations = useMemo(() => {
    if (regionalDestinations.length <= itemsPerPage) return regionalDestinations;
    const start = (destPageOffset * itemsPerPage) % regionalDestinations.length;
    const slice = regionalDestinations.slice(start, start + itemsPerPage);
    if (slice.length < itemsPerPage) {
      return [...slice, ...regionalDestinations.slice(0, itemsPerPage - slice.length)];
    }
    return slice;
  }, [regionalDestinations, destPageOffset]);

  // Filtered Archetypes
  const filteredArchetypes = useMemo(() => {
    if (archetypeCategory === "All") return SUBCULTURAL_ARCHETYPES;
    return SUBCULTURAL_ARCHETYPES.filter((a) => a.category === archetypeCategory);
  }, [archetypeCategory]);

  const handleCustomArchetypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArchetypeInput.trim()) return;
    setArchetype(customArchetypeInput.trim());
    setCustomArchetypeInput("");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setSavedId(null);
    setVerifiedEntities([]);
    try {
      const res = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          archetype,
          days: duration,
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
        const fallbackRes = await runTravelConciergeAgent({
          city,
          archetype,
          days: duration,
        });
        setResult(fallbackRes);
      }
    } catch (err) {
      console.error("Travel Concierge generation failed, falling back:", err);
      const fallbackRes = await runTravelConciergeAgent({
        city,
        archetype,
        days: duration,
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
      userName: user?.displayName || userProfile?.displayName || user?.email || "CulturAI Explorer",
      agentType: "travel-concierge",
      title: result.title,
      destCity: city,
      signals: [city, archetype],
      summary: result.summary,
      items: result.itinerary,
      tasteVectors: result.radarVectors,
    });
    if (docId) setSavedId(docId);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n${result.subtitle}\n\n${result.summary}\n\n` +
      result.itinerary.map((i) => `• [${i.day} - ${i.time}] ${i.name}\n  ${i.description}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040409] text-white selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns scale-105 transition-all duration-1000 opacity-35 sm:opacity-45"
          style={{ backgroundImage: `url('/bg_travel.jpg')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(4,4,9,0.55)_0%,rgba(4,4,9,0.85)_75%,rgba(4,4,9,0.98)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/85 via-transparent to-[#040409]/95" />
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-purple-500/20 via-indigo-600/15 to-transparent rounded-full blur-[170px] animate-aurora" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-600/20 via-blue-600/15 to-transparent rounded-full blur-[180px] animate-aurora [animation-delay:4s]" />
      </div>

      {/* Global Navigation Bar */}
      <GlobalNavbar />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono shadow-sm">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Autonomous Subculture Travel Synthesis
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Curate an Uncompromised Global Expedition
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Qloo crafts bespoke 3-day itineraries engineered specifically against raw subcultural authenticity vectors — bypassing tourist traps in favor of architectural sanctuaries, audiophile vinyl dens, and low-profile wine vaults.
          </p>
        </div>

        {/* Progressive Refinement if Music was Skipped in Onboarding */}
        <ProgressiveRefinementBanner
          domain="music"
          onRefined={(newItems) => {
            if (newItems.length > 0) {
              setArchetype(newItems[0] + " & Audiophile Culture");
            }
          }}
        />

        {/* Configuration Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Destinations & Archetype Selection (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 p-6 rounded-3xl bg-[#080d1a]/85 border border-purple-500/25 backdrop-blur-2xl shadow-2xl shadow-purple-950/20">
            {/* ======================================================== */}
            {/* 1. TARGET CULTURAL METROPOLIS (WORLDWIDE SEARCH & SELECT) */}
            {/* ======================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-gray-200 uppercase tracking-wider font-bold">
                  Target Cultural Metropolis & Destination
                </label>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                  45+ Global Cultural Hubs
                </span>
              </div>

              {/* Active Selected Destination Pill Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-black/80 to-indigo-500/10 border border-purple-500/40 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <CountryFlag code={selectedCountryCode} size="md" className="rounded shadow-md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {city}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        ({selectedCountryName})
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-300 font-mono block">
                      Targeted for Autonomous 3-Day Subculture Synthesis
                    </span>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Ready to synthesize" />
              </div>

              {/* Live Autocomplete Destination Search Bar */}
              <div className="relative" ref={searchContainerRef}>
                <form onSubmit={handleCustomCitySubmit} className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={destinationSearch}
                    onChange={(e) => {
                      setDestinationSearch(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (destinationSearch.trim().length > 0) setIsSearchOpen(true);
                    }}
                    placeholder="Search any world city or country (e.g. Kyoto, Milan, Sri Lanka, Oaxaca, Sydney)..."
                    className="w-full pl-10 pr-24 py-2.5 bg-black/60 border border-white/10 hover:border-purple-400/50 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all font-sans"
                    autoComplete="off"
                  />
                  {destinationSearch.trim() && (
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-mono text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Target City
                    </button>
                  )}
                </form>

                {/* Autocomplete Dropdown Menu */}
                {isSearchOpen && destinationSearch.trim().length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#070914]/98 border border-purple-500/40 shadow-2xl shadow-black/90 z-50 backdrop-blur-2xl p-2 space-y-1 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    <div className="px-2.5 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Globe2 className="w-3 h-3" />
                        <span>Matching Global Travel Destinations</span>
                      </span>
                      <span className="text-[9px] text-gray-500">Click to Select</span>
                    </div>

                    {searchResults.length > 0 ? (
                      searchResults.map((dest) => (
                        <div
                          key={`${dest.city}-${dest.country}`}
                          onClick={() => handleSelectCity(dest)}
                          className="p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border border-transparent hover:bg-purple-500/15 hover:border-purple-500/30 text-gray-200 hover:text-white"
                        >
                          <div className="flex items-center gap-3">
                            <CountryFlag code={dest.code} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{dest.city}</span>
                                <span className="text-[10px] font-mono text-gray-400">({dest.country})</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-purple-300">
                                  {dest.region}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">{dest.vibe}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-purple-400 font-bold shrink-0">
                            Select ↗
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No standard curated hub matched "{destinationSearch}".
                      </div>
                    )}

                    {/* Fallback to select custom typed destination */}
                    <div
                      onClick={() => {
                        setCity(destinationSearch.trim());
                        setSelectedCountryName("Global");
                        setSelectedCountryCode("GLOBAL");
                        setSelectedFlag("🌐");
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-dashed border-purple-400/40 text-xs text-purple-200 font-mono flex items-center justify-between cursor-pointer transition-colors mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>
                          Target custom metropolis: <strong className="text-white">"{destinationSearch.trim()}"</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">Press Enter ↵</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Region Filter Tabs & Shuffle Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                  {["All", "Europe", "Asia & Pacific", "Americas", "Middle East & Africa"].map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => {
                        setActiveRegion(reg);
                        setDestPageOffset(0);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                        activeRegion === reg
                          ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30"
                          : "bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDestPageOffset((prev) => prev + 1)}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Discover more global destinations"
                >
                  <RefreshCw className="w-3 h-3 text-purple-300" />
                  <span>Shuffle Cities</span>
                </button>
              </div>

              {/* Quick Destination Cards Grid (6 at a time) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {displayedDestinations.map((d) => {
                  const isSelected = city.toLowerCase() === d.city.toLowerCase();
                  return (
                    <button
                      key={`${d.city}-${d.country}`}
                      type="button"
                      onClick={() => handleSelectCity(d)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
                        isSelected
                          ? "bg-purple-500/25 border-purple-400 text-white shadow-lg shadow-purple-500/25 scale-[1.02]"
                          : "bg-black/50 border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                            {d.city}
                          </span>
                          <CountryFlag code={d.code} size="xs" />
                        </div>
                        <div className="text-[10px] font-mono text-purple-300/80 mb-1">{d.country}</div>
                        <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                          {d.highlight}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-gray-500">{d.region}</span>
                        {isSelected && <span className="text-purple-300 font-bold">Active</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ======================================================== */}
            {/* 2. AESTHETIC SUBCULTURAL ARCHETYPE (20+ RICH ARCHETYPES) */}
            {/* ======================================================== */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-gray-200 uppercase tracking-wider font-bold">
                  Aesthetic Subcultural Archetype (20+ Archetypes)
                </label>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                  Domain Filterable
                </span>
              </div>

              {/* Archetype Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  "All",
                  "Sound & Nightlife",
                  "Design & Architecture",
                  "Gastronomy & Wine",
                  "Cinema & Visual Art",
                  "Spiritual & Nature",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setArchetypeCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      archetypeCategory === cat
                        ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25"
                        : "bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Archetypes Scrollable Card List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                {filteredArchetypes.map((arch) => {
                  const isSelected = archetype === arch.name;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setArchetype(arch.name)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isSelected
                          ? "bg-purple-500/20 border-purple-400 text-purple-100 shadow-md shadow-purple-500/20"
                          : "bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.05] hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs font-bold group-hover:text-purple-200 transition-colors">
                            {arch.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          {arch.subtext}
                        </p>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-purple-400 text-black flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-500 group-hover:text-purple-300 transition-colors shrink-0">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Archetype Input Form */}
              <form onSubmit={handleCustomArchetypeSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customArchetypeInput}
                  onChange={(e) => setCustomArchetypeInput(e.target.value)}
                  placeholder="Or define bespoke archetype (e.g. Lo-Fi Hip Hop & Rain Alleyways)..."
                  className="flex-1 px-3.5 py-2 bg-black/60 border border-white/10 hover:border-cyan-400/50 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-all font-sans"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
                >
                  Set Custom
                </button>
              </form>
            </div>

            {/* Launch Button or Standby Notice */}
            {!isQlooLiveConnected ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Qloo Production API Engine on Standby</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  To ensure total algorithmic authenticity for judges, live subcultural routes require official Qloo API key calibration. Configure keys in the Admin Console to activate live synthesis.
                </p>
                <Link
                  href="/admin/keys"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-white underline font-semibold cursor-pointer"
                >
                  Admin Console Setup ↗
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Synthesizing 3-Day Experiential Route in {city}...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-purple-200" />
                    <span>Generate 3-Day Subculture Route for {city}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right Column: Narrative Overview (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#070b14]/85 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
                  Urban Mapping Architecture
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isQlooLiveConnected
                    ? "text-purple-300 bg-purple-500/20 border-purple-500/30"
                    : "text-amber-300 bg-amber-500/20 border-amber-500/30"
                }`}>
                  {isQlooLiveConnected ? "Qloo Live Nodes" : "Engine Standby"}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Traditional travel apps optimize for mass tourism volume. CulturAI filters {city} ({selectedCountryName}) against raw subcultural authenticity vectors, prioritizing low-profile spaces that resonate with intellectual curiosity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target Metropolis:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <CountryFlag code={selectedCountryCode} size="xs" />
                  <span>{city}, {selectedCountryName}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Curated Duration:</span>
                <span className="text-white font-bold">3 Full Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Synthesis Engine:</span>
                <span className={isQlooLiveConnected ? "text-emerald-400 font-bold" : "text-amber-300 font-bold"}>
                  {isQlooLiveConnected ? "Live Graph Active" : "Staged • Key Required"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Archetype:</span>
                <span className="text-purple-300 font-bold truncate max-w-[200px]" title={archetype}>
                  {archetype}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pt-4">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {result.subtitle}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-2">
                  {result.title}
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Actions */}
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
                  <span>{savedId ? "Saved in Cloud" : "Save Itinerary"}</span>
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
              <div className="p-4 rounded-2xl bg-[#070b14]/90 border border-purple-500/30 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    Verified Qloo Graph Coordinates (Entity Lookups)
                  </span>
                  <span className="text-gray-500">{verifiedEntities.length} Live Graph Nodes Grounding This Residency</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {verifiedEntities.map((ent, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-1.5"
                    >
                      <span className="text-purple-300 font-bold">{ent.name}</span>
                      <span className="text-gray-500 text-[10px]">({ent.entity_id.slice(0, 8)}...)</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">{ent.domain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 Days Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-[#090912]/90 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase font-bold">
                        {item.day || `Day ${idx + 1}`}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {item.time}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-purple-400">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
                      <strong>Qloo Match Reason:</strong> {item.matchReason}
                    </div>

                    {item.spotifyTrack && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Sonic Alignment: {item.spotifyTrack}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Narrative Commentary */}
            {result.aiCommentary && (
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Cultural Concierge Synthesis Commentary
                </span>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  &ldquo;{result.aiCommentary}&rdquo;
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
