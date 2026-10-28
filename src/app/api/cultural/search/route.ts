import { NextRequest, NextResponse } from "next/server";
import { getApiSettings } from "@/lib/firestoreService";
import { searchCulturalEntities, CulturalSuggestion } from "@/lib/culturalDictionary";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const domain = (searchParams.get("domain") || "all") as any;

    if (!query.trim()) {
      return NextResponse.json({ query: "", results: [], isQlooLive: false });
    }

    // 1. Instant local dictionary search
    const localResults = searchCulturalEntities(query, domain);

    // 2. Check if live Qloo API key is configured
    let liveQlooResults: CulturalSuggestion[] = [];
    let isQlooLive = false;

    try {
      const settings = await getApiSettings();
      if (settings?.qlooApiKey && settings.qlooApiKey.trim().length > 0 && settings.qlooApiMode === "live") {
        isQlooLive = true;
        // Query live Qloo Hackathon entity search endpoint
        const qlooUrl = `https://hackathon.api.qloo.com/search?query=${encodeURIComponent(
          query.trim()
        )}`;
        const qlooRes = await fetch(qlooUrl, {
          method: "GET",
          headers: {
            "X-Api-Key": settings.qlooApiKey.trim(),
            accept: "application/json",
          },
          // 2.5 second timeout so user typing never lags
          signal: AbortSignal.timeout(2500),
        });

        if (qlooRes.ok) {
          const qlooData = await qlooRes.json();
          const items =
            qlooData?.results || qlooData?.entities || (Array.isArray(qlooData) ? qlooData : []);

          if (Array.isArray(items)) {
            liveQlooResults = items.slice(0, 6).map((item: any, idx: number) => {
              const name = item.name || item.title || item.label || "";
              const typesArr: string[] = Array.isArray(item.types) ? item.types : [item.type || item.domain || ""];
              const isMovie = typesArr.some((t: string) => t.includes("movie") || t.includes("film"));
              const isPlace = typesArr.some((t: string) => t.includes("place") || t.includes("restaurant") || t.includes("dining"));
              const isFashion = typesArr.some((t: string) => t.includes("brand") || t.includes("fashion") || t.includes("clothing"));
              
              const mappedDomain: "music" | "cinema" | "dining" | "fashion" | "travel" =
                isMovie ? "cinema" : isPlace ? "dining" : isFashion ? "fashion" : "music";

              const tagStrings: string[] = Array.isArray(item.tags)
                ? item.tags.map((t: any) => (typeof t === "string" ? t : (t?.name || ""))).filter(Boolean)
                : [];

              const primaryCategory = tagStrings[0] || (isMovie ? "Cinema" : isPlace ? "Culinary Culture" : "Sound & Music");
              const shortDesc = item.properties?.short_description || item.disambiguation || `Verified entity in Qloo Taste AI Graph with ${tagStrings.length} cultural tags.`;

              return {
                id: item.entity_id || `qloo_live_${item.id || idx}`,
                name,
                domain: mappedDomain,
                category: primaryCategory,
                subtext: shortDesc,
                tags: tagStrings.length > 0 ? tagStrings.slice(0, 6) : ["Qloo Live Verified"],
                iconType: mappedDomain === "cinema" ? "film" : mappedDomain === "dining" ? "utensils" : mappedDomain === "fashion" ? "shirt" : "music",
              };
            });
          }
        }
      }
    } catch (apiErr) {
      // Gracefully fall back to comprehensive local graph if Qloo API is unreachable/standby
      console.warn("Live Qloo search standby, falling back to local cultural graph:", apiErr);
    }

    // Merge results, giving priority to exact name matches and removing duplicates
    const seenNames = new Set<string>();
    const mergedResults: CulturalSuggestion[] = [];

    // Add live Qloo results first if any
    for (const r of liveQlooResults) {
      if (r.name && !seenNames.has(r.name.toLowerCase())) {
        seenNames.add(r.name.toLowerCase());
        mergedResults.push(r);
      }
    }

    // Add local curated results
    for (const r of localResults) {
      if (r.name && !seenNames.has(r.name.toLowerCase())) {
        seenNames.add(r.name.toLowerCase());
        mergedResults.push(r);
      }
    }

    return NextResponse.json({
      query,
      results: mergedResults.slice(0, 8),
      isQlooLive,
    });
  } catch (err: any) {
    console.error("Cultural search API error:", err);
    return NextResponse.json(
      { error: "Failed to query cultural graph", results: [] },
      { status: 500 }
    );
  }
}
