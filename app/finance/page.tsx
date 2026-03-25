"use client";
import { BUSINESS_DATA as D } from "../data/business";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, ReferenceLine,
  PieChart, Pie, Legend,
} from "recharts";

const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

export default function Finance() {
  const { finance } = D;
  const { pnl, costBreakdown, cashFlow13Week } = finance;

  const ebitdaColor =
    pnl.ebitdaMargin >= pnl.ebitdaTarget
      ? "text-green-400"
      : pnl.ebitdaMargin >= pnl.ebitdaFloor
      ? "text-yellow-400"
      : "text-red-400";

  const ebitdaBadgeBg =
    pnl.ebitdaMargin >= pnl.ebitdaTarget
      ? "bg-green-900 text-green-300"
      : pnl.ebitdaMargin >= pnl.ebitdaFloor
      ? "bg-yellow-900 text-yellow-300"
      : "bg-red-900 text-red-300";

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">FINANCE</div>
        <div className="text-sm text-gray-400">March 2026 · Source: Xero API</div>
      </div>

      {/* ── EBITDA STATUS ALERT ── */}
      <div className="card card-red mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-red-400 text-sm">🔴 EBITDA BELOW FLOOR</div>
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${ebitdaBadgeBg}`}>
            {pnl.ebitdaMargin}% actual
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
          <div className="bg-red-950 rounded p-2">
            <div className="text-red-300 font-black text-lg">{pnl.ebitdaMargin}%</div>
            <div className="text-gray-400">Actual</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-yellow-300 font-black text-lg">{pnl.ebitdaFloor}%</div>
            <div className="text-gray-400">Floor</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-green-300 font-black text-lg">{pnl.ebitdaTarget}%</div>
            <div className="text-gray-400">Target</div>
          </div>
        </div>
        <div className="text-gray-300 text-xs">
          Wages are 45% of revenue — the biggest drag after materials. Fix pricing and dispatch efficiency to close the gap.
        </div>
      </div>

      {/* ── P&L SNAPSHOT ── */}
      <div className="section-header">📊 P&L SNAPSHOT — MARCH 2026</div>
      <div className="card mb-4">
        {[
          { label: "Revenue",         value: pnl.revenue,          sign: "",  color: "text-white",       pct: null },
          { label: "Materials (COGS)",value: pnl.cogs,              sign: "-", color: "text-red-400",     pct: 31.0 },
          { label: "Gross Profit",    value: pnl.grossProfit,       sign: "",  color: "text-green-400",   pct: pnl.grossMargin },
          { label: "Solar Rebate",    value: pnl.solarRebate,       sign: "+", color: "text-green-300",   pct: null },
          { label: "Google Ads",      value: pnl.googleAds,         sign: "-", color: "text-red-400",     pct: 8.4 },
          { label: "Business Software",value: pnl.businessSoftware, sign: "-", color: "text-red-400",     pct: 2.3 },
          { label: "Wages & Overhead",value: pnl.wagesAndOverhead,  sign: "-", color: "text-orange-400",  pct: 44.6 },
          { label: "Net Profit (EBITDA)", value: pnl.ebitda,        sign: "",  color: ebitdaColor,         pct: pnl.ebitdaMargin },
        ].map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0 ${
              row.label.startsWith("Net Profit") ? "bg-gray-900 -mx-4 px-4 rounded-b-xl" : ""
            }`}
          >
            <span className="text-sm text-gray-300 font-semibold">{row.label}</span>
            <div className="flex items-center gap-3">
              {row.pct !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    row.label.startsWith("Net Profit")
                      ? ebitdaBadgeBg
                      : row.label === "Gross Profit"
                      ? "bg-green-900 text-green-300"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {row.pct}%
                </span>
              )}
              <span className={`text-base font-black ${row.color}`}>
                {row.sign}{fmtFull(row.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── COST BREAKDOWN ── */}
      <div className="section-header">💸 COST BREAKDOWN</div>
      <div className="card mb-4">
        {costBreakdown.map((item, i) => (
          <div key={i} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-semibold">{item.label}</span>
              <span className="text-gray-400">{fmtFull(item.amount)} · {item.pct}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
        <div className="mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500">
          Wages breakdown pending — pulling full payroll split from Xero.
        </div>
      </div>

      {/* ── AR STATUS ── */}
      <div className="section-header mt-2">💳 AR STATUS</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="card card-red p-3 text-center">
          <div className="text-2xl font-black text-red-400">{fmt(finance.phantomAR)}</div>
          <div className="text-xs text-gray-400 mt-1">Phantom AR</div>
          <div className="text-xs text-red-400 font-semibold">ST-Xero sync broken</div>
        </div>
        <div className="card card-amber p-3 text-center">
          <div className="text-2xl font-black text-yellow-400">{fmt(finance.invoiceBalances)}</div>
          <div className="text-xs text-gray-400 mt-1">Outstanding Invoices</div>
          <div className="text-xs text-yellow-400 font-semibold">Collect now</div>
        </div>
      </div>

      <div className="card card-red mb-2">
        <div className="font-bold text-red-400 text-sm mb-1">⚠️ {fmtFull(finance.phantomAR)} Phantom AR</div>
        <div className="text-gray-300 text-xs">
          ServiceTitan→Xero payment sync is broken. Invoices showing unpaid in Xero were already collected in ST.
          Fix this to get accurate cash position.
        </div>
        <div className="text-yellow-300 text-xs mt-2 font-semibold">
          → Assign IT/Finance to fix sync this week
        </div>
      </div>

      <div className="card mb-4">
        <div className="font-semibold text-gray-300 text-sm mb-2">Outstanding Invoice Breakdown</div>
        <div className="text-gray-400 text-xs italic py-4 text-center">
          📋 Invoice data loading via BookkeeperBot…
        </div>
        <div className="border-t border-gray-800 pt-2 flex justify-between text-sm">
          <span className="text-gray-400 font-semibold">Total Outstanding</span>
          <span className="text-yellow-400 font-black">{fmtFull(finance.invoiceBalances)}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">Source: ServiceTitan · Real invoice list pending</div>
      </div>

      {/* ── 13-WEEK CASH FLOW ── */}
      <div className="section-header mt-2">💰 13-WEEK CASH FLOW</div>
      <div className="card mb-4">
        <div className="text-xs text-gray-500 mb-2">W1 = March net profit. W2–W13 pending live bank feed.</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashFlow13Week.map((w) => ({ ...w, net: w.net ?? 0 }))}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <XAxis
                dataKey="week"
                tick={{ fill: "#6b7280", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: 12,
                }}
                formatter={(v: unknown, _name: unknown, props: { payload?: { net: number | null } }) => {
                  if (props?.payload?.net === null) return ["Pending live bank feed", "Net"];
                  return [`$${Number(v).toLocaleString()}`, "Net"];
                }}
              />
              <ReferenceLine y={0} stroke="#374151" />
              <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                {cashFlow13Week.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.net === null ? "#374151" : entry.net >= 0 ? "#22c55e" : "#ef4444"}
                    opacity={entry.net === null ? 0.4 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-600 mt-1 text-center">
          ⬛ Grey bars = pending bank feed integration
        </div>
      </div>
    </div>
  );
}
