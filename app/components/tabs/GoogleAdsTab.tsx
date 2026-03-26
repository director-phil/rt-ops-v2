"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Campaign {
  campaign: string;
  trade: string;
  status: string;
  impressions: number;
  impressionsPrev: number;
  clicks: number;
  clicksPrev: number;
  ctr: number;
  ctrPrev: number;
  avgCpc: number;
  avgCpcPrev: number;
  spend: number;
  spendPrev: number;
  conversions: number;
  conversionsPrev: number;
  convRate: number;
  convRatePrev: number;
  cpa: number | null;
  cpaPrev: number | null;
  estRevenue: number;
  estRevenuePrev: number;
  roas: number;
  roasPrev: number;
  spendVariance: number;
  spendVariancePct: number;
  roasVariance: number;
  convVariance: number;
  revenueVariance: number;
  note: string | null;
}

interface WildJarCall {
  callTime: string;
  phone: string;
  campaign: string;
  adGroup: string;
  keyword: string;
  duration: string;
  outcome: string;
  trade: string;
  revenue: number;
}

interface AdsAlert {
  type: string;
  campaign: string;
  message: string;
  action: string;
}

interface AdsResponse {
  ok: boolean;
  period: string;
  dataSource: string;
  isLive: boolean;
  summary: {
    totalSpend: number;
    totalRevenue: number;
    totalConversions: number;
    blendedRoas: number;
    activeCampaigns: number;
    pausedCampaigns: number;
  };
  campaigns: Campaign[];
  wildjarAttribution: WildJarCall[];
  alerts: AdsAlert[];
  updatedAt: string;
  source: string;
  error?: string;
}

function Variance({ now, prev, prefix = "", suffix = "", invert = false }: {
  now: number; prev: number; prefix?: string; suffix?: string; invert?: boolean;
}) {
  const diff = now - prev;
  const pct = prev > 0 ? ((diff / prev) * 100) : 0;
  const isUp = diff > 0;
  const isGood = invert ? !isUp : isUp;
  const color = diff === 0 ? "text-zinc-600" : isGood ? "text-green-400" : "text-red-400";
  const arrow = diff === 0 ? "→" : isUp ? "↑" : "↓";
  return (
    <span className={`text-xs ${color}`}>
      {arrow} {prefix}{Math.abs(diff).toFixed(suffix === "%" ? 1 : 0)}{suffix}
      <span className="opacity-60 ml-0.5">({pct > 0 ? "+" : ""}{pct.toFixed(0)}%)</span>
    </span>
  );
}

