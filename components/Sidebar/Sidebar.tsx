"use client";

import { useState } from "react";
import { Aircraft } from "@/types/flight";
import { Vessel } from "@/types/vessel";
import { IntelFeedResult } from "@/types/intel";
import { NAVY_CONFIG } from "@/constants/vessels";
import FlightList from "./FlightList";
import FlightDetail from "./FlightDetail";
import VesselDetail from "./VesselDetail";
import IntelFeed from "./IntelFeed";
import AlertsPanel from "./AlertsPanel";

type Tab = "alerts" | "aircraft" | "vessels" | "intel";

interface Props {
  aircraft: Aircraft[];
  vessels: Vessel[];
  alerts: Aircraft[];
  selectedAircraftId: string | null;
  selectedVesselMmsi: string | null;
  onSelectAircraft: (a: Aircraft) => void;
  onSelectVessel: (v: Vessel) => void;
  onDeselect: () => void;
  loading: boolean;
  vesselLoading: boolean;
  lastUpdated: number | null;
  intelResult: IntelFeedResult | null;
  intelLoading: boolean;
  intelError: string | null;
  onIntelRefresh: () => void;
}

export default function Sidebar({
  aircraft, vessels, alerts,
  selectedAircraftId, selectedVesselMmsi,
  onSelectAircraft, onSelectVessel, onDeselect,
  loading, vesselLoading, lastUpdated,
  intelResult, intelLoading, intelError, onIntelRefresh,
}: Props) {
  const [tab, setTab] = useState<Tab>("alerts");

  const selectedAircraft = aircraft.find((a) => a.icao24 === selectedAircraftId) ?? null;
  const selectedVessel   = vessels.find((v) => v.mmsi === selectedVesselMmsi) ?? null;

  const handleSelectAircraft = (a: Aircraft) => { setTab("aircraft"); onSelectAircraft(a); };
  const handleSelectVessel   = (v: Vessel)   => { setTab("vessels");  onSelectVessel(v); };

  return (
    <aside className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <div className="text-white font-bold text-sm tracking-wide">FLIGHTINT</div>
          <div className="text-gray-500 text-xs">Military Tracker</div>
        </div>
        <div className="flex items-center gap-1.5">
          {loading       && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"   title="Fetching aircraft" />}
          {vesselLoading && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Fetching vessels" />}
          {intelLoading  && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Fetching intel" />}
          {!loading && !vesselLoading && !intelLoading && (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        <button
          onClick={() => setTab("alerts")}
          className={`flex-1 py-2 text-xs font-medium transition-colors relative ${
            tab === "alerts"
              ? alerts.length > 0 ? "text-red-400" : "text-white"
              : alerts.length > 0 ? "text-red-500 hover:text-red-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          🎯 {alerts.length > 0 ? alerts.length : ""}
          {tab === "alerts" && (
            <div className={`absolute bottom-0 left-0 right-0 h-px ${alerts.length > 0 ? "bg-red-500" : "bg-white/30"}`} />
          )}
        </button>

        <button onClick={() => setTab("aircraft")}
          className={`flex-1 py-2 text-xs font-medium transition-colors relative ${tab === "aircraft" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          ✈ {aircraft.length > 0 ? aircraft.length : ""}
          {tab === "aircraft" && <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-500" />}
        </button>

        <button onClick={() => setTab("vessels")}
          className={`flex-1 py-2 text-xs font-medium transition-colors relative ${tab === "vessels" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          ⚓ {vessels.length > 0 ? vessels.length : ""}
          {tab === "vessels" && <div className="absolute bottom-0 left-0 right-0 h-px bg-orange-500" />}
        </button>

        <button onClick={() => setTab("intel")}
          className={`flex-1 py-2 text-xs font-medium transition-colors relative ${tab === "intel" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
        >
          📡 {intelResult?.items.length ?? ""}
          {tab === "intel" && <div className="absolute bottom-0 left-0 right-0 h-px bg-yellow-500" />}
        </button>
      </div>

      {tab === "alerts" && (
        <AlertsPanel
          alerts={alerts}
          selectedId={selectedAircraftId}
          onSelect={handleSelectAircraft}
        />
      )}

      {tab === "aircraft" && (
        <>
          {lastUpdated && (
            <div className="px-4 py-1.5 text-xs text-gray-600 border-b border-gray-800 shrink-0">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          {selectedAircraft
            ? <FlightDetail aircraft={selectedAircraft} onClose={onDeselect} />
            : <FlightList aircraft={aircraft} selectedId={selectedAircraftId} onSelect={handleSelectAircraft} />
          }
          <div className="mt-auto border-t border-gray-800 px-4 py-3 shrink-0">
            <div className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider">Aircraft</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { color: "bg-blue-500",    label: "Transport" },
                { color: "bg-amber-500",   label: "Tanker" },
                { color: "bg-purple-500",  label: "Surveillance" },
                { color: "bg-red-500",     label: "Fighter" },
                { color: "bg-emerald-500", label: "Helicopter" },
                { color: "bg-gray-500",    label: "Unknown" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-gray-400 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "vessels" && (
        <>
          {selectedVessel
            ? <VesselDetail vessel={selectedVessel} onClose={onDeselect} />
            : <VesselList vessels={vessels} selectedMmsi={selectedVesselMmsi} onSelect={handleSelectVessel} />
          }
          <div className="mt-auto border-t border-gray-800 px-4 py-3 shrink-0">
            <div className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider">Navies</div>
            <div className="grid grid-cols-2 gap-1">
              {(Object.entries(NAVY_CONFIG) as [string, { label: string; color: string; flag: string }][])
                .filter(([k]) => k !== "other")
                .map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span className="text-gray-400 text-xs truncate">{cfg.flag} {cfg.label}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {tab === "intel" && (
        <IntelFeed
          result={intelResult}
          loading={intelLoading}
          error={intelError}
          onRefresh={onIntelRefresh}
        />
      )}
    </aside>
  );
}

function VesselList({ vessels, selectedMmsi, onSelect }: {
  vessels: Vessel[];
  selectedMmsi: string | null;
  onSelect: (v: Vessel) => void;
}) {
  if (vessels.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs">
        No vessels in this region.
        <br />
        <span className="text-gray-700 mt-1 block">
          Warships may have AIS off.
          <br />USNS supply ships are most visible.
        </span>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto flex-1">
      {vessels.map((v) => {
        const cfg = NAVY_CONFIG[v.navy];
        return (
          <button
            key={v.mmsi}
            onClick={() => onSelect(v)}
            className={`w-full text-left px-4 py-2.5 border-b border-gray-800 hover:bg-gray-800 transition-colors flex items-center gap-3 ${
              v.mmsi === selectedMmsi ? "bg-gray-800 border-l-2 border-l-orange-500" : ""
            }`}
          >
            <div className="w-2.5 h-2.5 shrink-0 rounded-sm" style={{ backgroundColor: cfg.color }} />
            <div className="min-w-0">
              <div className="text-white text-xs font-mono font-semibold truncate">{v.name}</div>
              <div className="text-gray-500 text-xs truncate">
                {cfg.flag} {v.vesselCategory}{v.speed !== null ? ` · ${v.speed.toFixed(0)} kts` : ""}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
