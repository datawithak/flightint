import { NextRequest, NextResponse } from "next/server";
import { fetchVesselsViaAIS } from "@/lib/aisstream";
import { RegionKey } from "@/types/flight";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const region = (req.nextUrl.searchParams.get("region") ?? "middle-east") as RegionKey;
  const apiKey = process.env.AISSTREAM_API_KEY ?? "";

  if (!apiKey) {
    return NextResponse.json(
      { vessels: [], error: "AISSTREAM_API_KEY not set — get a free key at aisstream.io", usingTestData: true },
      { status: 200 }
    );
  }

  try {
    const vessels = await fetchVesselsViaAIS(region, apiKey, 8_000);
    return NextResponse.json({ vessels, fetchedAt: Date.now(), usingTestData: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { vessels: [], error: message, usingTestData: true },
      { status: 200 }
    );
  }
}
