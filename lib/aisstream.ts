import { Vessel } from "@/types/vessel";
import { RegionKey } from "@/types/flight";
import { REGIONS } from "@/constants/regions";
import {
  isMilitaryVessel,
  detectNavy,
  categorizeVessel,
} from "@/constants/vessels";
import { detectRegion } from "./military-filter";

import WS from "ws";

// aisstream.io — free WebSocket AIS stream (requires free API key)
// Register at: https://aisstream.io
const AISSTREAM_URL = "wss://stream.aisstream.io/v0/stream";

// ─── AIS message types from aisstream.io ─────────────────────────────────────

interface AISMeta {
  MMSI: number;
  ShipName: string;
  latitude: number;
  longitude: number;
  time_utc: string;
}

interface PositionReport {
  Cog: number;
  NavigationalStatus: number;
  Sog: number;
  TrueHeading: number;
  Latitude: number;
  Longitude: number;
}

interface ShipStaticData {
  CallSign: string;
  Destination: string;
  Type: number;
  Name: string;
}

interface AidsToNavReport {
  Name: string;
  Latitude: number;
  Longitude: number;
  TypeOfAidsToNavigation: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMessage = Record<string, any>;

interface AISMessage {
  MessageType: string;
  MetaData: AISMeta;
  Message: {
    PositionReport?: PositionReport;
    ShipStaticData?: ShipStaticData;
    StandardClassBPositionReport?: PositionReport;
    AidsToNavigationReport?: AidsToNavReport;
  } & AnyMessage;
}

// ─── In-memory vessel store (shared across one-shot calls) ───────────────────

const vesselStore = new Map<string, Partial<Vessel>>();
const msgTypeCounts = new Map<string, number>();

function applyPositionReport(mmsi: string, meta: AISMeta, pos: PositionReport) {
  const existing = vesselStore.get(mmsi) ?? {};
  vesselStore.set(mmsi, {
    ...existing,
    mmsi,
    name: meta.ShipName?.trim() || existing.name || mmsi,
    latitude: pos.Latitude ?? meta.latitude,
    longitude: pos.Longitude ?? meta.longitude,
    speed: pos.Sog ?? null,
    course: pos.Cog ?? null,
    heading: pos.TrueHeading !== 511 ? pos.TrueHeading : (pos.Cog ?? null),
    navStatus: pos.NavigationalStatus ?? 15,
    lastUpdate: Date.now(),
  });
}

function applyStaticData(mmsi: string, meta: AISMeta, s: ShipStaticData) {
  const existing = vesselStore.get(mmsi) ?? {};
  vesselStore.set(mmsi, {
    ...existing,
    mmsi,
    name: s.Name?.trim() || meta.ShipName?.trim() || existing.name || mmsi,
    callsign: s.CallSign?.trim() || "",
    shipType: s.Type ?? 0,
    destination: s.Destination?.trim() || "",
    lastUpdate: Date.now(),
  });
}

function processMessage(msg: AISMessage) {
  const mmsi = String(msg.MetaData?.MMSI ?? "");
  if (!mmsi) return;

  // Track message type counts for debugging
  const mt = msg.MessageType ?? "unknown";
  msgTypeCounts.set(mt, (msgTypeCounts.get(mt) ?? 0) + 1);

  // MetaData always has lat/lon — use it as baseline position for ANY message type
  const metaLat = msg.MetaData?.latitude;
  const metaLon = msg.MetaData?.longitude;
  if (metaLat != null && metaLon != null) {
    const existing = vesselStore.get(mmsi) ?? {};
    vesselStore.set(mmsi, {
      ...existing,
      mmsi,
      name: msg.MetaData.ShipName?.trim() || existing.name || mmsi,
      latitude: metaLat,
      longitude: metaLon,
      lastUpdate: Date.now(),
    });
  }

  // Override with more precise position report data if available
  const pos = msg.Message?.PositionReport ?? msg.Message?.StandardClassBPositionReport;
  if (pos) applyPositionReport(mmsi, msg.MetaData, pos);

  const s = msg.Message?.ShipStaticData;
  if (s) applyStaticData(mmsi, msg.MetaData, s);
}

function finalizeVessels(): Vessel[] {
  const results: Vessel[] = [];
  for (const [mmsi, partial] of Array.from(vesselStore.entries())) {
    if (partial.latitude == null || partial.longitude == null) continue;
    const name = partial.name ?? mmsi;
    const aisType = partial.shipType ?? 0;
    if (!isMilitaryVessel(name, aisType)) continue;

    results.push({
      mmsi,
      name,
      callsign: partial.callsign ?? "",
      shipType: aisType,
      latitude: partial.latitude,
      longitude: partial.longitude,
      speed: partial.speed ?? null,
      course: partial.course ?? null,
      heading: partial.heading ?? null,
      navStatus: partial.navStatus ?? 15,
      destination: partial.destination ?? "",
      isMilitary: true,
      country: partial.country ?? "",
      navy: detectNavy(name, mmsi),
      vesselCategory: categorizeVessel(name, aisType),
      lastUpdate: partial.lastUpdate ?? Date.now(),
      region: detectRegion(partial.latitude, partial.longitude),
    });
  }
  return results;
}

// ─── One-shot WebSocket fetch ─────────────────────────────────────────────────
// Connects, subscribes to bounding box, collects for N seconds, disconnects.
// This fits the polling model of our Next.js API route.

export async function fetchVesselsViaAIS(
  region: RegionKey,
  apiKey: string,
  collectMs = 15_000
): Promise<Vessel[]> {
  const bounds = REGIONS[region].bounds;
  vesselStore.clear();
  msgTypeCounts.clear();

  return new Promise((resolve) => {
    let ws: WS;
    try {
      ws = new WS(AISSTREAM_URL);
    } catch {
      resolve([]);
      return;
    }

    let resolved = false;
    const done = (reason: string) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      const typeSummary = Array.from(msgTypeCounts.entries())
        .map(([t, n]) => `${t}:${n}`)
        .join(", ");
      const military = finalizeVessels();
      console.log(`[AIS] ${reason} — ${vesselStore.size} raw, ${military.length} military | types: ${typeSummary || "none"}`);
      try { ws.close(); } catch {}
      resolve(military);
    };

    const timer = setTimeout(() => done("timeout"), collectMs);

    ws.on("open", () => {
      // No FilterMessageTypes — receive all AIS message types.
      // MetaData always carries lat/lon so we capture position from any broadcast.
      ws.send(JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [[
          [bounds.lat_min, bounds.lon_min],
          [bounds.lat_max, bounds.lon_max],
        ]],
      }));
    });

    ws.on("message", (data: WS.RawData) => {
      try {
        const raw = typeof data === "string" ? data : data.toString("utf8");
        const msg: AISMessage = JSON.parse(raw);
        processMessage(msg);
      } catch {}
    });

    ws.on("error", () => done("error"));
    ws.on("close", () => done("closed"));
  });
}
