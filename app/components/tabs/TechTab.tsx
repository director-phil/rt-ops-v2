"use client";

import TechScorecard from "@/app/components/TechScorecard";
import { TECHNICIANS } from "@/app/data/staticData";

const topPerformers  = TECHNICIANS.filter(t => t.efficiency >= 70).length;
const atRisk         = TECHNICIANS.filter(t => t.efficiency < 30).length;
const highRecalls    = TECHNICIANS.filter(t => t.recalls >= 3).length;
const totalRevenue   = TECHNICIANS.reduce((s, t) => s + t.revenue, 0);

export default function TechTab() {
  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TechKpi label="Total Field Techs"       value={`${TECHNICIANS.length}`}          sub="Active this month" color="white"  />
        <TechKpi label="Top Performers (70%+ eff)" value={`${topPerformers}`}             sub="Efficiency ≥ 70%"  color="green"  />
        <TechKpi label="At Risk (<30% eff)"       value={`${atRisk}`}                     sub="Need coaching"     color="red"    />
        <TechKpi label="Recall Alerts"            value={`${highRecalls} tech(s)`}        sub="3+ recalls/month"  color="amber"  />
      </div>

      {/* Revenue per tech bar visual */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Revenue Distribution — Top 10</div>
        <div className="space-y-2">
          {TECHNICIANS.slice(0, 10).map(t => {
            const pct = (t.revenue / TECHNICIANS[0].revenue) * 100;
            const isGreen  = t.efficiency >= 70;
            const isAmber  = t.efficiency >= 50 && t.efficiency < 70;
            return (
              <div key={t.name} className="flex items-center gap-3">
                <div className="w-36 text-xs text-zinc-300 truncate text-right flex-shrink-0">{t.name}</div>
                <div className="flex-1 h-5 bg-zinc-800 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm flex items-center pl-2 text-xs font-bold text-white transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isGreen ? "#22c55e" : isAmber ? "#f59e0b" : "#ef4444"
                    }}
                  >
                    {pct > 20 && `$${(t.revenue/1000).toFixed(0)}k`}
                  </div>
                </div>
                <div className="w-20 text-xs text-right flex-shrink-0">
                  <span className={t.efficiency >= 70 ? "text-green-400" : t.efficiency >= 50 ? "text-amber-400" : "text-red-400"}>
                    {t.efficiency}% eff
                  </span>
                </div>
                {t.recalls >= 3 && (
                  <div className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {t.recalls} recalls
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-zinc-700 flex gap-4">
          <span>🟢 ≥70% efficiency</span>
          <span>🟡 50–69%</span>
          <span>🔴 &lt;50%</span>
        </div>
      </div>

      {/* Full scorecard table */}
      <TechScorecard />

    </div>
  );
}

function TechKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
