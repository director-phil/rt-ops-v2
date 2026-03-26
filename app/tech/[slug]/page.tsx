"use client";

import { useParams } from "next/navigation";
import { useApi } from "../../lib/use-api";
import Link from "next/link";

type TechItem = {
  name: string;
  revenueMTD: number;
  jobCount: number;
  commission: number;
  progressPct: number;
  thresholdGap: number;
  meetsThreshold: boolean;
};

type TechsData = { technicians: TechItem[]; updatedAt?: string };

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

function ProgressBar({ pct }: { pct: number }) {
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

  const { data, loading, error, updatedAt } = useApi<TechsData>("/api/technicians", {});

  const tech = data?.technicians.find(t => slugify(t.name) === slug) ?? null;

  const initials = tech
    ? tech.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const COMMISSION_THRESHOLD = 80000;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading technician data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Failed to load</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/technicians" className="text-blue-400 underline">← Back to Team</Link>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Tech not found</h1>
        <p className="text-gray-400 mb-6">No technician found for &quot;{slug}&quot;</p>
        <Link href="/technicians" className="text-blue-400 underline">← Back to Team</Link>
      </div>
    );
  }

  const revenuePct = tech.progressPct ?? Math.round((tech.revenueMTD / COMMISSION_THRESHOLD) * 100);
  const onTrack    = tech.meetsThreshold;
  const neededForTarget = tech.thresholdGap > 0 ? tech.thresholdGap : 0;

  // Rank among all techs by revenueMTD
  const rank = data
    ? [...data.technicians].sort((a, b) => b.revenueMTD - a.revenueMTD).findIndex(t => t.name === tech.name) + 1
    : null;
  const totalTechs = data?.technicians.length ?? 0;

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/technicians" className="text-gray-400 text-sm mb-4 block hover:text-white transition-colors">
            ← Back to Team
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-xl font-bold text-orange-400">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tech.name}</h1>
              <div className="text-gray-400 text-xs mt-0.5">
                March 2026 · RT Ops Dashboard
                {updatedAt && ` · Updated ${new Date(updatedAt).toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Bonus Progress */}
        <div className={`rounded-xl border p-4 ${onTrack ? "bg-green-500/10 border-green-500/40" : "bg-yellow-500/10 border-yellow-500/40"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{onTrack ? "🟢" : "🟡"}</span>
            <span className={`font-semibold ${onTrack ? "text-green-400" : "text-yellow-400"}`}>
              {onTrack
                ? "On track for commission eligibility"
                : `Need ${fmtFull(neededForTarget)} more to hit commission threshold`}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Commission threshold: {fmtFull(COMMISSION_THRESHOLD)}/month · You&apos;re at {fmtFull(tech.revenueMTD)} ({revenuePct}% of target)
          </p>
        </div>

        {/* Commission This Month */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            💰 My Commission This Month
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Commission Earned</div>
              <div className="text-2xl font-bold text-green-400">{fmtFull(tech.commission)}</div>
              <div className="text-gray-500 text-xs mt-1">{tech.jobCount} jobs this month</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Threshold Gap</div>
              <div className={`text-2xl font-bold ${onTrack ? "text-green-400" : "text-yellow-400"}`}>
                {onTrack ? "✓ Met" : fmtFull(neededForTarget)}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {onTrack ? "Commission threshold reached" : "Still needed to hit threshold"}
              </div>
            </div>
          </div>
        </div>

        {/* My Performance */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            📈 My Performance
          </h2>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Revenue this month</span>
              <span className="text-white font-semibold">{fmtFull(tech.revenueMTD)} / $80K</span>
            </div>
            <ProgressBar pct={revenuePct} />
            <div className="text-gray-500 text-xs mt-1">{revenuePct}% of threshold</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{tech.jobCount}</div>
              <div className="text-gray-500 text-xs">Jobs this month</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {tech.jobCount > 0 ? `$${Math.round(tech.revenueMTD / tech.jobCount).toLocaleString()}` : "—"}
              </div>
              <div className="text-gray-500 text-xs">Avg job value</div>
            </div>
          </div>
        </div>

        {/* Team Leaderboard */}
        {rank !== null && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              🏆 Team Leaderboard
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-2xl font-black text-orange-400">
                #{rank}
              </div>
              <div>
                <div className="text-white font-semibold">
                  You&apos;re {ordinal(rank)} of {totalTechs} techs this month
                </div>
                <div className="text-gray-400 text-sm mt-0.5">
                  {rank === 1
                    ? "🥇 Top performer! Keep it up."
                    : rank <= 3
                    ? "🥈 Top 3 — excellent work!"
                    : rank <= 5
                    ? "💪 Top half — strong month."
                    : rank <= 10
                    ? "📈 Keep pushing — more jobs = more commission."
                    : "⚠️ This month has been tough — let's talk about what support you need."}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs pb-6">
          Data as of March 2026 · Reliable Tradies<br />
          Commission calculated at 1.5% of eligible job revenue<br />
          Questions? Talk to your manager.
        </div>
      </div>
    </div>
  );
}
