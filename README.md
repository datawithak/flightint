# FLIGHTINT — Military Aircraft & Vessel Tracker

Live OSINT dashboard tracking military aircraft (ADS-B) and naval vessels (AIS) globally, with watchlist alerts and geofence filtering.

**Live:** https://flightint.vercel.app

---

## What it does

- **Real-time military aircraft** — pulls from [adsb.fi](https://opendata.adsb.fi/api/v2/mil), which serves ~260+ military aircraft broadcasting ADS-B globally (refreshes every 30s)
- **Naval vessel tracking** — AIS stream via [aisstream.io](https://aisstream.io) filtered to military/naval vessels by MMSI country code and name prefix (USS, USNS, HMS, INS, etc.) — refreshes every 60s
- **Watchlist alerts** — flags high-interest callsign prefixes (RIVET, JAKE, SENTRY, NIGHTW, SPAR, FORTE, LAGR, PETRO, SAM…) with mission tooltips and pulsing red ring on map
- **Geofence draw tool** — click two points on the map to draw a bounding box; filters both aircraft and vessels to that zone
- **Intel feed** — pulls publicly broadcast OSINT from DoD, CENTCOM, MARAD, UK MOD RSS feeds (refreshes every 5 min)
- **Regions** — Global, US, Europe, Middle East, Pacific, India

---

## Why Middle East sometimes shows no aircraft

This is expected and is itself intelligence. US and Israeli military aircraft suppress ADS-B transponders in active conflict zones (OPSEC). An empty Middle East map = military operations are running dark. Switch to Global to see ~260 aircraft, mostly US/NATO in training or logistics.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet + react-leaflet (CartoDB Voyager tiles) |
| Aircraft data | adsb.fi `/v2/mil` — free, no key, no cloud IP blocking |
| Vessel data | aisstream.io WebSocket — free tier |
| Intel feed | MARAD, CENTCOM, DoD, UK MOD RSS/Atom |
| Deployment | Vercel |

---

## Running locally

```bash
npm install
```

Create `.env.local`:
```
AISSTREAM_API_KEY=your_key_here
```

Get a free API key at [aisstream.io](https://aisstream.io).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variable: `AISSTREAM_API_KEY`
4. Deploy

If no AIS key is set, vessels fall back to demo data.

---

## Data sources

All data is **publicly broadcast** — no scraping, no paid APIs, no classified sources.

| Source | What | URL |
|---|---|---|
| adsb.fi | Military ADS-B transponders | https://opendata.adsb.fi/api/v2/mil |
| aisstream.io | AIS vessel position stream | https://aisstream.io |
| MARAD | Maritime security alerts | https://www.maritime.dot.gov/msci-feed |
| CENTCOM | US Central Command news | https://www.centcom.mil/RSS/ |
| DoD News | US Dept of Defense | https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx |
| UK MOD | UK Ministry of Defence | https://www.gov.uk/government/organisations/ministry-of-defence.atom |

---

## Watchlist callsigns

| Prefix | Mission |
|---|---|
| RIVET / JAKE | SIGINT — electronic eavesdropping & radar mapping |
| SENTRY | AWACS — airborne early warning & battle management |
| NIGHTW | COMMAND — doomsday command aircraft |
| SPAR / SAM | VIP — senior government/military transport |
| FORTE / HAWK | UAV — high-altitude surveillance drones |
| LAGR / NCHO | TANKER — aerial refueling |
| PETRO | STRIKE — B-2 bomber refueling ops |
