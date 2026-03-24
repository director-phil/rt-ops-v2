"use client";

import { useParams } from "next/navigation";
import { TECHS, getTechBySlug } from "../../data/techs";
import Link from "next/link";

const TRADE_CONFIG = {
  electrical: { emoji: "⚡", color: "yellow", bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-500" },
  hvac: { emoji: "❄️", color: "teal", bg: "bg-teal-500/20", border: "border-teal-500/40", text: "text-teal-400", badge: "bg-teal-500" },
  solar: { emoji: "☀️", color: "orange", bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-400", badge: "bg-orange-500" },
  plumbing: { emoji: "🔧", color: "blue", bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400", badge: "bg-blue-500" },
};

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

function Avatar({ initials, trade }: { initials: string; trade: keyof typeof TRADE_CONFIG }) {
  const cfg = TRADE_CONFIG[trade];
  return (
    <div className={`w-16 h-16 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center text-xl font-bold ${cfg.text}`}>
      {initials}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const capped = Math.min(pct, 100);
  const barColor =
    pct >= 100 ? "bg-green-500" : pct >= 75 ? "bg-yellow-500" : pct >= 50 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1">
      <div
        className={`h-2.5 rounded-full transition-all ${barColor}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

export default function TechPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const tech = getTechBySlug(slug);

  if (!tech) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Tech not found</h1>
        <p className="text-gray-400 mb-6">No technician found for "{slug}"</p>
        <Link href="/technicians" className="text-blue-400 underline">← Back to Team</Link>
      </div>
    );
  }

  const cfg = TRADE_CONFIG[tech.trade];
  const revenuePct = Math.round((tech.revenueMTD / tech.revenueTarget) * 100);
  const commissionEarned = Math.round(tech.revenueMTD * 0.015) + tech.sellingCommission;
  const commissionBlocked = Math.round(tech.blockedValue * 0.015);
  const avgJobValue = Math.round(tech.revenueMTD / tech.jobsCompleted);
  const trend = tech.revenueMTD >= tech.lastMonthRevenue ? "up" : "down";
  const trendPct = Math.abs(Math.round(((tech.revenueMTD - tech.lastMonthRevenue) / tech.lastMonthRevenue) * 100));
  const neededForTarget = Math.max(0, tech.commissionThreshold - tech.revenueMTD);
  const onTrack = tech.revenueMTD >= tech.commissionThreshold;
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className={`${cfg.bg} border-b ${cfg.border} px-4 pt-6 pb-4`}>
        <div className="max-w-2xl mx-auto">
          <Link href="/technicians" className="text-gray-400 text-sm mb-4 block hover:text-white transition-colors">
            ← Back to Team
          </Link>
          <div className="flex items-center gap-4">
            <Avatar initials={tech.avatar} trade={tech.trade} />
            <div>
              <h1 className="text-2xl font-bold">{tech.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${cfg.text} font-medium`}>{cfg.emoji} {tech.role}</span>
              </div>
              <div className="text-gray-400 text-xs mt-0.5">March 2026 · RT Ops Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Special note */}
        {tech.specialNote && (
          <div className="bg-blue-500/10 border border-blue-500/40 rounded-xl p-4">
            <p className="text-blue-300 text-sm leading-relaxed">{tech.specialNote}</p>
          </div>
        )}

        {/* Flag / warning */}
        {tech.flag && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
            <p className="text-red-300 text-sm leading-relaxed">{tech.flag}</p>
          </div>
        )}

        {/* Bonus Progress */}
        <div className={`rounded-xl border p-4 ${onTrack ? "bg-green-500/10 border-green-500/40" : "bg-yellow-500/10 border-yellow-500/40"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{onTrack ? "🟢" : "🟡"}</span>
            <span className={`font-semibold ${onTrack ? "text-green-400" : "text-yellow-400"}`}>
              {onTrack ? "On track for commission eligibility" : `Need ${fmtFull(neededForTarget)} more to hit commission threshold`}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Commission threshold: {fmtFull(tech.commissionThreshold)}/month · You're at {fmtFull(tech.revenueMTD)} ({revenuePct}% of target)
          </p>
        </div>

        {/* Commission This Month */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            💰 My Commission This Month
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Total Earned</div>
              <div className="text-2xl font-bold text-green-400">{fmtFull(commissionEarned)}</div>
              <div className="text-gray-500 text-xs mt-1">
                {tech.eligibleJobs} eligible jobs × 1.5%
                {tech.sellingCommission > 0 && ` + ${fmtFull(tech.sellingCommission)} sales bonus`}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Blocked (margin &lt;15%)</div>
              <div className="text-2xl font-bold text-red-400">{fmtFull(commissionBlocked)}</div>
              <div className="text-gray-500 text-xs mt-1">{tech.blockedJobs} jobs · {fmtFull(tech.blockedValue)} revenue</div>
            </div>
          </div>
          {tech.blockedJobs > 0 && (
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-300 text-xs leading-relaxed">
                <span className="text-orange-400 font-semibold">ℹ️ Why blocked?</span> {tech.blockedJobs} jobs this month ({fmtFull(tech.blockedValue)} total revenue) had a job margin below the 15% threshold, so commission wasn't paid on those jobs.
                {tech.trade === "solar" && " Note: the solar pricebook issue is being investigated by management — some of these blocks may be reversed."}
                {tech.trade !== "solar" && " Tip: Focus on higher-value task categories (installs, upgrades, commercial work) to improve margin and unlock more commission."}
              </p>
            </div>
          )}
        </div>

        {/* My Performance */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            📈 My Performance
          </h2>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Revenue this month</span>
              <span className="text-white font-semibold">{fmtFull(tech.revenueMTD)} / {fmt(tech.revenueTarget)}</span>
            </div>
            <ProgressBar pct={revenuePct} color={cfg.color} />
            <div className="text-gray-500 text-xs mt-1">{revenuePct}% of target</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{tech.jobsCompleted}</div>
              <div className="text-gray-500 text-xs">Jobs done</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">${avgJobValue}</div>
              <div className="text-gray-500 text-xs">Avg job value</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
                {trend === "up" ? "↑" : "↓"} {trendPct}%
              </div>
              <div className="text-gray-500 text-xs">vs last month</div>
            </div>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            🏆 Team Leaderboard
          </h2>
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center text-2xl font-black ${cfg.text}`}>
              #{tech.rank}
            </div>
            <div>
              <div className="text-white font-semibold">
                You're {ordinal(tech.rank)} of {tech.totalTechs} techs this month
              </div>
              <div className="text-gray-400 text-sm mt-0.5">
                {tech.rank === 1
                  ? "🥇 Top performer! Keep it up."
                  : tech.rank <= 3
                  ? "🥈 Top 3 — excellent work!"
                  : tech.rank <= 5
                  ? "💪 Top half — strong month."
                  : tech.rank <= 10
                  ? "📈 Keep pushing — more jobs = more commission."
                  : "⚠️ This month has been tough — let's talk about what support you need."}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Today */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            📅 My Jobs Today — Tue 24 Mar
          </h2>
          {tech.jobsToday.length === 0 ? (
            <p className="text-gray-400 text-sm">No jobs scheduled today.</p>
          ) : (
            <div className="space-y-2">
              {tech.jobsToday.map((job, i) => (
                <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{job.customer}</span>
                        <span className="text-gray-500 text-xs">· {job.suburb}</span>
                      </div>
                      <div className="text-gray-300 text-xs mt-0.5">{job.type}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{job.trade}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`text-sm font-bold ${cfg.text}`}>{job.time}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{fmtFull(job.value)}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-1 border-t border-gray-800 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total today</span>
                  <span className="text-white font-semibold">
                    {fmtFull(tech.jobsToday.reduce((sum, j) => sum + j.value, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs pb-6">
          Data as of Tue 24 Mar 2026 · Reliable Tradies<br/>
          Commission calculated at 1.5% of eligible job revenue<br/>
          Questions? Talk to your manager.
        </div>
      </div>
    </div>
  );
}
