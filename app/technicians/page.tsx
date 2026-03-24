"use client";
import { BUSINESS_DATA as D } from "../data/business";

const fmt = (n: number) => `$${n.toLocaleString()}`;

function TechCard({ tech }: { tech: (typeof D.technicians)[0] }) {
  const pct = Math.round((tech.revenueMTD / tech.target) * 100);
  const status = pct >= 90 ? "green" : pct >= 60 ? "amber" : "red";
  const totalJobs = tech.commissionEligible + tech.commissionBlocked;

  return (
    <div className={`card ${status === "red" ? "card-red" : status === "amber" ? "card-amber" : ""} mb-3`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-white text-base">{tech.name}</div>
          <div className="text-xs text-gray-500">{tech.role}</div>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-black ${
              status === "green"
                ? "text-green-400"
                : status === "amber"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {pct}%
          </div>
          <div className="text-xs text-gray-500">of target</div>
        </div>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <div>
          <span className="text-white font-bold">{fmt(tech.revenueMTD)}</span>
          <span className="text-gray-500 text-xs ml-1">/ {fmt(tech.target)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-sm ${
              tech.trend === "up" ? "text-green-400" : "text-red-400"
            }`}
          >
            {tech.trend === "up" ? "↑" : "↓"}
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      </div>

      <div className="progress-bar mb-3">
        <div
          className={`progress-fill ${
            status === "green"
              ? "bg-green-500"
              : status === "amber"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Commission status */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-semibold">
            ✓ {tech.commissionEligible} eligible
          </span>
          {tech.commissionBlocked > 0 && (
            <span className="text-red-400 font-semibold">
              ✗ {tech.commissionBlocked} blocked
            </span>
          )}
        </div>
        <span className="text-gray-600">{totalJobs} jobs</span>
      </div>

      {tech.commissionBlocked > 0 && (
        <div className="progress-bar mb-2" style={{ height: 6 }}>
          <div
            className="h-full rounded-l bg-green-500"
            style={{
              width: `${(tech.commissionEligible / totalJobs) * 100}%`,
              display: "inline-block",
            }}
          />
        </div>
      )}

      {tech.flag && (
        <div className="mt-2 bg-gray-900 rounded-lg px-3 py-2 text-xs text-yellow-300 font-semibold border border-yellow-900">
          {tech.flag}
        </div>
      )}
    </div>
  );
}

export default function Technicians() {
  const totalRevenue = D.technicians.reduce((s, t) => s + t.revenueMTD, 0);
  const totalTarget = D.technicians.reduce((s, t) => s + t.target, 0);
  const teamPct = Math.round((totalRevenue / totalTarget) * 100);

  const dragging = D.technicians.filter((t) => {
    const pct = (t.revenueMTD / t.target) * 100;
    return pct < 50;
  });

  const performing = D.technicians.filter((t) => {
    const pct = (t.revenueMTD / t.target) * 100;
    return pct >= 50;
  });

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">TECHNICIANS</div>
        <div className="text-sm text-gray-400">March Performance — Radical Transparency</div>
      </div>

      {/* Team Total */}
      <div className={`card mb-4 ${teamPct < 70 ? "card-red" : teamPct < 85 ? "card-amber" : "card-green"}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="metric-label">TEAM TOTAL</div>
            <div className="text-3xl font-black text-white">{`$${Math.round(totalRevenue / 1000)}K`}</div>
            <div className="text-gray-500 text-sm">/ ${Math.round(totalTarget / 1000)}K target</div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-black ${teamPct < 70 ? "text-red-400" : teamPct < 85 ? "text-yellow-400" : "text-green-400"}`}>
              {teamPct}%
            </div>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${teamPct < 70 ? "bg-red-500" : teamPct < 85 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(teamPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Performing Techs */}
      <div className="section-header">PERFORMERS</div>
      {performing.map((tech, i) => (
        <TechCard key={i} tech={tech} />
      ))}

      {/* Dragging */}
      {dragging.length > 0 && (
        <>
          <div className="section-header mt-4">🔴 DRAGGING THE TEAM</div>
          <div className="card card-red mb-3 p-3">
            <div className="text-red-400 text-xs font-bold mb-1">
              These techs are significantly below target — visible to all
            </div>
          </div>
          {dragging.map((tech, i) => (
            <TechCard key={i} tech={tech} />
          ))}
        </>
      )}
    </div>
  );
}
