"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COST_BREAKDOWN, AR_AGING, METRICS } from "@/app/data/staticData";

export default function FinanceTab() {
  const totalAR = AR_AGING.reduce((s, b) => s + b.amount, 0);
  const overdueAR = AR_AGING.find(b => b.bracket === "90+ days")?.amount || 0;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Revenue reconciliation banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          ST vs Xero Reconciliation · March 2026
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ReconcCard label="ST Completed Revenue" value="$510,216" note="From ServiceTitan invoices" color="orange" />
          <ReconcCard label="Xero Recognised"       value="$498,840" note="Xero P&L (some in transit)" color="blue"   />
          <ReconcCard label="Variance"               value="$11,376" note="1 invoice batch pending" color={11376 > 5000 ? "amber" : "green"} />
          <ReconcCard label="EBITDA (actual)"        value={`${METRICS.ebitdaActualPct}%`} note={`Target: ${METRICS.ebitdaTargetPct}%`} color="red" />
        </div>
        <div className="mt-4 text-xs text-zinc-600 border-t border-zinc-800 pt-3">
          ⚠ Data leak detection: ST→Xero sync runs nightly. Last sync: today 02:14 AEST. Variance within acceptable range (&lt;5%).
        </div>
      </div>

      {/* Cost breakdown + AR Aging side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Cost breakdown donut */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Cost Breakdown (% of Revenue)</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={COST_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#0a0a0a"
                >
                  {COST_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
                  formatter={(v: unknown) => [`${Number(v ?? 0)}%`, ""] as [string, string]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {COST_BREAKDOWN.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-zinc-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}%</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-2 mt-2">
                <div className="text-xs text-zinc-600">EBITDA target: 30%</div>
                <div className="text-xs text-red-400 font-bold mt-0.5">Currently 11% — 19pp gap</div>
              </div>
            </div>
          </div>
        </div>

        {/* AR Aging */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">AR Aging</div>
            <div className="text-right">
              <div className="text-lg font-black text-white">${totalAR.toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Total outstanding</div>
            </div>
          </div>
          <div className="space-y-3">
            {AR_AGING.map(b => {
              const pct = (b.amount / totalAR) * 100;
              const isOverdue = b.bracket === "90+ days";
              const is60 = b.bracket === "61–90 days";
              return (
                <div key={b.bracket}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isOverdue ? "text-red-400" : is60 ? "text-amber-400" : "text-zinc-300"}`}>
                        {b.bracket}
                      </span>
                      {isOverdue && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">ACTION</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white">${b.amount.toLocaleString()}</span>
                      <span className="text-xs text-zinc-600 ml-2">({b.count} inv)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                         style={{
                           width: `${pct}%`,
                           background: isOverdue ? "#ef4444" : is60 ? "#f59e0b" : "#FF4500"
                         }} />
                  </div>
                </div>
              );
            })}
          </div>
          {overdueAR > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              ⚠ ${overdueAR.toLocaleString()} overdue 90+ days. Send final notices immediately.
            </div>
          )}
        </div>
      </div>

      {/* Data leak detection */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Data Integrity Checks</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <IntegrityCheck label="ST → Xero Invoice Sync"   status="ok"   detail="Variance 2.2% — within 5% threshold" />
          <IntegrityCheck label="Technician Revenue Match"  status="warn" detail="3 jobs in ST not mapped to invoice" />
          <IntegrityCheck label="Materials Cost Variance"   status="warn" detail="14 jobs: actual &gt; estimate by &gt;20%" />
        </div>
      </div>

    </div>
  );
}

function ReconcCard({ label, value, note, color }: { label: string; value: string; note: string; color: string }) {
  const textColor =
    color === "orange" ? "text-orange-400" :
    color === "blue"   ? "text-blue-400"   :
    color === "green"  ? "text-green-400"  :
    color === "amber"  ? "text-amber-400"  :
    color === "red"    ? "text-red-400"    : "text-white";
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={`text-xl font-black ${textColor}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-1">{note}</div>
    </div>
  );
}

function IntegrityCheck({ label, status, detail }: { label: string; status: "ok" | "warn" | "error"; detail: string }) {
  return (
    <div className={`p-3 rounded-lg border ${
      status === "ok"   ? "bg-green-500/10 border-green-500/30" :
      status === "warn" ? "bg-amber-500/10 border-amber-500/30" :
      "bg-red-500/10 border-red-500/30"
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{status === "ok" ? "✅" : status === "warn" ? "⚠️" : "❌"}</span>
        <span className="text-xs font-bold text-white">{label}</span>
      </div>
      <div className="text-xs text-zinc-400">{detail}</div>
    </div>
  );
}
