"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, Navigation, Crosshair, Sparkles, Check, Globe } from "lucide-react";

export interface SelectedLocation {
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
}

interface InteractiveCulturalMapProps {
  initialLocation?: SelectedLocation;
  onLocationSelect: (loc: SelectedLocation) => void;
  heightClassName?: string;
}

// 40+ Curated Cultural Metropolises for Instant 1-Click Teleport
const CURATED_METROPOLISES: SelectedLocation[] = [
  { city: "Sichuan (Chengdu)", country: "China", countryCode: "CN", flag: "🇨🇳", lat: 30.5728, lng: 104.0668 },
  { city: "Shanghai", country: "China", countryCode: "CN", flag: "🇨🇳", lat: 31.2304, lng: 121.4737 },
  { city: "Beijing", country: "China", countryCode: "CN", flag: "🇨🇳", lat: 39.9042, lng: 116.4074 },
  { city: "Tokyo", country: "Japan", countryCode: "JP", flag: "🇯🇵", lat: 35.6762, lng: 139.6503 },
  { city: "Paris", country: "France", countryCode: "FR", flag: "🇫🇷", lat: 48.8566, lng: 2.3522 },
  { city: "London", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", lat: 51.5074, lng: -0.1278 },
  { city: "New York", country: "United States", countryCode: "US", flag: "🇺🇸", lat: 40.7128, lng: -74.006 },
  { city: "Berlin", country: "Germany", countryCode: "DE", flag: "🇩🇪", lat: 52.52, lng: 13.405 },
  { city: "Milan", country: "Italy", countryCode: "IT", flag: "🇮🇹", lat: 45.4642, lng: 9.19 },
  { city: "Colombo", country: "Sri Lanka", countryCode: "LK", flag: "🇱🇰", lat: 6.9271, lng: 79.8612 },
  { city: "Seoul", country: "South Korea", countryCode: "KR", flag: "🇰🇷", lat: 37.5665, lng: 126.978 },
  { city: "Sydney", country: "Australia", countryCode: "AU", flag: "🇦🇺", lat: -33.8688, lng: 151.2093 },
  { city: "Singapore", country: "Singapore", countryCode: "SG", flag: "🇸🇬", lat: 1.3521, lng: 103.8198 },
  { city: "Dubai", country: "United Arab Emirates", countryCode: "AE", flag: "🇦🇪", lat: 25.2048, lng: 55.2708 },
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL", flag: "🇳🇱", lat: 52.3676, lng: 4.9041 },
  { city: "Barcelona", country: "Spain", countryCode: "ES", flag: "🇪🇸", lat: 41.3879, lng: 2.1699 },
  { city: "Zurich", country: "Switzerland", countryCode: "CH", flag: "🇨🇭", lat: 47.3769, lng: 8.5417 },
  { city: "Stockholm", country: "Sweden", countryCode: "SE", flag: "🇸🇪", lat: 59.3293, lng: 18.0686 },
  { city: "Copenhagen", country: "Denmark", countryCode: "DK", flag: "🇩🇰", lat: 55.6761, lng: 12.5683 },
  { city: "São Paulo", country: "Brazil", countryCode: "BR", flag: "🇧🇷", lat: -23.5505, lng: -46.6333 },
  { city: "Mexico City", country: "Mexico", countryCode: "MX", flag: "🇲🇽", lat: 19.4326, lng: -99.1332 },
  { city: "Bangkok", country: "Thailand", countryCode: "TH", flag: "🇹🇭", lat: 13.7563, lng: 100.5018 },
  { city: "Cape Town", country: "South Africa", countryCode: "ZA", flag: "🇿🇦", lat: -33.9249, lng: 18.4241 },
  { city: "Vienna", country: "Austria", countryCode: "AT", flag: "🇦🇹", lat: 48.2082, lng: 16.3738 },
  { city: "Lisbon", country: "Portugal", countryCode: "PT", flag: "🇵🇹", lat: 38.7223, lng: -9.1393 },
  { city: "Athens", country: "Greece", countryCode: "GR", flag: "🇬🇷", lat: 37.9838, lng: 23.7275 },
  { city: "Toronto", country: "Canada", countryCode: "CA", flag: "🇨🇦", lat: 43.6532, lng: -79.3832 },
  { city: "Kyoto", country: "Japan", countryCode: "JP", flag: "🇯🇵", lat: 35.0116, lng: 135.7681 },
  { city: "Kandy", country: "Sri Lanka", countryCode: "LK", flag: "🇱🇰", lat: 7.2906, lng: 80.6337 },
  { city: "Galle", country: "Sri Lanka", countryCode: "LK", flag: "🇱🇰", lat: 6.0535, lng: 80.221 },
  { city: "Mumbai", country: "India", countryCode: "IN", flag: "🇮🇳", lat: 19.076, lng: 72.8777 },
];

// 100% Free, Zero API Key Tile Engines with Global English Labels
const TILE_SERVERS = {
  cyber: {
    name: "Cyber Midnight (English)",
    icon: "⚡",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    className: "culturai-dark-tiles",
    maxZoom: 19,
    attribution: "© Esri World Street Map",
  },
  satellite: {
    name: "Satellite Recon",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    className: "",
    maxZoom: 19,
    attribution: "© Esri World Imagery",
  },
  esri: {
    name: "Esri Dark Canvas",
    icon: "🏛️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    className: "",
    maxZoom: 16,
    attribution: "© Esri",
  },
};

type MapThemeKey = keyof typeof TILE_SERVERS;

export default function InteractiveCulturalMap({
  initialLocation,
  onLocationSelect,
  heightClassName,
}: InteractiveCulturalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<MapThemeKey>("cyber");
  const [activeLocation, setActiveLocation] = useState<SelectedLocation>(
    initialLocation || CURATED_METROPOLISES[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map safely in client environment
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      // Dynamic import to prevent SSR build breaks
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted) return;

      // If map already exists, remove it
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const initialLat = initialLocation?.lat ?? 35.6762;
      const initialLng = initialLocation?.lng ?? 139.6503;

      // Initialize map instance with dark themed settings
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      leafletRef.current = L;

      // Initial Free Tile Layer (OpenStreetMap with Cyberpunk Dark Invert Filter)
      const cfg = TILE_SERVERS[mapTheme];
      const initialTile = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom,
        className: cfg.className,
      }).addTo(map);

      tileLayerRef.current = initialTile;

      // Add minimal zoom control to top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Custom Neon Glowing Pin Icon with FlagCDN badge
      const createNeonPin = (loc: SelectedLocation) => {
        const flagImg = loc.countryCode && loc.countryCode !== "XX"
          ? `<img src="https://flagcdn.com/w40/${loc.countryCode.toLowerCase()}.png" onerror="this.style.display='none'" style="width: 16px; height: 11px; object-fit: cover; border-radius: 2px; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.5);" alt="" />`
          : `<span>${loc.flag || '📍'}</span>`;

        return L.divIcon({
          className: "custom-neon-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
              <div style="
                position: absolute;
                bottom: 8px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(6, 182, 212, 0.35);
                box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: rgba(4, 4, 9, 0.95);
                border: 1.5px solid #06b6d4;
                border-radius: 9999px;
                box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
                font-family: monospace;
                font-size: 11px;
                font-weight: 700;
                color: #ffffff;
                white-space: nowrap;
                z-index: 10;
              ">
                ${flagImg}
                <span>${loc.city}</span>
                <span style="color: #22d3ee; font-size: 9px;">✦</span>
              </div>
              <div style="
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid #06b6d4;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
              "></div>
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #22d3ee;
                box-shadow: 0 0 10px #22d3ee;
                margin-top: -2px;
              "></div>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      };

      // Add Initial Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: createNeonPin(activeLocation),
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle map clicks to drop pin anywhere
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        map.panTo([lat, lng], { animate: true });

        setIsReverseGeocoding(true);
        try {
          // OpenStreetMap Nominatim reverse geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.suburb ||
              addr.state ||
              "Unknown Metropolis";
            const country = addr.country || "Global";
            const countryCode = (addr.country_code || "XX").toUpperCase();

            // Find flag or fallback
            const match = CURATED_METROPOLISES.find(
              (c) => c.countryCode.toLowerCase() === countryCode.toLowerCase()
            );
            const flag = match ? match.flag : "🌐";

            const newLoc: SelectedLocation = {
              city,
              country,
              countryCode,
              flag,
              lat,
              lng,
            };

            setActiveLocation(newLoc);
            marker.setIcon(createNeonPin(newLoc));
            onLocationSelect(newLoc);
          }
        } catch {
          // Fallback if network issue
          const fallbackLoc: SelectedLocation = {
            city: `Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
            country: "Global Coordinate",
            countryCode: "XX",
            flag: "📍",
            lat,
            lng,
          };
          setActiveLocation(fallbackLoc);
          marker.setIcon(createNeonPin(fallbackLoc));
          onLocationSelect(fallbackLoc);
        } finally {
          setIsReverseGeocoding(false);
        }
      });

      // Handle marker drag
      marker.on("dragend", async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        map.panTo([lat, lng], { animate: true });

        setIsReverseGeocoding(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.state ||
              "Custom Coordinate";
            const country = addr.country || "Global";
            const countryCode = (addr.country_code || "XX").toUpperCase();

            const match = CURATED_METROPOLISES.find(
              (c) => c.countryCode.toLowerCase() === countryCode.toLowerCase()
            );
            const flag = match ? match.flag : "🌐";

            const newLoc: SelectedLocation = {
              city,
              country,
              countryCode,
              flag,
              lat,
              lng,
            };

            setActiveLocation(newLoc);
            marker.setIcon(createNeonPin(newLoc));
            onLocationSelect(newLoc);
          }
        } finally {
          setIsReverseGeocoding(false);
        }
      });

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically swap free tile layer when map theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    const map = mapInstanceRef.current;
    const L = leafletRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_SERVERS[mapTheme];
    const newLayer = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      className: cfg.className,
      attribution: cfg.attribution,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapTheme]);

  // Teleport to a specific metropolis
  const teleportTo = async (loc: SelectedLocation) => {
    setActiveLocation(loc);
    onLocationSelect(loc);

    if (mapInstanceRef.current && markerRef.current) {
      const L = (await import("leaflet")).default;
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 11, {
        animate: true,
        duration: 1.5,
      });
      markerRef.current.setLatLng([loc.lat, loc.lng]);

      // Update marker label with FlagCDN badge
      const flagImg = loc.countryCode && loc.countryCode !== "XX"
        ? `<img src="https://flagcdn.com/w40/${loc.countryCode.toLowerCase()}.png" onerror="this.style.display='none'" style="width: 16px; height: 11px; object-fit: cover; border-radius: 2px; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.5);" alt="" />`
        : `<span>${loc.flag || '📍'}</span>`;

      const icon = L.divIcon({
        className: "custom-neon-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="
              position: absolute;
              bottom: 8px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(6, 182, 212, 0.35);
              box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 4px 10px;
              background: rgba(4, 4, 9, 0.95);
              border: 1.5px solid #06b6d4;
              border-radius: 9999px;
              box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
              font-family: monospace;
              font-size: 11px;
              font-weight: 700;
              color: #ffffff;
              white-space: nowrap;
              z-index: 10;
            ">
              ${flagImg}
              <span>${loc.city}</span>
              <span style="color: #22d3ee; font-size: 9px;">✦</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid #06b6d4;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            "></div>
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #22d3ee;
              box-shadow: 0 0 10px #22d3ee;
              margin-top: -2px;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      markerRef.current.setIcon(icon);
    }
  };

  // Search autocomplete handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // 1. First check local curated list
      const localMatches = CURATED_METROPOLISES.filter(
        (m) =>
          m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.country.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (localMatches.length > 0) {
        teleportTo(localMatches[0]);
        setSearchResults(localMatches);
        setIsSearching(false);
        return;
      }

      // 2. Fallback to OpenStreetMap Geocoding API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          const addr = first.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.state ||
            first.name ||
            searchQuery;
          const country = addr.country || "Global";
          const countryCode = (addr.country_code || "XX").toUpperCase();

          const match = CURATED_METROPOLISES.find(
            (c) => c.countryCode.toLowerCase() === countryCode.toLowerCase()
          );
          const flag = match ? match.flag : "📍";

          const foundLoc: SelectedLocation = {
            city,
            country,
            countryCode,
            flag,
            lat,
            lng,
          };

          teleportTo(foundLoc);
          setSearchResults(data);
        }
      }
    } catch (err) {
      console.error("Map search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar & Instant City Teleport Controls */}
      <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any country, metropolis, or place (e.g. Paris, Tokyo, Colombo, New York, Berlin)..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSearching ? (
              <span className="animate-spin text-sm">⟳</span>
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>Locate</span>
          </button>
        </form>

        {/* Quick Regional Teleport Hotspot Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Cultural Hotspots (1-Click Teleport):</span>
            </span>
            <span className="text-gray-500 text-[10px]">Click anywhere on map to drop custom pin</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CURATED_METROPOLISES.slice(0, 16).map((m) => {
              const isSelected =
                activeLocation.city.toLowerCase() === m.city.toLowerCase();
              return (
                <button
                  key={m.city}
                  type="button"
                  onClick={() => teleportTo(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-md shadow-cyan-500/20 font-bold"
                      : "bg-black/50 hover:bg-white/[0.08] text-gray-300 border border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="w-4 h-3 rounded-[3px] overflow-hidden flex items-center justify-center shrink-0 border border-white/20 shadow-sm bg-black/40">
                    <img
                      src={`https://flagcdn.com/w40/${m.countryCode.toLowerCase()}.png`}
                      alt={m.country}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span>{m.city}</span>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas Container */}
      <div className={`relative w-full ${heightClassName || "h-[340px] sm:h-[460px] lg:h-[520px]"} rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#040409]`}>
        {/* The Leaflet Div Mount */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Cyberpunk Map Scanline / Vignette Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#040409]/80 via-transparent to-[#040409]/40 z-10" />

        {/* Floating Top Left: Active Anchor Verification HUD */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto">
          <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#040409]/90 border border-cyan-500/30 backdrop-blur-2xl shadow-xl flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-6 sm:w-9 sm:h-7 rounded-md overflow-hidden bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={`https://flagcdn.com/w80/${(activeLocation.countryCode || 'xx').toLowerCase()}.png`}
                alt={activeLocation.country}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {activeLocation.city}
                </span>
                <span className="text-gray-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-gray-300 hidden sm:inline">{activeLocation.country}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {isReverseGeocoding ? "Locating..." : "Qloo Anchor Locked"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Top Right: Map Engine Style Switcher (100% Free, Zero API Keys) */}
        <div className="absolute top-4 right-14 z-20 pointer-events-auto flex items-center gap-1 bg-[#040409]/90 border border-white/10 p-1 rounded-2xl backdrop-blur-xl shadow-xl">
          {(["cyber", "satellite", "esri"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapTheme(mode)}
              title={TILE_SERVERS[mode].name}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                mapTheme === mode
                  ? "bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{TILE_SERVERS[mode].icon}</span>
              <span className="hidden md:inline">{TILE_SERVERS[mode].name}</span>
            </button>
          ))}
        </div>

        {/* Floating Bottom Right: Telemetry Coordinates HUD */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
          <div className="p-3 rounded-2xl bg-[#040409]/85 border border-white/10 backdrop-blur-xl text-[10px] font-mono text-gray-400 space-y-1 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">LAT / LNG</span>
              <span className="text-cyan-300 font-bold">
                {activeLocation.lat.toFixed(4)}°, {activeLocation.lng.toFixed(4)}°
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">MAP ENGINE</span>
              <span className="text-emerald-400 font-bold">
                {TILE_SERVERS[mapTheme].name} (Free • No Key)
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">PIN STATUS</span>
              <span className="text-purple-300">Draggable / Click-Enabled</span>
            </div>
          </div>
        </div>

        {/* Floating Instruction Badge */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Click or drag pin to anchor any neighborhood</span>
          </div>
        </div>
      </div>
    </div>
  );
}
