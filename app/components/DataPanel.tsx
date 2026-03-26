"use client";

import { Loader2 } from "lucide-react";

interface DataPanelProps {
  title: string;
  source: string;
  updatedAt: string | null;
  loading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

function formatSync(ts: string | null): string {
  if (!ts) return "Never";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-AU");
}

function freshnessColor(ts: string | null): string {
  if (!ts) return "text-zinc-600";
  const diffMin = (new Date().getTime() - new Date(ts).getTime()) / 60000;
  if (diffMin < 5)  return "text-green-400";
  if (diffMin < 30) return "text-amber-400";
  return "text-red-400";
}

export default function DataPanel({ title, source, updatedAt, loading, error, children, className = "", badge }: DataPanelProps) {
  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden ${error ? "border-red-500/60" : "border-zinc-800"} ${className}`}>
      {/* Header */}
      <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${error ? "border-red-500/40 bg-red-500/5" : "border-zinc-800"}`}>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</div>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
          {badge}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-600 hidden sm:inline">Source: {source}</span>
          {error
            ? <span className="text-red-400 font-medium">⚠ API error — data may be stale</span>
            : <span className={`${freshnessColor(updatedAt)}`}>
                Last synced: {formatSync(updatedAt)}
              </span>
          }
        </div>
      </div>

      {/* Body */}
      {loading && !error ? (
        <div className="flex items-center justify-center py-12 text-zinc-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center">
          <div className="text-red-400 font-semibold mb-1">Data unavailable — refresh to retry</div>
          <div className="text-xs text-zinc-600 font-mono">{error}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// KPI card with prev month comparison
interface KpiCompareProps {
  label: string;
  value: string;
  prevValue?: string | null;
  change?: number | null;
  changePct?: number | null;
  icon?: string;
  accent?: boolean;
  loading?: boolean;
}

export function KpiCompare({ label, value, prevValue, change, changePct, icon, accent, loading }: KpiCompareProps) {
  const isPositive = (change || 0) > 0;
  const isNegative = (change || 0) < 0;

  return (
    <div className={`rounded-xl p-4 border flex flex-col gap-1 ${accent ? "bg-orange-500/10 border-orange-500/30" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-base">{icon}</span>}
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 truncate">{label}</div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
          <span className="text-xs text-zinc-600">Loading...</span>
        </div>
      ) : (
        <>
          <div className={`text-2xl font-black leading-none ${accent ? "text-orange-400" : "text-white"}`}>{value}</div>
          {(change !== null && change !== undefined && prevValue) && (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className={`text-xs font-bold ${isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-zinc-500"}`}>
                {isPositive ? "↑" : isNegative ? "↓" : "→"}
                {" "}{change < 0 ? "-" : "+"}${Math.abs(change).toLocaleString()}
                {changePct !== null && changePct !== undefined && ` (${changePct > 0 ? "+" : ""}${changePct}%)`}
              </span>
              <span className="text-xs text-zinc-600">vs {prevValue}</span>
            </div>
          )}
          {!change && prevValue && (
            <div className="text-xs text-zinc-600 mt-0.5">vs {prevValue}</div>
          )}
        </>
      )}
    </div>
  );
}
