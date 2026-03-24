"use client";
import { TECHS } from "../data/techs";
import Link from "next/link";

const TRADE_CONFIG = {
  electrical: { emoji: "⚡", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  hvac: { emoji: "❄️", text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  solar: { emoji: "☀️", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  plumbing: { emoji: "🔧", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const fmt = (n: number) => `$${n.toLocaleString()}`;
const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;

function TechRow({ tech }: { tech: (typeof TECHS)[0] }) {
  const pct = Math.round((tech.revenueMTD / tech.revenueTarget) * 100);
  const status = pct >= 90 ? "green" : pct >= 60 ? "amber" : "red";
  const cfg = TRADE_CONFIG[tech.trade];
  const trend = tech.revenueMTD >= tech.lastMonthRevenue;
  const commissionEarned = Math.round(tech.revenueMTD * 0.015) + tech.sellingCommission;

  return (
    <Link href={`/tech/${tech.slug}`} className="block">
      <div className={`bg-gray-900 border rounded-xl p-3 mb-2 hover:border-gray-600 transition-all active:scale-99 ${status === "red" ? "border-red-900/60" : status === "amber" ? "border-yellow-900/60" : "border-gray-800"}`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center text-xs font-bold ${cfg.text} flex-shrink-0`}>
            {tech.avatar}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{tech.name}</span>
              {tech.flag && <span className="text-xs">{tech.flag.split(" ")[0]}</span>}
            </div>
            <div className={`text-xs ${cfg.text}`}>{cfg.emoji} {tech.role}</div>
            <div className="mt-1.5 bg-gray-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${status === "green" ? "bg-green-500" : status === "amber" ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
          {/* Stats */}
          <div className="text-right flex-shrink-0 ml-2">
            <div className={`font-black text-lg ${status === "green" ? "text-green-400" : status === "amber" ? "text-yellow-400" : "text-red-400"}`}>
              {pct}%
            </div>
            <div className="text-gray-400 text-xs">{fmtK(tech.revenueMTD)}</div>
            <div className={`text-xs mt-0.5 ${trend ? "text-green-400" : "text-red-400"}`}>
              {trend ? "↑" : "↓"}
            </div>
          </div>
        </div>
        {/* Commission row */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400">✓ {tech.eligibleJobs} eligible</span>
            {tech.blockedJobs > 0 && <span className="text-red-400">✗ {tech.blockedJobs} blocked</span>}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">commission:</span>
            <span className="text-green-300 font-semibold">{fmt(commissionEarned)}</span>
            <span className="text-blue-400">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Technicians() {
  const totalRevenue = TECHS.reduce((s, t) => s + t.revenueMTD, 0);
  const totalTarget = TECHS.reduce((s, t) => s + t.revenueTarget, 0);
  const teamPct = Math.round((totalRevenue / totalTarget) * 100);

  const sorted = [...TECHS].sort((a, b) => b.revenueMTD - a.revenueMTD);

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">TECHNICIANS</div>
        <div className="text-sm text-gray-400">March 2026 · Tap a tech to see their own dashboard</div>
      </div>

      {/* Team Total */}
      <div className={`bg-gray-900 rounded-xl border p-4 mb-4 ${teamPct < 70 ? "border-red-900/60" : teamPct < 85 ? "border-yellow-900/60" : "border-green-900/60"}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">TEAM TOTAL</div>
            <div className="text-3xl font-black text-white">{fmtK(totalRevenue)}</div>
            <div className="text-gray-500 text-sm">/ {fmtK(totalTarget)} target</div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black ${teamPct < 70 ? "text-red-400" : teamPct < 85 ? "text-yellow-400" : "text-green-400"}`}>
              {teamPct}%
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${teamPct < 70 ? "bg-red-500" : teamPct < 85 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(teamPct, 100)}%` }}
          />
        </div>
        <div className="text-gray-600 text-xs mt-2">
          {TECHS.filter(t => t.revenueMTD >= t.commissionThreshold).length} of {TECHS.length} techs are commission-eligible this month
        </div>
      </div>

      {/* All techs */}
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">ALL TECHNICIANS (tap to view personal dashboard)</div>
      {sorted.map((tech) => (
        <TechRow key={tech.slug} tech={tech} />
      ))}

      <div className="text-center text-gray-700 text-xs mt-4 pb-6">
        Each tech can view ONLY their own data via their personal link.<br/>
        Commission: 1.5% of eligible revenue + selling bonus.
      </div>
    </div>
  );
}
