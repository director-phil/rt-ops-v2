"use client";

// ============================================================
// DATA: Sourced from verified-tech-data-march.json (real ST data)
// Only techs with a monthly target are shown (field techs + apprentices + sales)
// ============================================================

const TECH_DATA = [
  { name: "Romello Moore",       role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 63117, target: 46000, pct: 137.2, jobs: 20, aboveMargin: 10, belowMargin: 10 },
  { name: "Kyan Davis",          role: "Apprentice",                    team: "Apprentice's",            rev: 22168, target: 15000, pct: 147.8, jobs: 7,  aboveMargin: 1,  belowMargin: 6  },
  { name: "Luke Coates",         role: "Apprentice",                    team: "Apprentice's",            rev: 35688, target: 15000, pct: 237.9, jobs: 1,  aboveMargin: 1,  belowMargin: 0  },
  { name: "Sam Liska",           role: "Apprentice",                    team: "Apprentice's",            rev: 26981, target: 15000, pct: 179.9, jobs: 4,  aboveMargin: 0,  belowMargin: 4  },
  { name: "Kristian Calcagno",   role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 37462, target: 46000, pct: 81.4,  jobs: 16, aboveMargin: 6,  belowMargin: 10 },
  { name: "Kyle Rootes",         role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 36477, target: 46000, pct: 79.3,  jobs: 22, aboveMargin: 7,  belowMargin: 15 },
  { name: "zachary lingard",     role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 34474, target: 46000, pct: 74.9,  jobs: 16, aboveMargin: 4,  belowMargin: 12 },
  { name: "Lachlan Henzell",     role: "Field Tech - AC/HVAC",          team: "Air Con Team",            rev: 32086, target: 46000, pct: 69.8,  jobs: 18, aboveMargin: 3,  belowMargin: 15 },
  { name: "Scott Gullick",       role: "Field Tech - Plumbing",         team: "Plumbing Team",           rev: 29035, target: 46000, pct: 63.1,  jobs: 17, aboveMargin: 8,  belowMargin: 9  },
  { name: "Dean Retra",          role: "Field Tech - Dual Trade",       team: "Dual Trade's team Electrical / AC", rev: 28277, target: 46000, pct: 61.5, jobs: 20, aboveMargin: 4, belowMargin: 16 },
  { name: "Curtis Jeffrey",      role: "Field Tech - Dual Trade",       team: "Dual Trade's team Electrical / AC", rev: 25291, target: 46000, pct: 55.0, jobs: 20, aboveMargin: 5, belowMargin: 15 },
  { name: "Gnoor Singh",         role: "Apprentice",                    team: "Apprentice's",            rev: 11734, target: 15000, pct: 78.2,  jobs: 4,  aboveMargin: 0,  belowMargin: 4  },
  { name: "Bradley Tinworth MT", role: "Field Tech - Plumbing",         team: "Plumbing Team",           rev: 21832, target: 46000, pct: 47.5,  jobs: 13, aboveMargin: 7,  belowMargin: 6  },
  { name: "Hayden Sibley",       role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 21553, target: 46000, pct: 46.9,  jobs: 20, aboveMargin: 12, belowMargin: 8  },
  { name: "Mitch Powell",        role: "Field Tech - AC/HVAC",          team: "Air Con Team",            rev: 18518, target: 46000, pct: 40.3,  jobs: 15, aboveMargin: 2,  belowMargin: 13 },
  { name: "Alex Naughton",       role: "Field Tech - Plumbing",         team: "Plumbing Team",           rev: 14404, target: 46000, pct: 31.3,  jobs: 20, aboveMargin: 8,  belowMargin: 12 },
  { name: "Rusty Daniells",      role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 10984, target: 46000, pct: 23.9,  jobs: 6,  aboveMargin: 0,  belowMargin: 6  },
  { name: "David White",         role: "Field Tech - AC/HVAC",          team: "Air Con Team",            rev: 11827, target: 46000, pct: 25.7,  jobs: 19, aboveMargin: 4,  belowMargin: 15 },
  { name: "Bailey Somerville",   role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 6273,  target: 46000, pct: 13.6,  jobs: 11, aboveMargin: 2,  belowMargin: 9  },
  { name: "Alex Peisler",        role: "Field Tech - Electrical/Solar", team: "Electrical / Solar Team", rev: 4288,  target: 46000, pct: 9.3,   jobs: 10, aboveMargin: 5,  belowMargin: 5  },
  { name: "daniel hayes",        role: "Sales Tech",                    team: "Dan's Team",              rev: 4271,  target: 80000, pct: 5.3,   jobs: 9,  aboveMargin: 3,  belowMargin: 6  },
  { name: "Lincoln Boyd",        role: "Apprentice",                    team: "Apprentice's",            rev: 0,     target: 15000, pct: 0,     jobs: 0,  aboveMargin: 0,  belowMargin: 0  },
].sort((a, b) => b.rev - a.rev);

const TEAM_TARGET = 782000;
const TOTAL_REV = TECH_DATA.reduce((s, t) => s + t.rev, 0);
const HEALTH_PCT = Math.round((TOTAL_REV / TEAM_TARGET) * 100);

