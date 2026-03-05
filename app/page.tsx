"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Aircraft, FlightFilters, RegionKey } from "@/types/flight";
import { Vessel } from "@/types/vessel";
import { IntelFeedResult } from "@/types/intel";
import { filterAircraft } from "@/lib/military-filter";
import { TEST_AIRCRAFT } from "@/constants/testData";
import { TEST_VESSELS } from "@/constants/testVessels";
import FilterPanel from "@/components/Filters/FilterPanel";
import Sidebar from "@/components/Sidebar/Sidebar";

const FlightMap = dynamic(() => import("@/components/Map/FlightMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500 text-sm">
      Loading map...
    </div>
  ),
});

const DEFAULT_FILTERS: FlightFilters = {
  region: "global",
  aircraftType: "all",
  showGrounded: false,
  showVessels: true,
  showAircraft: true,
};

const FLIGHT_REFRESH_MS = 30_000;
const VESSEL_REFRESH_MS = 60_000;  // AIS updates ~1/min
const INTEL_REFRESH_MS  = 300_000; // 5 min

export default function Home() {
  // ── Filters ───────────────────────────────────────────────────
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

  // ── Aircraft state ────────────────────────────────────────────
  const [aircraft, setAircraft]       = useState<Aircraft[]>(TEST_AIRCRAFT);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [flightLoading, setFlightLoading]     = useState(false);
  const [flightError, setFlightError]         = useState<string | null>(null);
  const [lastFlightUpdate, setLastFlightUpdate] = useState<number | null>(null);
  const [useTestFlights, setUseTestFlights]   = useState(true); // flips false once live data arrives
  const flightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Vessel state ──────────────────────────────────────────────
  const [vessels, setVessels]         = useState<Vessel[]>(TEST_VESSELS);
  const [selectedVesselMmsi, setSelectedVesselMmsi] = useState<string | null>(null);
  const [vesselLoading, setVesselLoading]   = useState(false);
  const [vesselError, setVesselError]       = useState<string | null>(null);
  const [useTestVessels, setUseTestVessels] = useState(true); // flips false once live data arrives
  const vesselIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Intel state ───────────────────────────────────────────────
  const [intelResult, setIntelResult] = useState<IntelFeedResult | null>(null);
  const [intelLoading, setIntelLoading]   = useState(false);
  const [intelError, setIntelError]       = useState<string | null>(null);
  const intelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch flights ─────────────────────────────────────────────
  const fetchFlights = useCallback(async (region: RegionKey) => {
    setFlightLoading(true);
    setFlightError(null);
    try {
      const res  = await fetch(`/api/flights?region=${region}`);
      const data = await res.json();
      if (data.error) {
        setFlightError(data.error);
        setAircraft(TEST_AIRCRAFT);
      } else {
        setAircraft(data.aircraft.length > 0 ? data.aircraft : TEST_AIRCRAFT);
        setLastFlightUpdate(data.fetchedAt);
        setUseTestFlights(data.aircraft.length === 0);
      }
    } catch {
      setFlightError("Live flights unavailable — showing demo data");
      setAircraft(TEST_AIRCRAFT);
    } finally {
      setFlightLoading(false);
    }
  }, []);

  // ── Fetch vessels ─────────────────────────────────────────────
  const fetchVessels = useCallback(async (region: RegionKey) => {
    setVesselLoading(true);
    setVesselError(null);
    try {
      const res  = await fetch(`/api/vessels?region=${region}`);
      const data = await res.json();
      if (data.error && data.usingTestData) {
        setVesselError(data.error);
        setVessels(TEST_VESSELS);
      } else {
        setVessels(data.vessels.length > 0 ? data.vessels : TEST_VESSELS);
        setUseTestVessels(data.usingTestData || data.vessels.length === 0);
      }
    } catch {
      setVesselError("AIS stream unreachable");
      setVessels(TEST_VESSELS);
    } finally {
      setVesselLoading(false);
    }
  }, []);

  // ── Fetch intel ───────────────────────────────────────────────
  const fetchIntel = useCallback(async (region: RegionKey) => {
    setIntelLoading(true);
    setIntelError(null);
    try {
      const res  = await fetch(`/api/intel?region=${region}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IntelFeedResult = await res.json();
      setIntelResult(data);
    } catch (err) {
      setIntelError(err instanceof Error ? err.message : "Failed");
    } finally {
      setIntelLoading(false);
    }
  }, []);

  // ── Auto-fetch + auto-refresh: aircraft ──────────────────────
  // Runs on mount and whenever region changes. No button click needed.
  useEffect(() => {
    fetchFlights(filters.region);
    flightIntervalRef.current = setInterval(() => fetchFlights(filters.region), FLIGHT_REFRESH_MS);
    return () => { if (flightIntervalRef.current) clearInterval(flightIntervalRef.current); };
  }, [filters.region, fetchFlights]);

  // ── Auto-fetch + auto-refresh: vessels ────────────────────────
  useEffect(() => {
    fetchVessels(filters.region);
    vesselIntervalRef.current = setInterval(() => fetchVessels(filters.region), VESSEL_REFRESH_MS);
    return () => { if (vesselIntervalRef.current) clearInterval(vesselIntervalRef.current); };
  }, [filters.region, fetchVessels]);

  // ── Auto-refresh: intel (always on) ──────────────────────────
  useEffect(() => {
    fetchIntel(filters.region);
    intelIntervalRef.current = setInterval(() => fetchIntel(filters.region), INTEL_REFRESH_MS);
    return () => { if (intelIntervalRef.current) clearInterval(intelIntervalRef.current); };
  }, [filters.region, fetchIntel]);

  // ── Deselect both when region changes ────────────────────────
  const handleFilterChange = (f: FlightFilters) => {
    setFilters(f);
    setSelectedAircraftId(null);
    setSelectedVesselMmsi(null);
  };

  // Selecting one clears the other
  const handleSelectAircraft = (a: Aircraft) => {
    setSelectedAircraftId(a.icao24);
    setSelectedVesselMmsi(null);
  };
  const handleSelectVessel = (v: Vessel) => {
    setSelectedVesselMmsi(v.mmsi);
    setSelectedAircraftId(null);
  };
  const handleDeselect = () => {
    setSelectedAircraftId(null);
    setSelectedVesselMmsi(null);
  };

  // ── Filtered data ─────────────────────────────────────────────
  const visibleAircraft = filters.showAircraft
    ? filterAircraft(aircraft, filters.region, filters.aircraftType, filters.showGrounded)
    : [];

  const visibleVessels = filters.showVessels
    ? vessels.filter((v) => filters.region === "global" || v.region === filters.region)
    : [];

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <header className="bg-gray-950 border-b border-gray-800 px-4 py-2 flex items-center gap-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold tracking-widest text-sm">&#9992; FLIGHTINT</span>
          <span className="text-gray-600 text-xs">/ military tracker</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Separate live/demo indicators per layer */}
          <span className={`text-xs px-2 py-0.5 rounded border ${useTestFlights ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-green-400 bg-green-400/10 border-green-400/30"}`}>
            ✈ {useTestFlights ? "demo" : "live"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded border ${useTestVessels ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-green-400 bg-green-400/10 border-green-400/30"}`}>
            ⚓ {useTestVessels ? "demo" : "live"}
          </span>
          {vesselError && (
            <span className="text-red-400 text-xs truncate max-w-xs" title={vesselError}>
              &#9888; {vesselError}
            </span>
          )}

          {/* Manual refresh */}
          <button
            onClick={() => {
              fetchFlights(filters.region);
              fetchVessels(filters.region);
            }}
            disabled={flightLoading || vesselLoading}
            className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1 rounded transition-colors"
          >
            {(flightLoading || vesselLoading) ? "Fetching..." : "↺ Refresh"}
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        aircraftCount={visibleAircraft.length}
        vesselCount={visibleVessels.length}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          aircraft={visibleAircraft}
          vessels={visibleVessels}
          selectedAircraftId={selectedAircraftId}
          selectedVesselMmsi={selectedVesselMmsi}
          onSelectAircraft={handleSelectAircraft}
          onSelectVessel={handleSelectVessel}
          onDeselect={handleDeselect}
          loading={flightLoading}
          vesselLoading={vesselLoading}
          lastUpdated={lastFlightUpdate}
          intelResult={intelResult}
          intelLoading={intelLoading}
          intelError={intelError}
          onIntelRefresh={() => fetchIntel(filters.region)}
        />

        <main className="flex-1 relative">
          <FlightMap
            aircraft={visibleAircraft}
            vessels={visibleVessels}
            selectedAircraftId={selectedAircraftId}
            selectedVesselMmsi={selectedVesselMmsi}
            region={filters.region}
            onSelectAircraft={handleSelectAircraft}
            onSelectVessel={handleSelectVessel}
          />
        </main>
      </div>
    </div>
  );
}
