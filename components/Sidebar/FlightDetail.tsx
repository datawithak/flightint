"use client";

import { Aircraft } from "@/types/flight";
import { metersToFeet, msToKnots, headingToCardinal } from "@/lib/military-filter";

const TYPE_BADGE: Record<string, string> = {
  tanker: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  transport: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  surveillance: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  fighter: "bg-red-500/20 text-red-400 border-red-500/40",
  helicopter: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  unknown: "bg-gray-500/20 text-gray-400 border-gray-500/40",
};

interface Props {
  aircraft: Aircraft;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-800">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-200 text-xs font-mono">{value}</span>
    </div>
  );
}

export default function FlightDetail({ aircraft, onClose }: Props) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-white font-bold font-mono text-lg">{aircraft.callsign}</div>
          <div className="text-gray-400 text-xs">{aircraft.origin_country}</div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>

      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium mb-4 ${TYPE_BADGE[aircraft.aircraftType]}`}
      >
        {aircraft.aircraftType.toUpperCase()}
      </div>

      <div className="space-y-0">
        <Row label="ICAO24" value={aircraft.icao24.toUpperCase()} />
        <Row label="Altitude" value={metersToFeet(aircraft.baro_altitude)} />
        <Row label="Speed" value={msToKnots(aircraft.velocity)} />
        <Row
          label="Heading"
          value={
            aircraft.true_track !== null
              ? `${Math.round(aircraft.true_track)}° ${headingToCardinal(aircraft.true_track)}`
              : "—"
          }
        />
        <Row
          label="Vertical Rate"
          value={
            aircraft.vertical_rate !== null
              ? `${aircraft.vertical_rate > 0 ? "+" : ""}${Math.round(aircraft.vertical_rate * 3.28084)} ft/min`
              : "—"
          }
        />
        <Row label="Squawk" value={aircraft.squawk ?? "—"} />
        <Row label="Status" value={aircraft.on_ground ? "On Ground" : "Airborne"} />
        <Row
          label="Position"
          value={
            aircraft.latitude !== null && aircraft.longitude !== null
              ? `${aircraft.latitude.toFixed(3)}, ${aircraft.longitude.toFixed(3)}`
              : "—"
          }
        />
      </div>
    </div>
  );
}
