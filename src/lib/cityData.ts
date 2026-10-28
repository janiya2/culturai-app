/**
 * Cultural Metropolises & Global Mapping Data
 * Powers interactive world map city selector and header country badges
 */

export interface CulturalCity {
  id: string;
  name: string;
  country: string;
  flag: string;
  code: string;
  vibe: string;
  xPercent: number; // 0 - 100 for SVG World Map positioning
  yPercent: number; // 0 - 100
  qlooNodeCount: string;
}

export const CULTURAL_CITIES: CulturalCity[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    code: "JP",
    vibe: "Jazz Kissas, Brutalism & Neon Alleys",
    xPercent: 88.0,
    yPercent: 32.5,
    qlooNodeCount: "1.4M Nodes",
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    flag: "🇩🇪",
    code: "DE",
    vibe: "Brutalist Concrete, Industrial Techno & Natural Wine",
    xPercent: 55.5,
    yPercent: 22.5,
    qlooNodeCount: "980K Nodes",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    code: "GB",
    vibe: "Subterranean Vinyl Dens & Independent Galleries",
    xPercent: 45.0,
    yPercent: 21.0,
    qlooNodeCount: "1.8M Nodes",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    flag: "🇫🇷",
    code: "FR",
    vibe: "Natural Wine Bistros & Arthouse Celluloid",
    xPercent: 47.0,
    yPercent: 30.0,
    qlooNodeCount: "1.6M Nodes",
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    flag: "🇺🇸",
    code: "US",
    vibe: "Industrial Lofts & Speakeasy Mixology",
    xPercent: 28.0,
    yPercent: 32.0,
    qlooNodeCount: "2.4M Nodes",
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    code: "KR",
    vibe: "Futuristic Concrete & Concept Cafes",
    xPercent: 79.5,
    yPercent: 33.0,
    qlooNodeCount: "860K Nodes",
  },
  {
    id: "milan",
    name: "Milan",
    country: "Italy",
    flag: "🇮🇹",
    code: "IT",
    vibe: "Archival Fashion Houses & Rationalist Architecture",
    xPercent: 52.0,
    yPercent: 35.0,
    qlooNodeCount: "740K Nodes",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    flag: "🇳🇱",
    code: "NL",
    vibe: "Canal-Side Listening Bars & Modernist Design",
    xPercent: 50.5,
    yPercent: 19.5,
    qlooNodeCount: "620K Nodes",
  },
  {
    id: "sichuan",
    name: "Sichuan (Chengdu)",
    country: "China",
    flag: "🇨🇳",
    code: "CN",
    vibe: "Teahouses, Cyberpunk Alleys & Spicy Gastronomy",
    xPercent: 74.0,
    yPercent: 41.0,
    qlooNodeCount: "1.2M Nodes",
  },
  {
    id: "shanghai",
    name: "Shanghai",
    country: "China",
    flag: "🇨🇳",
    code: "CN",
    vibe: "Futuristic Megacity, Art Deco & Electronic Underground",
    xPercent: 78.5,
    yPercent: 42.0,
    qlooNodeCount: "1.7M Nodes",
  },
  {
    id: "beijing",
    name: "Beijing",
    country: "China",
    flag: "🇨🇳",
    code: "CN",
    vibe: "Imperial Architecture, Hutong Subculture & Indie Rock",
    xPercent: 77.0,
    yPercent: 32.0,
    qlooNodeCount: "1.5M Nodes",
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    country: "United States",
    flag: "🇺🇸",
    code: "US",
    vibe: "Mid-Century Modern & Desert Soundscapes",
    xPercent: 17.5,
    yPercent: 35.5,
    qlooNodeCount: "1.9M Nodes",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    code: "SG",
    vibe: "Biophilic Architecture & Bespoke Cocktail Dens",
    xPercent: 74.0,
    yPercent: 57.0,
    qlooNodeCount: "590K Nodes",
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    flag: "🇯🇵",
    code: "JP",
    vibe: "Minimalist Tea Pavilions & Analog Sound Bars",
    xPercent: 84.0,
    yPercent: 39.0,
    qlooNodeCount: "430K Nodes",
  },
  {
    id: "melbourne",
    name: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    code: "AU",
    vibe: "Subterranean Laneways & Third-Wave Roasters",
    xPercent: 88.0,
    yPercent: 82.0,
    qlooNodeCount: "680K Nodes",
  },
];

/**
 * Standard ISO Country Reference Map
 */
