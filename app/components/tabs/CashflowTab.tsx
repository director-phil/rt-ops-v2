"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { useApi } from "@/app/lib/use-api";

const EBITDA_TARGET_PCT = 30;
const REVENUE_TARGET = 600000;

type ExpensesData = {
  income: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPct: number;
  expenseBreakdown: { name: string; amount: number }[];
  updatedAt?: string;
};

export default function CashflowTab() {
  const { data, loading, error } = useApi<ExpensesData>("/api/expenses", {});

  const ebitdaActual = data?.netMarginPct ?? null;
  const income = data?.income ?? null;
  const netProfit = data?.netProfit ?? null;

  const chartData = data
    ? [{ month: "March 2026 (Live)", revenue: data.income, ebitda: data.netProfit }]
    : [];

  const ebitdaGap = ebitdaActual !== null ? (EBITDA_TARGET_PCT - ebitdaActual).toFixed(1) : null;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CfKpi
          label="Current Month Revenue"
          value={loading ? "…" : income !== null ? `$${Math.round(income / 1000)}k` : "—"}
          sub="March 2026 (live)"
          color="orange"
        />
        <CfKpi
          label="EBITDA Actual"
          value={loading ? "…" : ebitdaActual !== null ? `${ebitdaActual.toFixed(1)}%` : "—"}
          sub={loading ? "" : netProfit !== null ? `$${Math.round(netProfit / 1000)}k net profit` : "—"}
          color="amber"
        />
        <CfKpi
          label="EBITDA Target"
          value={`${EBITDA_TARGET_PCT}%`}
          sub="$180k/month at $600k rev"
          color="green"
        />
        <CfKpi
          label="Gap to Target"
          value={loading ? "…" : ebitdaGap !== null ? `${ebitdaGap}pp` : "—"}
          sub="points below 30% target"
          color="blue"
        />
      </div>

      {/* Main chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">March 2026 — Live Revenue &amp; Net Profit</div>
            <div className="text-xs text-zinc-600 mt-0.5">
              {data?.updatedAt
                ? `Updated: ${new Date(data.updatedAt).toLocaleString()}`
                : "Live data from Xero API"}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="#FF4500" label="Revenue (live)" />
            <LegendDot color="#22c55e" label="Net Profit (live)" />
          </div>
        </div>

        {loading ? (
          <div className="h-[340px] flex items-center justify-center text-zinc-500 text-sm">Loading live data…</div>
        ) : error ? (
          <div className="h-[340px] flex items-center justify-center text-red-400 text-sm">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                width={52}
              />
              <YAxis
                yAxisId="profit"
                orientation="right"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                width={52}
              />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => [
                  `$${Number(v ?? 0).toLocaleString()}`,
                  String(name) === "revenue" ? "Revenue" : "Net Profit"
                ] as [string, string]}
              />
              <Bar yAxisId="rev" dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={80}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#FF4500" opacity={0.9} />
                ))}
              </Bar>
              <Line
                yAxisId="profit"
                type="monotone"
                dataKey="ebitda"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 5 }}
              />
              <ReferenceLine
                yAxisId="rev"
                y={REVENUE_TARGET}
                stroke="#FF4500"
                strokeDasharray="4 2"
                strokeOpacity={0.4}
                label={{ value: "$600k target", fill: "#FF4500", fontSize: 10, position: "insideTopLeft" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* EBITDA waterfall explanation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Reaching 30% EBITDA — What Needs to Change</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EbitdaAction
            step="1"
            title="Fix Pricebook (biggest lever)"
            impact="+$97k EBITDA/month"
            detail="68% of jobs below 15% margin. A 10pp margin improvement on revenue = $51k extra. Full fix = $97k."
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
          {data ? (
            <>
              Current net margin: <span className="font-bold">{data.netMarginPct.toFixed(1)}%</span>
              {" — "}gap to 30% target: <span className="font-bold">{(30 - data.netMarginPct).toFixed(1)}pp</span>.
              Combined improvement plan: +$108k/month EBITDA improvement.
            </>
          ) : (
            "Combined effect: +$108k/month EBITDA improvement = approx 21% EBITDA at current revenue."
          )}
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
