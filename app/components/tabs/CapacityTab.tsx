"use client";

import { CAPACITY, TECHNICIANS } from "@/app/data/staticData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Cell } from "recharts";

const DAILY_TARGET = CAPACITY.dailyTargetPerTech; // $1,533

export default function CapacityTab() {
  const overallUtil = Math.round(
    CAPACITY.utilisation.reduce((s, t) => s + t.utilPct, 0) / CAPACITY.utilisation.length
  );

  // Merge utilisation with revenue to show daily rate
  const techData = CAPACITY.utilisation.map(u => {
    const tech = TECHNICIANS.find(t => t.name === u.name);
    const dailyRev = tech ? Math.round(tech.revenue / CAPACITY.workingDaysMonth) : 0;
    return { ...u, dailyRev };
  });

  const aboveTarget = techData.filter(t => t.dailyRev >= DAILY_TARGET).length;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CapKpi label="Active Techs"       value={CAPACITY.activeTechs.toString()}          sub="Field technicians"        color="white"  />
        <CapKpi label="Avg Utilisation"    value={`${overallUtil}%`}                         sub="Scheduled vs available"   color={overallUtil >= 70 ? "green" : overallUtil >= 50 ? "amber" : "red"} />
        <CapKpi label="Daily Rev Target"   value={`$${DAILY_TARGET.toLocaleString()}/day`}   sub="Per tech · $1,533"        color="orange" />
        <CapKpi label="Above Target"       value={`${aboveTarget}/${CAPACITY.activeTechs}`}  sub="Hitting daily rev target" color={aboveTarget >= 5 ? "green" : "amber"} />
      </div>

      {/* Utilisation bars */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Tech Utilisation — Days Scheduled vs Available</div>
          <div className="text-xs text-zinc-600">{CAPACITY.workingDaysMonth} working days this month</div>
        </div>
        <div className="space-y-2">
          {CAPACITY.utilisation.map(t => {
            const barColor =
              t.utilPct >= 75 ? "#22c55e" :
              t.utilPct >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <div key={t.name} className="flex items-center gap-3">
                <div className="w-36 text-xs text-zinc-300 truncate text-right flex-shrink-0">{t.name}</div>
                <div className="flex-1 h-5 bg-zinc-800 rounded-sm overflow-hidden relative">
                  <div
                    className="h-full rounded-sm flex items-center pl-2 text-xs font-bold text-white"
                    style={{ width: `${t.utilPct}%`, background: barColor }}
                  >
                    {t.utilPct > 20 && `${t.utilPct}%`}
                  </div>
                </div>
                <div className="w-24 text-xs text-zinc-500 flex-shrink-0">
                  {t.scheduled}/{t.available} days
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-zinc-600">
          <span>🟢 ≥75% utilised</span>
          <span>🟡 50–74%</span>
          <span>🔴 &lt;50% — under-utilised</span>
        </div>
      </div>

      {/* Daily revenue vs target chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Daily Revenue Rate vs ${DAILY_TARGET.toLocaleString()} Target
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={techData}
            layout="vertical"
            margin={{ top: 0, right: 80, left: 140, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickFormatter={v => `$${v}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#d1d5db", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={135}
            />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
              formatter={(v: unknown) => [`$${Number(v ?? 0)}/day`, "Daily Revenue"] as [string, string]}
            />
            <ReferenceLine
              x={DAILY_TARGET}
              stroke="#FF4500"
              strokeDasharray="4 2"
              label={{ value: `$${DAILY_TARGET}/day target`, fill: "#FF4500", fontSize: 10, position: "top" }}
            />
            <Bar dataKey="dailyRev" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#9ca3af", fontSize: 10, formatter: (v: unknown) => `$${Number(v ?? 0)}` }}>
              {techData.map((t, i) => (
                <Cell key={i} fill={t.dailyRev >= DAILY_TARGET ? "#22c55e" : t.dailyRev >= 800 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sold work on schedule */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Sold Work on Schedule</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-zinc-500 mb-1">Scheduled Jobs</div>
            <div className="text-2xl font-black text-white">{CAPACITY.scheduledJobs}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-zinc-500 mb-1">Scheduled Value</div>
            <div className="text-2xl font-black text-orange-400">${(CAPACITY.scheduledValue/1000).toFixed(0)}k</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-zinc-500 mb-1">Team Capacity (days)</div>
            <div className="text-2xl font-black text-blue-400">{CAPACITY.totalCapacityDays}</div>
            <div className="text-xs text-zinc-600 mt-0.5">{CAPACITY.activeTechs} techs × {CAPACITY.workingDaysMonth} days</div>
          </div>
        </div>
      </div>

    </div>
  );
}

function CapKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
