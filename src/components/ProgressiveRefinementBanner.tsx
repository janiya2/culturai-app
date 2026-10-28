"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/authContext";
import { Sparkles, Check, ArrowRight, X, RefreshCw, Compass, Globe2 } from "lucide-react";
import CulturalAutocompleteInput from "@/components/CulturalAutocompleteInput";

interface OptionItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  region?: string;
}

interface DomainConfig {
  title: string;
  subtitle: string;
  categories: string[];
  options: OptionItem[];
}

const DOMAIN_OPTIONS: Record<string, DomainConfig> = {
  dining: {
    title: "Dining & Mixology Signals Missing",
    subtitle: "You skipped dining in onboarding. Select from 24+ global culinary movements or search 575M+ Qloo entities below:",
    categories: [
      "All",
      "Speakeasies & Bars",
      "Japanese & East Asian",
      "Wine & Artisan",
      "Chef's Tasting",
      "Street Food & Markets",
    ],
    options: [
      { id: "Speakeasy Cocktails", name: "Speakeasy Cocktails", subtitle: "Subterranean cocktail dens, crystal hand-carved ice & rare mezcal", category: "Speakeasies & Bars", region: "New York / London" },
      { id: "Natural Wine Bars", name: "Natural Wine Bars", subtitle: "Low-intervention biodynamic pet-nats, orange skin-contact wines & sourdough", category: "Wine & Artisan", region: "Paris / Copenhagen" },
      { id: "Omakase Counter", name: "Omakase Counter", subtitle: "Minimalist 18-course seasonal Japanese sushi mastercraft & binchotan sear", category: "Japanese & East Asian", region: "Tokyo / Kyoto" },
      { id: "Underground Ramen", name: "Underground Ramen", subtitle: "18-hour slow-simmered tonkotsu broths in narrow neon train alleyways", category: "Japanese & East Asian", region: "Osaka / Fukuoka" },
      { id: "Secret Vinyl Listening Bar", name: "Secret Vinyl Listening Bar", subtitle: "Vacuum tube amplifiers, Tannoy speakers, Japanese pressings & rare single malts", category: "Speakeasies & Bars", region: "Shibuya / Berlin" },
      { id: "Izakaya & Charcoal Yakitori", name: "Izakaya & Charcoal Yakitori", subtitle: "Smoky robata charcoal skewers, highballs & lively neighborhood counter vibes", category: "Japanese & East Asian", region: "Tokyo / Shinjuku" },
      { id: "Nordic Foraged Tasting", name: "Nordic Foraged Tasting", subtitle: "Hyper-seasonal wild herbs, lichen, fermented berries & minimalist plating", category: "Chef's Tasting", region: "Copenhagen / Oslo" },
      { id: "Parisian Neo-Bistronomy", name: "Parisian Neo-Bistronomy", subtitle: "Reinvented French classics by rebel chefs in intimate, candlelit spaces", category: "Chef's Tasting", region: "Paris (11th Arr.)" },
      { id: "Basque Pintxos & Txakoli", name: "Basque Pintxos & Txakoli", subtitle: "Cantabrian anchovies, cider poured from ceiling height & bustling bar hops", category: "Wine & Artisan", region: "San Sebastián / Bilbao" },
      { id: "Oaxacan Artisanal Mezcaleria", name: "Oaxacan Artisanal Mezcaleria", subtitle: "Wild espadín & tobalá agaves roasted underground with dark chili mole", category: "Speakeasies & Bars", region: "Oaxaca / CDMX" },
      { id: "Third-Wave Pour-Over Roastery", name: "Third-Wave Pour-Over Roastery", subtitle: "Single-origin Ethiopian anaerobic lots brewed at concrete industrial brew bars", category: "Wine & Artisan", region: "Melbourne / Portland" },
      { id: "Kyoto Ceremonial Teahouse", name: "Kyoto Ceremonial Teahouse", subtitle: "Whisked Uji matcha, seasonal wagashi sweets & tranquil bamboo garden views", category: "Japanese & East Asian", region: "Kyoto / Gion" },
      { id: "Neapolitan Sourdough Pizzeria", name: "Neapolitan Sourdough Pizzeria", subtitle: "48-hour fermented blistered dough, San Marzano tomatoes & fior di latte", category: "Street Food & Markets", region: "Naples / Rome" },
      { id: "Mexican Street Taquería", name: "Mexican Street Taquería", subtitle: "Al pastor sliced fresh from the trompo onto handmade heirloom corn tortillas", category: "Street Food & Markets", region: "Mexico City / Guadalajara" },
      { id: "Modern Korean Hansik", name: "Modern Korean Hansik", subtitle: "Aged fermented kimchi, elevated royal banchan & artisanal craft makgeolli", category: "Chef's Tasting", region: "Seoul (Gangnam / Seongsu)" },
      { id: "Sichuan Peppercorn Hotpot", name: "Sichuan Peppercorn Hotpot", subtitle: "Numbs-the-tongue mala broth with wild mushrooms and lotus root in night markets", category: "Street Food & Markets", region: "Chengdu / Chongqing" },
      { id: "Venetian Cicchetti & Spritz", name: "Venetian Cicchetti & Spritz", subtitle: "Canal-side bacari serving baccalà mantecato, polenta squares & Select spritz", category: "Wine & Artisan", region: "Venice / Dorsoduro" },
      { id: "Bangkok Night Market Stall", name: "Bangkok Night Market Stall", subtitle: "Wok-tossed pad kra pao with holy basil, crispy pork belly & tamarind broth", category: "Street Food & Markets", region: "Bangkok (Yaowarat)" },
      { id: "Farm-to-Table Biodynamic Kitchen", name: "Farm-to-Table Biodynamic Kitchen", subtitle: "Zero-waste heirloom vegetables picked that morning from regenerative soils", category: "Chef's Tasting", region: "Hudson Valley / Cotswolds" },
      { id: "Artisanal Craft Microbrewery", name: "Artisanal Craft Microbrewery", subtitle: "Hazy double IPAs, barrel-aged wild sours & rustic warehouse tasting rooms", category: "Speakeasies & Bars", region: "Brussels / Denver" },
    ],
  },

  cinema: {
    title: "Cinematic Aesthetic Signals Missing",
    subtitle: "You skipped cinema in onboarding. Select from 20+ auteur visions or search any director across cinema history:",
    categories: [
      "All",
      "Sci-Fi & Monumental",
      "Neon Melancholy & Romance",
      "Auteur Whimsy & Symmetry",
      "Dark Thriller & Neo-Noir",
    ],
    options: [
      { id: "Christopher Nolan", name: "Christopher Nolan", subtitle: "Non-linear mind-bending sci-fi, ticking clocks & visceral IMAX practical scale", category: "Sci-Fi & Monumental", region: "Hollywood / London" },
      { id: "Wong Kar-wai", name: "Wong Kar-wai", subtitle: "Step-printed neon melancholy, rain-slicked Hong Kong & romantic longing", category: "Neon Melancholy & Romance", region: "Hong Kong" },
      { id: "Denis Villeneuve", name: "Denis Villeneuve", subtitle: "Monolithic brutalist architecture, Hans Zimmer brass drone & atmospheric scale", category: "Sci-Fi & Monumental", region: "Montreal / Hollywood" },
      { id: "Wes Anderson", name: "Wes Anderson", subtitle: "Pastel symmetrical dioramas, eccentric typography & nostalgic storybook whimsy", category: "Auteur Whimsy & Symmetry", region: "Paris / Austin" },
      { id: "David Fincher", name: "David Fincher", subtitle: "Clinical precision lighting, green-yellow color timing & psychological obsession", category: "Dark Thriller & Neo-Noir", region: "Los Angeles" },
      { id: "Hayao Miyazaki", name: "Hayao Miyazaki", subtitle: "Lush hand-drawn pastoral wonder, steampunk flying craft & deep ecological spirit", category: "Auteur Whimsy & Symmetry", region: "Tokyo / Studio Ghibli" },
      { id: "Stanley Kubrick", name: "Stanley Kubrick", subtitle: "One-point perspective symmetry, cold cosmic dread & hypnotic classical scores", category: "Sci-Fi & Monumental", region: "London / New York" },
      { id: "Quentin Tarantino", name: "Quentin Tarantino", subtitle: "Kinetic pop-culture dialogue, razor-sharp tension & obscure 70s needle drops", category: "Dark Thriller & Neo-Noir", region: "Los Angeles" },
      { id: "Ridley Scott (Blade Runner)", name: "Ridley Scott (Blade Runner)", subtitle: "Perpetual acid rain, neon geisha billboards, smoke & synthetic humanity", category: "Sci-Fi & Monumental", region: "London / Los Angeles" },
      { id: "Bong Joon-ho", name: "Bong Joon-ho", subtitle: "Razor-sharp social architectural satire, class tension & unpredictable genre shifts", category: "Dark Thriller & Neo-Noir", region: "Seoul" },
      { id: "Sofia Coppola", name: "Sofia Coppola", subtitle: "Sun-drenched languor, dreamy shoegaze soundtracks & poetic foreign isolation", category: "Neon Melancholy & Romance", region: "Tokyo / New York" },
      { id: "Andrei Tarkovsky", name: "Andrei Tarkovsky", subtitle: "Philosophical contemplation, wet soil, burning houses & meditative long takes", category: "Sci-Fi & Monumental", region: "Moscow / Florence" },
      { id: "Guillermo del Toro", name: "Guillermo del Toro", subtitle: "Ornate gothic fairy tales, amber clockwork machinery & empathetic monsters", category: "Auteur Whimsy & Symmetry", region: "Guadalajara / Toronto" },
      { id: "Paul Thomas Anderson", name: "Paul Thomas Anderson", subtitle: "Volatile character studies, fluid Steadicam sequences & gritty American canvas", category: "Dark Thriller & Neo-Noir", region: "San Fernando Valley" },
      { id: "A24 Folk Horror Aesthetic", name: "A24 Folk Horror Aesthetic", subtitle: "Bright sunlit pagan terrors, floral crowns, dread-inducing acoustic strings", category: "Dark Thriller & Neo-Noir", region: "Nordic / New York" },
      { id: "French New Wave (Godard)", name: "French New Wave (Godard)", subtitle: "Rebellious jump cuts, Paris boulevard romance & spontaneous jazz cool", category: "Neon Melancholy & Romance", region: "Paris" },
    ],
  },

  fashion: {
    title: "Form & Architectural Style Missing",
    subtitle: "You skipped design & architecture in onboarding. Select aesthetic paradigms or search global design movements:",
    categories: [
      "All",
      "Architectural Brutalism",
      "Avant-Garde & Deconstruction",
      "Minimalism & Scandi",
      "Technical Gorpcore",
    ],
    options: [
      { id: "Brutalist Architecture", name: "Brutalist Architecture", subtitle: "Raw exposed concrete, monolithic geometric overhangs & dramatic shadow play", category: "Architectural Brutalism", region: "London / Berlin" },
      { id: "Issey Miyake Pleats", name: "Issey Miyake Pleats", subtitle: "Kinetic heat-pressed permanent pleats, architectural drapery & sculptural ease", category: "Avant-Garde & Deconstruction", region: "Tokyo / Paris" },
      { id: "Maison Margiela", name: "Maison Margiela", subtitle: "Deconstructed seams, split-toe tabi silhouettes & subversive anti-fashion", category: "Avant-Garde & Deconstruction", region: "Paris / Antwerp" },
      { id: "Technical Gorpcore", name: "Technical Gorpcore", subtitle: "Gore-Tex taped seams, Arc'teryx beta shells & weather-engineered urban utility", category: "Technical Gorpcore", region: "Vancouver / Tokyo" },
      { id: "Bauhaus Modernism", name: "Bauhaus Modernism", subtitle: "Form follows function, tubular steel cantilevers, primary colors & rational lines", category: "Architectural Brutalism", region: "Dessau / Berlin" },
      { id: "Yohji Yamamoto Monochromes", name: "Yohji Yamamoto Monochromes", subtitle: "Voluminous fluid black wool, asymmetric hems & philosophical anti-color poetry", category: "Avant-Garde & Deconstruction", region: "Tokyo" },
      { id: "Japanese Wabi-Sabi", name: "Japanese Wabi-Sabi", subtitle: "Reverence for natural decay, unglazed ceramics, charred cedar & coarse raw linen", category: "Minimalism & Scandi", region: "Kyoto / Kanazawa" },
      { id: "Mid-Century Modernism", name: "Mid-Century Modernism", subtitle: "Eames molded walnut, floor-to-ceiling glass pavilions & warm organic geometry", category: "Minimalism & Scandi", region: "Palm Springs / Copenhagen" },
      { id: "Rick Owens Darkwear", name: "Rick Owens Darkwear", subtitle: "Gothic proportions, sculptural draped jersey, geometric leather & brutalist footwear", category: "Avant-Garde & Deconstruction", region: "Paris / Venice" },
      { id: "Scandinavian Functionalism", name: "Scandinavian Functionalism", subtitle: "Pale blonde Nordic birch, unpretentious curves & warm, layered hygge lighting", category: "Minimalism & Scandi", region: "Stockholm / Copenhagen" },
      { id: "Cyberpunk Tactical Wear", name: "Cyberpunk Tactical Wear", subtitle: "Matte black Fidlock buckles, modular Molle webbing & high-density Schoeller textiles", category: "Technical Gorpcore", region: "Berlin / Seoul" },
      { id: "Biophilic Architecture", name: "Biophilic Architecture", subtitle: "Cascading interior fern living walls, skylight sun filtering & raw porous travertine", category: "Architectural Brutalism", region: "Singapore / Milan" },
      { id: "Dieter Rams Braun Design", name: "Dieter Rams Braun Design", subtitle: "Less, but better — iconic functional simplicity, clean white matte controls & dials", category: "Minimalism & Scandi", region: "Frankfurt" },
      { id: "Archival Streetwear", name: "Archival Streetwear", subtitle: "Heavyweight 450gsm boxy hoodies, limited OG sneaker grails & collector subculture", category: "Technical Gorpcore", region: "Tokyo (Harajuku) / NYC" },
    ],
  },

  music: {
    title: "Sonic Palettes Missing",
    subtitle: "You skipped music in onboarding. Pick from 20+ legendary sonic icons or search any musical artist in the world:",
    categories: [
      "All",
      "Art Rock & Post-Punk",
      "Electronic & Ambient",
      "Jazz & Neo-Soul",
      "Psychedelic & Synthpop",
    ],
    options: [
      { id: "Radiohead", name: "Radiohead", subtitle: "Melancholic dystopian art-rock, glitch modular drums & Thom Yorke falsettos", category: "Art Rock & Post-Punk", region: "Oxford, UK" },
      { id: "Miles Davis", name: "Miles Davis", subtitle: "Nocturnal modal cool jazz, muted brass trumpet & smoky Parisian atmosphere", category: "Jazz & Neo-Soul", region: "New York / Paris" },
      { id: "Aphex Twin", name: "Aphex Twin", subtitle: "IDM glitch braindance, lush ambient analog modular synths & breakbeat fury", category: "Electronic & Ambient", region: "Cornwall / London" },
      { id: "FKJ", name: "FKJ", subtitle: "Organic multi-instrumental loops, Fender Rhodes neo-soul & warm saxophone", category: "Jazz & Neo-Soul", region: "Paris" },
      { id: "Pink Floyd", name: "Pink Floyd", subtitle: "Monumental concept suites, soaring Gilmour stratocaster solos & spatial reverb", category: "Art Rock & Post-Punk", region: "London, UK" },
      { id: "Daft Punk", name: "Daft Punk", subtitle: "French touch filtered disco loops, vintage vocoders & retro-futuristic synth funk", category: "Electronic & Ambient", region: "Paris" },
      { id: "Massive Attack", name: "Massive Attack", subtitle: "Dark Bristol trip-hop, heavy dub sub-basslines & haunting nocturnal strings", category: "Art Rock & Post-Punk", region: "Bristol, UK" },
      { id: "Tame Impala", name: "Tame Impala", subtitle: "Lush multi-tracked phasing, vintage Roland synths & sun-drenched psych pop", category: "Psychedelic & Synthpop", region: "Perth, Australia" },
      { id: "Brian Eno", name: "Brian Eno", subtitle: "Groundbreaking generative ambient soundscapes, tape loop cycles & serene calm", category: "Electronic & Ambient", region: "London" },
      { id: "David Bowie", name: "David Bowie", subtitle: "Chameleonic reinvention, Berlin Trilogy synth experiments & timeless art-pop", category: "Art Rock & Post-Punk", region: "Berlin / London" },
      { id: "Portishead", name: "Portishead", subtitle: "Cinematic spy noir textures, vinyl turntable crackle & Beth Gibbons' raw ache", category: "Art Rock & Post-Punk", region: "Bristol, UK" },
      { id: "Ryuichi Sakamoto", name: "Ryuichi Sakamoto", subtitle: "Heart-wrenching acoustic piano minimalism, lush orchestral scores & field recordings", category: "Electronic & Ambient", region: "Tokyo / New York" },
      { id: "Arctic Monkeys", name: "Arctic Monkeys", subtitle: "Witty Sheffield lyricism, fuzzy garage rock riffs & cinematic 70s lounge grooves", category: "Art Rock & Post-Punk", region: "Sheffield, UK" },
      { id: "Nils Frahm", name: "Nils Frahm", subtitle: "Prepared upright piano felt hammers, vintage space echo & hypnotic classical loops", category: "Electronic & Ambient", region: "Berlin" },
      { id: "Bonobo", name: "Bonobo", subtitle: "Organic world percussion, lush jazz brass samples & deep downtempo electronica", category: "Electronic & Ambient", region: "Brighton / Los Angeles" },
      { id: "The Cure", name: "The Cure", subtitle: "Flanged basslines, atmospheric swirling guitars & romantic gothic melancholia", category: "Art Rock & Post-Punk", region: "Crawley, UK" },
    ],
  },
};

