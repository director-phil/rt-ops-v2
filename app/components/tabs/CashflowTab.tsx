"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell
} from "recharts";
import { CASHFLOW_DATA, CASHFLOW_ANNOTATIONS, METRICS } from "@/app/data/staticData";

const TARGET_EBITDA_ABS = 600000 * 0.30; // $180,000

export default function CashflowTab() {
  const latest = CASHFLOW_DATA.find(d => d.month === "Feb 26")!;
  const projected = CASHFLOW_DATA.filter(d => d.type === "projected");

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CfKpi label="Current Month Revenue" value="$510,216" sub="Feb 2026 actual" color="orange" />
        <CfKpi label="EBITDA Actual"          value={`${METRICS.ebitdaActualPct}%`} sub={`$${(510216 * 0.108 / 1000).toFixed(0)}k`} color="amber" />
        <CfKpi label="EBITDA Target"          value={`${METRICS.ebitdaTargetPct}%`} sub="$180k/month at $600k rev" color="green" />
        <CfKpi label="Mar 26 Projected"       value="$590k" sub="Revenue forecast" color="blue" />
      </div>

      {/* Main chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">18-Month Revenue + EBITDA Trend</div>
            <div className="text-xs text-zinc-600 mt-0.5">Sep 2024 — May 2026 · Projected months shown with dashed border</div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="#FF4500" label="Revenue (actual)" />
            <LegendDot color="#6366f1" label="Revenue (projected)" />
            <LegendDot color="#22c55e" label="EBITDA $" />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={CASHFLOW_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
              width={52}
            />
            <YAxis
              yAxisId="ebitda"
              orientation="right"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
              width={52}
            />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
              formatter={(v: unknown, name: unknown) => [
                `$${Number(v ?? 0).toLocaleString()}`,
                String(name) === "revenue" ? "Revenue" : String(name) === "ebitda" ? "EBITDA" : String(name)
              ] as [string, string]}
            />
            {/* Revenue bars */}
            <Bar yAxisId="rev" dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {CASHFLOW_DATA.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.type === "projected" ? "#6366f1" : "#FF4500"}
                  opacity={entry.type === "projected" ? 0.7 : 0.9}
                />
              ))}
            </Bar>
            {/* EBITDA line */}
            <Line
              yAxisId="ebitda"
              type="monotone"
              dataKey="ebitda"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 3 }}
            />
            {/* 30% EBITDA target reference */}
            <ReferenceLine
              yAxisId="ebitda"
              y={TARGET_EBITDA_ABS}
              stroke="#22c55e"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{ value: "30% EBITDA target", fill: "#22c55e", fontSize: 10, position: "right" }}
            />
            {/* Revenue $600k target */}
            <ReferenceLine
              yAxisId="rev"
              y={600000}
              stroke="#FF4500"
              strokeDasharray="4 2"
              strokeOpacity={0.4}
              label={{ value: "$600k target", fill: "#FF4500", fontSize: 10, position: "insideTopLeft" }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Annotations */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CASHFLOW_ANNOTATIONS.map(a => (
            <div key={a.month} className="text-xs bg-zinc-800 rounded-full px-3 py-1 text-zinc-400">
              <span className="text-zinc-600">{a.month}:</span> {a.label}
            </div>
          ))}
        </div>
      </div>

      {/* EBITDA waterfall explanation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Reaching 30% EBITDA — What Needs to Change</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EbitdaAction
            step="1"
            title="Fix Pricebook (biggest lever)"
            impact="+$97k EBITDA/month"
            detail="68% of jobs below 15% margin. A 10pp margin improvement on $510k revenue = $51k extra. Full fix = $97k."
            color="red"
          />
          <EbitdaAction
            step="2"
            title="Pause underperforming Google Ads"
            impact="+$2.8k saved/month"
            detail="Emergency Plumbing campaign: 0x ROAS. Immediate pause saves $2,800/month."
            color="amber"
          />
          <EbitdaAction
            step="3"
            title="Reduce materials over-runs"
            impact="+$8k EBITDA/month"
            detail="14 jobs with actuals 20%+ over estimate. Average over-run $570/job."
            color="blue"
          />
        </div>
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
          Combined effect: +$108k/month EBITDA improvement = approx <span className="font-bold">21% EBITDA at current revenue</span>.
          Scale revenue to $625k simultaneously and 30% target is achievable by May 2026.
        </div>
      </div>

    </div>
  );
}

function CfKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "amber" ? "text-amber-400" : color === "green" ? "text-green-400" : "text-blue-400";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="text-zinc-400">{label}</span>
    </div>
  );
}

function EbitdaAction({ step, title, impact, detail, color }: {
  step: string; title: string; impact: string; detail: string; color: string;
}) {
  const border = color === "red" ? "border-red-500/30 bg-red-500/5" : color === "amber" ? "border-amber-500/30 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5";
  const impactC = color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-blue-400";
  return (
    <div className={`border rounded-xl p-4 ${border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-zinc-800 text-white text-xs font-bold flex items-center justify-center">{step}</span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <div className={`text-lg font-black ${impactC} mb-1`}>{impact}</div>
      <div className="text-xs text-zinc-500">{detail}</div>
    </div>
  );
}
