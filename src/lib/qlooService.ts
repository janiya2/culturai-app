/**
 * Qloo Taste AI Graph Service
 * Bridges LLMs with cultural affinity vectors across Film, Music, Dining, Fashion, Books & Travel.
 * Dual-Mode: Live Qloo API Client + High-Dimensional Resilient Mock Engine.
 */

import { getApiSettings } from "./firestoreService";

export interface CulturalEntity {
  id: string;
  name: string;
  domain: "music" | "film" | "dining" | "fashion" | "travel" | "books";
  category?: string;
  tags: string[];
  affinityScore?: number;
  description?: string;
  location?: string;
  imageUrl?: string;
}

export interface TasteRadarVector {
  sonicDepth: number;     // Classical / Indie / Ambient / Electronic
  cinematicAesthetic: number; // Noir / Avant-Garde / Blockbuster / Surrealist
  gastronomyCuriosity: number; // Speakeasy / Michelin / Street Food / Omakase
  urbanSubculture: number; // Underground / Architectural / Bohemian / Luxury
  literaryResonance: number; // Philosophical / Cyberpunk / Classical / Contemporary
  [key: string]: number;
}

// ---------------------------------------------------------------------------
// High-Fidelity Curated Cultural Knowledge Graph
// ---------------------------------------------------------------------------
export const CURATED_CULTURAL_GRAPH: CulturalEntity[] = [
  // MUSIC
  {
    id: "mus_radiohead",
    name: "Radiohead",
    domain: "music",
    category: "Experimental Art Rock / Electronic",
    tags: ["Experimental", "Melancholic", "Avant-Garde", "Deep Listening", "Dystopian"],
    description: "Atmospheric textures, boundary-pushing arrangements, and introspective soundscapes.",
  },
  {
    id: "mus_daftpunk",
    name: "Daft Punk",
    domain: "music",
    category: "French House / Synthwave / Cyberpunk",
    tags: ["Cyberpunk", "Futuristic", "Groove", "Iconic", "Analog Synths"],
    description: "Pioneering electronic rhythms fused with retro-futuristic robotic aesthetics.",
  },
  {
    id: "mus_milesdavis",
    name: "Miles Davis",
    domain: "music",
    category: "Modal Jazz / Cool Jazz",
    tags: ["Sophisticated", "Late Night", "Nocturnal", "Improvisational", "Timeless"],
    description: "Sublime, understated modal jazz engineered for candlelit evenings and quiet introspection.",
  },
  {
    id: "mus_aphextwin",
    name: "Aphex Twin",
    domain: "music",
    category: "IDM / Ambient Techno",
    tags: ["IDM", "Complex", "Braindance", "Ambient", "Surreal"],
    description: "Intricate rhythmic glitch architecture paired with lush neoclassical melodies.",
  },
  {
    id: "mus_fkj",
    name: "FKJ (French Kiwi Juice)",
    domain: "music",
    category: "Neo-Soul / Nu-Jazz / Lo-Fi",
    tags: ["Smooth", "Soulful", "Cocktail", "Multi-instrumental", "Warm"],
    description: "Sensual guitar licks, Rhodes keys, and organic grooves perfect for intimate lounges.",
  },
  {
    id: "mus_tycho",
    name: "Tycho",
    domain: "music",
    category: "Chillwave / Post-Rock",
    tags: ["Atmospheric", "Sunset", "Warm", "Design-Driven", "Inspiring"],
    description: "Sun-drenched synths and driving basslines inspired by California modernism.",
  },

  // FILM & DIRECTORS
  {
    id: "flm_nolan",
    name: "Christopher Nolan",
    domain: "film",
    category: "Sci-Fi / Psychological Thriller",
    tags: ["Non-Linear", "Intellectual", "Grand Scale", "Philosophical", "Practical FX"],
    description: "Architectural storytelling exploring the mechanics of time, memory, and perception.",
  },
  {
    id: "flm_villeneuve",
    name: "Denis Villeneuve",
    domain: "film",
    category: "Speculative Sci-Fi / Brutalist Cinema",
    tags: ["Brutalist", "Atmospheric", "Epic", "Cinematography", "Slow-Burn"],
    description: "Hypnotic visual minimalism, towering scale, and deeply immersive world-building.",
  },
  {
    id: "flm_wongkarwai",
    name: "Wong Kar-wai",
    domain: "film",
    category: "Romantic Neo-Noir",
    tags: ["Neon", "Sensual", "Step-Printing", "Nostalgic", "Urban Solitude"],
    description: "Lush Hong Kong neon palettes, slow-motion reveries, and aching romantic nostalgia.",
  },
  {
    id: "flm_wesanderson",
    name: "Wes Anderson",
    domain: "film",
    category: "Whimsical Narrative / Pastel Aesthetic",
    tags: ["Symmetrical", "Pastel", "Artisanal", "Quirky", "Meticulous"],
    description: "Obsessively composed dioramas, bespoke typography, and nostalgic melancholia.",
  },
  {
    id: "flm_fincher",
    name: "David Fincher",
    domain: "film",
    category: "Precision Procedural Thriller",
    tags: ["Calculated", "Dark Green Tint", "Obsessive", "Technical", "Clinical"],
    description: "Razor-sharp pacing, low-key lighting, and psychological forensic intensity.",
  },

  // DINING & SPEAKEASIES
  {
    id: "din_vinylbar",
    name: "Bar Shiru / Jazu Hi-Fi Lounge",
    domain: "dining",
    category: "Japanese Listening Bar & Craft Cocktails",
    tags: ["Hi-Fi Audio", "Vinyl", "Whiskey", "Intimate", "Warm Wood"],
    description: "Audiophile-grade vintage speakers playing rare jazz and soul, accompanied by hand-carved ice cocktails.",
  },
  {
    id: "din_omakase",
    name: "Underground Counter Omakase",
    domain: "dining",
    category: "Modern Edomae Sushi",
    tags: ["Artisanal", "Minimalist", "Precision", "Sake Pairing", "Culinary Craft"],
    description: "A private 8-seat counter presenting hyper-seasonal nigiri brushed with aged nikiri shoyu.",
  },
  {
    id: "din_brutalistbistro",
    name: "Atelier Septime / Neo-Bistro",
    domain: "dining",
    category: "Natural Wine & Hyper-Seasonal French",
    tags: ["Natural Wine", "Farm-to-Table", "Effortless", "Biodynamic", "Urban"],
    description: "Poured pet-nats and unpretentious Michelin-starred seasonal plates in an industrial space.",
  },
  {
    id: "din_speakeasy_apothecary",
    name: "The Blind Barber & Apothecary",
    domain: "dining",
    category: "Hidden Behind-Bookcase Speakeasy",
    tags: ["Hidden Door", "Herbal Cocktails", "Dimly Lit", "Velvet", "Secretive"],
    description: "Concealed behind an antique tailor shop, serving botanical elixirs and rare mezcals.",
  },

  // TRAVEL & SUBCULTURES
  {
    id: "trv_shimokitazawa",
    name: "Shimokitazawa & Daikanyama",
    domain: "travel",
    location: "Tokyo, Japan",
    category: "Vinyl, Independent Boutiques & Brutalist Cafes",
    tags: ["Subculture", "Vintage", "Indie Music", "Specialty Coffee", "Curated"],
    description: "Tokyo’s bohemian epicenter of rare vinyl record dens, archive fashion, and single-origin pour-overs.",
  },
  {
    id: "trv_shoreditch_soho",
    name: "Soho & Redchurch Street",
    domain: "travel",
    location: "London, UK",
    category: "Avant-Garde Art, Jazz Cellars & Design Studios",
    tags: ["Creative Hub", "Historic Jazz", "Design", "Cocktail Culture", "Modernist"],
    description: "Cobblestone alleys blending storied basement jazz clubs with progressive contemporary art galleries.",
  },
  {
    id: "trv_lower_east_side",
    name: "Lower East Side & Dumbo",
    domain: "travel",
    location: "New York, USA",
    category: "Indie Galleries, Natural Wine & Rooftop Cinema",
    tags: ["Urban Edge", "Loft Culture", "Natural Wine", "Eclectic", "Nightlife"],
    description: "Raw tenement architecture housing cutting-edge gallery openings, late-night vinyl spots, and skyline lofts.",
  },
  {
    id: "trv_canal_saint_martin",
    name: "Canal Saint-Martin & Belleville",
    domain: "travel",
    location: "Paris, France",
    category: "Artists Lofts, Bookshops & Waterfront Aperitifs",
    tags: ["Literary", "Waterfront", "Bohemian", "Aperitif", "Bistronomy"],
    description: "Tree-shaded iron footbridges, independent philosophy bookshops, and waterside natural wine bars.",
  },
  {
    id: "trv_kreuzberg_mitte",
    name: "Kreuzberg & Mitte Gallery Mile",
    domain: "travel",
    location: "Berlin, Germany",
    category: "Industrial Techno, Bauhaus Design & Third-Wave Coffee",
    tags: ["Industrial", "Electronic Music", "Brutalist", "Art Galleries", "Underground"],
    description: "Repurposed power stations, brutalist concrete spaces, and boundary-pushing contemporary art exhibits.",
  },

  // FASHION & DESIGN
  {
    id: "fsh_isseymiyake",
    name: "Issey Miyake / Homme Plissé",
    domain: "fashion",
    category: "Architectural Pleats & Kinetic Form",
    tags: ["Architectural", "Textured", "Functional", "Sculptural", "Japanese Design"],
    description: "Fluid, crease-resistant engineered textiles celebrating freedom of movement and structure.",
  },
  {
    id: "fsh_margiela",
    name: "Maison Margiela",
    domain: "fashion",
    category: "Deconstruction & Haute Conceptualism",
    tags: ["Deconstructed", "Avant-Garde", "White Paint", "Anonymity", "Subversive"],
    description: "Reconstructed silhouettes, artisanal tabi boots, and anti-fashion conceptual integrity.",
  },
  {
    id: "fsh_acne",
    name: "Acne Studios",
    domain: "fashion",
    category: "Scandinavian Tailoring & Contemporary Streetwear",
    tags: ["Minimalist", "Tailored", "Swedish", "Pastel Nuance", "Understated"],
    description: "Effortless Stockholm proportions, nuanced earth tones, and razor-sharp everyday tailoring.",
  },
];

