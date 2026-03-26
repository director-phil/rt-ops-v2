'use client';
import { useState } from 'react';
import { useApi } from '../lib/use-api';

interface TechComm {
  name: string;
  grossJobsValue: number;
  netValue: number;
  totalCommission: number;
  jobCount: number;
  meetsThreshold: boolean;
  progressPct: number;
  thresholdGap: number;
}

interface CommData {
  ok: boolean;
  period: string;
  threshold: number;
  totalCommission: number;
  earnerCount: number;
  techCount: number;
  technicians: TechComm[];
  updatedAt: string;
}

const WEEK_OPTIONS = [
  { value: "week",      label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "week_2",    label: "2 Weeks Ago" },
  { value: "week_3",    label: "3 Weeks Ago" },
  { value: "week_4",    label: "4 Weeks Ago" },
];

const MONTH_OPTIONS = [
  { value: "mtd",        label: "Month to Date" },
  { value: "last_month", label: "Last Month" },
  { value: "month_2",    label: "2 Months Ago" },
  { value: "month_3",    label: "3 Months Ago" },
];

function fmt(n: number) {
  return (n || 0).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

export default function Commissions() {
  const [dateFilter, setDateFilter] = useState("mtd");
  const { data, loading, error } = useApi<CommData>("/api/commissions", { date: dateFilter });

  const techs = data?.technicians ?? [];
  const earners = techs.filter(t => t.meetsThreshold);
  const totalComm = data?.totalCommission ?? 0;
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).toLocaleString("en-AU") : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header + Period Selector */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Commission Calculator</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading ? "Loading…" : (data?.period ?? "—")} · Live from ServiceTitan
              {updatedAt && ` · ${updatedAt}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              {WEEK_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setDateFilter(o.value)}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border-r border-slate-700 last:border-0 ${
                    dateFilter === o.value
                      ? "bg-amber-500 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              {MONTH_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setDateFilter(o.value)}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border-r border-slate-700 last:border-0 ${
                    dateFilter === o.value
                      ? "bg-amber-500 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Commission</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {loading ? "…" : `$${totalComm.toFixed(2)}`}
            </div>
            <div className="text-xs text-slate-500 mt-1">Payable for period</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Earners</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{loading ? "…" : earners.length}</div>
            <div className="text-xs text-slate-500 mt-1">Above $80K threshold</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Below Threshold</div>
            <div className="text-2xl font-bold text-slate-400 mt-1">{loading ? "…" : techs.length - earners.length}</div>
            <div className="text-xs text-slate-500 mt-1">Not yet at $80K</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Payment</div>
            <div className="text-lg font-bold text-white mt-1">Weekly</div>
            <div className="text-xs text-slate-500 mt-1">Paid 1 month in arrears</div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6 text-xs text-slate-400 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><span className="text-white font-medium">Rate:</span> 1.5% doing + 1.5% selling</div>
          <div><span className="text-white font-medium">Threshold:</span> $80,000 monthly revenue</div>
          <div><span className="text-white font-medium">Blocked if:</span> margin &lt;15%, unpaid, callback</div>
          <div><span className="text-white font-medium">Payment:</span> Weekly, 1 month in arrears</div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center text-amber-400 animate-pulse">
            Loading commission data…
          </div>
        ) : error ? (
          <div className="bg-slate-900 rounded-xl border border-red-800 p-8 text-center text-red-400">{error}</div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Tech Commission — {data?.period}</div>
              <div className="text-xs text-slate-500">{techs.length} technicians</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-right px-4 py-3">Revenue</th>
                    <th className="text-right px-4 py-3">Jobs</th>
                    <th className="text-right px-4 py-3">Net Value</th>
                    <th className="text-right px-4 py-3">Commission</th>
                    <th className="text-right px-4 py-3">Progress</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...techs].sort((a, b) => b.grossJobsValue - a.grossJobsValue).map((t, i) => (
                    <tr key={t.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-white">
                        <span className="text-slate-600 text-xs mr-2">{i + 1}</span>
                        {t.name}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400 font-bold">${fmt(t.grossJobsValue)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{t.jobCount}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">${fmt(t.netValue)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        <span className={t.meetsThreshold ? "text-green-400" : "text-slate-500"}>
                          {t.meetsThreshold ? `$${t.totalCommission.toFixed(2)}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${t.meetsThreshold ? "bg-green-500" : "bg-amber-600"}`}
                              style={{ width: `${Math.min(t.progressPct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8">{t.progressPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.meetsThreshold ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">Earner ✓</span>
                        ) : (
                          <span className="text-xs text-slate-500">${fmt(t.thresholdGap)} to go</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
