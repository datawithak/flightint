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
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
