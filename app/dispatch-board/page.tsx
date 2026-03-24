"use client";

import { useState } from "react";
import { DISPATCH_TECHS, TODAY_JOBS, TIME_SLOTS, DispatchTech, DispatchJob } from "../data/techs";
import Link from "next/link";

const TRADE_CONFIG = {
  electrical: { emoji: "⚡", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-300", badge: "bg-yellow-500", badgeText: "text-yellow-950", headerBg: "bg-yellow-500/10" },
  hvac: { emoji: "❄️", bg: "bg-teal-500/20", border: "border-teal-500/50", text: "text-teal-300", badge: "bg-teal-500", badgeText: "text-teal-950", headerBg: "bg-teal-500/10" },
  solar: { emoji: "☀️", bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-300", badge: "bg-orange-500", badgeText: "text-orange-950", headerBg: "bg-orange-500/10" },
  plumbing: { emoji: "🔧", bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-300", badge: "bg-blue-500", badgeText: "text-blue-950", headerBg: "bg-blue-500/10" },
};

const STATUS_CONFIG = {
  "on-job": { label: "On Job", dot: "bg-green-500", text: "text-green-400" },
  "driving": { label: "Driving", dot: "bg-blue-500 animate-pulse", text: "text-blue-400" },
  "available": { label: "Available", dot: "bg-gray-500", text: "text-gray-400" },
  "overloaded": { label: "Overloaded", dot: "bg-red-500 animate-pulse", text: "text-red-400" },
};

function TechCard({ tech, selected, onClick }: { tech: DispatchTech; selected: boolean; onClick: () => void }) {
  const cfg = TRADE_CONFIG[tech.trade];
  const sc = STATUS_CONFIG[tech.status];
  const utilPct = Math.min(Math.round((tech.hoursScheduled / tech.hoursCapacity) * 100), 999);
  const overloaded = tech.status === "overloaded";
  const extraHours = tech.hoursScheduled - tech.hoursCapacity;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-all ${selected ? `${cfg.bg} ${cfg.border}` : "bg-gray-900 border-gray-800 hover:border-gray-700"} ${overloaded ? "ring-1 ring-red-500/50" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center text-xs font-bold ${cfg.text} flex-shrink-0`}>
          {cfg.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{tech.shortName}</div>
          <div className={`flex items-center gap-1 text-xs ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
            {sc.label}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xs font-bold ${overloaded ? "text-red-400" : "text-gray-400"}`}>
            {overloaded ? `+${extraHours.toFixed(1)}h` : `${tech.hoursScheduled}h`}
          </div>
          <div className="text-gray-600 text-xs">{utilPct}%</div>
        </div>
      </div>
      {/* Mini bar */}
      <div className="mt-2 bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${overloaded ? "bg-red-500" : utilPct >= 90 ? "bg-yellow-500" : "bg-green-500"}`}
          style={{ width: `${Math.min(utilPct, 100)}%` }}
        />
      </div>
    </button>
  );
}

function JobCard({ job, highlighted }: { job: DispatchJob; highlighted: boolean }) {
  const cfg = TRADE_CONFIG[job.trade];
  const timeNum = parseInt(job.time.split(":")[0]);
  const timeLabel = timeNum < 12 ? `${job.time}am` : timeNum === 12 ? `${job.time}pm` : `${timeNum - 12}:${job.time.split(":")[1]}pm`;

  return (
    <div className={`rounded-lg border p-3 transition-all ${highlighted ? `${cfg.bg} ${cfg.border} ring-2 ring-white/20` : `bg-gray-900 border-gray-800`} ${job.priority === "urgent" ? "ring-1 ring-red-500/60" : ""}`}>
      {job.priority === "urgent" && (
        <div className="text-red-400 text-xs font-semibold mb-1">🚨 URGENT</div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white text-sm font-semibold">{job.customer}</span>
            <span className="text-gray-500 text-xs">· {job.suburb}</span>
          </div>
          <div className="text-gray-300 text-xs mt-0.5">{job.type}</div>
          <div className={`inline-flex items-center gap-1 text-xs mt-1.5 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.border} border ${cfg.text}`}>
            {cfg.emoji} {job.trade}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-white text-sm font-bold">{timeLabel}</div>
          <div className={`text-xs mt-0.5 ${cfg.text}`}>{job.tech}</div>
          <div className="text-gray-500 text-xs">{job.duration}h</div>
        </div>
      </div>
    </div>
  );
}

export default function DispatchBoard() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<"today" | "tomorrow">("today");

  const filteredJobs = selectedTech
    ? TODAY_JOBS.filter((j) => j.techSlug === selectedTech)
    : TODAY_JOBS;

  const overloadedTechs = DISPATCH_TECHS.filter((t) => t.status === "overloaded");
  const totalJobsToday = TODAY_JOBS.length;
  const totalOverloadHours = overloadedTechs.reduce((sum, t) => sum + (t.hoursScheduled - t.hoursCapacity), 0);

  const jobsInSlot = (slot: typeof TIME_SLOTS[0]) =>
    filteredJobs.filter((j) => slot.range.includes(j.time));

  // Stats
  const electricalJobs = TODAY_JOBS.filter(j => j.trade === "electrical").length;
  const hvacJobs = TODAY_JOBS.filter(j => j.trade === "hvac").length;
  const solarJobs = TODAY_JOBS.filter(j => j.trade === "solar").length;
  const plumbingJobs = TODAY_JOBS.filter(j => j.trade === "plumbing").length;

  // Tomorrow available techs (from business.ts logic)
  const tomorrowTechs = [
    { name: "Alex N.", trade: "electrical" as const, hours: 6.5 },
    { name: "David W.", trade: "hvac" as const, hours: 6.5 },
    { name: "Dean R.", trade: "electrical" as const, hours: 6.5 },
    { name: "Scott G.", trade: "solar" as const, hours: 5.0 },
    { name: "Lachlan H.", trade: "plumbing" as const, hours: 5.5 },
    { name: "Kyle R.", trade: "electrical" as const, hours: 6.0 },
    { name: "Zachary L.", trade: "hvac" as const, hours: 5.75 },
    { name: "Hayden S.", trade: "hvac" as const, hours: 4.75 },
    { name: "Rusty D.", trade: "plumbing" as const, hours: 5.75 },
    { name: "Romello M.", trade: "hvac" as const, hours: 6.0 },
    { name: "Bradley T.", trade: "hvac" as const, hours: 5.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-5 pb-4 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">📋 Dispatch Board</h1>
              <p className="text-gray-400 text-xs mt-0.5">Reliable Tradies · Live scheduling</p>
            </div>
            <Link href="/" className="text-gray-400 text-sm hover:text-white transition-colors">← Home</Link>
          </div>

          {/* Day selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDay("today")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeDay === "today" ? "bg-white text-gray-950" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Tue 24 Mar
              {overloadedTechs.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{overloadedTechs.length} overloaded</span>
              )}
            </button>
            <button
              onClick={() => setActiveDay("tomorrow")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeDay === "tomorrow" ? "bg-white text-gray-950" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Wed 25 Mar
              <span className="ml-2 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">63.8h open</span>
            </button>
          </div>
        </div>
      </div>

      {activeDay === "today" ? (
        <div className="max-w-screen-xl mx-auto">
          {/* Alert banner */}
          {overloadedTechs.length > 0 && (
            <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/40 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">🚨</span>
                <div>
                  <div className="text-red-300 font-semibold text-sm">
                    {overloadedTechs.length} techs overloaded today — {totalOverloadHours.toFixed(1)} excess hours
                  </div>
                  <div className="text-red-400/70 text-xs mt-0.5">
                    Overloaded: {overloadedTechs.map(t => t.shortName).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 px-4 mt-4">
            {[
              { trade: "electrical" as const, count: electricalJobs },
              { trade: "hvac" as const, count: hvacJobs },
              { trade: "solar" as const, count: solarJobs },
              { trade: "plumbing" as const, count: plumbingJobs },
            ].map(({ trade, count }) => {
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

          {/* Main layout: techs sidebar + jobs */}
          <div className="flex gap-0 lg:gap-4 mt-4 px-0 lg:px-4">
            {/* Techs column - horizontal scroll on mobile, sidebar on desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide px-1 mb-1">
                  Technicians ({DISPATCH_TECHS.length})
                </div>
                {selectedTech && (
                  <button
                    onClick={() => setSelectedTech(null)}
                    className="w-full text-xs text-blue-400 text-left px-1 mb-1 hover:text-blue-300"
                  >
                    × Clear filter
                  </button>
                )}
                {DISPATCH_TECHS.sort((a, b) => {
                  const order = { overloaded: 0, "on-job": 1, driving: 2, available: 3 };
                  return order[a.status] - order[b.status];
                }).map((tech) => (
                  <TechCard
                    key={tech.slug}
                    tech={tech}
                    selected={selectedTech === tech.slug}
                    onClick={() => setSelectedTech(selectedTech === tech.slug ? null : tech.slug)}
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
                {DISPATCH_TECHS.sort((a, b) => {
                  const order = { overloaded: 0, "on-job": 1, driving: 2, available: 3 };
                  return order[a.status] - order[b.status];
                }).map((tech) => {
                  const cfg = TRADE_CONFIG[tech.trade];
                  const sc = STATUS_CONFIG[tech.status];
                  return (
                    <button
                      key={tech.slug}
                      onClick={() => setSelectedTech(selectedTech === tech.slug ? null : tech.slug)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${selectedTech === tech.slug ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-gray-900 border-gray-700 text-gray-300"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
                      {cfg.emoji} {tech.shortName}
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
                    Showing jobs for <span className="text-white font-semibold">{DISPATCH_TECHS.find(t => t.slug === selectedTech)?.name}</span>
                    <button onClick={() => setSelectedTech(null)} className="ml-2 text-blue-400 text-xs hover:text-blue-300">× clear</button>
                  </span>
                </div>
              )}
              {TIME_SLOTS.map((slot) => {
                const jobs = jobsInSlot(slot);
                if (jobs.length === 0) return null;
                return (
                  <div key={slot.label} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{slot.label}</div>
                      <div className="flex-1 h-px bg-gray-800" />
                      <div className="text-gray-600 text-xs">{jobs.length} jobs</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          highlighted={selectedTech === job.techSlug}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredJobs.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  No jobs found for this technician today.
                </div>
              )}
              <div className="text-center text-gray-700 text-xs py-4">
                {totalJobsToday} total jobs today · Tap a tech to filter
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tomorrow view */
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
          <div className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="text-green-300 font-semibold">63.8 hours of open capacity Wednesday</div>
                <div className="text-green-400/70 text-sm mt-1">
                  11 techs available to fill — book jobs now to capture this revenue.
                  At avg $829/job and ~2h/job, this represents ~{Math.round(63.8 / 2)} jobs or ~${Math.round(63.8 / 2 * 829).toLocaleString()} potential revenue.
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Available Tomorrow</h2>
          <div className="space-y-2">
            {tomorrowTechs.map((tech) => {
              const cfg = TRADE_CONFIG[tech.trade];
              return (
                <div key={tech.name} className={`${cfg.bg} border ${cfg.border} rounded-xl p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cfg.emoji}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{tech.name}</div>
                      <div className={`text-xs ${cfg.text}`}>{tech.trade}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{tech.hours}h</div>
                    <div className="text-gray-500 text-xs">available</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">📊 Capacity Summary</h3>
            <div className="space-y-2">
              {[
                { trade: "electrical" as const, hours: 6.5 + 6.5 + 6.0, count: 3 },
                { trade: "hvac" as const, hours: 6.5 + 5.75 + 4.75 + 6.0 + 5.5, count: 5 },
                { trade: "solar" as const, hours: 5.0, count: 1 },
                { trade: "plumbing" as const, hours: 5.5 + 5.75, count: 2 },
              ].map(({ trade, hours, count }) => {
                const cfg = TRADE_CONFIG[trade];
                return (
                  <div key={trade} className="flex items-center justify-between">
                    <span className={`text-sm ${cfg.text}`}>{cfg.emoji} {trade} ({count} techs)</span>
                    <span className="text-white font-semibold text-sm">{hours.toFixed(1)}h open</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between">
                <span className="text-gray-400 font-semibold">Total</span>
                <span className="text-white font-bold">63.8h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
