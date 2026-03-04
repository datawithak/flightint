"use client";

import { IntelFeedResult, IntelItem } from "@/types/intel";

const SOURCE_COLORS: Record<string, string> = {
  dod: "bg-blue-700",
  centcom: "bg-green-700",
  eucom: "bg-indigo-700",
  indopacom: "bg-cyan-700",
  marad: "bg-orange-600",
  state: "bg-slate-500",
  navcent: "bg-blue-900",
  nato: "bg-blue-500",
  ukmod: "bg-red-700",
  idf: "bg-sky-700",
  francemod: "bg-violet-700",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

interface SourceStatusProps {
  sources: IntelFeedResult["sources"];
}

function SourceStatus({ sources }: SourceStatusProps) {
  return (
    <div className="px-4 py-2 border-b border-gray-800 flex flex-wrap gap-1.5">
      {sources.map((s) => (
        <div
          key={s.id}
          title={s.error ?? `${s.count} items`}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono ${
            s.status === "ok"
              ? "bg-gray-800 text-gray-300"
              : s.status === "empty"
              ? "bg-gray-900 text-gray-600"
              : "bg-gray-900 text-red-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              s.status === "ok" ? "bg-green-500" :
              s.status === "empty" ? "bg-gray-600" : "bg-red-500"
            }`}
          />
          {s.name}
          {s.status === "ok" && (
            <span className="text-gray-500">{s.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface ItemCardProps {
  item: IntelItem;
}

function ItemCard({ item }: ItemCardProps) {
  const color = SOURCE_COLORS[item.sourceId] ?? "bg-gray-700";

  return (
    <a
      href={item.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-4 py-3 border-b border-gray-800 hover:bg-gray-800/60 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${color} text-white shrink-0`}>
          {item.sourceShort}
        </span>
        <span className="text-gray-600 text-xs ml-auto shrink-0">{timeAgo(item.publishedAt)}</span>
      </div>
      <div className="text-gray-200 text-xs leading-snug group-hover:text-white transition-colors">
        {item.title}
      </div>
      {item.summary && (
        <div className="text-gray-500 text-xs mt-1 leading-snug line-clamp-2">
          {item.summary}
        </div>
      )}
    </a>
  );
}

interface Props {
  result: IntelFeedResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function IntelFeed({ result, loading, error, onRefresh }: Props) {
  if (loading && !result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-xs">Fetching intel feeds...</span>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <div className="text-red-400 text-xs">{error}</div>
        <button
          onClick={onRefresh}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const items = result?.items ?? [];
  const sources = result?.sources ?? [];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Source status row */}
      <SourceStatus sources={sources} />

      {/* Refresh + timestamp */}
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-gray-800 shrink-0">
        <span className="text-gray-600 text-xs">
          {result ? `${items.length} items` : ""}
          {result && loading ? " · refreshing..." : ""}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-gray-500 hover:text-white text-xs disabled:opacity-40 transition-colors"
          title="Refresh feeds"
        >
          ↻
        </button>
      </div>

      {/* Items */}
      <div className="overflow-y-auto flex-1">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-600 text-xs">
            No intel items found for this region.
            <br />
            <span className="text-gray-700">Some sources may be temporarily unavailable.</span>
          </div>
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>

      {/* Last updated */}
      {result && (
        <div className="px-4 py-2 border-t border-gray-800 text-gray-700 text-xs shrink-0">
          Updated {new Date(result.fetchedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
