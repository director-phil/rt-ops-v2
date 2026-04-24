"use client";

import { useState, useCallback, useMemo } from "react";
import { useApi } from "../lib/use-api";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Appt = {
  appointmentId: number;
  jobId: number;
  jobNumber: string;
  start: string;
  end: string;
  arrivalWindow: string;   // "HH:MM – HH:MM"
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
  appointments: Appt[];
  summary: { jobCount: number; estimatedRevenue: number; totalDriveMinutes: number; tightBufferCount: number };
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

// ─── Status types ─────────────────────────────────────────────────────────────

type LiveStatus = "on_site" | "en_route" | "running_behind" | "late" | "upcoming" | "completed";

type StatusedTech = {
  schedule: TechSchedule;
  liveStatus: LiveStatus;
  relevantAppt: Appt | null;
  statusDetail: string;
  minutesDelta: number;   // +ve = late, -ve = ahead
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TRADE_CFG: Record<string, { emoji: string; bg: string; border: string; text: string }> = {
  electrical: { emoji: "⚡", bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-300" },
  hvac:       { emoji: "❄️", bg: "bg-teal-500/15",   border: "border-teal-500/40",   text: "text-teal-300"   },
  solar:      { emoji: "☀️", bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-300" },
  plumbing:   { emoji: "🔧", bg: "bg-blue-500/15",   border: "border-blue-500/40",   text: "text-blue-300"   },
  other:      { emoji: "🔩", bg: "bg-gray-500/15",   border: "border-gray-500/40",   text: "text-gray-400"   },
};
const tradeCfg = (t: string) => TRADE_CFG[t] ?? TRADE_CFG.other;

function shortName(name: string) {
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0]}.`;
}
function initials(name: string) {
  return name.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}
function fmtRev(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
}
function fmtMins(m: number | null) {
  if (m === null) return null;
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
function timeToMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function parseWindow(w: string): [number, number] {
  const [start, end] = w.split(" – ");
  return [timeToMins(start), timeToMins(end)];
}

function nowAEST_mins(): number {
  const d = new Date(Date.now() + 10 * 60 * 60 * 1000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function todayAEST() {
  const d = new Date(Date.now() + 10 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
function tomorrowAEST() {
  const d = new Date(Date.now() + 10 * 60 * 60 * 1000 + 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// ─── Status computation ───────────────────────────────────────────────────────

function computeLiveStatus(schedule: TechSchedule, nowMins: number): StatusedTech {
  const { appointments } = schedule;

  // ST-reported active states take precedence
  const working    = appointments.find(a => a.status === "Working" || a.status === "InProgress");
  const dispatched = appointments.find(a => a.status === "Dispatched");

  if (working) {
    return { schedule, liveStatus: "on_site", relevantAppt: working,
      statusDetail: working.suburb || working.address.split(",")[0], minutesDelta: 0 };
  }

  if (dispatched) {
    const [, wEnd] = parseWindow(dispatched.arrivalWindow);
    const delta = nowMins - wEnd;
    if (delta > 0) {
      return { schedule, liveStatus: "running_behind", relevantAppt: dispatched,
        statusDetail: `${delta}m past arrival window`, minutesDelta: delta };
    }
    return { schedule, liveStatus: "en_route", relevantAppt: dispatched,
      statusDetail: `Window ${dispatched.arrivalWindow}`, minutesDelta: wEnd - nowMins };
  }

  // Next unstarted appointment
  const next = appointments.find(a => a.status === "Scheduled" || a.status === "New" || !a.status);

  if (!next) {
    const hasAny = appointments.some(a => a.status === "Done" || a.status === "Completed");
    return { schedule, liveStatus: "completed", relevantAppt: null,
      statusDetail: hasAny ? "All jobs done" : "No appointments", minutesDelta: 0 };
  }

  const [wStart, wEnd] = parseWindow(next.arrivalWindow);

  // Past arrival window → Late
  if (nowMins > wEnd) {
    const late = nowMins - wEnd;
    return { schedule, liveStatus: "late", relevantAppt: next,
      statusDetail: `${late}m past window`, minutesDelta: late };
  }

  // Inside arrival window but not checked in → Running behind
  if (nowMins >= wStart) {
    const behind = nowMins - wStart;
    return { schedule, liveStatus: "running_behind", relevantAppt: next,
      statusDetail: behind === 0 ? "Window just opened" : `${behind}m into window`, minutesDelta: behind };
  }

  // Should have departed by now based on drive time
  if (next.driveMinutesFromPrev !== null && next.driveMinutesFromPrev > 0) {
    const shouldLeaveBy = wStart - next.driveMinutesFromPrev;
    if (nowMins > shouldLeaveBy) {
      const overdue = nowMins - shouldLeaveBy;
      return { schedule, liveStatus: "running_behind", relevantAppt: next,
        statusDetail: `Should've left ${overdue}m ago`, minutesDelta: overdue };
    }
  }

  // Still ahead of schedule
  const minsUntilWindow = wStart - nowMins;
  return { schedule, liveStatus: "upcoming", relevantAppt: next,
    statusDetail: `Window at ${next.arrivalWindow.split(" – ")[0]}`, minutesDelta: -minsUntilWindow };
}

