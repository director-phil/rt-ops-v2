"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { useApi } from "@/app/lib/use-api";

interface TechData { technicians: { name: string }[] }

const DATE_OPTIONS = [
  { value: "today",     label: "Today" },
  { value: "week",      label: "This Week" },
  { value: "mtd",       label: "Month to Date" },
  { value: "last_month",label: "Last Month" },
  { value: "custom",    label: "Custom Range" },
];

const TRADE_OPTIONS = [
  { value: "all",        label: "All Trades" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac",       label: "AC-HVAC" },
  { value: "plumbing",   label: "Plumbing" },
  { value: "solar",      label: "Solar" },
];

interface FilterBarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  onFilterChange?: () => void;
}

export default function FilterBar({ onRefresh, refreshing, onFilterChange }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { data: techData } = useApi<TechData>("/api/technicians", {});
  const staffMembers = ["All Staff", ...(techData?.technicians?.map(t => t.name) ?? [])];

  const date     = params.get("date")   || "mtd";
  const trade    = params.get("trade")  || "all";
  const staff    = params.get("staff")  || "All Staff";

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    p.set(key, value);
    router.push(`${pathname}?${p.toString()}`);
    // Notify parent to show loading spinner and re-fetch
    onFilterChange?.();
  }, [params, pathname, router, onFilterChange]);

  return (
    <div className="sticky top-0 z-50 flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 flex-wrap"
         style={{ background: "#0a0a0a" }}>
      {/* Date filter */}
      <div className="relative">
        <select
          value={date}
          onChange={e => setParam("date", e.target.value)}
          className="appearance-none bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors"
        >
          {DATE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>

      {/* Trade filter */}
      <div className="relative">
        <select
          value={trade}
          onChange={e => setParam("trade", e.target.value)}
          className="appearance-none bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors"
        >
          {TRADE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>

      {/* Staff filter */}
      <div className="relative">
        <select
          value={staff}
          onChange={e => setParam("staff", e.target.value)}
          className="appearance-none bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-3 pr-8 py-2 cursor-pointer hover:border-orange-500 focus:outline-none focus:border-orange-500 transition-colors"
        >
          {staffMembers.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 hover:border-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
}
