import { NextRequest, NextResponse } from "next/server";
import { getSourcesForRegion } from "@/constants/feeds";
import { fetchFeedSource } from "@/lib/feeds";
import { IntelFeedResult } from "@/types/intel";
import { RegionKey } from "@/types/flight";

export const runtime = "nodejs";
// Don't cache at the route level — each feed handles its own revalidation
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const region = (req.nextUrl.searchParams.get("region") ?? "global") as RegionKey;
  const sources = getSourcesForRegion(region);

  // Fetch all sources in parallel — failures don't block others
  const results = await Promise.allSettled(
    sources.map((source) => fetchFeedSource(source))
  );

  const allItems = [];
  const sourceStatuses = [];

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      allItems.push(...result.value.items);
      sourceStatuses.push({
        id: source.id,
        name: source.short,
        status: result.value.status,
        count: result.value.items.length,
        error: result.value.error,
      });
    } else {
      sourceStatuses.push({
        id: source.id,
        name: source.short,
        status: "error" as const,
        count: 0,
        error: result.reason?.message,
      });
    }
  }

  // Sort by most recent first
  allItems.sort((a, b) => b.publishedMs - a.publishedMs);

  const payload: IntelFeedResult = {
    items: allItems.slice(0, 50), // cap at 50 items
    sources: sourceStatuses,
    fetchedAt: Date.now(),
  };

  return NextResponse.json(payload);
}
