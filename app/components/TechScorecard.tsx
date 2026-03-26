"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useApi } from "@/app/lib/use-api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface Tech {
  name: string;
  revenueMTD: number;
  jobCount: number;
  commission: number;
  meetsThreshold: boolean;
  progressPct: number;
  thresholdGap: number;
}
interface TechData { ok: boolean; technicians: Tech[]; commissionThreshold: number; updatedAt: string; }

type SortKey = "revenueMTD" | "jobCount" | "commission" | "progressPct";

const COLUMNS: { key: SortKey; label: string; fmt: (v: number) => string }[] = [
  { key: "revenueMTD",   label: "Revenue MTD",    fmt: v => `$${v.toLocaleString()}` },
  { key: "jobCount",     label: "Jobs",           fmt: v => `${v}` },
  { key: "commission",   label: "Commission",     fmt: v => `$${v.toLocaleString()}` },
  { key: "progressPct",  label: "Progress",       fmt: v => `${v}%` },
];

export default function TechScorecard() {
  const [sortKey, setSortKey] = useState<SortKey>("revenueMTD");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView]       = useState<"table" | "chart">("table");

  const { data, loading } = useApi<TechData>("/api/technicians", {});
  const techs = data?.technicians ?? [];

  const sorted = [...techs].sort((a, b) => {
    const diff = (a[sortKey] as number) - (b[sortKey] as number);
    return sortDir === "desc" ? -diff : diff;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-widest text-zinc-300">Technician Scorecards</div>
          {data?.updatedAt && <div className="text-xs text-zinc-600 mt-0.5">Updated {new Date(data.updatedAt).toLocaleTimeString()}</div>}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          <button onClick={() => setView("table")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "table" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>Table</button>
          <button onClick={() => setView("chart")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "chart" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>Chart</button>
        </div>
      </div>

      {loading ? (
        <div className="px-5 py-12 text-center text-zinc-600 text-sm animate-pulse">Loading live data…</div>
      ) : techs.length === 0 ? (
        <div className="px-5 py-8 text-center text-zinc-500 text-sm">No technician data available</div>
      ) : view === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                {COLUMNS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className="text-right px-3 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-orange-400 transition-colors select-none whitespace-nowrap">
                    <span className="flex items-center justify-end gap-1">
                      {col.label}
                      {sortKey === col.key
                        ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
                        : <ChevronDown className="w-3 h-3 opacity-20" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((tech, i) => (
                <tr key={tech.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                      {tech.name}
                      {tech.meetsThreshold && <span className="text-xs text-green-400 font-bold">✓</span>}
                    </div>
                  </td>
                  {COLUMNS.map(col => (
                    <td key={col.key} className={`px-3 py-3 text-right font-mono text-sm ${
                      col.key === "revenueMTD" ? "text-orange-400 font-bold" :
                      col.key === "commission" && tech.meetsThreshold ? "text-green-400" :
                      col.key === "commission" ? "text-zinc-500" :
                      "text-zinc-300"
                    }`}>
                      {col.fmt(tech[col.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sorted.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 80, left: 140, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 11 }} axisLine={false} tickLine={false} width={135} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                formatter={(v: ValueType | undefined) => [`$${Number(v ?? 0).toLocaleString()}`, "Revenue MTD"] as [string, string]} />
              <Bar dataKey="revenueMTD" fill="#FF4500" radius={[0, 4, 4, 0]}
                label={{ position: "right", formatter: (v: unknown) => `$${(Number(v ?? 0)/1000).toFixed(0)}k`, fill: "#9ca3af", fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