export default function GoogleAdsTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const date = params.get("date") || "mtd";

  const { data, loading, error, updatedAt } =
    useApi<AdsResponse>("/api/ads", { date }, refreshKey);

  const s = data?.summary;
  const campaigns = data?.campaigns || [];
  const alerts = data?.alerts || [];
  const wildjar = data?.wildjarAttribution || [];

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Alerts */}
      {alerts.map(alert => (
        <div key={alert.campaign} className={`border rounded-xl p-4 flex items-center gap-4 ${
          alert.type === "danger" ? "bg-red-500/10 border-red-500/40" : "bg-green-500/10 border-green-500/30"
        }`}>
          <div className="text-2xl">{alert.type === "danger" ? "🚨" : "🚀"}</div>
          <div>
            <div className={`font-bold ${alert.type === "danger" ? "text-red-400" : "text-green-400"}`}>
              {alert.campaign} — {alert.action}
            </div>
            <div className="text-sm text-zinc-400 mt-0.5">{alert.message}</div>
          </div>
          <div className="ml-auto">
            <button className={`text-xs font-bold px-4 py-2 rounded-lg ${
              alert.type === "danger" ? "bg-red-500 text-white" : "bg-green-500 text-zinc-900"
            }`}>
              {alert.action}
            </button>
          </div>
        </div>
      ))}

      {/* Summary KPIs */}
      <DataPanel
        title={`Google Ads · ${data?.period || date.toUpperCase()}`}
        source={data?.dataSource || "Google Ads"}
        updatedAt={updatedAt}
        loading={loading}
        error={error}
      >
        {s && (
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <AdsKpi label="Total Spend MTD"    value={`$${s.totalSpend.toLocaleString()}`}         sub="All campaigns" color="white" />
              <AdsKpi label="Total Revenue (Est)" value={`$${(s.totalRevenue/1000).toFixed(0)}k`}    sub="Attribution est." color="orange" />
              <AdsKpi label="Blended ROAS"        value={`${s.blendedRoas}x`}                        sub="Revenue / spend" color="green" />
              <AdsKpi label="Conversions"         value={`${s.totalConversions}`}                    sub={`${s.activeCampaigns} active campaigns`} color="amber" />
            </div>

            {/* Campaign Table — all columns */}
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/30">
                    {["Campaign", "Status", "Impr.", "Clicks", "CTR", "Avg CPC", "Spend", "Conv.", "Conv%", "CPA", "Est Rev", "ROAS"].map(h => (
                      <th key={h} className="text-left px-3 py-3 font-bold uppercase text-zinc-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => {
                    const roasColor = c.roas === 0 ? "text-red-400" : c.roas >= 20 ? "text-green-400" : c.roas >= 10 ? "text-amber-400" : "text-zinc-300";
                    return (
                      <tr key={c.campaign} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 ${c.status === "pause" ? "opacity-60" : ""}`}>
                        <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">
                          {c.campaign}
                          {c.note && <div className="text-zinc-600 font-normal text-[10px]">{c.note}</div>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {c.status === "active" ? "Active" : "PAUSE"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.impressions.toLocaleString()}</div>
                          <Variance now={c.impressions} prev={c.impressionsPrev} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.clicks.toLocaleString()}</div>
                          <Variance now={c.clicks} prev={c.clicksPrev} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.ctr}%</div>
                          <Variance now={c.ctr} prev={c.ctrPrev} suffix="%" />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">${c.avgCpc}</div>
                          <Variance now={c.avgCpc} prev={c.avgCpcPrev} prefix="$" invert />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">${c.spend.toLocaleString()}</div>
                          <Variance now={c.spend} prev={c.spendPrev} prefix="$" />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.conversions}</div>
                          <Variance now={c.conversions} prev={c.conversionsPrev} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.convRate}%</div>
                          <Variance now={c.convRate} prev={c.convRatePrev} suffix="%" />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono">{c.cpa ? `$${c.cpa.toFixed(0)}` : "N/A"}</div>
                          {c.cpa && c.cpaPrev && <Variance now={c.cpa} prev={c.cpaPrev} prefix="$" invert />}
                        </td>
                        <td className="px-3 py-2.5 text-orange-400">
                          <div className="font-mono font-bold">{c.estRevenue > 0 ? `$${(c.estRevenue/1000).toFixed(0)}k` : "—"}</div>
                          {c.estRevenue > 0 && c.estRevenuePrev > 0 && <Variance now={c.estRevenue} prev={c.estRevenuePrev} prefix="$" />}
                        </td>
                        <td className={`px-3 py-2.5 font-black font-mono ${roasColor}`}>
                          <div>{c.roas === 0 ? "0x ❌" : `${c.roas}x`}</div>
                          <Variance now={c.roas} prev={c.roasPrev} suffix="x" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DataPanel>

      {/* ROAS Chart */}
      {campaigns.length > 0 && (
        <DataPanel title="ROAS by Campaign" source="Google Ads" updatedAt={updatedAt}>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={campaigns} layout="vertical" margin={{ top: 0, right: 80, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="campaign" tick={{ fill: "#d1d5db", fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
                  formatter={(v: unknown) => [`${Number(v ?? 0)}x`, "ROAS"] as [string, string]}
                />
                <Bar dataKey="roas" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#9ca3af", fontSize: 10, formatter: (v: unknown) => `${v}x` }}>
                  {campaigns.map((c, i) => (
                    <rect key={i} fill={c.roas === 0 ? "#ef4444" : c.roas >= 20 ? "#22c55e" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataPanel>
      )}

      {/* WildJar Attribution Chain */}
      <DataPanel title="WildJar Call Attribution — Ad → Call → Booking → Revenue" source="WildJar" updatedAt={updatedAt}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {["Time", "Phone", "Campaign / Ad Group", "Keyword (GCLID)", "Duration", "Outcome", "Trade", "Revenue"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold uppercase text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wildjar.map((call, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{call.callTime}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-500">{call.phone}</td>
                  <td className="px-4 py-2.5">
                    <div className="text-zinc-300">{call.campaign}</div>
                    <div className="text-zinc-600 text-[10px]">{call.adGroup}</div>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 italic">{call.keyword}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{call.duration}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      call.outcome === "Booked" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                    }`}>{call.outcome}</span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">{call.trade}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-orange-400">
                    {call.revenue > 0 ? `$${call.revenue.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-zinc-600 border-t border-zinc-800">
            Source: WildJar call tracking · Phone numbers masked for privacy · GCLID links to Google Ads click
          </div>
        </div>
      </DataPanel>

    </div>
  );
}

function AdsKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
