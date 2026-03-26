"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Job {
  jobId: string;
  jobNumber: string;
  date: string;
  tech: string;
  trade: string;
  invoiceTotal: number;
  netSale: number;
  labourHours: number;
  labourCost: number;
  estMaterials: number;
  actMaterials: number;
  matVariance: number;
  matVariancePct: number;
  matFlag: boolean;
  marginDollar: number;
  marginPct: number;
  marginFlag: boolean;
  effectiveRate: number | null;
}

interface JobsResponse {
  ok: boolean;
  period: string;
  jobs: Job[];
  totals: {
    jobs: number;
    totalRevenue: number;
    totalNetSale: number;
    totalLabourCost: number;
    totalMaterials: number;
    totalMarginDollar: number;
    avgMarginPct: number;
    below15Count: number;
    matFlagCount: number;
  };
  noData?: boolean;
  updatedAt: string;
  source: string;
  error?: string;
}

type SortKey = "invoiceTotal" | "marginPct" | "matVariancePct" | "labourCost";

export default function JobsProfitTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const date  = params.get("date") || "mtd";
  const trade = params.get("trade") || "all";
  const staff = params.get("staff") || "All Staff";

  const { data, loading, error, updatedAt } =
    useApi<JobsResponse>("/api/jobs", { date, trade, staff }, refreshKey);

  const [sortKey, setSortKey] = useState<SortKey>("marginPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showOnly, setShowOnly] = useState<"all" | "below15" | "matFlag">("all");

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const jobs = data?.jobs || [];
  const totals = data?.totals;

  const filtered = jobs.filter(j => {
    if (showOnly === "below15") return j.marginFlag;
    if (showOnly === "matFlag") return j.matFlag;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortKey] as number;
    const vb = b[sortKey] as number;
    return sortDir === "asc" ? va - vb : vb - va;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary */}
      <DataPanel
        title={`Jobs Profitability · ${data?.period || date.toUpperCase()}`}
        source="ServiceTitan"
        updatedAt={updatedAt}
        loading={loading}
        error={error}
      >
        {totals && (
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <ProfitKpi label="Total Jobs"       value={String(totals.jobs)}                         sub="Completed" color="white" />
              <ProfitKpi label="Total Revenue"    value={`$${(totals.totalRevenue/1000).toFixed(0)}k`} sub="Gross invoiced" color="orange" />
              <ProfitKpi label="Avg Margin"       value={`${totals.avgMarginPct}%`}                   sub="All jobs" color={totals.avgMarginPct >= 15 ? "green" : "red"} />
              <ProfitKpi label="Below 15% Floor"  value={`${totals.below15Count}/${totals.jobs}`}     sub={`${totals.matFlagCount} mat overruns`} color="red" />
            </div>

            {totals.below15Count > 0 && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-4">
                <div className="font-bold text-red-400">🚨 {totals.below15Count} jobs below 15% margin floor</div>
                <div className="text-sm text-zinc-400 mt-0.5">
                  These jobs are destroying value. Review pricebook and labour rates urgently.
                </div>
              </div>
            )}

            {/* Filter buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {(["all", "below15", "matFlag"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setShowOnly(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    showOnly === f ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? `All Jobs (${jobs.length})` : f === "below15" ? `⚠ Below 15% (${totals.below15Count})` : `🔴 Mat Overruns (${totals.matFlagCount})`}
                </button>
              ))}
            </div>

            {data?.noData ? (
              <div className="text-center text-zinc-600 py-8">No data for period — try a different date range</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-800/30">
                      <th className="text-left px-3 py-3 font-bold uppercase text-zinc-500">Job #</th>
                      <th className="text-left px-3 py-3 font-bold uppercase text-zinc-500">Date</th>
                      <th className="text-left px-3 py-3 font-bold uppercase text-zinc-500">Tech</th>
                      <th className="text-left px-3 py-3 font-bold uppercase text-zinc-500">Trade</th>
                      <SortTh label="Invoice" k="invoiceTotal" current={sortKey} dir={sortDir} onSort={handleSort} />
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Net (×0.95)</th>
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Hrs</th>
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Labour $</th>
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Est Mat</th>
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Act Mat</th>
                      <SortTh label="Mat Var" k="matVariancePct" current={sortKey} dir={sortDir} onSort={handleSort} />
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">Margin $</th>
                      <SortTh label="Margin %" k="marginPct" current={sortKey} dir={sortDir} onSort={handleSort} />
                      <th className="text-right px-3 py-3 font-bold uppercase text-zinc-500">$/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(j => {
                      const marginColor = j.marginPct < 0 ? "text-red-500 font-black" : j.marginFlag ? "text-red-400 font-bold" : j.marginPct < 25 ? "text-amber-400" : "text-green-400";
                      const matColor = j.matFlag ? "text-red-400 font-bold" : j.matVariance > 0 ? "text-amber-400" : "text-green-400";
                      return (
                        <tr key={j.jobId} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 ${j.marginFlag ? "bg-red-500/5" : ""}`}>
                          <td className="px-3 py-2.5 font-mono text-zinc-500">{j.jobNumber}</td>
                          <td className="px-3 py-2.5 text-zinc-500">{j.date ? new Date(j.date).toLocaleDateString("en-AU", { day: "2-digit", month: "short" }) : "—"}</td>
                          <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{j.tech}</td>
                          <td className="px-3 py-2.5 text-zinc-400">{j.trade}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-orange-400 font-bold">${j.invoiceTotal.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-400">${j.netSale.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-400">{j.labourHours}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-400">${j.labourCost.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-500">${j.estMaterials.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-400">${j.actMaterials.toLocaleString()}</td>
                          <td className={`px-3 py-2.5 text-right font-mono ${matColor}`}>
                            {j.matVariance >= 0 ? "+" : ""}${j.matVariance.toLocaleString()}
                            <span className="opacity-60 ml-1">({j.matVariancePct >= 0 ? "+" : ""}{j.matVariancePct}%)</span>
                            {j.matFlag && " 🔴"}
                          </td>
                          <td className={`px-3 py-2.5 text-right font-mono ${j.marginDollar < 0 ? "text-red-500" : "text-zinc-300"}`}>${j.marginDollar.toLocaleString()}</td>
                          <td className={`px-3 py-2.5 text-right font-mono ${marginColor}`}>
                            {j.marginPct.toFixed(1)}%{j.marginFlag && " ⚠"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-zinc-500">
                            {j.effectiveRate ? `$${j.effectiveRate}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals row */}
                  {totals && sorted.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-zinc-700 bg-zinc-800/40 font-bold">
                        <td colSpan={4} className="px-3 py-3 text-zinc-400">TOTAL ({sorted.length} jobs)</td>
                        <td className="px-3 py-3 text-right font-mono text-orange-400">
                          ${sorted.reduce((s, j) => s + j.invoiceTotal, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          ${sorted.reduce((s, j) => s + j.netSale, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          {sorted.reduce((s, j) => s + j.labourHours, 0).toFixed(0)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          ${sorted.reduce((s, j) => s + j.labourCost, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-500">
                          ${sorted.reduce((s, j) => s + j.estMaterials, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          ${sorted.reduce((s, j) => s + j.actMaterials, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">—</td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          ${sorted.reduce((s, j) => s + j.marginDollar, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-zinc-400">
                          {sorted.length > 0 ? (sorted.reduce((s, j) => s + j.marginPct, 0) / sorted.length).toFixed(1) : "—"}%
                        </td>
                        <td className="px-3 py-3">—</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}
      </DataPanel>

    </div>
  );
}

function SortTh({ label, k, current, dir, onSort }: {
  label: string; k: SortKey; current: SortKey; dir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  return (
    <th onClick={() => onSort(k)} className="text-right px-3 py-3 text-xs font-bold uppercase text-zinc-500 cursor-pointer hover:text-orange-400 select-none whitespace-nowrap">
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
