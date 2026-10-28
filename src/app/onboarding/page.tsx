"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { calculateTasteDNA } from "@/lib/qlooService";
import {
  Music,
  Film,
  Utensils,
  Sparkles,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe2,
  Compass,
  Shirt,
  Search,
  Lock,
  Flame,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Layers,
  Plus,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { SelectedLocation } from "@/components/InteractiveCulturalMap";

const InteractiveCulturalMap = dynamic(
  () => import("@/components/InteractiveCulturalMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] rounded-3xl bg-[#040409] border border-white/10 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyan-400">Loading Global Cultural Map Canvas...</span>
      </div>
    ),
  }
);

// World Countries with Major Cultural Metropolises & Flags
interface CountryData {
  name: string;
  code: string;
  flag: string;
  region: "Asia" | "Europe" | "Americas" | "Oceania" | "Middle East & Africa";
  cities: string[];
}

const WORLD_COUNTRIES: CountryData[] = [
  { name: "China", code: "CN", flag: "🇨🇳", region: "Asia", cities: ["Sichuan (Chengdu)", "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Hangzhou"] },
  { name: "Japan", code: "JP", flag: "🇯🇵", region: "Asia", cities: ["Tokyo", "Kyoto", "Osaka", "Sapporo", "Fukuoka"] },
  { name: "United States", code: "US", flag: "🇺🇸", region: "Americas", cities: ["New York", "Los Angeles", "Chicago", "San Francisco", "Austin", "Miami", "Seattle"] },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", region: "Europe", cities: ["London", "Manchester", "Edinburgh", "Bristol", "Glasgow"] },
  { name: "France", code: "FR", flag: "🇫🇷", region: "Europe", cities: ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice"] },
  { name: "Germany", code: "DE", flag: "🇩🇪", region: "Europe", cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"] },
  { name: "Italy", code: "IT", flag: "🇮🇹", region: "Europe", cities: ["Milan", "Rome", "Florence", "Venice", "Naples"] },
  { name: "South Korea", code: "KR", flag: "🇰🇷", region: "Asia", cities: ["Seoul", "Busan", "Incheon", "Daegu"] },
  { name: "Canada", code: "CA", flag: "🇨🇦", region: "Americas", cities: ["Toronto", "Montreal", "Vancouver", "Quebec City"] },
  { name: "Australia", code: "AU", flag: "🇦🇺", region: "Oceania", cities: ["Melbourne", "Sydney", "Brisbane", "Perth"] },
  { name: "Singapore", code: "SG", flag: "🇸🇬", region: "Asia", cities: ["Singapore City"] },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", region: "Middle East & Africa", cities: ["Dubai", "Abu Dhabi"] },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰", region: "Asia", cities: ["Colombo", "Kandy", "Galle", "Negombo"] },
  { name: "India", code: "IN", flag: "🇮🇳", region: "Asia", cities: ["Mumbai", "Bengaluru", "New Delhi", "Goa", "Kolkata"] },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", region: "Europe", cities: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague"] },
  { name: "Spain", code: "ES", flag: "🇪🇸", region: "Europe", cities: ["Barcelona", "Madrid", "Valencia", "Seville", "Bilbao"] },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", region: "Europe", cities: ["Zurich", "Geneva", "Basel", "Lausanne"] },
  { name: "Sweden", code: "SE", flag: "🇸🇪", region: "Europe", cities: ["Stockholm", "Gothenburg", "Malmo"] },
  { name: "Denmark", code: "DK", flag: "🇩🇰", region: "Europe", cities: ["Copenhagen", "Aarhus"] },
  { name: "Brazil", code: "BR", flag: "🇧🇷", region: "Americas", cities: ["São Paulo", "Rio de Janeiro", "Brasília"] },
  { name: "Mexico", code: "MX", flag: "🇲🇽", region: "Americas", cities: ["Mexico City", "Guadalajara", "Oaxaca", "Monterrey"] },
  { name: "Thailand", code: "TH", flag: "🇹🇭", region: "Asia", cities: ["Bangkok", "Chiang Mai", "Phuket"] },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", region: "Asia", cities: ["Bali/Ubud", "Jakarta", "Yogyakarta"] },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", region: "Middle East & Africa", cities: ["Cape Town", "Johannesburg", "Durban"] },
  { name: "Norway", code: "NO", flag: "🇳🇴", region: "Europe", cities: ["Oslo", "Bergen", "Trondheim"] },
  { name: "Austria", code: "AT", flag: "🇦🇹", region: "Europe", cities: ["Vienna", "Salzburg", "Innsbruck"] },
  { name: "Portugal", code: "PT", flag: "🇵🇹", region: "Europe", cities: ["Lisbon", "Porto", "Faro"] },
  { name: "Greece", code: "GR", flag: "🇬🇷", region: "Europe", cities: ["Athens", "Thessaloniki", "Santorini"] },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", region: "Oceania", cities: ["Auckland", "Wellington", "Christchurch"] },
  { name: "Ireland", code: "IE", flag: "🇮🇪", region: "Europe", cities: ["Dublin", "Galway", "Cork"] },
];

