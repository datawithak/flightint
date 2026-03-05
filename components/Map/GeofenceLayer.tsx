"use client";

import { useEffect, useState } from "react";
import { Rectangle, useMapEvents } from "react-leaflet";
import { Geofence } from "@/types/flight";

interface DrawHandlerProps {
  isDrawing: boolean;
  onGeofenceSet: (g: Geofence) => void;
  onDrawingDone: () => void;
}

function DrawHandler({ isDrawing, onGeofenceSet, onDrawingDone }: DrawHandlerProps) {
  const [corner1, setCorner1] = useState<[number, number] | null>(null);

  // Reset when drawing mode is turned off
  useEffect(() => {
    if (!isDrawing) setCorner1(null);
  }, [isDrawing]);

  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      const { lat, lng } = e.latlng;
      if (!corner1) {
        setCorner1([lat, lng]);
      } else {
        onGeofenceSet({
          lat_min: Math.min(corner1[0], lat),
          lat_max: Math.max(corner1[0], lat),
          lon_min: Math.min(corner1[1], lng),
          lon_max: Math.max(corner1[1], lng),
        });
        setCorner1(null);
        onDrawingDone();
      }
    },
  });

  // Show first corner as a small marker hint
  if (corner1) {
    return (
      <Rectangle
        bounds={[[corner1[0] - 0.2, corner1[1] - 0.2], [corner1[0] + 0.2, corner1[1] + 0.2]]}
        pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.5, weight: 1 }}
      />
    );
  }

  return null;
}

interface Props {
  geofence: Geofence | null;
  isDrawing: boolean;
  onGeofenceSet: (g: Geofence) => void;
  onDrawingDone: () => void;
}

export default function GeofenceLayer({ geofence, isDrawing, onGeofenceSet, onDrawingDone }: Props) {
  return (
    <>
      <DrawHandler
        isDrawing={isDrawing}
        onGeofenceSet={onGeofenceSet}
        onDrawingDone={onDrawingDone}
      />
      {geofence && (
        <Rectangle
          bounds={[
            [geofence.lat_min, geofence.lon_min],
            [geofence.lat_max, geofence.lon_max],
          ]}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.06,
            weight: 2,
            dashArray: "6 4",
          }}
        />
      )}
    </>
  );
}
