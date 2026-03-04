"use client";

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Vessel, NAV_STATUS } from "@/types/vessel";
import { NAVY_CONFIG, VESSEL_CATEGORY_ICONS } from "@/constants/vessels";

function makeVesselIcon(vessel: Vessel, selected: boolean): L.DivIcon {
  const cfg = NAVY_CONFIG[vessel.navy];
  const color = cfg.color;
  const heading = vessel.heading ?? vessel.course ?? 0;
  const size = selected ? 36 : 28;
  const icon = VESSEL_CATEGORY_ICONS[vessel.vesselCategory] ?? "⚓";

  // Triangle shape (▲) rotated to heading — distinct from aircraft teardrop
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: ${size * 0.4}px solid transparent;
          border-right: ${size * 0.4}px solid transparent;
          border-bottom: ${size * 0.85}px solid ${color};
          transform: rotate(${heading}deg);
          filter: drop-shadow(0 0 ${selected ? 8 : 4}px ${color}99) drop-shadow(0 0 1px #000);
          position: absolute;
        "></div>
        <span style="
          position: absolute;
          font-size: ${size * 0.38}px;
          line-height: 1;
          z-index: 2;
          transform: translateY(${size * 0.12}px);
        ">${icon}</span>
        ${selected ? `<div style="
          position: absolute;
          width: ${size + 8}px;
          height: ${size + 8}px;
          border: 2px solid white;
          border-radius: 50%;
          top: -4px;
          left: -4px;
          pointer-events: none;
        "></div>` : ""}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface Props {
  vessel: Vessel;
  selected: boolean;
  onSelect: (v: Vessel) => void;
}

export default function VesselMarker({ vessel, selected, onSelect }: Props) {
  return (
    <Marker
      position={[vessel.latitude, vessel.longitude]}
      icon={makeVesselIcon(vessel, selected)}
      eventHandlers={{ click: () => onSelect(vessel) }}
      zIndexOffset={selected ? 999 : -1} // vessels render below aircraft
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
        <div className="text-xs font-mono">
          <div className="font-bold">{vessel.name}</div>
          <div>{NAVY_CONFIG[vessel.navy].flag} {vessel.vesselCategory}</div>
          <div className="text-gray-400">{NAV_STATUS[vessel.navStatus] ?? "Unknown"}</div>
        </div>
      </Tooltip>
    </Marker>
  );
}
