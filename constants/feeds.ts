import { RegionKey } from "@/types/flight";

export interface FeedSource {
  id: string;
  name: string;
  short: string;        // badge label
  country: string;      // for flag/label
  rssUrl?: string;      // RSS 2.0 or Atom feed
  scrapeUrl?: string;   // fallback HTML page
  color: string;        // tailwind bg class for badge
  regions: RegionKey[]; // which region filters show this source
  type: "rss" | "atom" | "scrape";
}

export const FEED_SOURCES: FeedSource[] = [
  // ── US Combatant Commands ─────────────────────────────────────
  {
    id: "dod",
    name: "US Dept of Defense",
    short: "DoD",
    country: "US",
    // DNN CMS RSS pattern used on defense.gov
    rssUrl: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1&max=20",
    color: "bg-blue-700",
    regions: ["global", "us", "middle-east", "europe", "pacific"],
    type: "rss",
  },
  {
    id: "centcom",
    name: "US Central Command",
    short: "CENTCOM",
    country: "US",
    // CENTCOM covers Middle East + Central Asia (21 countries)
    rssUrl: "https://www.centcom.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1058&max=20",
    scrapeUrl: "https://www.centcom.mil/MEDIA/PRESS-RELEASES/",
    color: "bg-green-700",
    regions: ["middle-east"],
    type: "rss",
  },
  {
    id: "eucom",
    name: "US European Command",
    short: "EUCOM",
    country: "US",
    rssUrl: "https://www.eucom.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=XX&max=20",
    scrapeUrl: "https://www.eucom.mil/media-gallery/press-releases",
    color: "bg-indigo-700",
    regions: ["europe"],
    type: "rss",
  },
  {
    id: "indopacom",
    name: "US Indo-Pacific Command",
    short: "INDOPACOM",
    country: "US",
    rssUrl: "https://www.pacom.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=1&max=20",
    scrapeUrl: "https://www.pacom.mil/Media/Press-Releases-and-Readouts/",
    color: "bg-cyan-700",
    regions: ["pacific"],
    type: "rss",
  },

  // ── US Maritime / State ────────────────────────────────────────
  {
    id: "marad",
    name: "MARAD Maritime Security",
    short: "MARAD",
    country: "US",
    // No RSS — scrape the HTML alert list
    scrapeUrl: "https://www.maritime.dot.gov/msci-alerts",
    color: "bg-orange-600",
    regions: ["global", "middle-east", "pacific"],
    type: "scrape",
  },
  {
    id: "state",
    name: "US State Dept",
    short: "State",
    country: "US",
    // WordPress REST feed
    rssUrl: "https://www.state.gov/category/press-releases/feed/",
    color: "bg-slate-600",
    regions: ["global", "us", "middle-east", "europe", "pacific"],
    type: "rss",
  },
  {
    id: "navcent",
    name: "US Naval Forces Central Command",
    short: "NAVCENT",
    country: "US",
    scrapeUrl: "https://www.cusnc.navy.mil/Media/News/",
    color: "bg-blue-900",
    regions: ["middle-east"],
    type: "scrape",
  },

  // ── Allied / International ─────────────────────────────────────
  {
    id: "nato",
    name: "NATO",
    short: "NATO",
    country: "NATO",
    rssUrl: "https://www.nato.int/cps/en/natohq/news_rss.xml",
    color: "bg-blue-500",
    regions: ["global", "europe", "middle-east"],
    type: "rss",
  },
  {
    id: "ukmod",
    name: "UK Ministry of Defence",
    short: "UK MOD",
    country: "UK",
    // GOV.UK uses standard Atom for all departments
    rssUrl: "https://www.gov.uk/government/organisations/ministry-of-defence.atom",
    color: "bg-red-700",
    regions: ["global", "middle-east", "europe"],
    type: "atom",
  },
  {
    id: "idf",
    name: "Israel Defense Forces",
    short: "IDF",
    country: "IL",
    rssUrl: "https://www.idf.il/en/rss/",
    scrapeUrl: "https://www.idf.il/en/press-releases/",
    color: "bg-sky-700",
    regions: ["middle-east"],
    type: "rss",
  },
  {
    id: "francemod",
    name: "French Ministry of Armed Forces",
    short: "FR MoD",
    country: "FR",
    rssUrl: "https://www.defense.gouv.fr/feed",
    color: "bg-violet-700",
    regions: ["global", "middle-east", "europe"],
    type: "rss",
  },
];

// Which sources to show per region
export function getSourcesForRegion(region: RegionKey): FeedSource[] {
  return FEED_SOURCES.filter((s) => s.regions.includes(region));
}
