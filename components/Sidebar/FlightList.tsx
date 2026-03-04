"use client";

import { Aircraft } from "@/types/flight";

const TYPE_DOT: Record<string, string> = {
  tanker: "bg-amber-500",
  transport: "bg-blue-500",
  surveillance: "bg-purple-500",
  fighter: "bg-red-500",
  helicopter: "bg-emerald-500",
  unknown: "bg-gray-500",
};

interface Props {
  aircraft: Aircraft[];
  selectedId: string | null;
  onSelect: (a: Aircraft) => void;
}

export default function FlightList({ aircraft, selectedId, onSelect }: Props) {
  if (aircraft.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No military aircraft detected in this region.
        <br />
        <span className="text-xs mt-1 block">OpenSky updates every ~10s</span>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      {aircraft.map((a) => (
        <button
          key={a.icao24}
          onClick={() => onSelect(a)}
          className={`w-full text-left px-4 py-2.5 border-b border-gray-800 hover:bg-gray-800 transition-colors flex items-center gap-3 ${
            a.icao24 === selectedId ? "bg-gray-800 border-l-2 border-l-blue-500" : ""
          }`}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[a.aircraftType]}`} />
          <div className="min-w-0">
            <div className="text-white text-xs font-mono font-semibold truncate">
              {a.callsign}
            </div>
            <div className="text-gray-500 text-xs truncate">
              {a.aircraftType} · {a.on_ground ? "GND" : a.baro_altitude ? `${Math.round((a.baro_altitude * 3.28084) / 100) * 100} ft` : "—"}
            </div>
          </div>
          {a.true_track !== null && (
            <div className="ml-auto text-gray-600 text-xs shrink-0">
              {Math.round(a.true_track)}°
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
