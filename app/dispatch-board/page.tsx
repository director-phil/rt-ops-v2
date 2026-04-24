"use client";

import { useState, useCallback } from "react";
import { useApi } from "../lib/use-api";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppointmentSchedule = {
  appointmentId: number;
  jobId: number;
  jobNumber: string;
  start: string;
  end: string;
  arrivalWindow: string;
  status: string;
  address: string;
  suburb: string;
  lat: number;
  lng: number;
  trade: string;
  estimatedRevenue: number;
  driveMinutesFromPrev: number | null;
  bufferMinutesFromPrev: number | null;
  bufferTight: boolean;
};

type TechSchedule = {
  tech: string;
  appointments: AppointmentSchedule[];
  summary: {
    jobCount: number;
    estimatedRevenue: number;
    totalDriveMinutes: number;
    tightBufferCount: number;
  };
};

type ScheduleData = {
  ok: boolean;
  date: string;
  label: string;
  companySummary: {
    totalJobs: number;
    totalEstRevenue: number;
    techsWorking: number;
    avgDriveMinutes: number;
    totalTightBuffers: number;
  } | null;
  techSchedules: TechSchedule[];
  updatedAt: string;
};

// ─── Config ──────────────────────────────────────────────────────────────────

const TRADE_CONFIG: Record<string, { emoji: string; bg: string; border: string; text: string }> = {
  electrical: { emoji: "⚡", bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-300" },
  hvac:       { emoji: "❄️", bg: "bg-teal-500/15",   border: "border-teal-500/40",   text: "text-teal-300"   },
  solar:      { emoji: "☀️", bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-300" },
  plumbing:   { emoji: "🔧", bg: "bg-blue-500/15",   border: "border-blue-500/40",   text: "text-blue-300"   },
  other:      { emoji: "🔩", bg: "bg-gray-500/15",   border: "border-gray-500/40",   text: "text-gray-400"   },
};

function tradeCfg(trade: string) {
  return TRADE_CONFIG[trade] ?? TRADE_CONFIG.other;
}

function shortName(name: string) {
  const parts = name.trim().split(" ");
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function initials(name: string) {
  return name.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function fmtRevenue(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

function fmtDrive(mins: number | null) {
  if (mins === null) return null;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function statusDot(status: string) {
  if (status === "Done")       return "bg-green-500";
  if (status === "InProgress" || status === "Dispatched") return "bg-blue-400 animate-pulse";
  return "bg-gray-500";
}

// ─── Today date helper ───────────────────────────────────────────────────────
function todayAEST() {
  const d = new Date(Date.now() + 10 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function tomorrowAEST() {
  const d = new Date(Date.now() + 10 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DriveConnector({ mins, tight }: { mins: number | null; tight: boolean }) {
  if (mins === null) return (
    <div className="flex items-center gap-2 py-1 px-3">
      <div className="w-px h-4 bg-gray-800 mx-1" />
      <span className="text-gray-700 text-xs">drive time unknown</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-2 py-1 px-3 ${tight ? "text-red-400" : "text-gray-500"}`}>
      <div className={`w-px h-3 mx-1 ${tight ? "bg-red-500/50" : "bg-gray-700"}`} />
      <span className="text-xs font-medium">
        {tight ? "⚠️ " : "🚗 "}{fmtDrive(mins)} drive
      </span>
      {tight && <span className="text-xs text-red-400/70">(tight)</span>}
    </div>
  );
}

function AppointmentRow({ appt }: { appt: AppointmentSchedule }) {
  const cfg = tradeCfg(appt.trade);
  return (
    <div className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(appt.status)}`} />
            <span className="text-white text-sm font-semibold">{appt.start}</span>
            <span className="text-gray-500 text-xs">– {appt.end}</span>
          </div>
          <div className="text-gray-400 text-xs truncate">{appt.address}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
              {cfg.emoji} {appt.trade}
            </span>
            <span className="text-gray-600 text-xs">{appt.jobNumber}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-sm font-bold ${cfg.text}`}>{fmtRevenue(appt.estimatedRevenue)}</div>
          <div className="text-gray-600 text-xs mt-0.5">{appt.arrivalWindow}</div>
        </div>
      </div>
    </div>
  );
}

function TechCard({ schedule, expanded, onToggle }: {
  schedule: TechSchedule;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { tech, appointments, summary } = schedule;
  const hasIssues = summary.tightBufferCount > 0;

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${
        expanded
          ? "bg-gray-900 border-gray-700"
          : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
      }`}
      onClick={onToggle}
    >
      {/* Card header */}
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xs font-bold text-orange-300 flex-shrink-0">
            {initials(tech)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold">{shortName(tech)}</span>
              {hasIssues && <span className="text-xs text-red-400 font-medium">⚠️ tight</span>}
            </div>
            <div className="text-gray-400 text-xs">
              {summary.jobCount} {summary.jobCount === 1 ? "job" : "jobs"} · {fmtRevenue(summary.estimatedRevenue)} est
              {summary.totalDriveMinutes > 0 && ` · ${fmtDrive(summary.totalDriveMinutes)} drive`}
            </div>
          </div>
          <div className={`text-gray-500 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▼</div>
        </div>

        {/* Trade pip row */}
        <div className="flex gap-1 mt-2">
          {[...new Set(appointments.map(a => a.trade))].map(trade => {
            const cfg = tradeCfg(trade);
            return (
              <span key={trade} className={`text-xs px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                {cfg.emoji}
              </span>
            );
          })}
        </div>
      </div>

      {/* Expanded schedule */}
      {expanded && (
        <div className="border-t border-gray-800 px-3 pb-3 pt-2">
          {appointments.map((appt, i) => (
            <div key={appt.appointmentId}>
              {i > 0 && (
                <DriveConnector
                  mins={appt.driveMinutesFromPrev}
                  tight={appt.bufferTight}
                />
              )}
              <AppointmentRow appt={appt} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DispatchBoard() {
  const today    = todayAEST();
  const tomorrow = tomorrowAEST();

  const [selectedDate, setSelectedDate] = useState(today);
  const [customInput, setCustomInput]   = useState("");
  const [expandedTechs, setExpandedTechs] = useState<Set<string>>(new Set());

  const dateLabel =
    selectedDate === today    ? "today" :
    selectedDate === tomorrow ? "tomorrow" :
    selectedDate;

  const { data, loading, error } = useApi<ScheduleData>(
    "/api/dispatch-schedule",
    { date: selectedDate },
    undefined
  );

  const toggleTech = useCallback((tech: string) => {
    setExpandedTechs(prev => {
      const next = new Set(prev);
      next.has(tech) ? next.delete(tech) : next.add(tech);
      return next;
    });
  }, []);

  const expandAll  = () => setExpandedTechs(new Set(data?.techSchedules.map(t => t.tech) ?? []));
  const collapseAll = () => setExpandedTechs(new Set());

  const cs = data?.companySummary;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Header ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-5 pb-3 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold">📋 Dispatch Board</h1>
              {data?.label && <p className="text-gray-400 text-xs mt-0.5">{data.label}</p>}
            </div>
            <Link href="/" className="text-gray-500 text-sm hover:text-white">← Home</Link>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Today",    value: today },
              { label: "Tomorrow", value: tomorrow },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedDate(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedDate === opt.value
                    ? "bg-white text-gray-950"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {/* Custom date */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-500"
              />
              {customInput && customInput !== selectedDate && (
                <button
                  onClick={() => { setSelectedDate(customInput); setExpandedTechs(new Set()); }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg font-medium"
                >
                  Go
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4">

        {/* ── Company summary strip ── */}
        {cs && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Jobs scheduled",  value: cs.totalJobs,                           sub: dateLabel },
              { label: "Est. revenue",    value: `$${(cs.totalEstRevenue / 1000).toFixed(0)}k`, sub: "invoices not yet raised" },
              { label: "Techs working",   value: cs.techsWorking,                        sub: "assigned technicians" },
              { label: "Avg drive time",  value: fmtDrive(cs.avgDriveMinutes) ?? "—",   sub: cs.totalTightBuffers > 0 ? `⚠️ ${cs.totalTightBuffers} tight buffer${cs.totalTightBuffers > 1 ? "s" : ""}` : "no conflicts" },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{stat.label}</div>
                <div className="text-white font-bold text-xl">{stat.value}</div>
                <div className="text-gray-600 text-xs mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            Failed to load schedule: {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && data?.techSchedules.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <div className="text-4xl mb-3">📅</div>
            <div className="font-semibold">No appointments found</div>
            <div className="text-sm mt-1">No jobs scheduled for {data?.label ?? selectedDate}</div>
          </div>
        )}

        {/* ── Tech schedule grid ── */}
        {!loading && !error && (data?.techSchedules.length ?? 0) > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-500 text-xs uppercase tracking-wide font-semibold">
                Technician schedule — {data?.label}
              </div>
              <div className="flex gap-2">
                <button onClick={expandAll}   className="text-xs text-gray-500 hover:text-white">Expand all</button>
                <span className="text-gray-700">·</span>
                <button onClick={collapseAll} className="text-xs text-gray-500 hover:text-white">Collapse all</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data?.techSchedules.map(schedule => (
                <TechCard
                  key={schedule.tech}
                  schedule={schedule}
                  expanded={expandedTechs.has(schedule.tech)}
                  onToggle={() => toggleTech(schedule.tech)}
                />
              ))}
            </div>

            {data?.updatedAt && (
              <div className="text-center text-gray-700 text-xs mt-6">
                Updated {new Date(data.updatedAt).toLocaleTimeString("en-AU")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
