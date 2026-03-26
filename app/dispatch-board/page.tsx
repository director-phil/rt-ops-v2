"use client";

import { useState } from "react";
import { useApi } from "../lib/use-api";
import Link from "next/link";

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

const TRADE_CONFIG = {
  electrical: { emoji: "⚡", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-300", headerBg: "bg-yellow-500/10" },
  hvac:       { emoji: "❄️", bg: "bg-teal-500/20",   border: "border-teal-500/50",   text: "text-teal-300",   headerBg: "bg-teal-500/10"   },
  solar:      { emoji: "☀️", bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-300", headerBg: "bg-orange-500/10" },
  plumbing:   { emoji: "🔧", bg: "bg-blue-500/20",   border: "border-blue-500/50",   text: "text-blue-300",   headerBg: "bg-blue-500/10"   },
} as const;

type TradeKey = keyof typeof TRADE_CONFIG;

function tradeCfg(trade: string) {
  return TRADE_CONFIG[trade as TradeKey] ?? {
    emoji: "🔩", bg: "bg-gray-500/20", border: "border-gray-500/50", text: "text-gray-300", headerBg: "bg-gray-500/10"
  };
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function shortName(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function TechCard({
  tech, jobCount, selected, onClick,
}: {
  tech: TechItem; jobCount: number; selected: boolean; onClick: () => void;
}) {
  const isActive = jobCount > 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-all ${
        selected ? "bg-orange-500/20 border-orange-500/50" : "bg-gray-900 border-gray-800 hover:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-xs font-bold text-orange-300 flex-shrink-0">
          {tech.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{shortName(tech.name)}</div>
          <div className={`text-xs ${isActive ? "text-green-400" : "text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${isActive ? "bg-green-500" : "bg-gray-600"}`} />
            {isActive ? `${jobCount} jobs` : "no jobs"}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-bold text-orange-400">${(tech.revenueMTD / 1000).toFixed(0)}k</div>
          <div className="text-gray-600 text-xs">{tech.progressPct?.toFixed(0)}%</div>
        </div>
      </div>
      <div className="mt-2 bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${tech.meetsThreshold ? "bg-green-500" : tech.progressPct >= 75 ? "bg-yellow-500" : "bg-orange-500"}`}
          style={{ width: `${Math.min(tech.progressPct ?? 0, 100)}%` }}
        />
      </div>
    </button>
  );
}

function JobCard({ job, highlighted }: { job: JobItem; highlighted: boolean }) {
  const cfg = tradeCfg(job.trade);
  return (
    <div className={`rounded-lg border p-3 transition-all ${
      highlighted ? `${cfg.bg} ${cfg.border} ring-2 ring-white/20` : "bg-gray-900 border-gray-800"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold">{job.jobNumber}</div>
          <div className={`inline-flex items-center gap-1 text-xs mt-1.5 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.border} border ${cfg.text}`}>
            {cfg.emoji} {job.trade}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-white text-sm font-bold">${job.invoiceTotal.toLocaleString()}</div>
          <div className={`text-xs mt-0.5 ${cfg.text}`}>{job.tech || "—"}</div>
        </div>
      </div>
    </div>
  );
}

export default function DispatchBoard() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<"today" | "tomorrow">("today");

  const techs = useApi<TechsData>("/api/technicians", {});
  const jobs  = useApi<JobsData>("/api/jobs", { date: "today" });

  const loading = techs.loading || jobs.loading;

  const allJobs  = jobs.data?.jobs ?? [];
  const techList = techs.data?.technicians ?? [];

  // Count jobs per tech name
  const jobsPerTech = allJobs.reduce<Record<string, number>>((acc, j) => {
    if (j.tech) acc[j.tech] = (acc[j.tech] ?? 0) + 1;
    return acc;
  }, {});

  const filteredJobs = selectedTech
    ? allJobs.filter(j => slugify(j.tech ?? "") === selectedTech)
    : allJobs;

  // Group jobs by trade
  const trades = Array.from(new Set(filteredJobs.map(j => j.trade))).sort();

  const jobsByTrade = trades.reduce<Record<string, JobItem[]>>((acc, t) => {
    acc[t] = filteredJobs.filter(j => j.trade === t);
    return acc;
  }, {});

  const sortedTechs = [...techList].sort((a, b) => (jobsPerTech[b.name] ?? 0) - (jobsPerTech[a.name] ?? 0));

  const updatedAt = jobs.data?.updatedAt ?? techs.data?.updatedAt;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-5 pb-4 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">📋 Dispatch Board</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Reliable Tradies · Live scheduling
                {updatedAt && ` · ${new Date(updatedAt).toLocaleString()}`}
              </p>
            </div>
            <Link href="/" className="text-gray-400 text-sm hover:text-white transition-colors">← Home</Link>
          </div>

          {/* Day selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDay("today")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeDay === "today" ? "bg-white text-gray-950" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Today
              {!loading && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{allJobs.length} jobs</span>
              )}
            </button>
            <button
              onClick={() => setActiveDay("tomorrow")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeDay === "tomorrow" ? "bg-white text-gray-950" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Tomorrow
            </button>
          </div>
        </div>
      </div>

      {activeDay === "today" ? (
        loading ? (
          <div className="max-w-screen-xl mx-auto px-4 pt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="max-w-screen-xl mx-auto">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 px-4 mt-4">
              {(["electrical", "hvac", "solar", "plumbing"] as const).map(trade => {
                const count = allJobs.filter(j => j.trade === trade).length;
                const cfg = TRADE_CONFIG[trade];
                return (
                  <div key={trade} className={`${cfg.bg} border ${cfg.border} rounded-lg p-2 text-center`}>
                    <div className="text-lg">{cfg.emoji}</div>
                    <div className={`font-bold text-sm ${cfg.text}`}>{count}</div>
                    <div className="text-gray-500 text-xs">jobs</div>
                  </div>
                );
              })}
            </div>

            {/* Main layout */}
            <div className="flex gap-0 lg:gap-4 mt-4 px-0 lg:px-4">
              {/* Desktop tech sidebar */}
              <div className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-28 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide px-1 mb-1">
                    Technicians ({techList.length})
                  </div>
                  {selectedTech && (
                    <button
                      onClick={() => setSelectedTech(null)}
                      className="w-full text-xs text-blue-400 text-left px-1 mb-1 hover:text-blue-300"
                    >
                      × Clear filter
                    </button>
                  )}
                  {sortedTechs.map(tech => (
                    <TechCard
                      key={tech.name}
                      tech={tech}
                      jobCount={jobsPerTech[tech.name] ?? 0}
                      selected={selectedTech === slugify(tech.name)}
                      onClick={() => setSelectedTech(selectedTech === slugify(tech.name) ? null : slugify(tech.name))}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile tech strip */}
              <div className="lg:hidden w-full overflow-x-auto px-4 pb-2">
                <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                  {selectedTech && (
                    <button
                      onClick={() => setSelectedTech(null)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-800 text-blue-400 text-xs border border-blue-500/40"
                    >
                      × All
                    </button>
                  )}
                  {sortedTechs.map(tech => {
                    const slug = slugify(tech.name);
                    const isSelected = selectedTech === slug;
                    const count = jobsPerTech[tech.name] ?? 0;
                    return (
                      <button
                        key={tech.name}
                        onClick={() => setSelectedTech(isSelected ? null : slug)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          isSelected ? "bg-orange-500/20 border-orange-500/50 text-orange-300" : "bg-gray-900 border-gray-700 text-gray-300"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${count > 0 ? "bg-green-500" : "bg-gray-600"}`} />
                        {shortName(tech.name)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jobs board */}
              <div className="flex-1 px-4 lg:px-0 pb-8 mt-2 lg:mt-0">
                {selectedTech && (
                  <div className="mb-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-sm">
                      Showing jobs for{" "}
                      <span className="text-white font-semibold">
                        {techList.find(t => slugify(t.name) === selectedTech)?.name}
                      </span>
                      <button onClick={() => setSelectedTech(null)} className="ml-2 text-blue-400 text-xs hover:text-blue-300">× clear</button>
                    </span>
                  </div>
                )}

                {trades.map(trade => {
                  const tradeJobs = jobsByTrade[trade];
                  if (!tradeJobs?.length) return null;
                  const cfg = tradeCfg(trade);
                  return (
                    <div key={trade} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                          {cfg.emoji} {trade}
                        </div>
                        <div className="flex-1 h-px bg-gray-800" />
                        <div className="text-gray-600 text-xs">{tradeJobs.length} jobs</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {tradeJobs.map(job => (
                          <JobCard
                            key={job.jobId}
                            job={job}
                            highlighted={selectedTech === slugify(job.tech ?? "")}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredJobs.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    {selectedTech ? "No jobs for this technician today." : "No jobs loaded."}
                  </div>
                )}

                <div className="text-center text-gray-700 text-xs py-4">
                  {allJobs.length} total jobs today · Tap a tech to filter
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Tomorrow view */
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-gray-400 font-semibold">Tomorrow&apos;s schedule</div>
            <div className="text-gray-600 text-sm mt-1">
              Live scheduling data for tomorrow will appear here once ServiceTitan scheduling integration is connected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
