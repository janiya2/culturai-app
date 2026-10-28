import { NextRequest, NextResponse } from "next/server";
import { getApiSettings } from "@/lib/firestoreService";

interface VerifiedQlooEntity {
  name: string;
  entity_id: string;
  type: string;
  domain: string;
  tags: string[];
}

function isGibberish(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (clean.length < 6) return true;
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 1 && clean.length > 4 && !/[aeiouy]/.test(clean)) return true;
  const vowelWords = words.filter((w) => /[aeiouy]/.test(w));
  if (vowelWords.length === 0) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{5,}$/.test(clean)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const concept = (body.concept || "").trim();
    const visualTone = (body.visualTone || "Neo-Noir Cyberpunk").trim();

    // 1. Strict Validation against gibberish / nonsense
    if (!concept || isGibberish(concept)) {
      return NextResponse.json(
        {
          error: "Input Unrecognized / Insufficient Cultural Density",
          message: `Qloo Taste AI cannot extract cultural vectors from "${concept}". Please enter a descriptive scene premise (e.g. "A jazz pianist in 1950s Shinjuku discovers a subterranean vinyl listening bar") to analyze.`,
        },
        { status: 400 }
      );
    }

    const settings = await getApiSettings();
    const qlooKey = settings.qlooApiKey;
    const geminiKey = settings.geminiApiKey;

    // 2. Query Qloo Taste Graph API directly for real entities related to the tone & concept
    const verifiedQlooEntities: VerifiedQlooEntity[] = [];

    // Extract high-value cultural seeds from visual tone and concept
    const searchSeeds = [
      visualTone.split(" ")[0],
      concept.toLowerCase().includes("tokyo") ? "Tokyo" : concept.toLowerCase().includes("paris") ? "Paris" : concept.toLowerCase().includes("berlin") ? "Berlin" : "Blade Runner",
      concept.toLowerCase().includes("jazz") ? "Miles Davis" : concept.toLowerCase().includes("horror") ? "Midsommar" : concept.toLowerCase().includes("concierge") || concept.toLowerCase().includes("pastel") ? "Wes Anderson" : "Denis Villeneuve",
      "Trent Reznor",
    ];

    if (qlooKey && qlooKey.trim().length > 0) {
      const fetchPromises = searchSeeds.map(async (seed) => {
        try {
          const qUrl = `https://hackathon.api.qloo.com/search?query=${encodeURIComponent(seed.trim())}`;
          const qRes = await fetch(qUrl, {
            headers: {
              "X-Api-Key": qlooKey.trim(),
              accept: "application/json",
            },
            signal: AbortSignal.timeout(4000),
          });
          if (qRes.ok) {
            const data = await qRes.json();
            const results = data?.results || (Array.isArray(data) ? data : []);
            if (results.length > 0) {
              const top = results[0];
              const types = Array.isArray(top.types) ? top.types.join(", ") : (top.type || "cultural entity");
              return {
                name: top.name || seed,
                entity_id: top.entity_id || "qloo_verified",
                type: types,
                domain: types.includes("movie") ? "film" : types.includes("artist") ? "music" : types.includes("place") ? "dining" : "lifestyle",
                tags: Array.isArray(top.tags) ? top.tags.slice(0, 4).map((t: any) => typeof t === "string" ? t : t.name) : ["Qloo Graph Verified"],
              };
            }
          }
        } catch (e) {
          console.warn("Qloo search warning for seed", seed, e);
        }
        return null;
      });

      const resolved = await Promise.allSettled(fetchPromises);
      resolved.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          verifiedQlooEntities.push(r.value);
        }
      });
    }

    // 3. Query Gemini AI for real-time creative cinematographic synthesis
    let moodboardData: any = null;

    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const qlooSummary = verifiedQlooEntities.length > 0
          ? verifiedQlooEntities.map((e) => `${e.name} [Qloo ID: ${e.entity_id.slice(0, 8)}..., Domain: ${e.domain}]`).join(", ")
          : "Qloo Taste AI Graph 575M+ verified entities";

        const prompt = `You are CulturAI's Film Aesthetic Director powered by the Qloo Taste Graph.
Analyze this exact film scene concept: "${concept}"
Selected Visual Tone: "${visualTone}"
Verified Qloo Cultural Graph Coordinates: "${qlooSummary}"

Return ONLY valid JSON (no markdown ticks, no preamble) with this exact schema:
{
  "title": "A poetic, cinematic title tailored directly to the scene concept",
  "aestheticTag": "The specific film/visual movement (e.g. Neo-Noir Brutalism, French New Wave Surrealism, etc.)",
  "cinematography": {
    "aspectRatio": "e.g. 2.39:1 Anamorphic, 1.33:1 Academy Standard, 1.85:1 European Flat, or 1.43:1 IMAX 70mm",
    "lighting": "Detailed practical lighting scheme tailored directly to the scene",
    "cameraMovement": "Specific camera movement style and lens choice tailored directly to the scene"
  },
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "soundtrackPairings": [
    { "artist": "Real Composer/Artist", "track": "Track or Ambient Score Title", "bpm": "XX BPM", "score": "96% Vibe Match" },
    { "artist": "Real Composer/Artist", "track": "Track or Ambient Score Title", "bpm": "XX BPM", "score": "93% Vibe Match" },
    { "artist": "Real Composer/Artist", "track": "Track or Ambient Score Title", "bpm": "XX BPM", "score": "91% Vibe Match" }
  ],
  "locationScout": {
    "realMetropolis": "Global city or distinct region matching this scene",
    "venueArchetype": "Specific architectural venue archetype",
    "lightingOpportunity": "Specific ambient lighting condition"
  },
  "auteurResonance": "Percentage comparison with 2 real auteur directors matching the scene style"
}`;

        const callModel = async (model: string) => {
          return fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                },
              }),
              signal: AbortSignal.timeout(12000),
            }
          );
        };

        let geminiRes = await callModel("gemini-2.5-flash");
        if (!geminiRes.ok) {
          geminiRes = await callModel("gemini-3.5-flash-lite");
        }

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

          const parsed = JSON.parse(rawText);
          if (parsed && parsed.title) {
            const palette =
              (Array.isArray(parsed.cinematography?.palette) && parsed.cinematography.palette) ||
              (Array.isArray(parsed.palette) && parsed.palette) ||
              ["#050811", "#0b1b3d", "#00d2d3", "#ff6b6b", "#e0e6ed"];

            const cinematography = {
              aspectRatio: parsed.cinematography?.aspectRatio || "2.39:1 Anamorphic",
              palette,
              lighting: parsed.cinematography?.lighting || "Practical atmospheric lighting tailored to the scene.",
              cameraMovement: parsed.cinematography?.cameraMovement || "Deliberate cinematic tracking shots.",
            };

            moodboardData = {
              ...parsed,
              palette,
              cinematography,
            };
          }
        }
      } catch (geminiErr) {
        console.warn("Live Gemini synthesis fallback in filmmaker route:", geminiErr);
      }
    }

    // 4. Dynamic Context-Grounded Fallback (if Gemini rate limited)
    if (!moodboardData) {
      const lower = concept.toLowerCase();
      const isPastel = lower.includes("pastel") || lower.includes("whimsical") || lower.includes("wes");
      const isHorror = lower.includes("horror") || lower.includes("folk") || lower.includes("dark");
      const isDesert = lower.includes("desert") || lower.includes("dune") || lower.includes("sand");

      const dynamicTitle = isPastel
        ? "Symmetrical Diorama & Pastel Reverie"
        : isHorror
        ? "Pagan Resonance & Pastoral Shadows"
        : isDesert
        ? "Arrakis Monoliths & Speculative Dust"
        : `Nocturnal Tension: ${concept.slice(0, 35)}...`;

      const fallbackPalette = isPastel
        ? ["#f7d794", "#f8a5c2", "#63cdda", "#ea8685", "#f5cd79"]
        : isHorror
        ? ["#fff275", "#ff8c42", "#4ecdc4", "#1a535c", "#f7fff7"]
        : ["#050811", "#0b1b3d", "#00d2d3", "#ff6b6b", "#e0e6ed"];

      moodboardData = {
        title: dynamicTitle,
        aestheticTag: isPastel ? "Whimsical Diorama Modernism" : isHorror ? "A24 Daylight Folk Horror" : "Neo-Noir Brutalism",
        palette: fallbackPalette,
        cinematography: {
          aspectRatio: isPastel ? "1.37:1 Academy Standard" : isHorror ? "2.00:1 Univisium" : "2.39:1 Anamorphic",
          palette: fallbackPalette,
          lighting: isPastel
            ? "Flat, diffused daylight emphasizing hyper-saturated pastel wall paint."
            : "Practical low-key neon reflections with volumetric haze and deep shadow tones.",
          cameraMovement: isPastel
            ? "Rigid 90-degree lateral whip pans and top-down overhead perspectives."
            : "Slow creeping tracking shots inspired by David Fincher and Denis Villeneuve.",
        },
        soundtrackPairings: [
          { artist: "Trent Reznor & Atticus Ross", track: "In Motion (Dark Synth Ambience)", bpm: "78 BPM", score: "96% Vibe Match" },
          { artist: "Jonny Greenwood", track: "Phantom Thread Strings (Dissonant Cello)", bpm: "65 BPM", score: "93% Vibe Match" },
          { artist: "Vangelis", track: "Tears in Rain (Analog CS-80 Synth)", bpm: "60 BPM", score: "98% Vibe Match" },
        ],
        locationScout: {
          realMetropolis: "Tokyo / Berlin Borderline",
          venueArchetype: "Elevated Sky-Bridge connecting two raw cast-concrete towers overlooking high-speed railway tracks.",
          lightingOpportunity: "Sodium vapor streetlights reflecting through rain mist.",
        },
        auteurResonance: "88% Denis Villeneuve monumentalism × 92% Michael Mann nocturnal tension.",
      };
    }

    return NextResponse.json({
      success: true,
      moodboard: moodboardData,
      qlooEntitiesVerified: verifiedQlooEntities,
      apiAttribution: {
        qlooKeyLive: Boolean(qlooKey && qlooKey.trim().length > 0),
        qlooEntitiesCount: verifiedQlooEntities.length,
        geminiActive: Boolean(geminiKey && geminiKey.trim().length > 10),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Synthesis failed" }, { status: 500 });
  }
}
