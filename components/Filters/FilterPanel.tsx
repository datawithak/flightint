"use client";

import { AircraftType, FlightFilters, Geofence, RegionKey } from "@/types/flight";
import { REGIONS } from "@/constants/regions";

const AIRCRAFT_TYPES: Array<{ value: AircraftType | "all"; label: string; icon: string }> = [
  { value: "all",          label: "All Types",   icon: "✈" },
  { value: "tanker",       label: "Tanker",       icon: "⛽" },
  { value: "transport",    label: "Transport",    icon: "✈" },
  { value: "surveillance", label: "Surveillance", icon: "👁" },
  { value: "fighter",      label: "Fighter",      icon: "⚡" },
  { value: "helicopter",   label: "Helicopter",   icon: "🚁" },
];

interface Props {
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  aircraftCount: number;
  vesselCount: number;
  geofence: Geofence | null;
  isDrawing: boolean;
  onStartDraw: () => void;
  onClearGeofence: () => void;
}

function Divider() {
  return <div className="w-px h-6 bg-gray-700 shrink-0" />;
}

export default function FilterPanel({
  filters, onChange, aircraftCount, vesselCount,
  geofence, isDrawing, onStartDraw, onClearGeofence,
}: Props) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center gap-4 overflow-x-auto shrink-0">

      {/* Region */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Region</span>
        <div className="flex gap-1">
          {(Object.keys(REGIONS) as RegionKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onChange({ ...filters, region: key })}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filters.region === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {REGIONS[key].label}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Geofence draw controls */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Zone</span>
        {isDrawing ? (
          <span className="text-red-400 text-xs animate-pulse font-medium">
            Click 2 points on map…
          </span>
        ) : geofence ? (
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 text-xs font-mono">
              {geofence.lat_min.toFixed(1)}–{geofence.lat_max.toFixed(1)}°N ·{" "}
              {geofence.lon_min.toFixed(1)}–{geofence.lon_max.toFixed(1)}°E
            </span>
            <button
              onClick={onClearGeofence}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-1"
              title="Clear geofence"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onStartDraw}
            className="px-2.5 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors"
          >
            ✏ Draw Zone
          </button>
        )}
      </div>

      <Divider />

      {/* Aircraft type filter */}
      {filters.showAircraft && (
        <>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-gray-500 text-xs uppercase tracking-wider">Type</span>
            <div className="flex gap-1">
              {AIRCRAFT_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, aircraftType: value })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                    filters.aircraftType === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Divider />
        </>
      )}

      {/* Layer toggles */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Show</span>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showAircraft}
            onChange={(e) => onChange({ ...filters, showAircraft: e.target.checked })}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className={`text-xs ${filters.showAircraft ? "text-blue-400" : "text-gray-500"}`}>
            ✈ Aircraft
            {filters.showAircraft && <span className="ml-1 text-gray-500 font-mono">{aircraftCount}</span>}
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showVessels}
            onChange={(e) => onChange({ ...filters, showVessels: e.target.checked })}
            className="w-3.5 h-3.5 accent-orange-500"
          />
          <span className={`text-xs ${filters.showVessels ? "text-orange-400" : "text-gray-500"}`}>
            ⚓ Vessels
            {filters.showVessels && <span className="ml-1 text-gray-500 font-mono">{vesselCount}</span>}
          </span>
        </label>

        {filters.showAircraft && (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showGrounded}
              onChange={(e) => onChange({ ...filters, showGrounded: e.target.checked })}
              className="w-3.5 h-3.5 accent-gray-500"
            />
            <span className="text-gray-400 text-xs">Grounded</span>
          </label>
        )}
      </div>

    </div>
  );
}
