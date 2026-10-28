export interface TravelDestination {
  city: string;
  country: string;
  code: string;
  region: "Europe" | "Asia & Pacific" | "Americas" | "Middle East & Africa";
  flag: string;
  vibe: string;
  highlight: string;
}

export const GLOBAL_DESTINATIONS: TravelDestination[] = [
  // Europe
  { city: "Berlin", country: "Germany", code: "DE", region: "Europe", flag: "🇩🇪", vibe: "Brutalism, Industrial Techno & Subterranean Clubs", highlight: "Power Stations & Vinyl Dens" },
  { city: "Paris", country: "France", code: "FR", region: "Europe", flag: "🇫🇷", vibe: "Natural Wine Bistros, Neo-Bistronomy & Arthouse Celluloid", highlight: "Belleville Natural Wine & Cinematheque" },
  { city: "London", country: "United Kingdom", code: "GB", region: "Europe", flag: "🇬🇧", vibe: "Subterranean Vinyl Dens, Tate Modern & Brutalist Estates", highlight: "Barbican Concrete & Hackney Micro-Roasters" },
  { city: "Amsterdam", country: "Netherlands", code: "NL", region: "Europe", flag: "🇳🇱", vibe: "Canal-Side Listening Bars, Rietveld Modernism & Sourdough", highlight: "Analog Audio Bars & De Pijp Studios" },
  { city: "Milan", country: "Italy", code: "IT", region: "Europe", flag: "🇮🇹", vibe: "Archival Fashion Houses, Rationalist Architecture & Spritz", highlight: "Fondazione Prada & Navigli Vintage Vaults" },
  { city: "Rome", country: "Italy", code: "IT", region: "Europe", flag: "🇮🇹", vibe: "Ancient Travertine, Baroque Piazzas & Roman Cicchetti", highlight: "Trastevere Wine Bars & Brutalist EUR" },
  { city: "Florence", country: "Italy", code: "IT", region: "Europe", flag: "🇮🇹", vibe: "Renaissance Terraces, Leather Artisans & Chianti Vaults", highlight: "Oltrarno Artisan Workshops & Rooftops" },
  { city: "Venice", country: "Italy", code: "IT", region: "Europe", flag: "🇮🇹", vibe: "Canal-Side Bacari, Venetian Gothic & Murano Glassworks", highlight: "Dorsoduro Natural Wine & Hidden Canals" },
  { city: "Barcelona", country: "Spain", code: "ES", region: "Europe", flag: "🇪🇸", vibe: "Gaudí Surrealism, Gothic Quarter & Tapas Night Hops", highlight: "El Born Natural Wine & Underground Flamenco" },
  { city: "San Sebastián", country: "Spain", code: "ES", region: "Europe", flag: "🇪🇸", vibe: "Basque Pintxos Pilgrimage, Txakoli Pours & Atlantic Surf", highlight: "Old Town Pintxos Counters & Seafront Modernism" },
  { city: "Copenhagen", country: "Denmark", code: "DK", region: "Europe", flag: "🇩🇰", vibe: "Nordic Foraged Fermentation, Blonde Wood & Minimalist Bicycles", highlight: "Meatpacking District & Noma Fermentation Labs" },
  { city: "Stockholm", country: "Sweden", code: "SE", region: "Europe", flag: "🇸🇪", vibe: "Archipelago Clean Lines, Brutalist Metro & Warm Hygge", highlight: "Södermalm Archive Boutiques & Art Caverns" },
  { city: "Oslo", country: "Norway", code: "NO", region: "Europe", flag: "🇳🇴", vibe: "Munch Modernism, Fjord Sauna Pavilions & Nordic Roasters", highlight: "Harbor Architecture & Third-Wave Coffee" },
  { city: "Zurich", country: "Switzerland", code: "CH", region: "Europe", flag: "🇨🇭", vibe: "Dadaist Cabarets, Clean Modernist Typography & Precision", highlight: "Limmat River Bades & Industrial West" },
  { city: "Vienna", country: "Austria", code: "AT", region: "Europe", flag: "🇦🇹", vibe: "Secessionist Art, Historic Coffee Houses & Mahler", highlight: "Klimt Pavilions & Turn-of-the-Century Cafes" },
  { city: "Edinburgh", country: "United Kingdom", code: "GB", region: "Europe", flag: "🇬🇧", vibe: "Gothic Wynds, Old Town Smoky Whisky Dens & Rainy Neo-Classicism", highlight: "Royal Mile Cellars & Independent Bookshops" },
  { city: "Lisbon", country: "Portugal", code: "PT", region: "Europe", flag: "🇵🇹", vibe: "Azulejo Ceramic Tiles, Melancholic Fado & Pet-Nats", highlight: "Alfama Stairwells & Miradouros Wine Sunsets" },
  { city: "Athens", country: "Greece", code: "GR", region: "Europe", flag: "🇬🇷", vibe: "Ancient Marbles, Rooftop Cocktail Dens & Flea Markets", highlight: "Exarcheia Counterculture & Anafiotika Alleys" },

  // Asia & Pacific
  { city: "Tokyo", country: "Japan", code: "JP", region: "Asia & Pacific", flag: "🇯🇵", vibe: "Jazz Kissas, Subterranean Omakase & Neon Alleyways", highlight: "Shinjuku Golden Gai & Shibuya Audiophile Bars" },
  { city: "Kyoto", country: "Japan", code: "JP", region: "Asia & Pacific", flag: "🇯🇵", vibe: "Zen Moss Gardens, Tatami Machiyas & Ceremonial Matcha", highlight: "Gion Bamboo Sanctuaries & Antique Ceramics" },
  { city: "Osaka", country: "Japan", code: "JP", region: "Asia & Pacific", flag: "🇯🇵", vibe: "Underground Dotonbori Ramen, Vinyl Dens & Neon Cyberpunk", highlight: "Amerikamura Vintage & Narrow Izakayas" },
  { city: "Seoul", country: "South Korea", code: "KR", region: "Asia & Pacific", flag: "🇰🇷", vibe: "Futuristic Raw Concrete, Concept Cafes & Seongsu Streetwear", highlight: "Hongdae Indie Live Venues & Euljiro Metal Bars" },
  { city: "Busan", country: "South Korea", code: "KR", region: "Asia & Pacific", flag: "🇰🇷", vibe: "Coastal Cliffs, Haeundae Arthouse Cinema & Night Seafood", highlight: "BIFF Cinephile Alleys & Jagalchi Fish Stalls" },
  { city: "Singapore", country: "Singapore", code: "SG", region: "Asia & Pacific", flag: "🇸🇬", vibe: "Biophilic Supertrees, Speakeasy Cocktail Dens & Peranakan Craft", highlight: "Jalan Besar Roasters & Hidden Gin Alleys" },
  { city: "Bangkok", country: "Thailand", code: "TH", region: "Asia & Pacific", flag: "🇹🇭", vibe: "Yaowarat Wok Fire, Golden Temples & Subterranean Speakeasies", highlight: "Charoenkrung Art District & Chinatown Jazz Dens" },
  { city: "Chiang Mai", country: "Thailand", code: "TH", region: "Asia & Pacific", flag: "🇹🇭", vibe: "Slow Mountain Living, Artisan Indigo & Third-Wave Roasters", highlight: "Nimman Espresso Labs & Lanna Wood Carvers" },
  { city: "Bali (Ubud)", country: "Indonesia", code: "ID", region: "Asia & Pacific", flag: "🇮🇩", vibe: "Bamboo Pavilions, Sacred Water Temples & Plant Alchemy", highlight: "Ayung River Sanctuaries & Vegan Farm Kitchens" },
  { city: "Sichuan (Chengdu)", country: "China", code: "CN", region: "Asia & Pacific", flag: "🇨🇳", vibe: "Historic Teahouses, Peppercorn Hotpot & Underground Electronic", highlight: "People's Park Bamboo Chairs & Cyberpunk Nightclubs" },
  { city: "Shanghai", country: "China", code: "CN", region: "Asia & Pacific", flag: "🇨🇳", vibe: "Art Deco Bund, Futuristic Mega-Towers & Hidden Speakeasies", highlight: "French Concession Tree Canopies & Vinyl Bars" },
  { city: "Beijing", country: "China", code: "CN", region: "Asia & Pacific", flag: "🇨🇳", vibe: "Ancient Hutong Alleyways, 798 Art District & Courtyard Bars", highlight: "Lama Temple Sanctuaries & Post-Punk Basements" },
  { city: "Pinggu District", country: "China", code: "CN", region: "Asia & Pacific", flag: "🇨🇳", vibe: "Misty Mountain Orchard Terraces, Serene Lakes & Great Wall Passes", highlight: "Jinhai Lake & Golden Peach Terraces" },
  { city: "Hong Kong", country: "Hong Kong", code: "HK", region: "Asia & Pacific", flag: "🇭🇰", vibe: "Wong Kar-wai Neon Melancholy, Dim Sum Carts & Star Ferry", highlight: "Sheung Wan Antiquities & Mid-Levels Escalator Bars" },
  { city: "Melbourne", country: "Australia", code: "AU", region: "Asia & Pacific", flag: "🇦🇺", vibe: "Graffiti Laneways, World-Leading Third-Wave Roasters & Vinyl Bars", highlight: "Fitzroy Record Stores & Laneway Espresso" },
  { city: "Sydney", country: "Australia", code: "AU", region: "Asia & Pacific", flag: "🇦🇺", vibe: "Harbor Ocean Pools, Modern Australian Dining & Coastal Living", highlight: "Surry Hills Design & Bondi Icebergs" },
  { city: "Colombo", country: "Sri Lanka", code: "LK", region: "Asia & Pacific", flag: "🇱🇰", vibe: "Geoffrey Bawa Tropical Modernism, Cinnamon Coast & Tea Verandahs", highlight: "Number 11 Residence & Dutch Hospital Courtyards" },
  { city: "Galle", country: "Sri Lanka", code: "LK", region: "Asia & Pacific", flag: "🇱🇰", vibe: "17th-Century Ocean Fort Ramparts, Colonial Architecture & Spices", highlight: "Cobblestone Rampart Walks & Gem Boutiques" },
  { city: "Mumbai", country: "India", code: "IN", region: "Asia & Pacific", flag: "🇮🇳", vibe: "Art Deco Marine Drive, Irani Cafes & Kala Ghoda Art District", highlight: "Colaba Heritage Walks & Contemporary Art Basements" },

  // Americas
  { city: "New York", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Cast-Iron SoHo Lofts, Rare Jazz Cellars & Archival Mixology", highlight: "Greenwich Village Jazz Dens & DUMBO Studios" },
  { city: "Los Angeles", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Mid-Century Desert Pavilions, Natural Wine & Mulholland Neon", highlight: "Silver Lake Coffee & Eames Case Study Houses" },
  { city: "San Francisco", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Victorian Painted Ladies, Foggy Bay Roasters & Analog Audio", highlight: "Mission District Murals & North Beach Beatniks" },
  { city: "Chicago", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Mies van der Rohe Steel, Chicago Blues Cellars & Deep-Dish Roots", highlight: "South Side Blues Clubs & River Architectural Cruises" },
  { city: "Austin", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Hill Country Oak Smoke, Vinyl Honky-Tonks & Indie Synthesis", highlight: "East Austin Cocktail Caravans & Modular Synth Hubs" },
  { city: "Portland", country: "United States", code: "US", region: "Americas", flag: "🇺🇸", vibe: "Micro-Roasters, Independent Book Palaces & Forest Foraging", highlight: "Powell's City of Books & Micro-Distilleries" },
  { city: "Montreal", country: "Canada", code: "CA", region: "Americas", flag: "🇨🇦", vibe: "Mile End Bagels, French Neo-Bistros & Brutalist Habitat 67", highlight: "Plateau Arthouse Cafes & Saint-Laurent Vinyl" },
  { city: "Mexico City", country: "Mexico", code: "MX", region: "Americas", flag: "🇲🇽", vibe: "Luis Barragán Magenta Walls, Roma Norte Mezcalerias & Heirloom Corn", highlight: "Condesa Tree-Lined Avenidas & Coyoacán Studios" },
  { city: "Oaxaca", country: "Mexico", code: "MX", region: "Americas", flag: "🇲🇽", vibe: "Ancestral Clay Agave Distilleries, Black Mole & Zapotec Weaving", highlight: "Santo Domingo Plaza & Underground Mezcal Tastings" },
  { city: "Buenos Aires", country: "Argentina", code: "AR", region: "Americas", flag: "🇦🇷", vibe: "Belle Époque Bookstores, Nocturnal Steakhouses & San Telmo Tango", highlight: "El Ateneo Grand Splendid & Palermo Hollywood Bistros" },
  { city: "São Paulo", country: "Brazil", code: "BR", region: "Americas", flag: "🇧🇷", vibe: "Lina Bo Bardi Brutalism, Concrete Skylines & Tropicalia Rhythms", highlight: "MASP Concrete Easels & Vila Madalena Murals" },

  // Middle East & Africa
  { city: "Dubai", country: "United Arab Emirates", code: "AE", region: "Middle East & Africa", flag: "🇦🇪", vibe: "Futuristic Architecture, Alserkal Avenue Art & Desert Sanctuaries", highlight: "Alserkal Industrial Warehouses & Secret Speakeasies" },
  { city: "Cape Town", country: "South Africa", code: "ZA", region: "Middle East & Africa", flag: "🇿🇦", vibe: "Table Mountain Fynbos, Cape Dutch Vineyards & Coastal Art", highlight: "Kloof Street Dining & Zeitz MOCAA Silos" },
  { city: "Marrakech", country: "Morocco", code: "MA", region: "Middle East & Africa", flag: "🇲🇦", vibe: "Zellige Tile Riads, Medina Spice Souks & Majorelle Cobalt Blue", highlight: "Jemaa el-Fnaa Storytellers & Yves Saint Laurent Museum" },
];

export function findDestination(cityNameOrQuery: string): TravelDestination | undefined {
  if (!cityNameOrQuery) return undefined;
  const q = cityNameOrQuery.toLowerCase().trim();
  return GLOBAL_DESTINATIONS.find((d) => 
    d.city.toLowerCase() === q ||
    d.country.toLowerCase() === q ||
    d.city.toLowerCase().includes(q) ||
    q.includes(d.city.toLowerCase())
  );
}

export function searchDestinations(query: string): TravelDestination[] {
  if (!query || !query.trim()) return GLOBAL_DESTINATIONS;
  const q = query.toLowerCase().trim();
  return GLOBAL_DESTINATIONS.filter((d) =>
    d.city.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q) ||
    d.region.toLowerCase().includes(q) ||
    d.vibe.toLowerCase().includes(q) ||
    d.highlight.toLowerCase().includes(q)
  );
}
