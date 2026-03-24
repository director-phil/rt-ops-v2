"use client";
import { BUSINESS_DATA as D } from "../data/business";

const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

function RoasBadge({ roas }: { roas: number }) {
  const color =
    roas === 0
      ? "bg-red-900 text-red-300 border border-red-700"
      : roas >= 10
      ? "bg-green-900 text-green-300"
      : roas >= 5
      ? "bg-yellow-900 text-yellow-300"
      : "bg-red-900 text-red-300";
  return (
    <span className={`text-sm px-2 py-0.5 rounded font-black ${color}`}>
      {roas === 0 ? "0x 🔴" : `${roas}x`}
    </span>
  );
}

export default function Marketing() {
  const { marketing } = D;
  const spendPct = Math.round((marketing.totalSpend / marketing.totalBudget) * 100);

  const sorted = [...marketing.campaigns].sort((a, b) => b.roas - a.roas);

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">MARKETING</div>
        <div className="text-sm text-gray-400">Google Ads Cockpit — March MTD</div>
      </div>

      {/* ONE CLEAR ACTION */}
      <div className="card card-red mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-400 font-black text-base">PAUSE Emergency Plumbing NOW</div>
            <div className="text-gray-300 text-sm">$1,550 spent. Zero conversions. Not one booking in 4 weeks.</div>
            <div className="mt-2 bg-gray-900 rounded px-3 py-1.5 text-yellow-300 text-xs font-bold">
              → Saves $385/week | Action: Login to Google Ads → Pause campaign
            </div>
          </div>
        </div>
      </div>

      <div className="card card-green mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <div className="text-green-400 font-black text-base">SCALE Ducted AC — 21.6x ROAS</div>
            <div className="text-gray-300 text-sm">Best performing campaign. Under-budgeted at $8.4K vs $12K budget.</div>
            <div className="mt-2 bg-gray-900 rounded px-3 py-1.5 text-green-300 text-xs font-bold">
              → Increase budget by $3,600/month → est. +$77K revenue
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="section-header">OVERALL PERFORMANCE</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-white">{fmt(marketing.totalSpend)}</div>
          <div className="text-xs text-gray-500 mt-1">Spend MTD</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-green-400">{marketing.overallROAS}x</div>
          <div className="text-xs text-gray-500 mt-1">Overall ROAS</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-blue-400">{spendPct}%</div>
          <div className="text-xs text-gray-500 mt-1">Budget Used</div>
        </div>
      </div>

      <div className="progress-bar mb-6">
        <div
          className={`progress-fill ${spendPct > 95 ? "bg-red-500" : spendPct > 80 ? "bg-yellow-500" : "bg-blue-500"}`}
          style={{ width: `${Math.min(spendPct, 100)}%` }}
        />
      </div>

      {/* Campaign List */}
      <div className="section-header">BY CAMPAIGN (ranked by ROAS)</div>
      <div className="space-y-2">
        {sorted.map((c, i) => (
          <div
            key={i}
            className={`card p-3 ${
              c.status === "red"
                ? "card-red"
                : c.status === "amber"
                ? "card-amber"
                : ""
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">{c.name}</div>
                <div className="text-xs text-gray-500">
                  {fmt(c.spend)} spent · {c.conversions} conversions
                </div>
              </div>
              <RoasBadge roas={c.roas} />
            </div>

            {/* Spend vs budget bar */}
            <div className="progress-bar mb-2" style={{ height: 5 }}>
              <div
                className={`progress-fill ${
                  c.status === "red" ? "bg-red-500" : c.status === "green" ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min((c.spend / c.budget) * 100, 100)}%` }}
              />
            </div>

            <div
              className={`text-xs font-semibold ${
                c.status === "red"
                  ? "text-red-400"
                  : c.status === "amber"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              → {c.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
