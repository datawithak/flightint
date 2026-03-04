export interface IntelItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceShort: string;
  country: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: string;    // ISO string
  publishedMs: number;    // for sorting
}

export interface IntelFeedResult {
  items: IntelItem[];
  sources: Array<{
    id: string;
    name: string;
    status: "ok" | "error" | "empty";
    count: number;
    error?: string;
  }>;
  fetchedAt: number;
}