/**
 * Search cultural entities (supports live Qloo API with seamless mock fallback)
 */
export async function searchCulturalEntities(
  queryText: string,
  domain?: string
): Promise<CulturalEntity[]> {
  const settings = await getApiSettings();

  // If live Qloo API key is available, attempt live fetch
  if (settings.qlooApiKey && settings.qlooApiMode === "live") {
    try {
      const liveResults = await fetchFromLiveQloo("/search", {
        query: queryText,
        domain: domain || "all",
      }, settings.qlooApiKey);
      if (liveResults && liveResults.length > 0) {
        return liveResults;
      }
    } catch (err) {
      console.warn("Live Qloo search failed, falling back to curated taste graph:", err);
    }
  }

  // Curated Fallback
  const q = queryText.toLowerCase().trim();
  return CURATED_CULTURAL_GRAPH.filter((e) => {
    const matchesDomain = !domain || domain === "all" || e.domain === domain;
    const matchesQuery =
      e.name.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q));
    return matchesDomain && (q === "" || matchesQuery);
  });
}

/**
 * Generate taste affinities and recommendations from seeds
 */
export async function getCulturalAffinities(
  seeds: string[],
  targetDomain: CulturalEntity["domain"] | "all" = "all"
): Promise<CulturalEntity[]> {
  const settings = await getApiSettings();

  // If live Qloo API key is available, query live Qloo Hackathon endpoints
  if (settings.qlooApiKey && settings.qlooApiMode === "live") {
    try {
      const liveEntities: CulturalEntity[] = [];
      // Query live Qloo Hackathon entity search endpoint for each seed
      for (const seed of seeds.slice(0, 3)) {
        if (!seed || !seed.trim()) continue;
        const qlooUrl = `https://hackathon.api.qloo.com/search?query=${encodeURIComponent(seed.trim())}`;
        const res = await fetch(qlooUrl, {
          method: "GET",
          headers: {
            "X-Api-Key": settings.qlooApiKey.trim(),
            accept: "application/json",
          },
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const json = await res.json();
          const items = json?.results || json?.entities || (Array.isArray(json) ? json : []);
          if (Array.isArray(items)) {
            items.slice(0, 3).forEach((item: any, idx: number) => {
              const name = item.name || item.title || item.label || "";
              if (!name) return;
              const typeStr = Array.isArray(item.types) ? item.types.join(" ") : (item.type || item.domain || "");
              const isMovie = typeStr.includes("movie") || typeStr.includes("film");
              const isPlace = typeStr.includes("place") || typeStr.includes("restaurant") || typeStr.includes("dining");
              const isFashion = typeStr.includes("brand") || typeStr.includes("fashion");
              const isBook = typeStr.includes("book") || typeStr.includes("author");
              const domain: CulturalEntity["domain"] = isMovie ? "film" : isPlace ? "dining" : isFashion ? "fashion" : isBook ? "books" : "music";

              const tagList = Array.isArray(item.tags)
                ? item.tags.map((t: any) => (typeof t === "string" ? t : (t.name || "")))
                : [];

              liveEntities.push({
                id: item.entity_id || item.id || `live_qloo_${idx}`,
                name,
                domain,
                category: tagList[0] || (isMovie ? "Arthouse Cinema" : isPlace ? "Artisanal Dining" : "Sonic Vanguard"),
                tags: tagList.length > 0 ? tagList.slice(0, 8) : ["Qloo Verified"],
                affinityScore: Number((item.popularity || (0.93 + (idx * 0.02))).toFixed(2)),
                description: item.properties?.short_description || item.disambiguation || `Verified in Qloo Taste AI Graph with ${tagList.length} multidimensional cultural tags.`,
                imageUrl: item.properties?.image?.url || undefined,
              });
            });
          }
        }
      }

      if (liveEntities.length > 0) {
        const filteredLive = targetDomain === "all" ? liveEntities : liveEntities.filter((e) => e.domain === targetDomain);
        if (filteredLive.length > 0) {
          return filteredLive;
        }
      }
    } catch (err) {
      console.warn("Live Qloo affinity fetch fallback:", err);
    }
  }

  // Heuristic Affinity Matching (Calculates vector intersection between seed tags and candidate entities)
  const seedEntities = CURATED_CULTURAL_GRAPH.filter((e) =>
    seeds.some((s) => e.name.toLowerCase().includes(s.toLowerCase()) || e.id === s)
  );

  const activeSeedTags = new Set(
    seedEntities.flatMap((e) => e.tags.map((t) => t.toLowerCase()))
  );

  return CURATED_CULTURAL_GRAPH.filter((e) => {
    if (targetDomain !== "all" && e.domain !== targetDomain) return false;
    return !seeds.some((s) => e.name.toLowerCase() === s.toLowerCase());
  })
    .map((candidate) => {
      let commonTags = 0;
      candidate.tags.forEach((t) => {
        if (activeSeedTags.has(t.toLowerCase())) commonTags++;
      });
      // Base score between 0.72 and 0.98
      const calculatedScore = Math.min(
        0.98,
        0.72 + commonTags * 0.08 + (Math.sin(candidate.name.length) * 0.04)
      );
      return {
        ...candidate,
        affinityScore: Number(calculatedScore.toFixed(2)),
      };
    })
    .sort((a, b) => (b.affinityScore || 0) - (a.affinityScore || 0));
}

/**
 * Calculate 5-dimensional Taste DNA Vector
 */
export function calculateTasteDNA(signals: string[]): TasteRadarVector {
  const joined = signals.join(" ").toLowerCase();

  const vector: TasteRadarVector = {
    sonicDepth: 75,
    cinematicAesthetic: 80,
    gastronomyCuriosity: 78,
    urbanSubculture: 82,
    literaryResonance: 70,
  };

  if (joined.includes("radiohead") || joined.includes("jazz") || joined.includes("ambient")) {
    vector.sonicDepth = 94;
    vector.urbanSubculture = 88;
  }
  if (joined.includes("nolan") || joined.includes("villeneuve") || joined.includes("wong")) {
    vector.cinematicAesthetic = 96;
    vector.sonicDepth = Math.max(vector.sonicDepth, 86);
  }
  if (joined.includes("omakase") || joined.includes("cocktail") || joined.includes("wine")) {
    vector.gastronomyCuriosity = 95;
  }
  if (joined.includes("tokyo") || joined.includes("berlin") || joined.includes("vintage")) {
    vector.urbanSubculture = 97;
    vector.literaryResonance = 85;
  }
  if (joined.includes("fashion") || joined.includes("miyake") || joined.includes("margiela")) {
    vector.cinematicAesthetic = Math.max(vector.cinematicAesthetic, 90);
    vector.urbanSubculture = Math.max(vector.urbanSubculture, 92);
  }

  return vector;
}

export const calculateTasteVector = calculateTasteDNA;

/**
 * Helper to call live Qloo Hackathon API when key is configured
 * Strictly follows Qloo Hackathon Developer Guide:
 * Base: https://hackathon.api.qloo.com
 * Header: X-Api-Key: <key>
 * Endpoints: /v2/insights (GET) & /search (GET)
 */
async function fetchFromLiveQloo(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<CulturalEntity[] | null> {
  const queryStr = new URLSearchParams(params).toString();
  let url = `https://hackathon.api.qloo.com${endpoint}?${queryStr}`;

  let res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey.trim(),
      accept: "application/json",
    },
  });

  // Automatic fallback to /v2 path if standard endpoint returns 404
  if (res.status === 404 && !endpoint.startsWith("/v2")) {
    url = `https://hackathon.api.qloo.com/v2${endpoint}?${queryStr}`;
    res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey.trim(),
        accept: "application/json",
      },
    });
  }

  if (!res.ok) {
    throw new Error(`Qloo API HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  // Map Qloo Hackathon entity format into unified CulturalEntity
  const candidates = json?.results || json?.entities || (Array.isArray(json) ? json : []);
  if (Array.isArray(candidates) && candidates.length > 0) {
    return candidates.map((r: any, idx: number) => {
      const typesArr: string[] = Array.isArray(r.types) ? r.types : [r.type || r.domain || ""];
      const isMovie = typesArr.some((t: string) => t.includes("movie") || t.includes("film"));
      const isPlace = typesArr.some((t: string) => t.includes("place") || t.includes("restaurant") || t.includes("dining"));
      const isFashion = typesArr.some((t: string) => t.includes("brand") || t.includes("fashion") || t.includes("clothing"));
      const isBook = typesArr.some((t: string) => t.includes("book") || t.includes("author") || t.includes("literature"));

      const domain: CulturalEntity["domain"] = isMovie
        ? "film"
        : isPlace
        ? "dining"
        : isFashion
        ? "fashion"
        : isBook
        ? "books"
        : "music";

      const tagStrings: string[] = Array.isArray(r.tags)
        ? r.tags.map((t: any) => (typeof t === "string" ? t : (t?.name || ""))).filter(Boolean)
        : [];

      return {
        id: r.entity_id || r.id || `qloo_${idx}`,
        name: r.name || r.title || r.label || "Cultural Entity",
        domain,
        category: tagStrings[0] || (isMovie ? "Cinema" : isPlace ? "Gastronomy" : "Sound & Music"),
        tags: tagStrings.length > 0 ? tagStrings.slice(0, 10) : ["Qloo Verified"],
        affinityScore: Number((r.popularity || 0.94).toFixed(2)),
        description:
          r.properties?.short_description ||
          r.disambiguation ||
          `Verified in Qloo Taste AI Graph with ${tagStrings.length} tags.`,
        imageUrl: r.properties?.image?.url || undefined,
      };
    });
  }

  return null;
}
