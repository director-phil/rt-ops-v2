"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, Legend
} from "recharts";
import { GOOGLE_ADS } from "@/app/data/staticData";

export default function GoogleAdsTab() {
  const { campaigns, spendTrend, totalSpend, totalRevenue, totalRoas } = GOOGLE_ADS;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdsKpi label="Total Spend MTD"    value={`$${totalSpend.toLocaleString()}`}    sub="Across all campaigns" color="white"  />
        <AdsKpi label="Total Revenue"      value={`$${(totalRevenue/1000).toFixed(0)}k`} sub="Google Ads attributed" color="orange" />
        <AdsKpi label="Blended ROAS"       value={`${totalRoas}x`}                      sub="Return on ad spend"    color="green"  />
        <AdsKpi label="Campaigns Running"  value={`${campaigns.filter(c=>c.status==="active").length}/${campaigns.length}`} sub="1 campaign paused" color="amber" />
      </div>

      {/* PAUSE ALERT */}
      <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-center gap-4">
        <div className="text-2xl">🚨</div>
        <div>
          <div className="font-bold text-red-400">Emergency Plumbing campaign — PAUSE NOW</div>
          <div className="text-sm text-zinc-400 mt-0.5">
            $2,800 spent this month · 0 conversions · 0x ROAS · 310 clicks going nowhere
          </div>
        </div>
        <div className="ml-auto">
          <div className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg">⏸ PAUSE</div>
        </div>
      </div>

      {/* Campaign table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Campaign Performance</div>
          <div className="text-xs text-zinc-600">Data via Google Ads API · Refreshed today</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Campaign", "Trade", "Status", "Spend", "Clicks", "Conv.", "Revenue", "ROAS"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const roasColor = c.roas === 0 ? "text-red-400" : c.roas >= 20 ? "text-green-400" : c.roas >= 10 ? "text-amber-400" : "text-zinc-300";
                return (
                  <tr key={c.name} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${c.status === "pause" ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{c.trade}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {c.status === "active" ? "🟢 Active" : "🔴 PAUSE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">${c.spend.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{c.conversions}</td>
                    <td className="px-4 py-3 text-orange-400 font-bold font-mono">
                      {c.revenue === 0 ? "—" : `$${c.revenue.toLocaleString()}`}
                    </td>
                    <td className={`px-4 py-3 font-black font-mono ${roasColor}`}>
                      {c.roas === 0 ? "0x ❌" : `${c.roas}x`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROAS comparison chart + spend trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ROAS bar chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">ROAS by Campaign</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={campaigns}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 10 }} axisLine={false} tickLine={false} width={145} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
                formatter={(v: unknown) => [`${Number(v ?? 0)}x`, "ROAS"] as [string, string]}
              />
              <Bar dataKey="roas" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#9ca3af", fontSize: 10, formatter: (v: unknown) => Number(v ?? 0) > 0 ? `${v}x` : "0x ❌" }}>
                {campaigns.map((c, i) => (
                  <rect key={i} fill={c.roas === 0 ? "#ef4444" : c.roas >= 20 ? "#22c55e" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly spend vs revenue trend */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Weekly Spend vs Revenue (8 weeks)</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={spendTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="spend"   tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <YAxis yAxisId="revenue" orientation="right" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
                formatter={(v: unknown, name: unknown) => [`$${Number(v ?? 0).toLocaleString()}`, String(name) === "spend" ? "Spend" : "Revenue"] as [string, string]}
              />
              <Bar yAxisId="spend" dataKey="spend" fill="#6366f1" opacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#FF4500" strokeWidth={2} dot={{ r: 3, fill: "#FF4500" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>
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
