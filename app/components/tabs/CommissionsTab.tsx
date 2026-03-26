"use client";

import { COMMISSIONS } from "@/app/data/staticData";
import { useState } from "react";

export default function CommissionsTab() {
  const [showAll, setShowAll] = useState(false);

  const earners = COMMISSIONS.breakdown.filter(t => t.commission > 0);
  const nonEarners = COMMISSIONS.breakdown.filter(t => t.commission === 0);
  const totalCheck = earners.reduce((s, t) => s + t.commission, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CommKpi label="Total Commission"   value={`$${COMMISSIONS.total.toFixed(2)}`}      sub={COMMISSIONS.period}         color="orange" />
        <CommKpi label="Techs Earning"      value={`${earners.length}`}                      sub="Above $20k threshold"       color="green"  />
        <CommKpi label="Techs Below Floor"  value={`${nonEarners.length}`}                   sub="Below $20k threshold"       color="amber"  />
        <CommKpi label="Payment Due"        value="April 7"                                  sub="Next payroll cycle"         color="white"  />
      </div>

      {/* Rules */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Commission Rules</div>
        <div className="text-sm text-zinc-300">{COMMISSIONS.rules}</div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 mb-0.5">Tier 1</div>
            <div className="font-bold text-white">$20k–$40k rev</div>
            <div className="text-zinc-400">2% commission</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 mb-0.5">Tier 2</div>
            <div className="font-bold text-orange-400">Above $40k rev</div>
            <div className="text-zinc-400">3% commission</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="text-zinc-500 mb-0.5">Below Threshold</div>
            <div className="font-bold text-zinc-400">Under $20k rev</div>
            <div className="text-zinc-400">No commission</div>
          </div>
        </div>
      </div>

      {/* Earners table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Commission Breakdown — {COMMISSIONS.period}</div>
          <div className="text-sm font-black text-orange-400">Total: ${COMMISSIONS.total.toFixed(2)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Technician</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Revenue MTD</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Rate</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Commission</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {earners.map(t => {
                const maxComm = earners[0].commission;
                const barPct = (t.commission / maxComm) * 100;
                return (
                  <tr key={t.tech} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{t.tech}</td>
                    <td className="px-4 py-3 text-right text-zinc-300 font-mono">${t.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.commissionRate === 3 ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
                        {t.commissionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${barPct}%` }} />
                        </div>
                        <span className="font-bold text-orange-400 font-mono">${t.commission.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">✓ Earns commission</span>
                    </td>
                  </tr>
                );
              })}

              {/* Non-earners (collapsible) */}
              {showAll && nonEarners.map(t => (
                <tr key={t.tech} className="border-b border-zinc-800/50 opacity-50">
                  <td className="px-4 py-3 text-zinc-500">{t.tech}</td>
                  <td className="px-4 py-3 text-right text-zinc-600 font-mono">${t.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right"><span className="text-xs text-zinc-600">—</span></td>
                  <td className="px-4 py-3 text-right text-zinc-600 font-mono">$0.00</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-zinc-800 text-zinc-600 px-2 py-0.5 rounded-full">Below $20k threshold</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => setShowAll(s => !s)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showAll ? "▲ Hide non-earners" : `▼ Show ${nonEarners.length} techs below threshold`}
          </button>
          <div className="text-xs text-zinc-500">
            Verification: calculated total ${totalCheck.toFixed(2)} {Math.abs(totalCheck - COMMISSIONS.total) < 0.01 ? "✅ matches" : "⚠ check variance"}
          </div>
        </div>
      </div>

    </div>
  );
}

function CommKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
