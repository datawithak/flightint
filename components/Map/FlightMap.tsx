"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Aircraft, RegionKey } from "@/types/flight";
import { Vessel } from "@/types/vessel";
import { REGION_CENTER, REGION_ZOOM } from "@/constants/regions";
import AircraftMarker from "./AircraftMarker";
import VesselMarker from "./VesselMarker";

import L from "leaflet";
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ region }: { region: RegionKey }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(REGION_CENTER[region], REGION_ZOOM[region], { duration: 1.2 });
  }, [region, map]);
  return null;
}

interface Props {
  aircraft: Aircraft[];
  vessels: Vessel[];
  selectedAircraftId: string | null;
  selectedVesselMmsi: string | null;
  region: RegionKey;
  onSelectAircraft: (a: Aircraft) => void;
  onSelectVessel: (v: Vessel) => void;
}

export default function FlightMap({
  aircraft,
  vessels,
  selectedAircraftId,
  selectedVesselMmsi,
  region,
  onSelectAircraft,
  onSelectVessel,
}: Props) {
  return (
    <MapContainer
      center={REGION_CENTER[region]}
      zoom={REGION_ZOOM[region]}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <RecenterMap region={region} />

      {/* Vessels render first (below aircraft) */}
      {vessels.map((v) => (
        <VesselMarker
          key={v.mmsi}
          vessel={v}
          selected={v.mmsi === selectedVesselMmsi}
          onSelect={onSelectVessel}
        />
      ))}

      {/* Aircraft render on top */}
      {aircraft.map((a) => (
        <AircraftMarker
          key={a.icao24}
          aircraft={a}
          selected={a.icao24 === selectedAircraftId}
          onSelect={onSelectAircraft}
        />
      ))}
    </MapContainer>
  );
}
