import { Region, RegionKey } from "@/types/flight";

export const REGIONS: Record<RegionKey, Region> = {
  global: {
    label: "Global",
    bounds: { lat_min: -90, lon_min: -180, lat_max: 90, lon_max: 180 },
  },
  us: {
    label: "United States",
    bounds: { lat_min: 24, lon_min: -125, lat_max: 50, lon_max: -66 },
  },
  europe: {
    label: "Europe",
    bounds: { lat_min: 36, lon_min: -10, lat_max: 71, lon_max: 40 },
  },
  "middle-east": {
    label: "Middle East",
    bounds: { lat_min: 12, lon_min: 32, lat_max: 42, lon_max: 65 },
  },
  india: {
    label: "India",
    // Arabian Sea, Bay of Bengal, Indian Ocean approaches, Andaman Sea
    bounds: { lat_min: 0, lon_min: 55, lat_max: 28, lon_max: 100 },
  },
  pacific: {
    label: "Pacific",
    bounds: { lat_min: -10, lon_min: 100, lat_max: 55, lon_max: 180 },
  },
};

export const REGION_CENTER: Record<RegionKey, [number, number]> = {
  global: [20, 0],
  us: [38, -97],
  europe: [52, 15],
  "middle-east": [27, 48],
  india: [14, 77],
  pacific: [25, 140],
};

export const REGION_ZOOM: Record<RegionKey, number> = {
  global: 2,
  us: 4,
  europe: 4,
  "middle-east": 5,
  india: 4,
  pacific: 4,
};