// ─── Lane config ──────────────────────────────────────────────────────────────

const LANES: { status: LiveStatus; label: string; icon: string; bg: string; border: string; text: string; dot: string }[] = [
  { status: "on_site",        label: "On Site",        icon: "●",  bg: "bg-green-950/40",  border: "border-green-700/40",  text: "text-green-400",  dot: "bg-green-500" },
  { status: "en_route",       label: "En Route",       icon: "🚗", bg: "bg-blue-950/30",   border: "border-blue-700/30",   text: "text-blue-400",   dot: "bg-blue-400" },
  { status: "running_behind", label: "Running Behind", icon: "⚠️", bg: "bg-amber-950/30",  border: "border-amber-700/30",  text: "text-amber-400",  dot: "bg-amber-500" },
  { status: "late",           label: "Late",           icon: "🔴", bg: "bg-red-950/40",    border: "border-red-700/40",    text: "text-red-400",    dot: "bg-red-500" },
  { status: "upcoming",       label: "Upcoming",       icon: "○",  bg: "bg-gray-900/60",   border: "border-gray-800",      text: "text-gray-400",   dot: "bg-gray-600" },
  { status: "completed",      label: "Done",           icon: "✓",  bg: "bg-gray-900/20",   border: "border-gray-800/50",   text: "text-gray-600",   dot: "bg-gray-700" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DriveConnector({ mins, tight }: { mins: number | null; tight: boolean }) {
  if (mins === null) return <div className="h-2 border-l border-gray-800 ml-4" />;
  return (
    <div className={`flex items-center gap-2 py-0.5 pl-4 ${tight ? "text-red-400" : "text-gray-600"}`}>
      <div className={`w-px h-3 ${tight ? "bg-red-600/50" : "bg-gray-800"}`} />
      <span className="text-xs">{tight ? "⚠️ " : "↓ "}{fmtMins(mins)} drive</span>
    </div>
  );
}

function ApptRow({ appt }: { appt: Appt }) {
  const cfg = tradeCfg(appt.trade);
  return (
    <div className={`rounded-lg border p-2.5 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-white text-sm font-semibold">{appt.start}</span>
            <span className="text-gray-500 text-xs">–{appt.end}</span>
            <span className={`text-xs px-1 py-0 rounded ${cfg.bg} ${cfg.text}`}>{cfg.emoji}</span>
          </div>
          <div className="text-gray-400 text-xs truncate">{appt.address}</div>
          <div className="text-gray-600 text-xs mt-0.5">Window {appt.arrivalWindow} · {appt.jobNumber}</div>
        </div>
        <div className={`text-sm font-bold flex-shrink-0 ${cfg.text}`}>{fmtRev(appt.estimatedRevenue)}</div>
      </div>
    </div>
  );
}

// Compact card shown inside a swim lane
function TechPill({
  st, laneStatus, expanded, onToggle,
}: { st: StatusedTech; laneStatus: LiveStatus; expanded: boolean; onToggle: () => void }) {
  const lane = LANES.find(l => l.status === laneStatus)!;
  const { schedule, relevantAppt, statusDetail } = st;

  return (
    <div
      className={`rounded-xl border cursor-pointer transition-all ${expanded ? "bg-gray-900 border-gray-700" : `${lane.bg} ${lane.border} hover:border-gray-600`}`}
      onClick={onToggle}
    >
      {/* Pill header */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lane.dot}`} />
          <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
            {initials(schedule.tech)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold leading-tight">{shortName(schedule.tech)}</div>
            <div className={`text-xs leading-tight truncate ${lane.text}`}>{statusDetail}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-white text-xs font-bold">{fmtRev(schedule.summary.estimatedRevenue)}</div>
            <div className="text-gray-500 text-xs">{schedule.summary.jobCount} job{schedule.summary.jobCount !== 1 ? "s" : ""}</div>
          </div>
          <div className={`text-gray-600 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</div>
        </div>

        {/* Quick info row */}
        {relevantAppt && (
          <div className="mt-2 ml-9 text-xs text-gray-500 truncate">
            {relevantAppt.address}
            {schedule.summary.totalDriveMinutes > 0 && (
              <span className="ml-2 text-gray-600">· {fmtMins(schedule.summary.totalDriveMinutes)} drive today</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded full schedule */}
      {expanded && (
        <div className="border-t border-gray-800 px-3 pb-3 pt-2 space-y-1">
          {schedule.appointments.map((appt, i) => (
            <div key={appt.appointmentId}>
              {i > 0 && <DriveConnector mins={appt.driveMinutesFromPrev} tight={appt.bufferTight} />}
              <ApptRow appt={appt} />
            </div>
          ))}
          <div className="pt-1 flex justify-between text-xs text-gray-600">
            <span>{fmtRev(schedule.summary.estimatedRevenue)} est revenue</span>
            {schedule.summary.totalDriveMinutes > 0 && <span>{fmtMins(schedule.summary.totalDriveMinutes)} total drive</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Swim lane section
function Lane({
  lane, techs, expandedTechs, onToggle,
}: {
  lane: typeof LANES[0];
  techs: StatusedTech[];
  expandedTechs: Set<string>;
  onToggle: (name: string) => void;
}) {
  if (techs.length === 0) return null;

  return (
    <div className={`rounded-xl border p-3 ${lane.bg} ${lane.border}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${lane.text}`}>
        <span>{lane.icon}</span>
        <span>{lane.label}</span>
        <span className="ml-auto text-xs font-normal opacity-60">{techs.length}</span>
      </div>
      <div className="space-y-2">
        {techs.map(st => (
          <TechPill
            key={st.schedule.tech}
            st={st}
            laneStatus={lane.status}
            expanded={expandedTechs.has(st.schedule.tech)}
            onToggle={() => onToggle(st.schedule.tech)}
          />
        ))}
      </div>
    </div>
  );
}

// Future-date view: grouped by schedule quality
function FutureView({
  techSchedules, expandedTechs, onToggle,
}: { techSchedules: TechSchedule[]; expandedTechs: Set<string>; onToggle: (t: string) => void }) {
  const tight   = techSchedules.filter(t => t.summary.tightBufferCount > 0);
  const ok      = techSchedules.filter(t => t.summary.tightBufferCount === 0);

  const fakeSt = (s: TechSchedule): StatusedTech => ({
    schedule: s,
    liveStatus: "upcoming",
    relevantAppt: s.appointments[0] || null,
    statusDetail: s.summary.tightBufferCount > 0
      ? `⚠️ ${s.summary.tightBufferCount} tight buffer${s.summary.tightBufferCount > 1 ? "s" : ""}`
      : `${s.appointments[0]?.start ?? "—"} first job`,
    minutesDelta: 0,
  });

  return (
    <div className="space-y-3">
      {tight.length > 0 && (
        <div className="rounded-xl border border-amber-700/30 bg-amber-950/20 p-3">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-amber-400 flex items-center gap-2">
            <span>⚠️</span><span>Attention — Tight Schedule</span>
            <span className="ml-auto opacity-60">{tight.length}</span>
          </div>
          <div className="space-y-2">
            {tight.map(s => (
              <TechPill key={s.tech} st={fakeSt(s)} laneStatus="running_behind"
                expanded={expandedTechs.has(s.tech)} onToggle={() => onToggle(s.tech)} />
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
        <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400 flex items-center gap-2">
          <span>✓</span><span>Confirmed</span>
          <span className="ml-auto opacity-60">{ok.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ok.map(s => (
            <TechPill key={s.tech} st={fakeSt(s)} laneStatus="upcoming"
              expanded={expandedTechs.has(s.tech)} onToggle={() => onToggle(s.tech)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DispatchBoard() {
  const today    = todayAEST();
  const tomorrow = tomorrowAEST();

  const [selectedDate, setSelectedDate] = useState(today);
  const [customInput,  setCustomInput]  = useState("");
  const [expandedTechs, setExpandedTechs] = useState<Set<string>>(new Set());

  const isToday = selectedDate === today;

  const { data, loading, error } = useApi<ScheduleData>(
    "/api/dispatch-schedule",
    { date: selectedDate }
  );

  const toggleTech = useCallback((tech: string) => {
    setExpandedTechs(prev => {
      const n = new Set(prev);
      n.has(tech) ? n.delete(tech) : n.add(tech);
      return n;
    });
  }, []);

  // Compute live statuses once (memoised; recalculate each render for clock drift)
  const nowMins = nowAEST_mins();
  const statusedTechs = useMemo<StatusedTech[]>(() => {
    if (!data?.techSchedules) return [];
    return data.techSchedules.map(s => computeLiveStatus(s, nowMins));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Group into lanes
  const laneMap = useMemo(() => {
    const m = new Map<LiveStatus, StatusedTech[]>();
    LANES.forEach(l => m.set(l.status, []));
    statusedTechs.forEach(st => m.get(st.liveStatus)!.push(st));
    return m;
  }, [statusedTechs]);

  const cs = data?.companySummary;

  const activeLanes = LANES.filter(l => (laneMap.get(l.status)?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-5 pb-3 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold">📋 Dispatch Board</h1>
              {data?.label && <p className="text-gray-400 text-xs mt-0.5">{data.label}</p>}
            </div>
            <Link href="/" className="text-gray-500 text-sm hover:text-white">← Home</Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[{ label: "Today", value: today }, { label: "Tomorrow", value: tomorrow }].map(opt => (
              <button key={opt.value} onClick={() => { setSelectedDate(opt.value); setExpandedTechs(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedDate === opt.value ? "bg-white text-gray-950" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                {opt.label}
              </button>
            ))}
            <input type="date" value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-500" />
            {customInput && customInput !== selectedDate && (
              <button onClick={() => { setSelectedDate(customInput); setExpandedTechs(new Set()); }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg font-medium">
                Go
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-4">

        {/* Company summary strip */}
        {cs && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "Scheduled",    value: String(cs.totalJobs),                            sub: isToday ? "today" : data?.label ?? "" },
              { label: "Est. Revenue", value: `$${(cs.totalEstRevenue / 1000).toFixed(0)}k`,   sub: "invoices not yet raised" },
              { label: "Techs",        value: String(cs.techsWorking),                         sub: "assigned technicians" },
              { label: "Avg Drive",    value: fmtMins(cs.avgDriveMinutes) ?? "—",              sub: cs.totalTightBuffers > 0 ? `⚠️ ${cs.totalTightBuffers} tight` : "no conflicts" },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{s.label}</div>
                <div className="text-white font-bold text-xl">{s.value}</div>
                <div className="text-gray-600 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            Failed to load: {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && (data?.techSchedules.length ?? 0) === 0 && (
          <div className="text-center text-gray-600 py-16">
            <div className="text-4xl mb-3">📅</div>
            <div>No appointments for {data?.label ?? selectedDate}</div>
          </div>
        )}

        {/* ── TODAY: swim lane view ── */}
        {!loading && !error && isToday && statusedTechs.length > 0 && (
          <div className="space-y-3">
            {/* Alert lanes first (late / behind), then on-site / en-route / upcoming / done */}
            {LANES.map(lane => (
              <Lane
                key={lane.status}
                lane={lane}
                techs={laneMap.get(lane.status) ?? []}
                expandedTechs={expandedTechs}
                onToggle={toggleTech}
              />
            ))}
          </div>
        )}

        {/* ── FUTURE: grouped schedule view ── */}
        {!loading && !error && !isToday && (data?.techSchedules.length ?? 0) > 0 && (
          <FutureView
            techSchedules={data!.techSchedules}
            expandedTechs={expandedTechs}
            onToggle={toggleTech}
          />
        )}

        {!loading && data?.updatedAt && (
          <div className="text-center text-gray-700 text-xs mt-6">
            {isToday
              ? `Live · updated ${new Date(data.updatedAt).toLocaleTimeString("en-AU")} · status based on ST appointment events`
              : `Schedule as of ${new Date(data.updatedAt).toLocaleTimeString("en-AU")}`}
          </div>
        )}
      </div>
    </div>
  );
}