function FlagBadge({
  code,
  alt = "",
  className = "w-5 h-3.5 rounded-[3px] shrink-0 border border-white/20 shadow-sm bg-black/40",
}: {
  code?: string;
  alt?: string;
  className?: string;
}) {
  if (!code || code === "XX") {
    return <span className="text-xs">🌐</span>;
  }
  return (
    <span className={`overflow-hidden inline-flex items-center justify-center ${className}`}>
      <img
        src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
        alt={alt || code}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLElement).style.display = "none";
        }}
      />
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, updateTaste, loading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Selected state
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string[]>([]);
  const [selectedDining, setSelectedDining] = useState<string[]>([]);
  const [selectedFashion, setSelectedFashion] = useState<string[]>([]);
  
  // Country & City state (Step 5 - Mandatory)
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(WORLD_COUNTRIES[0]);
  const [selectedCity, setSelectedCity] = useState("Tokyo");
  const [customCityInput, setCustomCityInput] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [mapLocation, setMapLocation] = useState<SelectedLocation>({
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    lat: 35.6762,
    lng: 139.6503,
  });
  const [validationError, setValidationError] = useState("");
  const [saving, setSaving] = useState(false);

  // Step-specific Search and Genre Filter Tabs State
  const [musicSearch, setMusicSearch] = useState("");
  const [musicCategory, setMusicCategory] = useState("All");
  const [customMusicInput, setCustomMusicInput] = useState("");

  const [cinemaSearch, setCinemaSearch] = useState("");
  const [cinemaCategory, setCinemaCategory] = useState("All");
  const [customCinemaInput, setCustomCinemaInput] = useState("");

  const [diningSearch, setDiningSearch] = useState("");
  const [diningCategory, setDiningCategory] = useState("All");
  const [customDiningInput, setCustomDiningInput] = useState("");

  const [fashionSearch, setFashionSearch] = useState("");
  const [fashionCategory, setFashionCategory] = useState("All");
  const [customFashionInput, setCustomFashionInput] = useState("");

  // Comprehensive Curated Music Spectrum (Pop, Electronic, Rock, Hip-Hop, Classical & Jazz)
  const MUSIC_OPTIONS = [
    // Pop & Global
    {
      id: "Taylor Swift",
      category: "Pop & Global",
      genre: "Synth-Pop / Narrative Lyricism",
      vibe: "Introspective bridges, anthemic hooks & emotional storytelling",
      pill: "Global Icon",
    },
    {
      id: "The Weeknd",
      category: "Pop & Global",
      genre: "Dark R&B / Cinematic Synthwave",
      vibe: "Nocturnal hedonism, retro 80s analog synths & soaring falsettos",
      pill: "Nocturnal Pop",
    },
    {
      id: "Billie Eilish",
      category: "Pop & Global",
      genre: "Alt-Pop / Bass Minimalism",
      vibe: "Whispered vocals, subversive sub-bass & cinematic melancholia",
      pill: "Alt-Pop",
    },
    {
      id: "Bad Bunny",
      category: "Pop & Global",
      genre: "Latin Urban / Modern Trap",
      vibe: "Vibrant Caribbean rhythms, infectious cadence & boundary-pushing flow",
      pill: "Latin Icon",
    },
    // Electronic & Ambient
    {
      id: "Daft Punk",
      category: "Electronic",
      genre: "French House / Cyberpunk",
      vibe: "Retro-Futuristic Grooves & Vocoder Funk",
      pill: "Cyberpunk",
    },
    {
      id: "Aphex Twin",
      category: "Electronic",
      genre: "IDM / Ambient Techno",
      vibe: "Braindance, Glitch & Subversive Frequencies",
      pill: "IDM Glitch",
    },
    {
      id: "Fred again..",
      category: "Electronic",
      genre: "Future Garage / Emotive House",
      vibe: "Intimate voice samples, euphoric drops & club catharsis",
      pill: "Club Euphoria",
    },
    {
      id: "Tycho",
      category: "Electronic",
      genre: "Ambient Post-Rock / Chillwave",
      vibe: "Sun-drenched analog synths, sunset horizons & clean design",
      pill: "Ambient Wave",
    },
    // Rock & Alternative
    {
      id: "Radiohead",
      category: "Rock & Alternative",
      genre: "Experimental Art Rock",
      vibe: "Melancholic, Dystopian & Orchestral",
      pill: "Art Rock",
    },
    {
      id: "Arctic Monkeys",
      category: "Rock & Alternative",
      genre: "Indie Rock / Post-Punk Lounge",
      vibe: "Razor-sharp witty lyricism, smoky guitars & vintage swagger",
      pill: "Indie Rock",
    },
    {
      id: "Queen",
      category: "Rock & Alternative",
      genre: "Operatic Glam Rock / Arena Anthems",
      vibe: "Theatrical vocal harmonies, soaring guitar solos & timeless stadium energy",
      pill: "Glam Rock",
    },
    {
      id: "Tame Impala",
      category: "Rock & Alternative",
      genre: "Psychedelic Pop",
      vibe: "Hypnotic Dreamscapes & Analog Phasers",
      pill: "Psych Pop",
    },
    // Hip-Hop & R&B
    {
      id: "Kendrick Lamar",
      category: "Hip-Hop & R&B",
      genre: "Conscious Hip-Hop",
      vibe: "Complex Lyrical Narrative & Jazz Fusion",
      pill: "Conscious Rap",
    },
    {
      id: "Drake",
      category: "Hip-Hop & R&B",
      genre: "Nocturnal Melodic Trap / R&B",
      vibe: "Late-night Toronto introspection, atmospheric 808s & ambient chords",
      pill: "Melodic Trap",
    },
    {
      id: "Frank Ocean",
      category: "Hip-Hop & R&B",
      genre: "Avant-Garde R&B / Neo-Soul",
      vibe: "Raw vulnerability, unconventional structures & nostalgic warmth",
      pill: "Neo-Soul",
    },
    {
      id: "Massive Attack",
      category: "Hip-Hop & R&B",
      genre: "Trip Hop / Bristol",
      vibe: "Dark Cinematic Bass & Heavy Shadows",
      pill: "Trip Hop",
    },
    // Jazz & Classical
    {
      id: "Miles Davis",
      category: "Jazz & Classical",
      genre: "Modal Cool Jazz",
      vibe: "Nocturnal, Smoky & Atmospheric",
      pill: "Modal Jazz",
    },
    {
      id: "Hans Zimmer",
      category: "Jazz & Classical",
      genre: "Monumental Film Score / Neoclassical",
      vibe: "Thunderous brass, ticking clocks, sheer emotional scale & epic brass",
      pill: "Epic Score",
    },
    {
      id: "FKJ",
      category: "Jazz & Classical",
      genre: "Neo-Soul / Nu-Jazz",
      vibe: "Warm Organic Multi-Instrumental",
      pill: "Multi-Instrument",
    },
    {
      id: "Ludovico Einaudi",
      category: "Jazz & Classical",
      genre: "Minimalist Neoclassical Piano",
      vibe: "Poetic piano arpeggios, gentle strings & meditative stillness",
      pill: "Neoclassical",
    },
  ];

  // Comprehensive Cinema Visionaries (Sci-Fi, Noir, Anime, Cult & Blockbusters)
  const CINEMA_OPTIONS = [
    // Sci-Fi & Monumental
    {
      id: "Christopher Nolan",
      category: "Sci-Fi & Monumental",
      genre: "Mind-Bending Sci-Fi",
      notable: "Inception, Oppenheimer, Interstellar",
      tag: "Non-Linear Time",
    },
    {
      id: "Denis Villeneuve",
      category: "Sci-Fi & Monumental",
      genre: "Epic Monumentalism",
      notable: "Dune: Part Two, Blade Runner 2049, Arrival",
      tag: "Brutalist Sci-Fi",
    },
    {
      id: "Stanley Kubrick",
      category: "Sci-Fi & Monumental",
      genre: "Philosophical Symmetrical Sci-Fi",
      notable: "2001: A Space Odyssey, The Shining, Clockwork Orange",
      tag: "Cosmic Symmetry",
    },
    // Noir & Thriller
    {
      id: "David Fincher",
      category: "Noir & Thriller",
      genre: "Clinical Precision Noir",
      notable: "Fight Club, Zodiac, Seven, Mindhunter",
      tag: "Desaturated Green",
    },
    {
      id: "Martin Scorsese",
      category: "Noir & Thriller",
      genre: "Gritty Crime & Urban Psychology",
      notable: "Taxi Driver, Goodfellas, The Wolf of Wall Street",
      tag: "Kinetic Energy",
    },
    {
      id: "Bong Joon-ho",
      category: "Noir & Thriller",
      genre: "Subversive Social Thriller",
      notable: "Parasite, Memories of Murder, Snowpiercer",
      tag: "Class Friction",
    },
    // Poetry & Anime
    {
      id: "Wong Kar-wai",
      category: "Poetry & Anime",
      genre: "Neon Melancholy",
      notable: "In the Mood for Love, Chungking Express, Fallen Angels",
      tag: "Step-Printed Neon",
    },
    {
      id: "Hayao Miyazaki",
      category: "Poetry & Anime",
      genre: "Mythic Nostalgia & Shinto Wonder",
      notable: "Spirited Away, Princess Mononoke, The Boy and the Heron",
      tag: "Hand-Drawn Wonder",
    },
    {
      id: "Wes Anderson",
      category: "Poetry & Anime",
      genre: "Symmetrical Whimsy & Diorama",
      notable: "The Grand Budapest Hotel, Moonrise Kingdom, Asteroid City",
      tag: "Pastel Dioramas",
    },
    // Cult & Auteur
    {
      id: "Quentin Tarantino",
      category: "Cult & Auteur",
      genre: "Stylized Cult Cinema & Pulp Dialogue",
      notable: "Pulp Fiction, Kill Bill, Inglourious Basterds",
      tag: "Hyper-Dialogue",
    },
    {
      id: "Greta Gerwig",
      category: "Cult & Auteur",
      genre: "Vibrant Modern Cultural Empathy",
      notable: "Barbie, Little Women, Lady Bird",
      tag: "Luminous Wit",
    },
    {
      id: "Guillermo del Toro",
      category: "Cult & Auteur",
      genre: "Gothic Dark Fantasy & Macabre",
      notable: "Pan's Labyrinth, The Shape of Water, Pinocchio",
      tag: "Gothic Alchemy",
    },
  ];

  // Comprehensive Dining & Mixology (Speakeasies, Street Food, Omakase, Wine, Pizza, Craft Beer)
  const DINING_OPTIONS = [
    // Cocktails & Nightlife
    {
      id: "Speakeasy Cocktails",
      category: "Cocktails & Nightlife",
      type: "Hidden Den",
      desc: "Hidden subterranean cocktail dens & rare spirits behind unmarked doors",
      pill: "Subterranean",
    },
    {
      id: "Rooftop Botanical Lounge",
      category: "Cocktails & Nightlife",
      type: "Skyline Lounge",
      desc: "Skyline panoramas paired with botanical mezcal infusions & ambient house",
      pill: "Skyline Horizon",
    },
    {
      id: "Natural Wine Bars",
      category: "Cocktails & Nightlife",
      type: "Wine Bar",
      desc: "Low-intervention biodynamic pet-nats, orange wines & artisanal small plates",
      pill: "Biodynamic",
    },
    // Fine Dining & Omakase
    {
      id: "Omakase Counter",
      category: "Fine Dining & Omakase",
      type: "Japanese Craft",
      desc: "Minimalist multi-course seasonal Japanese sushi served by master itamae",
      pill: "Master Craft",
    },
    {
      id: "French Neo-Bistro",
      category: "Fine Dining & Omakase",
      type: "Bistronomy",
      desc: "Inventive hyper-seasonal French culinary art in an unpretentious industrial space",
      pill: "Michelin Craft",
    },
    {
      id: "Plant-Based Fine Dining",
      category: "Fine Dining & Omakase",
      type: "Botanical",
      desc: "Zero-waste culinary innovation, heirloom vegetables & wild-foraged mushrooms",
      pill: "Zero Waste",
    },
    // Street Food & Craft
    {
      id: "Street Food Night Markets",
      category: "Street Food & Craft",
      type: "Night Market",
      desc: "Open-air sizzling skewers, wok hei smoke & vibrant late-night communal energy",
      pill: "Night Market",
    },
    {
      id: "Underground Ramen",
      category: "Street Food & Craft",
      type: "Alleyway Noodle",
      desc: "Intense 18-hour broths tucked away in narrow train railway alleyways",
      pill: "Alleyway Craft",
    },
    {
      id: "Craft Beer Microbrewery",
      category: "Street Food & Craft",
      type: "Taproom",
      desc: "Experimental hazy IPAs, imperial stouts & lively industrial warehouse taprooms",
      pill: "Microbrewery",
    },
    // Café & Casual
    {
      id: "Artisan Third-Wave Coffee",
      category: "Café & Casual",
      type: "Single Origin",
      desc: "Single-origin pour-overs, brutalist concrete interiors & minimalist acoustics",
      pill: "Single Origin",
    },
    {
      id: "Authentic Neapolitan Pizza",
      category: "Café & Casual",
      type: "Wood-Fired",
      desc: "Blistered sourdough crusts, San Marzano tomatoes & melting buffalo mozzarella",
      pill: "Wood-Fired",
    },
    {
      id: "Tapas & Mezze Social",
      category: "Café & Casual",
      type: "Social Sharing",
      desc: "Sunlit Mediterranean sharing boards, Andalusian jamón, olives & crusty bread",
      pill: "Social Table",
    },
  ];

  // Comprehensive Form, Fashion & Architecture
  const FASHION_OPTIONS = [
    // Luxury & Tailoring
    {
      id: "Quiet Luxury & Old Money",
      category: "Luxury & Tailoring",
      archetype: "Understated Prestige",
      desc: "Unbranded cashmere, bespoke Savile Row tailoring, Loro Piana & understated palette",
      pill: "Quiet Luxury",
    },
    {
      id: "Scandinavian Minimalism",
      category: "Luxury & Tailoring",
      archetype: "Nordic Proportion",
      desc: "Effortless Stockholm tailoring, nuanced earth tones & functional minimalist lines",
      pill: "Stockholm Clean",
    },
    // Avant-Garde & Tech
    {
      id: "Issey Miyake Pleats",
      category: "Avant-Garde & Tech",
      archetype: "Textile Engineering",
      desc: "Architectural heat-pressed pleats celebrating dynamic motion & kinetic form",
      pill: "Kinetic Fold",
    },
    {
      id: "Maison Margiela",
      category: "Avant-Garde & Tech",
      archetype: "Deconstructivism",
      desc: "Deconstructed silhouettes, white-painted surfaces & subversive anti-fashion",
      pill: "Deconstructed",
    },
    {
      id: "Cyberpunk Techwear",
      category: "Avant-Garde & Tech",
      archetype: "Modular Utility",
      desc: "Acronym spec, high-tenacity Cordura, fidlock buckles & weatherproof urban shielding",
      pill: "Cyber Techwear",
    },
    // Streetwear & Retro
    {
      id: "90s Vintage Archive",
      category: "Streetwear & Retro",
      archetype: "Curated Retro",
      desc: "Faded heavyweight Japanese selvedge denim, archive band tees & distressed leather",
      pill: "Japanese Selvedge",
    },
    {
      id: "Streetwear & Sneakerhead",
      category: "Streetwear & Retro",
      archetype: "Urban Hype",
      desc: "Heavyweight boxy hoodies, limited archive sneaker silhouettes, Stüssy & Supreme",
      pill: "Hype Archive",
    },
    // Architectural Spaces
    {
      id: "Brutalist Architecture",
      category: "Architectural Spaces",
      archetype: "Monolithic Spatial",
      desc: "Exposed raw concrete, sharp geometric shadows & monolithic functional purity",
      pill: "Raw Concrete",
    },
    {
      id: "Mid-Century Modern",
      category: "Architectural Spaces",
      archetype: "Organic Modernism",
      desc: "Warm teak timber, post-and-beam glass pavilions & timeless Eames ergonomics",
      pill: "Organic Teak",
    },
    {
      id: "Biophilic Spatial Architecture",
      category: "Architectural Spaces",
      archetype: "Living Space",
      desc: "Cascading indoor greenery, living moss walls, natural stone & filtered sunlight",
      pill: "Living Biophilia",
    },
  ];

  // Memoized Filtered Lists for Each Step
  const filteredMusic = useMemo(() => {
    return MUSIC_OPTIONS.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(musicSearch.toLowerCase()) ||
        item.genre.toLowerCase().includes(musicSearch.toLowerCase()) ||
        item.vibe.toLowerCase().includes(musicSearch.toLowerCase());
      const matchCat = musicCategory === "All" || item.category === musicCategory;
      return matchSearch && matchCat;
    });
  }, [musicSearch, musicCategory]);

  const filteredCinema = useMemo(() => {
    return CINEMA_OPTIONS.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        item.genre.toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        item.notable.toLowerCase().includes(cinemaSearch.toLowerCase());
      const matchCat = cinemaCategory === "All" || item.category === cinemaCategory;
      return matchSearch && matchCat;
    });
  }, [cinemaSearch, cinemaCategory]);

  const filteredDining = useMemo(() => {
    return DINING_OPTIONS.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(diningSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(diningSearch.toLowerCase()) ||
        item.type.toLowerCase().includes(diningSearch.toLowerCase());
      const matchCat = diningCategory === "All" || item.category === diningCategory;
      return matchSearch && matchCat;
    });
  }, [diningSearch, diningCategory]);

  const filteredFashion = useMemo(() => {
    return FASHION_OPTIONS.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(fashionSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(fashionSearch.toLowerCase()) ||
        item.archetype.toLowerCase().includes(fashionSearch.toLowerCase());
      const matchCat = fashionCategory === "All" || item.category === fashionCategory;
      return matchSearch && matchCat;
    });
  }, [fashionSearch, fashionCategory]);

  // Custom Input Handlers
  const handleAddCustom = (
    val: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: (v: string) => void
  ) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setValidationError("");
    if (!list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput("");
  };

  const handleRemoveCustom = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((x) => x !== item));
  };

  // Filtered Countries by Search and Region
  const filteredCountries = useMemo(() => {
    return WORLD_COUNTRIES.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.cities.some((city) => city.toLowerCase().includes(countrySearch.toLowerCase()));
      const matchesRegion = selectedRegion === "All" || c.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [countrySearch, selectedRegion]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    setValidationError("");
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      if (list.length < 5) {
        setList([...list, item]);
      }
    }
  };

  const handleNextStep = () => {
    setValidationError("");
    // Step validation
    if (currentStep === 1 && selectedMusic.length === 0) {
      setValidationError("Please select at least 1 music artist to calculate your sonic affinity (or skip).");
      return;
    }
    if (currentStep === 2 && selectedCinema.length === 0) {
      setValidationError("Please select at least 1 cinematic auteur (or skip).");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleMapLocationSelect = (loc: SelectedLocation) => {
    setMapLocation(loc);
    setSelectedCity(loc.city);
    const matched = WORLD_COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === loc.country.toLowerCase() ||
        c.code.toLowerCase() === loc.countryCode.toLowerCase()
    );
    if (matched) {
      setSelectedCountry(matched);
    } else {
      setSelectedCountry({
        name: loc.country,
        code: loc.countryCode,
        flag: loc.flag,
        region: "Asia",
        cities: [loc.city],
      });
    }
  };

  const handleFinishOnboarding = async () => {
    setValidationError("");
    
    // Step 5 Country & City validation: STRICTLY MANDATORY!
    const activeCity =
      viewMode === "map"
        ? `${mapLocation.city}, ${mapLocation.country}`
        : `${customCityInput.trim() || selectedCity}, ${selectedCountry.name}`;

    if (!activeCity.trim()) {
      setValidationError("Location is Mandatory! Please select your Country and City to anchor your cultural map.");
      return;
    }

    setSaving(true);
    try {
      const allSignals = [...selectedMusic, ...selectedCinema, ...selectedDining, ...selectedFashion];
      const radar = calculateTasteDNA(allSignals.length > 0 ? allSignals : ["Radiohead", "Christopher Nolan"]);

      const trulyCompleted: string[] = [];
      if (selectedMusic.length > 0) trulyCompleted.push("music");
      if (selectedCinema.length > 0) trulyCompleted.push("cinema");
      if (selectedDining.length > 0) trulyCompleted.push("dining");
      if (selectedFashion.length > 0) trulyCompleted.push("fashion");
      if (activeCity.trim().length > 0) trulyCompleted.push("country-city");

      await updateTaste({
        music: selectedMusic,
        cinema: selectedCinema,
        dining: selectedDining,
        fashion: selectedFashion,
        city: activeCity,
        aestheticKeywords: allSignals,
        radarVectors: radar,
        onboarded: true,
        completedSteps: trulyCompleted,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040409] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#040409] text-white flex flex-col justify-between px-3 sm:px-8 py-3 sm:py-6 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ======================================================== */}
      {/* LUXURY NOCTURNAL CYBER CITY & TASTE GRAPH ANIMATED BACKGROUND */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. Bespoke AI Generated Taste DNA Constellation & Neural Cultural Wallpaper */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns transition-all duration-1000 scale-105"
          style={{
            backgroundImage: "url('/onboarding_taste_bg.jpg')",
            opacity: 0.52,
            filter: "contrast(115%) saturate(130%) brightness(95%)",
          }}
        />

        {/* 2. Cyberpunk Grid & Matrix Scanlines */}
        <div className="absolute inset-0 cyber-grid-overlay opacity-20" />

        {/* 3. Non-Destructive Ambient Radial Vignette so City Lights Stay Visible Everywhere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(4,4,9,0.35)_0%,rgba(4,4,9,0.78)_75%,rgba(4,4,9,0.95)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040409]/65 via-transparent to-[#040409]/85" />

        {/* 4. Animated Glowing Ethereal Aurora Orbs */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-transparent rounded-full blur-[160px] animate-aurora" />
        <div className="absolute -bottom-32 -right-32 w-[750px] h-[750px] bg-gradient-to-tl from-purple-600/25 via-pink-600/15 to-transparent rounded-full blur-[170px] animate-aurora [animation-delay:5s]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-500/15 rounded-full blur-[180px] pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-3.5 sm:pb-6 border-b border-white/10 relative z-20 gap-3">
        {/* Left: Brand & Stage Identifier */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="relative">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 p-0.5 sm:p-1 flex items-center justify-center shadow-lg shadow-cyan-500/25 overflow-hidden backdrop-blur-xl">
              <img
                src="/culturai_logo.png"
                alt="CulturAI Logo"
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#040409] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1">
                Taste DNA Profiling
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold shrink-0">
                Stage {currentStep} of {totalSteps}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-gray-400 hidden sm:block">
              {currentStep === 5 ? "Anchor Metropolis (Mandatory for Graph Context)" : "Synthesizing Cross-Domain Affinity Graph with Qloo Taste AI™"}
            </p>
          </div>
        </div>

        {/* Right: Official Qloo Badge + Step Progress Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Official Qloo Vector Badge */}
          <div className="hidden xs:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#070913]/90 border border-cyan-500/30 shadow-md backdrop-blur-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <img src="/qloo_logo.svg" alt="Qloo" className="h-2.5 sm:h-3 w-auto object-contain" />
          </div>

          {/* Segmented Step Progress Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {["Sonic", "Cinema", "Dining", "Form", "Anchor"].map((label, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === idx + 1
                      ? "w-6 sm:w-10 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/40"
                      : currentStep > idx + 1
                      ? "w-3 sm:w-5 bg-cyan-500"
                      : "w-2.5 sm:w-3.5 bg-white/10"
                  }`}
                />
                <span className={`text-[8px] sm:text-[9px] font-mono hidden md:inline ${currentStep === idx + 1 ? "text-cyan-300 font-bold" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Interactive Stage Body */}
      <div className="max-w-5xl mx-auto w-full flex-1 py-3 sm:py-6 pb-28 sm:pb-16 relative z-20">
        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 sm:gap-3 text-xs text-amber-200 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: MUSIC AFFINITIES */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <section className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-mono mb-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Acoustic Spectrum (Select 1 to 5)</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Which artists define your sonic universe?
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Qloo maps harmonic cadence, underground subgenres, and lyrical density to unlock paired nightlife and architectural spaces.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-cyan-500/15 px-3 py-1.5 rounded-full border border-cyan-500/30 self-start sm:self-auto shrink-0 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Selected: {selectedMusic.length} / 5</span>
              </div>
            </div>

            {/* Active Selected Signals Pill List */}
            {selectedMusic.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl animate-in fade-in">
                <span className="text-[10px] sm:text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Sonic DNA ({selectedMusic.length}):</span>
                </span>
                {selectedMusic.map((artist) => (
                  <span
                    key={artist}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-medium shadow-sm backdrop-blur-md"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-none">{artist}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(artist, selectedMusic, setSelectedMusic)}
                      className="w-4 h-4 rounded-full hover:bg-cyan-400/40 flex items-center justify-center transition-colors cursor-pointer text-cyan-300 hover:text-white"
                      title={`Remove ${artist}`}
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Universal Search & Custom Vector Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={musicSearch}
                onChange={(e) => setMusicSearch(e.target.value)}
                placeholder="Search 18+ artists or type any artist in the world (e.g. Hans Zimmer, Aphex Twin)..."
                className="w-full bg-[#0a0d1d]/85 border border-white/15 focus:border-cyan-400 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 backdrop-blur-xl transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(musicSearch, selectedMusic, setSelectedMusic, setMusicSearch);
                  }
                }}
              />
              {musicSearch.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddCustom(musicSearch, selectedMusic, setSelectedMusic, setMusicSearch)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Add Vector</span>
                </button>
              )}
            </div>

            {/* Category / Genre Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Pop & Global", "Electronic", "Rock & Alternative", "Hip-Hop & R&B", "Jazz & Classical"].map((cat) => {
                const active = musicCategory === cat;
                const count = cat === "All" ? MUSIC_OPTIONS.length : MUSIC_OPTIONS.filter((m) => m.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMusicCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/25 border border-cyan-400/40"
                        : "bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? "bg-black/30 text-cyan-200" : "bg-white/10 text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Curated Grid of Artists */}
            {filteredMusic.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {filteredMusic.map((item) => {
                  const active = selectedMusic.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(selectedMusic, setSelectedMusic, item.id)}
                      className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer backdrop-blur-md ${
                        active
                          ? "bg-gradient-to-b from-cyan-950/80 to-[#060d1f]/90 border-cyan-400 shadow-xl shadow-cyan-500/25 scale-[1.02]"
                          : "bg-[#090b16]/65 hover:bg-[#10152a]/75 border-white/10 hover:border-cyan-400/35"
                      }`}
                    >
                      {/* Top Row: Pill Tag & Radio/Checkmark */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] sm:text-[10px] font-mono uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 truncate max-w-[78%]">
                          {item.pill}
                        </span>
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            active
                              ? "bg-cyan-400 border-cyan-400 text-black shadow-md shadow-cyan-400/50"
                              : "border-white/20 group-hover:border-cyan-400/40"
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Middle: Title, Sub, Desc */}
                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.id}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-cyan-400 font-mono mt-0.5 truncate">{item.genre}</p>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mt-1 leading-snug line-clamp-1 sm:line-clamp-2">
                          {item.vibe}
                        </p>
                      </div>

                      {/* Active bottom glow accent */}
                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#090b16]/75 border border-dashed border-cyan-500/30 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Music className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No preset artist matches &ldquo;{musicSearch}&rdquo;</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Qloo Taste AI can vectorize ANY artist in existence. Click below to add &ldquo;{musicSearch}&rdquo; directly to your Taste DNA profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustom(musicSearch, selectedMusic, setSelectedMusic, setMusicSearch)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add &ldquo;{musicSearch}&rdquo; to Taste DNA</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 2: CINEMATIC VISIONS */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <section className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-mono mb-1.5">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cinematography & Philosophy (Select 1 to 5)</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Which cinematic visionaries shape your visual worldview?
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Auteurs dictate visual pacing, architectural symmetry, and emotional tone across experiential environments.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 bg-purple-500/15 px-3 py-1.5 rounded-full border border-purple-500/30 self-start sm:self-auto shrink-0 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Selected: {selectedCinema.length} / 5</span>
              </div>
            </div>

            {/* Active Selected Signals Pill List */}
            {selectedCinema.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-xl animate-in fade-in">
                <span className="text-[10px] sm:text-xs font-mono text-purple-300 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Active Cinematic DNA ({selectedCinema.length}):</span>
                </span>
                {selectedCinema.map((director) => (
                  <span
                    key={director}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-xs font-medium shadow-sm backdrop-blur-md"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-none">{director}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(director, selectedCinema, setSelectedCinema)}
                      className="w-4 h-4 rounded-full hover:bg-purple-400/40 flex items-center justify-center transition-colors cursor-pointer text-purple-300 hover:text-white"
                      title={`Remove ${director}`}
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Universal Search & Custom Vector Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={cinemaSearch}
                onChange={(e) => setCinemaSearch(e.target.value)}
                placeholder="Search 12+ visionaries or type any director in the world (e.g. David Lynch, Greta Gerwig)..."
                className="w-full bg-[#0d091a]/85 border border-white/15 focus:border-purple-400 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-400/50 backdrop-blur-xl transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(cinemaSearch, selectedCinema, setSelectedCinema, setCinemaSearch);
                  }
                }}
              />
              {cinemaSearch.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddCustom(cinemaSearch, selectedCinema, setSelectedCinema, setCinemaSearch)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Add Vector</span>
                </button>
              )}
            </div>

            {/* Category / Genre Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Sci-Fi & Monumental", "Noir & Thriller", "Poetry & Anime", "Cult & Auteur"].map((cat) => {
                const active = cinemaCategory === cat;
                const count = cat === "All" ? CINEMA_OPTIONS.length : CINEMA_OPTIONS.filter((c) => c.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCinemaCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      active
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-md shadow-purple-500/25 border border-purple-400/40"
                        : "bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? "bg-black/30 text-purple-200" : "bg-white/10 text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Curated Grid of Auteurs */}
            {filteredCinema.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {filteredCinema.map((item) => {
                  const active = selectedCinema.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(selectedCinema, setSelectedCinema, item.id)}
                      className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer backdrop-blur-md ${
                        active
                          ? "bg-gradient-to-b from-purple-950/80 to-[#120822]/90 border-purple-400 shadow-xl shadow-purple-500/25 scale-[1.02]"
                          : "bg-[#0b0816]/65 hover:bg-[#16102a]/75 border-white/10 hover:border-purple-400/35"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 truncate max-w-[78%]">
                          {item.tag}
                        </span>
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            active
                              ? "bg-purple-400 border-purple-400 text-black shadow-md shadow-purple-400/50"
                              : "border-white/20 group-hover:border-purple-400/40"
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {item.id}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-purple-400 font-mono mt-0.5 truncate">{item.genre}</p>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mt-1 line-clamp-1 sm:line-clamp-2">
                          <span className="text-gray-500 font-mono">Works:</span> {item.notable}
                        </p>
                      </div>

                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#0b0816]/75 border border-dashed border-purple-500/30 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <Film className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No preset visionary matches &ldquo;{cinemaSearch}&rdquo;</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Qloo Taste AI can vectorize ANY director or cinematic work. Click below to add &ldquo;{cinemaSearch}&rdquo; directly to your Taste DNA profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustom(cinemaSearch, selectedCinema, setSelectedCinema, setCinemaSearch)}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add &ldquo;{cinemaSearch}&rdquo; to Taste DNA</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 3: DINING & NOCTURNAL VIBE */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <section className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-mono mb-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gastronomy & Mixology (Select 1 to 5)</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  What defines your nocturnal culinary atmosphere?
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Choose the dining and beverage environments where you feel most attuned to the city.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/30 self-start sm:self-auto shrink-0 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Selected: {selectedDining.length} / 5</span>
              </div>
            </div>

            {/* Active Selected Signals Pill List */}
            {selectedDining.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-xl animate-in fade-in">
                <span className="text-[10px] sm:text-xs font-mono text-amber-300 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Active Gastronomic DNA ({selectedDining.length}):</span>
                </span>
                {selectedDining.map((dining) => (
                  <span
                    key={dining}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-medium shadow-sm backdrop-blur-md"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-none">{dining}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(dining, selectedDining, setSelectedDining)}
                      className="w-4 h-4 rounded-full hover:bg-amber-400/40 flex items-center justify-center transition-colors cursor-pointer text-amber-300 hover:text-white"
                      title={`Remove ${dining}`}
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Universal Search & Custom Vector Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={diningSearch}
                onChange={(e) => setDiningSearch(e.target.value)}
                placeholder="Search 12+ atmospheres or type any cuisine/cocktail bar (e.g. Molecular Mixology, Omakase)..."
                className="w-full bg-[#130b06]/85 border border-white/15 focus:border-amber-400 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 backdrop-blur-xl transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(diningSearch, selectedDining, setSelectedDining, setDiningSearch);
                  }
                }}
              />
              {diningSearch.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddCustom(diningSearch, selectedDining, setSelectedDining, setDiningSearch)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Add Vector</span>
                </button>
              )}
            </div>

            {/* Category / Atmosphere Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Cocktails & Nightlife", "Fine Dining & Omakase", "Street Food & Craft", "Café & Casual"].map((cat) => {
                const active = diningCategory === cat;
                const count = cat === "All" ? DINING_OPTIONS.length : DINING_OPTIONS.filter((d) => d.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDiningCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      active
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold shadow-md shadow-amber-500/25 border border-amber-400/40"
                        : "bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? "bg-black/25 text-black font-extrabold" : "bg-white/10 text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Curated Grid of Dining Atmospheres */}
            {filteredDining.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {filteredDining.map((item) => {
                  const active = selectedDining.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(selectedDining, setSelectedDining, item.id)}
                      className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer backdrop-blur-md ${
                        active
                          ? "bg-gradient-to-b from-amber-950/80 to-[#1c0f05]/90 border-amber-400 shadow-xl shadow-amber-500/25 scale-[1.02]"
                          : "bg-[#100b08]/65 hover:bg-[#1e150d]/75 border-white/10 hover:border-amber-400/35"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 truncate max-w-[78%]">
                          {item.pill}
                        </span>
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            active
                              ? "bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-400/50"
                              : "border-white/20 group-hover:border-amber-400/40"
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {item.id}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-amber-400 font-mono mt-0.5 truncate">{item.category}</p>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mt-1 leading-snug line-clamp-1 sm:line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#100b08]/75 border border-dashed border-amber-500/30 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No preset culinary atmosphere matches &ldquo;{diningSearch}&rdquo;</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Qloo Taste AI can vectorize ANY culinary concept or venue. Click below to add &ldquo;{diningSearch}&rdquo; directly to your Taste DNA profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustom(diningSearch, selectedDining, setSelectedDining, setDiningSearch)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add &ldquo;{diningSearch}&rdquo; to Taste DNA</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 4: FORM, FASHION & ARCHITECTURE */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <section className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header & Counter */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-mono mb-1.5">
                  <Shirt className="w-3.5 h-3.5 text-rose-400" />
                  <span>Form & Spatial Architecture (Select 1 to 5)</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Which structural design paradigms speak to you?
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Fashion and architecture reveal how you engage with materials, texture, silhouettes, and urban space.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300 bg-rose-500/15 px-3 py-1.5 rounded-full border border-rose-500/30 self-start sm:self-auto shrink-0 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Selected: {selectedFashion.length} / 5</span>
              </div>
            </div>

            {/* Active Selected Signals Pill List */}
            {selectedFashion.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-xl animate-in fade-in">
                <span className="text-[10px] sm:text-xs font-mono text-rose-300 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Active Architectural DNA ({selectedFashion.length}):</span>
                </span>
                {selectedFashion.map((fashion) => (
                  <span
                    key={fashion}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-medium shadow-sm backdrop-blur-md"
                  >
                    <span className="truncate max-w-[150px] sm:max-w-none">{fashion}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustom(fashion, selectedFashion, setSelectedFashion)}
                      className="w-4 h-4 rounded-full hover:bg-rose-400/40 flex items-center justify-center transition-colors cursor-pointer text-rose-300 hover:text-white"
                      title={`Remove ${fashion}`}
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Universal Search & Custom Vector Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fashionSearch}
                onChange={(e) => setFashionSearch(e.target.value)}
                placeholder="Search 10+ paradigms or type any designer/architectural style (e.g. Bauhaus, Zaha Hadid)..."
                className="w-full bg-[#130711]/85 border border-white/15 focus:border-rose-400 rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-400/50 backdrop-blur-xl transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(fashionSearch, selectedFashion, setSelectedFashion, setFashionSearch);
                  }
                }}
              />
              {fashionSearch.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddCustom(fashionSearch, selectedFashion, setSelectedFashion, setFashionSearch)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-rose-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Add Vector</span>
                </button>
              )}
            </div>

            {/* Category / Archetype Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Luxury & Tailoring", "Avant-Garde & Tech", "Streetwear & Retro", "Architectural Spaces"].map((cat) => {
                const active = fashionCategory === cat;
                const count = cat === "All" ? FASHION_OPTIONS.length : FASHION_OPTIONS.filter((f) => f.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFashionCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      active
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-md shadow-rose-500/25 border border-rose-400/40"
                        : "bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? "bg-black/30 text-rose-200" : "bg-white/10 text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Curated Grid of Architectural Archetypes */}
            {filteredFashion.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {filteredFashion.map((item) => {
                  const active = selectedFashion.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(selectedFashion, setSelectedFashion, item.id)}
                      className={`relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer backdrop-blur-md ${
                        active
                          ? "bg-gradient-to-b from-rose-950/80 to-[#1f0a17]/90 border-rose-400 shadow-xl shadow-rose-500/25 scale-[1.02]"
                          : "bg-[#110810]/65 hover:bg-[#200f1e]/75 border-white/10 hover:border-rose-400/35"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 truncate max-w-[78%]">
                          {item.pill}
                        </span>
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            active
                              ? "bg-rose-400 border-rose-400 text-black shadow-md shadow-rose-400/50"
                              : "border-white/20 group-hover:border-rose-400/40"
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                          {item.id}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-rose-400 font-mono mt-0.5 truncate">{item.archetype}</p>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mt-1 leading-snug line-clamp-1 sm:line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      {active && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#110810]/75 border border-dashed border-rose-500/30 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No preset paradigm matches &ldquo;{fashionSearch}&rdquo;</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Qloo Taste AI can vectorize ANY architectural movement or fashion house. Click below to add &ldquo;{fashionSearch}&rdquo; directly to your Taste DNA profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCustom(fashionSearch, selectedFashion, setSelectedFashion, setFashionSearch)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add &ldquo;{fashionSearch}&rdquo; to Taste DNA</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 5: COMPREHENSIVE GLOBAL COUNTRY & CITY (MANDATORY!) */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <section className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Mandatory Header Alert */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-mono mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mandatory Step • Global Urban Anchor</span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Anchor your Cultural Metropolis
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Pin your home city or destination on our interactive global map. CulturAI uses this coordinate to anchor subterranean nightlife, travel itineraries, and acoustic spaces.
                </p>
              </div>

              {/* Current Active Selection Pill with real FlagCDN badge */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent border border-cyan-500/30 flex items-center gap-2.5 sm:gap-3 shrink-0 backdrop-blur-xl">
                <FlagBadge
                  code={viewMode === "map" ? mapLocation.countryCode : selectedCountry.code}
                  className="w-8 h-6 sm:w-10 sm:h-7 rounded-md border border-white/20 shadow-md"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>
                      {viewMode === "map"
                        ? `${mapLocation.city}, ${mapLocation.country}`
                        : `${customCityInput.trim() || selectedCity}, ${selectedCountry.name}`}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Anchor Verified • Qloo Node Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Switcher: Interactive Map vs Directory Grid */}
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === "map"
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Radar Map</span>
                  <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[9px] font-sans">
                    RECOMMENDED
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white/15 text-white border border-white/20 shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Directory</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-gray-500 hidden sm:block">
                {viewMode === "map" ? "Pinpoint accuracy with drag-and-drop" : "Browse 30+ countries"}
              </div>
            </div>

            {/* INTERACTIVE MAP VIEW */}
            {viewMode === "map" && (
              <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
                <InteractiveCulturalMap
                  initialLocation={mapLocation}
                  onLocationSelect={handleMapLocationSelect}
                />

                {/* Selected Coordinate & Qloo Anchor Confirmation Banner */}
                <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-950/40 via-black/80 to-indigo-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <FlagBadge
                      code={mapLocation.countryCode}
                      className="w-10 h-7 sm:w-12 sm:h-9 rounded-lg border border-white/20 shadow-md"
                    />
                    <div>
                      <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <span>{mapLocation.city}</span>
                        <span className="text-cyan-400">•</span>
                        <span className="text-gray-300 font-normal">{mapLocation.country}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono text-cyan-400 flex items-center gap-2 mt-0.5">
                        <span>LAT: {mapLocation.lat.toFixed(4)}°</span>
                        <span className="text-gray-600">|</span>
                        <span>LNG: {mapLocation.lng.toFixed(4)}°</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-emerald-400 font-bold">Node Linked ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-[11px] font-mono text-gray-400 bg-black/50 px-2.5 py-1 rounded-xl border border-white/10 self-start sm:self-auto">
                    🎯 Tap anywhere on map or drag pin
                  </div>
                </div>
              </div>
            )}

            {/* DIRECTORY GRID VIEW */}
            {viewMode === "grid" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Country Search Bar & Region Filters */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search any country or major city (e.g., Japan, London, Sri Lanka, France)..."
                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      {["All", "Asia", "Europe", "Americas", "Oceania", "Middle East & Africa"].map((reg) => (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => setSelectedRegion(reg)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                            selectedRegion === reg
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredCountries.map((c) => {
                      const active = selectedCountry.code === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setSelectedCity(c.cities[0]);
                            setCustomCityInput("");
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                            active
                              ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10 scale-[1.02]"
                              : "bg-black/30 hover:bg-white/[0.06] border-white/10"
                          }`}
                        >
                          <span className="w-5 h-3.5 rounded-[3px] overflow-hidden flex items-center justify-center shrink-0 border border-white/20 shadow-sm bg-black/40">
                            <img
                              src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-bold text-white truncate">{c.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{c.region}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

            {/* City Selection for Active Country */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Select or Enter City in {selectedCountry.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click a popular cultural metropolis below or type your exact home city.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  {selectedCountry.cities.length} Curated Cities
                </span>
              </div>

              {/* Quick City Chips */}
              <div className="flex flex-wrap gap-2">
                {selectedCountry.cities.map((city) => {
                  const active = selectedCity === city && !customCityInput;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setCustomCityInput("");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                        active
                          ? "bg-emerald-500/25 border-emerald-400 text-white shadow-lg shadow-emerald-500/15 scale-105"
                          : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-gray-300"
                      }`}
                    >
                      <span>{city}</span>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom City Input Fallback */}
              <div className="pt-2 border-t border-white/10">
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Or Enter Another City / Town:
                </label>
                <div className="relative max-w-md">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    placeholder={`e.g., Shibuya, ${selectedCountry.name}`}
                    className="w-full pl-10 pr-4 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
        )}
      </div>

      {/* Bottom Sticky Action Footer - Fixed at bottom of screen with frosted glass */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#040409]/92 backdrop-blur-2xl border-t border-white/10 px-3 sm:px-8 py-2.5 sm:py-3.5 shadow-2xl shadow-black">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  setCurrentStep((s) => s - 1);
                }}
                className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-[11px] sm:text-xs text-gray-500 font-mono">Stage 1 of {totalSteps}</span>
            )}

            {currentStep < 5 && (
              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  setCurrentStep((s) => s + 1);
                }}
                className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Skip
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="py-2 sm:py-2.5 px-5 sm:px-7 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={saving}
                className="py-2 sm:py-2.5 px-5 sm:px-8 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Launch Cultural Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