interface Props {
  domain: "dining" | "cinema" | "fashion" | "music";
  onRefined?: (newItems: string[]) => void;
}

export default function ProgressiveRefinementBanner({ domain, onRefined }: Props) {
  const { userProfile, updateTaste } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [pageOffset, setPageOffset] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [success, setSuccess] = useState(false);

  const config = DOMAIN_OPTIONS[domain];
  const options = config?.options || [];

  // Filter options by category (Hooks MUST run unconditionally before any returns)
  const filteredOptions = useMemo(() => {
    if (!config) return [];
    if (activeCategory === "All") return options;
    return options.filter((opt) => opt.category === activeCategory);
  }, [config, options, activeCategory]);

  // Display 6 items at a time, cyclical shuffle (Hooks MUST run unconditionally before any returns)
  const itemsPerPage = 6;
  const displayedOptions = useMemo(() => {
    if (filteredOptions.length <= itemsPerPage) return filteredOptions;
    const start = (pageOffset * itemsPerPage) % filteredOptions.length;
    const slice = filteredOptions.slice(start, start + itemsPerPage);
    if (slice.length < itemsPerPage) {
      return [...slice, ...filteredOptions.slice(0, itemsPerPage - slice.length)];
    }
    return slice;
  }, [filteredOptions, pageOffset]);

  // Check if user already has data for this domain or if dismissed (placed AFTER all hooks)
  const existingList = (userProfile?.tasteProfile as any)?.[domain] || [];
  if (!config || existingList.length > 0 || dismissed) {
    return null;
  }

  const handleShuffle = () => {
    setPageOffset((prev) => prev + 1);
  };

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      if (selected.length < 5) {
        setSelected([...selected, id]);
      }
    }
  };

  const handleAddAutocompleteSeed = (seedName: string) => {
    if (!seedName.trim()) return;
    if (!selected.includes(seedName.trim())) {
      setSelected((prev) => (prev.length < 5 ? [...prev, seedName.trim()] : prev));
    }
  };

  const handleRemoveSeed = (seedName: string) => {
    setSelected((prev) => prev.filter((s) => s !== seedName));
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const current = userProfile?.tasteProfile || {
        music: [],
        cinema: [],
        dining: [],
        fashion: [],
        city: "Tokyo, Japan",
        aestheticKeywords: [],
        onboarded: true,
      };

      const updatedDomainList = selected;
      const allSignals = Array.from(
        new Set([
          ...(current.music || []),
          ...(current.cinema || []),
          ...(current.dining || []),
          ...(current.fashion || []),
          ...selected,
        ])
      );

      await updateTaste({
        [domain]: updatedDomainList,
        aestheticKeywords: allSignals,
      });

      setSuccess(true);
      if (onRefined) onRefined(updatedDomainList);
      setTimeout(() => {
        setDismissed(true);
      }, 1500);
    } catch (err) {
      console.error("Failed to update taste progressively:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black/90 to-purple-500/10 border border-amber-500/35 backdrop-blur-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl shadow-amber-950/30">
      {/* Decorative Aura Accent */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-amber-200 uppercase font-mono tracking-wider">
                {config.title}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold">
                {config.options.length}+ Curated Global Nodes
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed max-w-3xl">
              {config.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 shrink-0"
          title="Dismiss for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {success ? (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Synced {selected.length} preference(s) directly to your Firestore Taste DNA profile! Updating analysis...</span>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {/* Autocomplete Search Bar: Instant Suggestions & Custom Input */}
          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Globe2 className="w-3.5 h-3.5" />
                Live Cultural Autocomplete & 575M+ Knowledge Search:
              </span>
              <span className="text-gray-500 text-[10px]">Type any artist, dish, vibe from any country</span>
            </div>
            <CulturalAutocompleteInput
              domain={domain}
              placeholder={`Type any global ${domain} entity (e.g. Omakase, Mezcaleria, Nolan, Radiohead)...`}
              onAddSeed={handleAddAutocompleteSeed}
              buttonText="Add to Selection"
            />
          </div>

          {/* Currently Selected Seeds Tag Tray */}
          {selected.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider shrink-0">
                Selected ({selected.length} / 5):
              </span>
              {selected.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-black/70 border border-amber-400/40 text-xs font-mono text-amber-200 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSeed(item)}
                    className="hover:text-white text-gray-400 transition-colors text-sm"
                    title={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Category Filter Pills & Shuffle Controls */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {config.categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setPageOffset(0);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                      : "bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Rotate and discover more global options"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>Shuffle Choices</span>
            </button>
          </div>

          {/* Curated Option Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {displayedOptions.map((opt) => {
              const active = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer group ${
                    active
                      ? "bg-amber-500/25 border-amber-400 text-white shadow-lg shadow-amber-500/20 scale-[1.01]"
                      : "bg-black/50 hover:bg-white/[0.06] border-white/10 text-gray-300 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                        {opt.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {opt.region && (
                          <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {opt.region}
                          </span>
                        )}
                        {active && (
                          <div className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                      {opt.subtitle}
                    </p>
                  </div>
                  <div className="pt-2 mt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{opt.category}</span>
                    <span className={active ? "text-amber-300 font-bold" : "text-gray-400"}>
                      {active ? "Selected" : "+ Select"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs font-mono text-gray-400">
              Selected: <strong className="text-amber-300">{selected.length}</strong> / 5 max
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={selected.length === 0 || saving}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs font-mono shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            >
              {saving ? (
                <span>Syncing Taste DNA...</span>
              ) : (
                <>
                  <span>Sync & Sharpen Engine ({selected.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