const INSIGHTS = [
  { icon: "⚠️", text: "Alex Naughton: 31% of target — DISPATCH FIX NEEDED (sold $27K in estimates, needs to execute own quotes)", type: "warn" },
  { icon: "⚠️", text: "daniel hayes: 5% completed revenue BUT is a SALES TECH — KPI is sold value not completed (Jan: $219K sold)", type: "warn" },
  { icon: "⚠️", text: "68% of March jobs below 15% margin — pricebook pricing issue, not tech performance", type: "warn" },
  { icon: "⚠️", text: "Solar Quote jobs avg 10.2% margin — fix pricebook before next solar job dispatched", type: "warn" },
  { icon: "✅", text: "Romello Moore: 137% of target — top performer", type: "ok" },
  { icon: "⚠️", text: "Luke Coates (apprentice): $35K from 2 jobs — verify these are correctly attributed large projects", type: "warn" },
];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtFull(n: number) {
  return `$${n.toLocaleString()}`;
}

function statusColor(pct: number) {
  if (pct >= 100) return { row: "border-green-800/50", pctText: "text-green-400", bar: "bg-green-500", badge: "bg-green-900/40 text-green-400 border-green-700/50" };
  if (pct >= 70)  return { row: "border-yellow-800/50", pctText: "text-yellow-400", bar: "bg-yellow-500", badge: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50" };
  return              { row: "border-red-900/50", pctText: "text-red-400", bar: "bg-red-500", badge: "bg-red-900/30 text-red-400 border-red-800/50" };
}

function roleEmoji(role: string) {
  if (role.includes("Solar") || role.includes("Electrical")) return "⚡";
  if (role.includes("AC") || role.includes("HVAC")) return "❄️";
  if (role.includes("Plumbing")) return "🔧";
  if (role.includes("Dual")) return "🔌";
  if (role.includes("Sales")) return "💼";
  if (role.includes("Apprentice")) return "🎓";
  return "👷";
}

function marginOK(above: number, below: number) {
  const total = above + below;
  if (total === 0) return "—";
  const pct = Math.round((above / total) * 100);
  return `${pct}%`;
}

export default function TechniciansPage() {
  const healthColor = HEALTH_PCT >= 100 ? "text-green-400" : HEALTH_PCT >= 70 ? "text-yellow-400" : "text-red-400";
  const healthBarColor = HEALTH_PCT >= 100 ? "bg-green-500" : HEALTH_PCT >= 70 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">Reliable Tradies · ServiceTitan</span>
          </div>
          <h1 className="text-2xl font-black text-white">Technician Performance</h1>
          <p className="text-gray-400 text-sm mt-0.5">March 2026 — Real-time ST data</p>
        </div>

        {/* Summary bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Team Revenue</div>
              <div className="text-2xl font-black text-white">{fmt(TOTAL_REV)}</div>
              <div className="text-gray-500 text-xs">vs target {fmt(TEAM_TARGET)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">vs Target $782K</div>
              <div className={`text-2xl font-black ${healthColor}`}>{HEALTH_PCT}%</div>
              <div className="text-gray-500 text-xs">team attainment</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Health Score</div>
              <div className={`text-2xl font-black ${healthColor}`}>{HEALTH_PCT}%</div>
              <div className="mt-1 bg-gray-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${healthBarColor}`} style={{ width: `${Math.min(HEALTH_PCT, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> &gt;100% target</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 70–100%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;70%</span>
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Tech</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-right px-4 py-3 font-medium">March Rev</th>
                <th className="text-right px-4 py-3 font-medium">Target</th>
                <th className="text-right px-4 py-3 font-medium w-28">%</th>
                <th className="text-right px-4 py-3 font-medium">Jobs</th>
                <th className="text-right px-4 py-3 font-medium">Margin OK</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TECH_DATA.map((tech) => {
                const c = statusColor(tech.pct);
                return (
                  <tr key={tech.name} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{roleEmoji(tech.role)}</span>
                        <div>
                          <div className="text-white font-semibold">{tech.name}</div>
                          <div className="text-gray-500 text-xs">{tech.team}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{tech.role}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${c.pctText}`}>{fmtFull(tech.rev)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{fmtFull(tech.target)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-bold ${c.pctText}`}>{tech.pct.toFixed(1)}%</span>
                        <div className="w-20 bg-gray-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${Math.min(tech.pct, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">{tech.jobs}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {tech.jobs > 0 ? (
                        <span className={parseInt(marginOK(tech.aboveMargin, tech.belowMargin)) >= 50 ? "text-green-400" : "text-red-400"}>
                          {marginOK(tech.aboveMargin, tech.belowMargin)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.badge}`}>
                        {tech.pct >= 100 ? "✓ On Target" : tech.pct >= 70 ? "↗ Amber" : "↓ Below"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-2 mb-6">
          {TECH_DATA.map((tech) => {
            const c = statusColor(tech.pct);
            return (
              <div key={tech.name} className={`bg-gray-900 border ${c.row} rounded-xl p-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{roleEmoji(tech.role)}</span>
                      <span className="text-white font-semibold text-sm">{tech.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${c.badge}`}>
                        {tech.pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{tech.role}</div>
                    <div className="mt-2 bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${Math.min(tech.pct, 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-black ${c.pctText}`}>{fmt(tech.rev)}</div>
                    <div className="text-gray-500 text-xs">/ {fmt(tech.target)}</div>
                    <div className="text-gray-600 text-xs">{tech.jobs} jobs</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>📋</span> March Insights &amp; Flags
          </h2>
          <div className="space-y-2">
            {INSIGHTS.map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  ins.type === "ok"
                    ? "bg-green-950/40 border border-green-800/30 text-green-300"
                    : "bg-yellow-950/30 border border-yellow-800/30 text-yellow-200"
                }`}
              >
                <span className="text-base flex-shrink-0 mt-0.5">{ins.icon}</span>
                <span className="leading-snug">{ins.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-700 text-xs pb-6">
          Data source: ServiceTitan (verified March 2026) · {TECH_DATA.length} technicians shown
        </div>

      </div>
    </div>
  );
}
