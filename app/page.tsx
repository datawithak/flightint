"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Aircraft, FlightFilters, Geofence, RegionKey } from "@/types/flight";
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
const VESSEL_REFRESH_MS = 60_000;
const INTEL_REFRESH_MS  = 300_000;

type MobileTab = "alerts" | "aircraft" | "vessels" | "intel";

export default function Home() {
  // ── Filters ───────────────────────────────────────────────────
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);

  // ── Geofence ──────────────────────────────────────────────────
  const [geofence, setGeofence]   = useState<Geofence | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ── Aircraft state ────────────────────────────────────────────
  const [aircraft, setAircraft]               = useState<Aircraft[]>(TEST_AIRCRAFT);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [flightLoading, setFlightLoading]     = useState(false);
  const [flightError, setFlightError]         = useState<string | null>(null);
  const [lastFlightUpdate, setLastFlightUpdate] = useState<number | null>(null);
  const [useTestFlights, setUseTestFlights]   = useState(true);
  const flightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Vessel state ──────────────────────────────────────────────
  const [vessels, setVessels]                 = useState<Vessel[]>(TEST_VESSELS);
  const [selectedVesselMmsi, setSelectedVesselMmsi] = useState<string | null>(null);
  const [vesselLoading, setVesselLoading]     = useState(false);
  const [vesselError, setVesselError]         = useState<string | null>(null);
  const [useTestVessels, setUseTestVessels]   = useState(true);
  const vesselIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Intel state ───────────────────────────────────────────────
  const [intelResult, setIntelResult]   = useState<IntelFeedResult | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError]     = useState<string | null>(null);
  const intelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mobile panel state ────────────────────────────────────────
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>("alerts");

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
      setFlightError("Flight feed unreachable");
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

  // ── Auto-fetch + auto-refresh ─────────────────────────────────
  useEffect(() => {
    fetchFlights(filters.region);
    flightIntervalRef.current = setInterval(() => fetchFlights(filters.region), FLIGHT_REFRESH_MS);
    return () => { if (flightIntervalRef.current) clearInterval(flightIntervalRef.current); };
  }, [filters.region, fetchFlights]);

  useEffect(() => {
    fetchVessels(filters.region);
    vesselIntervalRef.current = setInterval(() => fetchVessels(filters.region), VESSEL_REFRESH_MS);
    return () => { if (vesselIntervalRef.current) clearInterval(vesselIntervalRef.current); };
  }, [filters.region, fetchVessels]);

  useEffect(() => {
    fetchIntel(filters.region);
    intelIntervalRef.current = setInterval(() => fetchIntel(filters.region), INTEL_REFRESH_MS);
    return () => { if (intelIntervalRef.current) clearInterval(intelIntervalRef.current); };
  }, [filters.region, fetchIntel]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleFilterChange = (f: FlightFilters) => {
    setFilters(f);
    setSelectedAircraftId(null);
    setSelectedVesselMmsi(null);
  };

  const openMobilePanel = (tab: MobileTab) => {
    if (mobilePanelOpen && mobileActiveTab === tab) {
      setMobilePanelOpen(false);
    } else {
      setMobileActiveTab(tab);
      setMobilePanelOpen(true);
    }
  };

  const handleSelectAircraft = (a: Aircraft) => {
    setSelectedAircraftId(a.icao24);
    setSelectedVesselMmsi(null);
    setMobileActiveTab("aircraft");
    setMobilePanelOpen(true);
  };

  const handleSelectVessel = (v: Vessel) => {
    setSelectedVesselMmsi(v.mmsi);
    setSelectedAircraftId(null);
    setMobileActiveTab("vessels");
    setMobilePanelOpen(true);
  };

  const handleDeselect = () => {
    setSelectedAircraftId(null);
    setSelectedVesselMmsi(null);
  };

  // ── Filtered data ─────────────────────────────────────────────
  const visibleAircraft = filters.showAircraft
    ? filterAircraft(aircraft, filters.region, filters.aircraftType, filters.showGrounded, geofence)
    : [];

  const visibleVessels = filters.showVessels
    ? vessels.filter((v) => {
        if (geofence) {
          if (v.latitude  < geofence.lat_min || v.latitude  > geofence.lat_max) return false;
          if (v.longitude < geofence.lon_min || v.longitude > geofence.lon_max) return false;
          return true;
        }
        return filters.region === "global" || v.region === filters.region;
      })
    : [];

  // ── Watchlist alerts ──────────────────────────────────────────
  const alerts = visibleAircraft.filter((a) => a.isWatchlisted);

  // ── Shared sidebar props ──────────────────────────────────────
  const sidebarProps = {
    aircraft: visibleAircraft,
    vessels: visibleVessels,
    alerts,
    selectedAircraftId,
    selectedVesselMmsi,
    onSelectAircraft: handleSelectAircraft,
    onSelectVessel: handleSelectVessel,
    onDeselect: handleDeselect,
    loading: flightLoading,
    vesselLoading,
    lastUpdated: lastFlightUpdate,
    intelResult,
    intelLoading,
    intelError,
    onIntelRefresh: () => fetchIntel(filters.region),
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <header className="bg-gray-950 border-b border-gray-800 px-3 md:px-4 py-2 flex items-center gap-2 md:gap-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold tracking-widest text-sm">&#9992; FLIGHTINT</span>
          <span className="text-gray-600 text-xs hidden sm:inline">/ military tracker</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="text-red-400 text-xs bg-red-400/10 border border-red-400/30 px-2 py-0.5 rounded animate-pulse font-semibold">
              🎯 {alerts.length}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded border ${useTestFlights ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-green-400 bg-green-400/10 border-green-400/30"}`}>
            ✈ {useTestFlights ? "demo" : "live"}
          </span>
          <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded border ${useTestVessels ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-green-400 bg-green-400/10 border-green-400/30"}`}>
            ⚓ {useTestVessels ? "demo" : "live"}
          </span>
          {vesselError && (
            <span className="hidden md:inline text-red-400 text-xs truncate max-w-[8rem]" title={vesselError}>
              &#9888; {vesselError}
            </span>
          )}
          <button
            onClick={() => { fetchFlights(filters.region); fetchVessels(filters.region); }}
            disabled={flightLoading || vesselLoading}
            className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1 rounded transition-colors"
          >
            <span className="hidden sm:inline">{(flightLoading || vesselLoading) ? "Fetching..." : "↺ Refresh"}</span>
            <span className="sm:hidden">{(flightLoading || vesselLoading) ? "…" : "↺"}</span>
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        aircraftCount={visibleAircraft.length}
        vesselCount={visibleVessels.length}
        geofence={geofence}
        isDrawing={isDrawing}
        onStartDraw={() => setIsDrawing(true)}
        onClearGeofence={() => { setGeofence(null); setIsDrawing(false); }}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar {...sidebarProps} />
        </div>

        {/* Map */}
        <main className="flex-1 relative pb-14 md:pb-0">
          <FlightMap
            aircraft={visibleAircraft}
            vessels={visibleVessels}
            selectedAircraftId={selectedAircraftId}
            selectedVesselMmsi={selectedVesselMmsi}
            region={filters.region}
            geofence={geofence}
            isDrawing={isDrawing}
            onSelectAircraft={handleSelectAircraft}
            onSelectVessel={handleSelectVessel}
            onGeofenceSet={(g) => { setGeofence(g); setIsDrawing(false); }}
            onDrawingDone={() => setIsDrawing(false)}
          />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 flex">
        <button
          onClick={() => openMobilePanel("alerts")}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            mobilePanelOpen && mobileActiveTab === "alerts"
              ? alerts.length > 0 ? "text-red-400" : "text-white"
              : alerts.length > 0 ? "text-red-500" : "text-gray-500"
          }`}
        >
          <span className="text-base leading-none">🎯</span>
          <span className="text-[10px]">{alerts.length > 0 ? `${alerts.length} alert${alerts.length !== 1 ? "s" : ""}` : "Alerts"}</span>
        </button>

        <button
          onClick={() => openMobilePanel("aircraft")}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            mobilePanelOpen && mobileActiveTab === "aircraft" ? "text-blue-400" : "text-gray-500"
          }`}
        >
          <span className="text-base leading-none">✈</span>
          <span className="text-[10px]">{visibleAircraft.length > 0 ? visibleAircraft.length : "Aircraft"}</span>
        </button>

        <button
          onClick={() => openMobilePanel("vessels")}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            mobilePanelOpen && mobileActiveTab === "vessels" ? "text-orange-400" : "text-gray-500"
          }`}
        >
          <span className="text-base leading-none">⚓</span>
          <span className="text-[10px]">{visibleVessels.length > 0 ? visibleVessels.length : "Vessels"}</span>
        </button>

        <button
          onClick={() => openMobilePanel("intel")}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
            mobilePanelOpen && mobileActiveTab === "intel" ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <span className="text-base leading-none">📡</span>
          <span className="text-[10px]">{intelResult?.items.length ? intelResult.items.length : "Intel"}</span>
        </button>
      </nav>

      {/* Mobile sidebar panel (bottom sheet) */}
      {mobilePanelOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobilePanelOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-gray-950 rounded-t-2xl h-[72vh] flex flex-col overflow-hidden border-t border-gray-700">
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />
            <Sidebar
              {...sidebarProps}
              defaultTab={mobileActiveTab}
              onClose={() => setMobilePanelOpen(false)}
              className="w-full bg-gray-950 flex flex-col flex-1 overflow-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
