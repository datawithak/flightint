"use client";

import { Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Aircraft } from "@/types/flight";
import { metersToFeet, msToKnots, headingToCardinal } from "@/lib/military-filter";

const TYPE_COLORS: Record<string, string> = {
  tanker: "#f59e0b",
  transport: "#3b82f6",
  surveillance: "#8b5cf6",
  fighter: "#ef4444",
  helicopter: "#10b981",
  unknown: "#6b7280",
};

const TYPE_ICONS: Record<string, string> = {
  tanker: "⛽",
  transport: "✈",
  surveillance: "👁",
  fighter: "⚡",
  helicopter: "🚁",
  unknown: "✈",
};

function makeIcon(aircraft: Aircraft, selected: boolean): L.DivIcon {
  const color = TYPE_COLORS[aircraft.aircraftType] ?? "#6b7280";
  const rotation = aircraft.true_track ?? 0;
  const size = selected ? 36 : 28;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid ${selected ? "#fff" : "#1a1a1a"};
        outline: 1px solid rgba(255,255,255,0.4);
        border-radius: 50% 50% 50% 0;
        transform: rotate(${rotation - 45}deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${selected ? "12px" : "6px"} ${color}80;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <span style="
          transform: rotate(${45 - rotation}deg);
          font-size: ${size * 0.5}px;
          line-height: 1;
        ">${TYPE_ICONS[aircraft.aircraftType] ?? "✈"}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
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
      zIndexOffset={selected ? 1000 : 0}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
        <div className="text-xs font-mono">
          <div className="font-bold">{aircraft.callsign}</div>
          <div>{aircraft.aircraftType.toUpperCase()}</div>
        </div>
      </Tooltip>
    </Marker>
  );
}
