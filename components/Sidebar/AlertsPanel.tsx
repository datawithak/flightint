"use client";

import { Aircraft } from "@/types/flight";
import { metersToFeet, msToKnots } from "@/lib/military-filter";

interface Props {
  alerts: Aircraft[];
  selectedId: string | null;
  onSelect: (a: Aircraft) => void;
}

export default function AlertsPanel({ alerts, selectedId, onSelect }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-2xl mb-3 opacity-40">🎯</div>
        <div className="text-gray-400 text-sm font-medium">No watchlist aircraft detected</div>
        <div className="text-gray-600 text-xs mt-2 leading-relaxed">
          Monitoring for RIVET, JAKE, SENTRY,<br />
          NIGHTW, SPAR, FORTE, LAGR, PETRO…
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 bg-red-950/40 border-b border-red-900/50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 text-xs font-semibold tracking-wider uppercase">
          {alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {alerts.map((a) => (
        <button
          key={a.icao24}
          onClick={() => onSelect(a)}
          className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
            a.icao24 === selectedId ? "bg-red-950/30 border-l-2 border-l-red-500" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-white text-sm font-mono font-bold">{a.callsign || a.icao24}</span>
            <span className="text-red-400 text-xs shrink-0">
              {a.on_ground ? "GROUND" : metersToFeet(a.baro_altitude)}
            </span>
          </div>
          <div className="text-red-300 text-xs mb-1.5">{a.watchlistTooltip}</div>
          <div className="text-gray-500 text-xs font-mono">
            {a.latitude?.toFixed(3)}°N · {a.longitude?.toFixed(3)}°E
            {a.velocity ? ` · ${msToKnots(a.velocity)}` : ""}
          </div>
        </button>
      ))}
    </div>
  );
}
