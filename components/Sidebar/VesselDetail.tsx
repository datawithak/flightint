"use client";

import { Vessel, NAV_STATUS } from "@/types/vessel";
import { NAVY_CONFIG, VESSEL_CATEGORY_ICONS } from "@/constants/vessels";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-800">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-200 text-xs font-mono">{value}</span>
    </div>
  );
}

interface Props {
  vessel: Vessel;
  onClose: () => void;
}

export default function VesselDetail({ vessel, onClose }: Props) {
  const cfg = NAVY_CONFIG[vessel.navy];
  const icon = VESSEL_CATEGORY_ICONS[vessel.vesselCategory];

  return (
    <div className="p-4 overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-white font-bold font-mono text-sm leading-tight">
            {vessel.name}
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            {cfg.flag} {cfg.label}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white text-lg leading-none px-1 shrink-0"
        >
          ×
        </button>
      </div>

      {/* Category badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium mb-4"
        style={{
          backgroundColor: `${cfg.color}20`,
          borderColor: `${cfg.color}50`,
          color: cfg.color,
        }}
      >
        <span>{icon}</span>
        {vessel.vesselCategory.toUpperCase().replace("-", " ")}
      </div>

      <div className="space-y-0">
        <Row label="MMSI"        value={vessel.mmsi} />
        <Row label="Callsign"    value={vessel.callsign || "—"} />
        <Row label="Status"      value={NAV_STATUS[vessel.navStatus] ?? "Unknown"} />
        <Row label="Speed"       value={vessel.speed !== null ? `${vessel.speed.toFixed(1)} kts` : "—"} />
        <Row
          label="Course"
          value={vessel.course !== null ? `${Math.round(vessel.course)}°` : "—"}
        />
        <Row
          label="Heading"
          value={vessel.heading !== null ? `${Math.round(vessel.heading)}°` : "—"}
        />
        <Row label="Destination" value={vessel.destination || "—"} />
        <Row
          label="Position"
          value={`${vessel.latitude.toFixed(3)}, ${vessel.longitude.toFixed(3)}`}
        />
        <Row
          label="Last Update"
          value={new Date(vessel.lastUpdate).toLocaleTimeString()}
        />
      </div>
    </div>
  );
}
