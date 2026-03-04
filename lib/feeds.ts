import { FeedSource } from "@/constants/feeds";
import { IntelItem } from "@/types/intel";

const FETCH_TIMEOUT_MS = 8000;

// ─── XML helpers ─────────────────────────────────────────────────────────────

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirst(xml: string, ...tags: string[]): string {
  for (const tag of tags) {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = xml.match(re);
    if (m) return stripCdata(stripTags(m[1])).substring(0, 400);
  }
  return "";
}

function extractLink(xml: string): string {
  // RSS text node: <link>url</link>
  const text = xml.match(/<link>([^<]+)<\/link>/i);
  if (text) return text[1].trim();
  // Atom attribute: <link href="url" .../>
  const attr = xml.match(/<link[^>]+href="([^"]+)"/i);
  if (attr) return attr[1];
  // Fallback: <guid>
  const guid = xml.match(/<guid[^>]*>([^<]+)<\/guid>/i);
  return guid ? guid[1].trim() : "";
}

function parseDate(raw: string): { iso: string; ms: number } {
  if (!raw) return { iso: new Date().toISOString(), ms: Date.now() };
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return { iso: new Date().toISOString(), ms: Date.now() };
  return { iso: d.toISOString(), ms: d.getTime() };
}

function splitBlocks(xml: string, tag: "item" | "entry"): string[] {
  const re = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>`, "gi");
  return xml.match(re) ?? [];
}

// ─── RSS 2.0 parser ───────────────────────────────────────────────────────────

function parseRSS(xml: string, source: FeedSource): IntelItem[] {
  return splitBlocks(xml, "item")
    .slice(0, 12)
    .map((block, i) => {
      const title = extractFirst(block, "title") || "(no title)";
      const summary = extractFirst(block, "description", "content:encoded", "summary");
      const link = extractLink(block);
      const { iso, ms } = parseDate(extractFirst(block, "pubDate", "dc:date", "date"));
      return makeItem(source, i, title, summary, link, iso, ms);
    });
}

// ─── Atom parser ─────────────────────────────────────────────────────────────

function parseAtom(xml: string, source: FeedSource): IntelItem[] {
  return splitBlocks(xml, "entry")
    .slice(0, 12)
    .map((block, i) => {
      const title = extractFirst(block, "title") || "(no title)";
      const summary = extractFirst(block, "summary", "content", "description");
      const link = extractLink(block);
      const { iso, ms } = parseDate(extractFirst(block, "updated", "published", "date"));
      return makeItem(source, i, title, summary, link, iso, ms);
    });
}

// ─── MARAD HTML scraper ───────────────────────────────────────────────────────

function scrapeMARAD(html: string, source: FeedSource): IntelItem[] {
  const items: IntelItem[] = [];

  // Try article blocks first (Drupal structure)
  const articleRe = /<article[\s\S]*?<\/article>/gi;
  const articles = html.match(articleRe) ?? [];

  if (articles.length > 0) {
    for (let i = 0; i < Math.min(articles.length, 10); i++) {
      const block = articles[i];
      const titleM = block.match(/<h[234][^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
      const title = titleM ? titleM[1].trim() : `MARAD Alert ${i + 1}`;
      const hrefM = block.match(/<a\s+href="([^"]+)"/i);
      const href = hrefM ? hrefM[1] : "";
      const link = href.startsWith("http") ? href : `https://www.maritime.dot.gov${href}`;
      const timeM = block.match(/<time[^>]+datetime="([^"]+)"/i);
      const { iso, ms } = parseDate(timeM ? timeM[1] : "");
      const summaryM = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const summary = summaryM ? stripTags(summaryM[1]).substring(0, 300) : "MARAD Maritime Security Advisory";
      items.push(makeItem(source, i, title, summary, link, iso, ms));
    }
    return items;
  }

  // Fallback: any link whose href contains advisory/alert keywords
  const linkRe = /<a\s+href="([^"]*(?:msci|maritime-security|advisory|alert)[^"]*)"[^>]*>([^<]{10,150})<\/a>/gi;
  let m;
  let idx = 0;
  while ((m = linkRe.exec(html)) !== null && idx < 10) {
    const href = m[1];
    const link = href.startsWith("http") ? href : `https://www.maritime.dot.gov${href}`;
    const ms = Date.now() - idx * 86400000;
    items.push(makeItem(source, idx, m[2].trim(), "MARAD Maritime Security Advisory", link,
      new Date(ms).toISOString(), ms));
    idx++;
  }
  return items;
}

// ─── Generic press-release HTML scraper ──────────────────────────────────────

function scrapeGeneric(html: string, source: FeedSource, baseUrl: string): IntelItem[] {
  const items: IntelItem[] = [];
  const articleRe = /<(?:article|li)[^>]*class="[^"]*(?:news|press|release|item|article)[^"]*"[^>]*>([\s\S]*?)<\/(?:article|li)>/gi;
  let m;
  let idx = 0;
  while ((m = articleRe.exec(html)) !== null && idx < 10) {
    const block = m[1];
    const titleM = block.match(/<(?:h[1-6]|a)[^>]*>([\s\S]*?)<\/(?:h[1-6]|a)>/i);
    const title = titleM ? stripTags(titleM[1]).substring(0, 200) : "";
    if (!title || title.length < 5) continue;
    const hrefM = block.match(/<a\s+href="([^"]+)"/i);
    const href = hrefM ? hrefM[1] : "";
    const link = href.startsWith("http") ? href : `${baseUrl}${href}`;
    const timeM = block.match(/<time[^>]+datetime="([^"]+)"/i);
    const { iso, ms } = parseDate(timeM ? timeM[1] : "");
    items.push(makeItem(source, idx, title, "", link, iso, ms));
    idx++;
  }
  return items;
}

// ─── Item factory ─────────────────────────────────────────────────────────────

function makeItem(
  source: FeedSource, idx: number,
  title: string, summary: string, link: string,
  iso: string, ms: number
): IntelItem {
  return {
    id: `${source.id}-${ms}-${idx}`,
    sourceId: source.id,
    sourceName: source.name,
    sourceShort: source.short,
    country: source.country,
    title,
    summary: summary.substring(0, 300),
    link,
    publishedAt: iso,
    publishedMs: ms,
  };
}

// ─── HTTP fetch with timeout ──────────────────────────────────────────────────

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FlightInt/1.0 (public OSINT; educational use)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*",
      },
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Public: fetch one source ─────────────────────────────────────────────────

export async function fetchFeedSource(source: FeedSource): Promise<{
  items: IntelItem[];
  status: "ok" | "error" | "empty";
  error?: string;
}> {
  try {
    // 1. Try RSS/Atom URL
    if (source.rssUrl) {
      const text = await fetchWithTimeout(source.rssUrl);
      const isAtom = text.includes("<feed") || source.type === "atom";
      const items = isAtom ? parseAtom(text, source) : parseRSS(text, source);
      if (items.length > 0) return { items, status: "ok" };
    }

    // 2. Fall back to HTML scraping
    if (source.scrapeUrl) {
      const html = await fetchWithTimeout(source.scrapeUrl);
      const origin = new URL(source.scrapeUrl).origin;
      const items =
        source.id === "marad"
          ? scrapeMARAD(html, source)
          : scrapeGeneric(html, source, origin);
      return { items, status: items.length > 0 ? "ok" : "empty" };
    }

    return { items: [], status: "empty" };
  } catch (err) {
    return {
      items: [],
      status: "error",
      error: err instanceof Error ? err.message : "Unknown",
    };
  }
}
