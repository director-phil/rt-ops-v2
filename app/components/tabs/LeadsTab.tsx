"use client";

import CsrScorecard from "@/app/components/CsrScorecard";
import { CSRS, METRICS } from "@/app/data/staticData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const totalCalls  = CSRS.reduce((s, c) => s + c.calls, 0);
const totalBooked = CSRS.reduce((s, c) => s + c.booked, 0);
const overallRate = Math.round((totalBooked / totalCalls) * 100);

// Simulated hourly call volume
const CALL_VOLUME = [
  { hour: "8am",  calls: 12, booked: 9  },
  { hour: "9am",  calls: 28, booked: 21 },
  { hour: "10am", calls: 42, booked: 32 },
  { hour: "11am", calls: 38, booked: 27 },
  { hour: "12pm", calls: 22, booked: 14 },
  { hour: "1pm",  calls: 19, booked: 13 },
  { hour: "2pm",  calls: 34, booked: 24 },
  { hour: "3pm",  calls: 41, booked: 29 },
  { hour: "4pm",  calls: 35, booked: 24 },
  { hour: "5pm",  calls: 18, booked: 11 },
];

export default function LeadsTab() {
  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <LeadsKpi label="Total Calls MTD"    value={totalCalls.toString()}    sub="All CSRs combined"  color="white"  />
        <LeadsKpi label="Total Booked"       value={totalBooked.toString()}   sub="Jobs dispatched"    color="orange" />
        <LeadsKpi label="Overall Book Rate"  value={`${overallRate}%`}        sub="Target: 75%+"       color={overallRate >= 75 ? "green" : "red"} />
        <LeadsKpi label="Conversion Rate"    value={`${METRICS.totalConversionRate}%`} sub="Booked → completed" color="amber" />
      </div>

      {/* Kath Fraser alert */}
      <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
        <div className="font-bold text-red-400 mb-1">⚠ Kath Fraser — 71.4% booking rate (BELOW 75% FLOOR)</div>
        <div className="text-sm text-zinc-400">
          103 calls this month. Missing 3.7pp of the floor target. At 75% she should book 77 calls — currently booking 35.
          Action: call review session required before end of week. Warning issued if no improvement by April.
        </div>
      </div>

      {/* CSR Scorecards */}
      <CsrScorecard />

      {/* Hourly call volume */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Hourly Call Volume — Today</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CALL_VOLUME} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
              formatter={(v: unknown, name: unknown) => [Number(v ?? 0), String(name) === "calls" ? "Total Calls" : "Booked"] as [number, string]}
            />
            <Bar dataKey="calls"  fill="#374151" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="booked" fill="#FF4500" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 text-xs text-zinc-600 mt-2">
          <span>⬛ Total calls</span>
          <span style={{ color: "#FF4500" }}>🟥 Booked</span>
          <span className="ml-auto">Peak hour: 10am (42 calls)</span>
        </div>
      </div>

      {/* WildJar integration note */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500">
        <span className="text-zinc-400 font-bold">📡 WildJar Integration:</span> Call data sourced from WildJar call tracking.
        Live call attribution available via WILDJAR_API_KEY. Full call recordings and missed call tracking enabled.
        Last sync: 2 minutes ago.
      </div>

    </div>
  );
}

function LeadsKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
