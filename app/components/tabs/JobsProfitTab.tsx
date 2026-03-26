"use client";

import { useState } from "react";
import { JOBS_PROFIT, METRICS } from "@/app/data/staticData";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "revenue" | "margin" | "matVariance" | "labourCost";

export default function JobsProfitTab() {
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showOnly, setShowOnly] = useState<"all" | "below15" | "positive">("all");

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const enriched = JOBS_PROFIT.map(j => ({
    ...j,
    matVariance: j.actMaterials - j.estMaterials,
    matVariancePct: ((j.actMaterials - j.estMaterials) / j.estMaterials) * 100,
    profit: j.revenue - j.actMaterials - j.labourCost,
  }));

  const filtered = enriched.filter(j => {
    if (showOnly === "below15") return j.margin < 15;
    if (showOnly === "positive") return j.margin >= 15;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortKey] as number;
    const vb = b[sortKey] as number;
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const below15Count = enriched.filter(j => j.margin < 15).length;
  const totalRevenue = enriched.reduce((s, j) => s + j.revenue, 0);
  const totalProfit  = enriched.reduce((s, j) => s + j.profit, 0);
  const avgMargin    = enriched.reduce((s, j) => s + j.margin, 0) / enriched.length;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ProfitKpi label="Jobs Shown"      value={enriched.length.toString()}          sub={`${below15Count} below 15% margin`} color="white"  />
        <ProfitKpi label="Total Revenue"   value={`$${(totalRevenue/1000).toFixed(0)}k`} sub="Sample 20 jobs"                  color="orange" />
        <ProfitKpi label="Avg Margin"      value={`${avgMargin.toFixed(1)}%`}          sub="Incl. negatives"                   color={avgMargin >= 15 ? "green" : "red"} />
        <ProfitKpi label="Below 15% Floor" value={`${below15Count}/${enriched.length}`} sub={`${METRICS.marginBelowFloorPct}% company-wide`} color="red" />
      </div>

      {/* Pricebook alert */}
      <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
        <div className="font-bold text-red-400 mb-1">🚨 Pricebook Crisis: {METRICS.marginBelowFloorPct}% of jobs below 15% margin</div>
        <div className="text-sm text-zinc-400">
          Labour rates and materials markups are not covering true costs. EBITDA is stuck at {METRICS.ebitdaActualPct}%.
          Every job below 15% margin destroys value. Fix the pricebook first — this is the #1 lever.
        </div>
      </div>

      {/* Filter + table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Job-by-Job Profit Analysis</div>
          <div className="flex gap-2">
            {(["all", "below15", "positive"] as const).map(f => (
              <button
                key={f}
                onClick={() => setShowOnly(f)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  showOnly === f
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                {f === "all" ? "All Jobs" : f === "below15" ? "⚠ Below 15%" : "✅ Above 15%"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Job</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Tech</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Type</th>
                <SortTh label="Revenue"   k="revenue"     current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Labour"    k="labourCost"  current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Mat Var"   k="matVariance" current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Margin %"  k="margin"      current={sortKey} dir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map(j => {
                const marginColor =
                  j.margin < 0    ? "text-red-500 font-black" :
                  j.margin < 15   ? "text-red-400 font-bold"  :
                  j.margin < 25   ? "text-amber-400"          :
                  "text-green-400";
                const varColor = j.matVariance > 0 ? "text-red-400" : "text-green-400";
                return (
                  <tr key={j.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${j.margin < 15 ? "bg-red-500/5" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{j.id}</td>
                    <td className="px-4 py-3 text-zinc-300 text-xs whitespace-nowrap">{j.tech}</td>
                    <td className="px-4 py-3 text-zinc-300 text-xs whitespace-nowrap">{j.type}</td>
                    <td className="px-4 py-3 text-orange-400 font-bold font-mono">${j.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono">${j.labourCost.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-mono ${varColor}`}>
                      {j.matVariance >= 0 ? "+" : ""}${j.matVariance}
                      <span className="text-xs ml-1">({j.matVariancePct >= 0 ? "+" : ""}{j.matVariancePct.toFixed(0)}%)</span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-right ${marginColor}`}>
                      {j.margin.toFixed(1)}%
                      {j.margin < 15 && <span className="ml-1">⚠</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-600">
          <span>Red rows = below 15% margin floor · Margin = (Revenue − Materials − Labour) ÷ Revenue</span>
          <span className="text-orange-400">Total profit this sample: ${totalProfit.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
}

function SortTh({ label, k, current, dir, onSort }: {
  label: string; k: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  return (
    <th onClick={() => onSort(k)} className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-orange-400 transition-colors select-none whitespace-nowrap">
      <span className="flex items-center justify-end gap-1">
        {label}
        {current === k
          ? (dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
          : <ChevronDown className="w-3 h-3 opacity-20" />
        }
      </span>
    </th>
  );
}

function ProfitKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
