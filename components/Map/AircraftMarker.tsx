"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Aircraft } from "@/types/flight";
import { metersToFeet, msToKnots } from "@/lib/military-filter";

// Inject watchlist pulse keyframes once
let pulseStyleInjected = false;
function ensurePulseStyle() {
  if (pulseStyleInjected || typeof document === "undefined") return;
  pulseStyleInjected = true;
  const s = document.createElement("style");
  s.textContent = `
    @keyframes watchlist-pulse {
      0%   { box-shadow: 0 0 0 0px rgba(239,68,68,0.9); }
      70%  { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0px rgba(239,68,68,0); }
    }
    .watchlist-ring { animation: watchlist-pulse 1.4s ease-out infinite; border-radius: 50% !important; }
  `;
  document.head.appendChild(s);
}

const TYPE_COLORS: Record<string, string> = {
  tanker:       "#f59e0b",
  transport:    "#3b82f6",
  surveillance: "#8b5cf6",
  fighter:      "#ef4444",
  helicopter:   "#10b981",
  unknown:      "#6b7280",
};

const TYPE_ICONS: Record<string, string> = {
  tanker:       "⛽",
  transport:    "✈",
  surveillance: "👁",
  fighter:      "⚡",
  helicopter:   "🚁",
  unknown:      "✈",
};

function makeIcon(aircraft: Aircraft, selected: boolean): L.DivIcon {
  ensurePulseStyle();
  const color    = TYPE_COLORS[aircraft.aircraftType] ?? "#6b7280";
  const rotation = aircraft.true_track ?? 0;
  const size     = selected ? 36 : 28;
  const watched  = aircraft.isWatchlisted;

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; width:${size + (watched ? 12 : 0)}px; height:${size + (watched ? 12 : 0)}px;">
        ${watched ? `
          <div class="watchlist-ring" style="
            position: absolute;
            inset: 0;
            border: 2px solid #ef4444;
            border-radius: 50%;
            pointer-events: none;
          "></div>
        ` : ""}
        <div style="
          position: absolute;
          inset: ${watched ? 6 : 0}px;
          background: ${color};
          border: 2px solid ${selected ? "#fff" : watched ? "#ef4444" : "#1a1a1a"};
          outline: 1px solid rgba(255,255,255,0.4);
          border-radius: 50% 50% 50% 0;
          transform: rotate(${rotation - 45}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 ${selected ? "14px" : watched ? "10px" : "6px"} ${watched ? "#ef4444cc" : color + "80"};
          cursor: pointer;
        ">
          <span style="
            transform: rotate(${45 - rotation}deg);
            font-size: ${size * 0.5}px;
            line-height: 1;
          ">${TYPE_ICONS[aircraft.aircraftType] ?? "✈"}</span>
        </div>
      </div>
    `,
    iconSize:   [size + (watched ? 12 : 0), size + (watched ? 12 : 0)],
    iconAnchor: [(size + (watched ? 12 : 0)) / 2, size + (watched ? 12 : 0)],
  });
}

interface Props {
  aircraft: Aircraft;
  selected: boolean;
  onSelect: (a: Aircraft) => void;
}

export default function AircraftMarker({ aircraft, selected, onSelect }: Props) {
  if (aircraft.latitude === null || aircraft.longitude === null) return null;

  return (
    <Marker
      position={[aircraft.latitude, aircraft.longitude]}
      icon={makeIcon(aircraft, selected)}
      eventHandlers={{ click: () => onSelect(aircraft) }}
      zIndexOffset={aircraft.isWatchlisted ? 2000 : selected ? 1000 : 0}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
        <div className="text-xs font-mono">
          <div className="font-bold">{aircraft.callsign || aircraft.icao24}</div>
          {aircraft.isWatchlisted
            ? <div className="text-red-400 font-semibold">{aircraft.watchlistTooltip}</div>
            : <div>{aircraft.aircraftType.toUpperCase()}</div>
          }
          {aircraft.baro_altitude && <div className="text-gray-400">{metersToFeet(aircraft.baro_altitude)}</div>}
          {aircraft.velocity && <div className="text-gray-400">{msToKnots(aircraft.velocity)}</div>}
        </div>
      </Tooltip>
    </Marker>
  );
}
