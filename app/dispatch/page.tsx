"use client";

import { useState } from "react";
import { useApi } from "../lib/use-api";

type TechItem = {
  name: string;
  revenueMTD: number;
  jobCount: number;
  commission: number;
  progressPct: number;
  thresholdGap: number;
  meetsThreshold: boolean;
};

type JobItem = {
  jobId: string;
  jobNumber: string;
  date: string;
  tech: string;
  trade: string;
  invoiceTotal: number;
  netSale: number;
};

type TechsData = { technicians: TechItem[]; updatedAt?: string };
type JobsData  = { jobs: JobItem[]; totals?: { count: number; invoiceTotal: number }; updatedAt?: string };

const tradeColors: Record<string, string> = {
  electrical: "text-yellow-400",
  hvac:       "text-blue-400",
  solar:      "text-orange-400",
  plumbing:   "text-cyan-400",
};

const tradeEmoji: Record<string, string> = {
  electrical: "⚡",
  hvac:       "❄️",
  solar:      "☀️",
  plumbing:   "🔧",
};

export default function Dispatch() {
  const [tab, setTab] = useState<"today" | "tomorrow" | "week">("today");

  const techs = useApi<TechsData>("/api/technicians", {});
  const jobs  = useApi<JobsData>("/api/jobs", { date: "today", mode: "schedule" });

  const loading = techs.loading || jobs.loading;

  const todayJobs   = jobs.data?.jobs ?? [];
  const techList    = techs.data?.technicians ?? [];

  // Group jobs by trade
  const byTrade = todayJobs.reduce<Record<string, JobItem[]>>((acc, job) => {
    const t = job.trade ?? "other";
    if (!acc[t]) acc[t] = [];
    acc[t].push(job);
    return acc;
  }, {});

  // Count jobs per tech
  const techJobCounts = todayJobs.reduce<Record<string, number>>((acc, job) => {
    if (job.tech) acc[job.tech] = (acc[job.tech] ?? 0) + 1;
    return acc;
  }, {});

  // Active techs today (have at least one job)
  const activeToday = Object.keys(techJobCounts).length;
  const totalJobs   = todayJobs.length;

  const updatedAt = jobs.data?.updatedAt ?? techs.data?.updatedAt;

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">DISPATCH BOARD</div>
        <div className="text-sm text-gray-400">
          Live · {new Date().toLocaleString("en-AU", { month: "long", year: "numeric" })}
          {updatedAt && <span className="ml-2 text-gray-600">· Updated {new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4">
        {(["today", "tomorrow", "week"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${
              tab === t
                ? "bg-white text-gray-900"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {t === "today" ? "TODAY" : t === "tomorrow" ? "TOMORROW" : "THIS WEEK"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Banner */}
              <div className="card card-blue mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  <div>
                    <div className="text-blue-400 font-black text-xl">{totalJobs} JOBS TODAY</div>
                    <div className="text-gray-300 text-sm">
                      {activeToday} active techs · {techList.length} total in roster
                    </div>
                  </div>
                </div>
              </div>

              {/* By Trade */}
              <div className="section-header">BY TRADE</div>
              <div className="card mb-4">
                {Object.entries(byTrade).map(([trade, tradeJobs], i) => {
                  const pct = totalJobs > 0 ? Math.round((tradeJobs.length / totalJobs) * 100) : 0;
                  return (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tradeEmoji[trade] ?? "🔩"}</span>
                          <span className="font-bold text-sm capitalize">{trade}</span>
                          <span className="text-gray-400 text-xs">{tradeJobs.length} jobs</span>
                        </div>
                        <span className="text-sm font-bold text-gray-300">{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill bg-blue-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(byTrade).length === 0 && (
                  <div className="text-gray-500 text-sm text-center py-2">No jobs loaded</div>
                )}
              </div>

              {/* Top techs by jobs today */}
              <div className="section-header">TECHS BY JOBS TODAY</div>
              <div className="space-y-2 mb-4">
                {techList
                  .filter(t => techJobCounts[t.name] > 0)
                  .sort((a, b) => (techJobCounts[b.name] ?? 0) - (techJobCounts[a.name] ?? 0))
                  .slice(0, 8)
                  .map((tech, i) => (
                    <div key={i} className="card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{tech.name}</div>
                          <div className="text-xs text-gray-400">${(tech.revenueMTD / 1000).toFixed(1)}k MTD</div>
                        </div>
                        <div className="text-blue-400 font-black text-xl">
                          {techJobCounts[tech.name] ?? 0} jobs
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Capacity Snapshot */}
              <div className="section-header">CAPACITY SNAPSHOT</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="card p-3 text-center">
                  <div className="text-blue-400 font-black text-2xl">{totalJobs}</div>
                  <div className="text-xs text-gray-400 mt-1">Jobs Scheduled</div>
                  <div className="text-xs text-blue-400 font-semibold">TODAY</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-green-400 font-black text-2xl">{activeToday}</div>
                  <div className="text-xs text-gray-400 mt-1">Techs Active</div>
                  <div className="text-xs text-green-400 font-semibold">WITH JOBS</div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === "tomorrow" && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-gray-400 font-semibold">Tomorrow view</div>
            <div className="text-gray-600 text-sm mt-1">Connect ServiceTitan scheduling for live tomorrow capacity</div>
          </div>
        </div>
      )}

      {tab === "week" && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-gray-400 font-semibold">Week view</div>
            <div className="text-gray-600 text-sm mt-1">Connect ServiceTitan for live week schedule</div>
          </div>
        </div>
      )}
    </div>
  );
}