const COUNTRY_MAP: Record<string, { code: string; flag: string; country: string }> = {
  china: { code: "CN", flag: "🇨🇳", country: "China" },
  sichuan: { code: "CN", flag: "🇨🇳", country: "China" },
  chengdu: { code: "CN", flag: "🇨🇳", country: "China" },
  shanghai: { code: "CN", flag: "🇨🇳", country: "China" },
  beijing: { code: "CN", flag: "🇨🇳", country: "China" },
  japan: { code: "JP", flag: "🇯🇵", country: "Japan" },
  tokyo: { code: "JP", flag: "🇯🇵", country: "Japan" },
  osaka: { code: "JP", flag: "🇯🇵", country: "Japan" },
  kyoto: { code: "JP", flag: "🇯🇵", country: "Japan" },
  germany: { code: "DE", flag: "🇩🇪", country: "Germany" },
  berlin: { code: "DE", flag: "🇩🇪", country: "Germany" },
  munich: { code: "DE", flag: "🇩🇪", country: "Germany" },
  uk: { code: "GB", flag: "🇬🇧", country: "United Kingdom" },
  "united kingdom": { code: "GB", flag: "🇬🇧", country: "United Kingdom" },
  britain: { code: "GB", flag: "🇬🇧", country: "United Kingdom" },
  england: { code: "GB", flag: "🇬🇧", country: "United Kingdom" },
  london: { code: "GB", flag: "🇬🇧", country: "United Kingdom" },
  france: { code: "FR", flag: "🇫🇷", country: "France" },
  paris: { code: "FR", flag: "🇫🇷", country: "France" },
  usa: { code: "US", flag: "🇺🇸", country: "United States" },
  "united states": { code: "US", flag: "🇺🇸", country: "United States" },
  america: { code: "US", flag: "🇺🇸", country: "United States" },
  "new york": { code: "US", flag: "🇺🇸", country: "United States" },
  "los angeles": { code: "US", flag: "🇺🇸", country: "United States" },
  korea: { code: "KR", flag: "🇰🇷", country: "South Korea" },
  "south korea": { code: "KR", flag: "🇰🇷", country: "South Korea" },
  seoul: { code: "KR", flag: "🇰🇷", country: "South Korea" },
  italy: { code: "IT", flag: "🇮🇹", country: "Italy" },
  milan: { code: "IT", flag: "🇮🇹", country: "Italy" },
  rome: { code: "IT", flag: "🇮🇹", country: "Italy" },
  netherlands: { code: "NL", flag: "🇳🇱", country: "Netherlands" },
  amsterdam: { code: "NL", flag: "🇳🇱", country: "Netherlands" },
  singapore: { code: "SG", flag: "🇸🇬", country: "Singapore" },
  australia: { code: "AU", flag: "🇦🇺", country: "Australia" },
  sydney: { code: "AU", flag: "🇦🇺", country: "Australia" },
  melbourne: { code: "AU", flag: "🇦🇺", country: "Australia" },
  "sri lanka": { code: "LK", flag: "🇱🇰", country: "Sri Lanka" },
  colombo: { code: "LK", flag: "🇱🇰", country: "Sri Lanka" },
  kandy: { code: "LK", flag: "🇱🇰", country: "Sri Lanka" },
  galle: { code: "LK", flag: "🇱🇰", country: "Sri Lanka" },
  canada: { code: "CA", flag: "🇨🇦", country: "Canada" },
  toronto: { code: "CA", flag: "🇨🇦", country: "Canada" },
  vancouver: { code: "CA", flag: "🇨🇦", country: "Canada" },
  india: { code: "IN", flag: "🇮🇳", country: "India" },
  mumbai: { code: "IN", flag: "🇮🇳", country: "India" },
  delhi: { code: "IN", flag: "🇮🇳", country: "India" },
  spain: { code: "ES", flag: "🇪🇸", country: "Spain" },
  barcelona: { code: "ES", flag: "🇪🇸", country: "Spain" },
  madrid: { code: "ES", flag: "🇪🇸", country: "Spain" },
  switzerland: { code: "CH", flag: "🇨🇭", country: "Switzerland" },
  zurich: { code: "CH", flag: "🇨🇭", country: "Switzerland" },
  geneva: { code: "CH", flag: "🇨🇭", country: "Switzerland" },
  brazil: { code: "BR", flag: "🇧🇷", country: "Brazil" },
  "são paulo": { code: "BR", flag: "🇧🇷", country: "Brazil" },
  mexico: { code: "MX", flag: "🇲🇽", country: "Mexico" },
  thailand: { code: "TH", flag: "🇹🇭", country: "Thailand" },
  bangkok: { code: "TH", flag: "🇹🇭", country: "Thailand" },
  indonesia: { code: "ID", flag: "🇮🇩", country: "Indonesia" },
  uae: { code: "AE", flag: "🇦🇪", country: "United Arab Emirates" },
  dubai: { code: "AE", flag: "🇦🇪", country: "United Arab Emirates" },
};

/**
 * Resolve any city string into a formatted city, country, flag, and code
 */
export function resolveCityMetadata(cityInput: string): {
  city: string;
  country: string;
  flag: string;
  code: string;
  fullName: string;
} {
  if (!cityInput) {
    return {
      city: "Tokyo",
      country: "Japan",
      flag: "🇯🇵",
      code: "JP",
      fullName: "Tokyo, Japan",
    };
  }

  const raw = cityInput.trim();
  const lower = raw.toLowerCase();

  // 1. Direct match in CULTURAL_CITIES
  const found = CULTURAL_CITIES.find(
    (c) =>
      lower.includes(c.name.toLowerCase()) ||
      lower.includes(c.id) ||
      (c.country && lower.includes(c.country.toLowerCase()))
  );

  // 2. Direct match in COUNTRY_MAP
  for (const [key, data] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key)) {
      const parts = raw.split(",");
      const cityName = parts[0]?.trim() || data.country;
      return {
        city: cityName,
        country: data.country,
        flag: data.flag,
        code: data.code,
        fullName: raw.includes(",") ? raw : `${raw}, ${data.country}`,
      };
    }
  }

  if (found) {
    return {
      city: found.name,
      country: found.country,
      flag: found.flag,
      code: found.code,
      fullName: `${found.name}, ${found.country}`,
    };
  }

  // 3. Generic fallback
  const cityName = raw.split(",")[0].trim();
  const countryName = raw.split(",")[1]?.trim() || "Global";
  const fallbackCode =
    countryName.toLowerCase() === "china"
      ? "CN"
      : countryName.slice(0, 2).toUpperCase();

  return {
    city: cityName,
    country: countryName,
    flag: countryName.toLowerCase() === "china" ? "🇨🇳" : "🌐",
    code: fallbackCode,
    fullName: raw,
  };
}
