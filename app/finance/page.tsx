"use client";
import { BUSINESS_DATA as D } from "../data/business";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, ReferenceLine,
} from "recharts";

const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

export default function Finance() {
  const { finance } = D;

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">FINANCE</div>
        <div className="text-sm text-gray-400">Liabilities • Cash Flow • P&amp;L</div>
      </div>

      {/* ── LIABILITIES ── */}
      <div className="section-header">🔴 LIABILITIES</div>

      <div className="grid grid-cols-2 gap-2 mb-4">
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
          ServiceTitan→Xero payment sync is broken. Invoices showing unpaid in Xero that were collected in ST.
          Fix this to get accurate cash position.
        </div>
        <div className="text-yellow-300 text-xs mt-2 font-semibold">
          → Assign IT/Finance to fix sync this week
        </div>
      </div>

      {/* Top 10 Overdue */}
      <div className="section-header mt-4">TOP 10 OVERDUE INVOICES</div>
      <div className="card mb-4">
        {finance.overdueTop10.map((inv, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-600 w-4 flex-shrink-0">{i + 1}</span>
              <span className="text-sm text-white truncate">{inv.client}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-sm font-bold ${
                  inv.daysOverdue >= 60
                    ? "text-red-400"
                    : inv.daysOverdue >= 30
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                {fmtFull(inv.amount)}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                  inv.daysOverdue >= 60
                    ? "bg-red-900 text-red-300"
                    : inv.daysOverdue >= 30
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {inv.daysOverdue}d
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 13-WEEK CASH FLOW ── */}
      <div className="section-header mt-2">💰 13-WEEK CASH FLOW</div>
      <div className="card mb-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finance.cashFlow13Week} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
                formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, "Net"]}
              />
              <ReferenceLine y={0} stroke="#374151" />
              <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                {finance.cashFlow13Week.map((entry, i) => (
                  <Cell key={i} fill={entry.net >= 0 ? "#22c55e" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── P&L SNAPSHOT ── */}
      <div className="section-header">📊 P&L SNAPSHOT — MARCH MTD</div>
      <div className="card mb-4">
        {[
          { label: "Revenue", value: finance.pnl.revenue, pct: null, color: "text-white" },
          { label: "COGS", value: -finance.pnl.cogs, pct: null, color: "text-red-400" },
          {
            label: "Gross Profit",
            value: finance.pnl.grossProfit,
            pct: finance.pnl.grossMargin,
            color: "text-green-400",
          },
          { label: "Operating Exp", value: -finance.pnl.operatingExpenses, pct: null, color: "text-red-400" },
          {
            label: "EBITDA",
            value: finance.pnl.ebitda,
            pct: finance.pnl.ebitdaMargin,
            color: finance.pnl.ebitdaMargin >= 25 ? "text-green-400" : finance.pnl.ebitdaMargin >= 15 ? "text-yellow-400" : "text-red-400",
          },
        ].map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0 ${
              row.label === "EBITDA" ? "bg-gray-900 -mx-4 px-4 rounded-b-xl" : ""
            }`}
          >
            <span className="text-sm text-gray-300 font-semibold">{row.label}</span>
            <div className="flex items-center gap-3">
              {row.pct !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    row.pct >= 25
                      ? "bg-green-900 text-green-300"
                      : row.pct >= 15
                      ? "bg-yellow-900 text-yellow-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {row.pct}%
                </span>
              )}
              <span className={`text-base font-black ${row.color}`}>
                {row.value < 0 ? "-" : ""}
                {fmt(Math.abs(row.value))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-red">
        <div className="font-bold text-red-400 text-sm mb-1">🔴 EBITDA at 17% — Target is 30%</div>
        <div className="text-gray-300 text-xs">
          Gap driven by: avg job value ($829 vs $1,200 target), below-cost solar pricing, and underperforming
          techs. Fix pricebook and dispatch → fastest path to 30%.
        </div>
      </div>
    </div>
  );
}
