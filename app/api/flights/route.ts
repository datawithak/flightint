import { NextRequest, NextResponse } from "next/server";
import { fetchMilitaryFlights } from "@/lib/opensky";
import { RegionKey } from "@/types/flight";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const region = (req.nextUrl.searchParams.get("region") ?? "global") as RegionKey;

  try {
    const aircraft = await fetchMilitaryFlights(region);
    return NextResponse.json({ aircraft, fetchedAt: Date.now() });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    // OpenSky blocks cloud/datacenter IPs — surface a clean message
    const message = raw.includes("fetch failed") || raw.includes("ECONNREFUSED")
      ? "OpenSky unavailable from cloud — showing demo data"
      : raw;
    return NextResponse.json({ error: message, aircraft: [] }, { status: 200 });
  }
}
