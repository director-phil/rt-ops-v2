"use client";

import { useApi } from "../lib/use-api";

type Campaign = {
  campaign: string;
  trade: string;
  status: string;
  spend: number;
  conversions: number;
  roas: number | null;
  ctr: number | null;
  avgCpc: number | null;
  note: string | null;
};

type AdsAlert = {
  type: "success" | "info" | "warning";
  campaign: string;
  message: string;
  action: string;
};

type AdsData = {
  summary: {
    totalSpend: number;
    totalClicks: number;
    totalConversions: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    byAccount: Record<string, { spend: number; clicks: number }>;
  };
  campaigns: Campaign[];
  alerts: AdsAlert[];
  updatedAt?: string;
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`;

function RoasBadge({ roas }: { roas: number | null }) {
  if (roas === null) return <span className="text-sm px-2 py-0.5 rounded font-black bg-gray-800 text-gray-400">—</span>;
  if (roas === 0)   return <span className="text-sm px-2 py-0.5 rounded font-black bg-red-900 text-red-300 border border-red-700">0x 🔴</span>;
  const color = roas >= 10 ? "bg-green-900 text-green-300" : roas >= 5 ? "bg-yellow-900 text-yellow-300" : "bg-red-900 text-red-300";
  return <span className={`text-sm px-2 py-0.5 rounded font-black ${color}`}>{roas}x</span>;
}

function AlertCard({ alert }: { alert: AdsAlert }) {
  const isWarning = alert.type === "warning";
  const isSuccess = alert.type === "success";
  return (
    <div className={`card ${isWarning ? "card-red" : isSuccess ? "card-green" : "card-amber"} mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{isWarning ? "🚨" : isSuccess ? "🚀" : "⚠️"}</span>
        <div>
          <div className={`font-black text-base ${isWarning ? "text-red-400" : isSuccess ? "text-green-400" : "text-yellow-400"}`}>
            {alert.campaign}: {alert.message}
          </div>
          <div className={`mt-2 bg-gray-900 rounded px-3 py-1.5 text-xs font-bold ${isWarning ? "text-yellow-300" : isSuccess ? "text-green-300" : "text-yellow-300"}`}>
            → {alert.action}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Marketing() {
  const { data, loading, error, updatedAt } = useApi<AdsData>("/api/ads", {});

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-3 py-4 space-y-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest">MARKETING</div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-3 py-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">MARKETING</div>
        <div className="card card-red text-red-400">{error ?? "No ads data"}</div>
      </div>
    );
  }

  const { summary, campaigns, alerts } = data;
  const totalBudget = 48000; // operational budget target
  const spendPct = Math.round((summary.totalSpend / totalBudget) * 100);
  const sorted = [...campaigns].sort((a, b) => (b.roas ?? 0) - (a.roas ?? 0));

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">MARKETING</div>
        <div className="text-sm text-gray-400">
          Google Ads Cockpit — March MTD
          {updatedAt && <span className="ml-2 text-gray-600">· {new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>

      {/* Dynamic alerts from API */}
      {alerts?.filter(a => a.type === "warning").map((alert, i) => (
        <AlertCard key={i} alert={alert} />
      ))}
      {alerts?.filter(a => a.type === "success").map((alert, i) => (
        <AlertCard key={i} alert={alert} />
      ))}
      {alerts?.filter(a => a.type === "info").map((alert, i) => (
        <AlertCard key={i} alert={alert} />
      ))}

      {/* Overall Stats */}
      <div className="section-header">OVERALL PERFORMANCE</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-white">{fmt(summary.totalSpend)}</div>
          <div className="text-xs text-gray-500 mt-1">Spend MTD</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-blue-400">{summary.totalConversions}</div>
          <div className="text-xs text-gray-500 mt-1">Conversions</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-blue-400">{spendPct}%</div>
          <div className="text-xs text-gray-500 mt-1">Budget Used</div>
        </div>
      </div>

      <div className="progress-bar mb-4">
        <div
          className={`progress-fill ${spendPct > 95 ? "bg-red-500" : spendPct > 80 ? "bg-yellow-500" : "bg-blue-500"}`}
          style={{ width: `${Math.min(spendPct, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-green-400">{summary.activeCampaigns}</div>
          <div className="text-xs text-gray-500 mt-1">Active Campaigns</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-black text-red-400">{summary.pausedCampaigns}</div>
          <div className="text-xs text-gray-500 mt-1">Paused</div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="section-header">BY CAMPAIGN (ranked by ROAS)</div>
      <div className="space-y-2">
        {sorted.map((c, i) => {
          const isPaused = c.status === "pause";
          const isZeroRoas = c.roas === 0;
          const cardClass = isZeroRoas || isPaused ? "card-red" : "";
          return (
            <div key={i} className={`card p-3 ${cardClass}`}>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{c.campaign}</div>
                  <div className="text-xs text-gray-500">
                    {fmt(c.spend)} spent · {c.conversions} conversions
                    {isPaused && <span className="ml-2 text-red-400 font-bold">PAUSED</span>}
                  </div>
                </div>
                <RoasBadge roas={c.roas} />
              </div>

              {c.note && (
                <div className={`text-xs font-semibold ${isZeroRoas ? "text-red-400" : "text-green-400"}`}>
                  → {c.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
