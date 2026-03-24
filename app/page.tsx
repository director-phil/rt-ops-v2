"use client";
import { BUSINESS_DATA as D } from "./data/business";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const fmt = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

function StatusDot({ status }: { status: string }) {
  const cls =
    status === "critical"
      ? "bg-red-600 animate-pulse"
      : status === "red"
      ? "bg-red-500"
      : status === "amber"
      ? "bg-yellow-500"
      : "bg-green-500";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls} mr-2 flex-shrink-0`} />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "critical")
    return <span className="text-red-500 text-lg font-black animate-pulse">🚨</span>;
  if (status === "red") return <span className="text-red-500 text-lg">🔴</span>;
  if (status === "amber") return <span className="text-yellow-500 text-lg">⚠️</span>;
  return <span className="text-green-500 text-lg">✅</span>;
}

export default function Home() {
  const criticalCount = D.liabilities.filter(
    (l) => l.severity === "critical" || l.severity === "high"
  ).length;

  const net7Color = D.cash.net7Day >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">
              RELIABLE TRADIES
            </div>
            <div className="text-sm text-gray-400">{D.date}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-yellow-400">{D.healthScore}</div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 progress-bar">
            <div
              className="progress-fill bg-yellow-500"
              style={{ width: `${D.healthScore}%` }}
            />
          </div>
          <span className="text-xs text-green-400 font-bold">↗ {D.healthTrend}</span>
        </div>
      </div>

      {/* Critical Banner */}
      <div className="card card-red mb-4">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-xl animate-pulse">🔴</span>
          <div>
            <div className="text-red-400 font-black text-lg">{criticalCount} CRITICAL ISSUES</div>
            <div className="text-red-300 text-xs">Require your action today</div>
          </div>
        </div>
      </div>

      {/* CASH POSITION */}
      <div className="section-header">💵 CASH POSITION</div>
      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="metric-label">In Bank</div>
            <div className="metric-big text-green-400">{fmtFull(D.cash.inBank)}</div>
          </div>
          <div>
            <div className="metric-label">Net 7-Day</div>
            <div className={`metric-big ${net7Color}`}>
              {D.cash.net7Day >= 0 ? "+" : ""}
              {fmtFull(D.cash.net7Day)}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-800 pt-3">
          <div>
            <span className="text-green-400 font-semibold">+{fmt(D.cash.dueIn7Days)}</span>
            <span className="text-gray-500 ml-1 text-xs">due in</span>
          </div>
          <div>
            <span className="text-red-400 font-semibold">-{fmt(D.cash.dueOut7Days)}</span>
            <span className="text-gray-500 ml-1 text-xs">due out</span>
          </div>
        </div>
      </div>

      {/* TODAY'S BOOKINGS */}
      <div className="section-header">📅 TODAY&apos;S BOOKINGS</div>
      <div className={`card mb-4 ${D.bookings.onTrack ? "card-green" : "card-amber"}`}>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="metric-label">Jobs Today</div>
            <div className="text-2xl font-black text-white">{D.bookings.jobsToday}</div>
          </div>
          <div>
            <div className="metric-label">Target</div>
            <div className="text-2xl font-black text-gray-300">{fmt(D.bookings.revenueTarget)}</div>
          </div>
          <div>
            <div className="metric-label">Pace</div>
            <div className="text-2xl font-black text-yellow-400">{fmt(D.bookings.revenuePace)}</div>
          </div>
        </div>
        <div className="progress-bar mb-2">
          <div
            className={`progress-fill ${D.bookings.onTrack ? "bg-green-500" : "bg-yellow-500"}`}
            style={{
              width: `${Math.round((D.bookings.revenuePace / D.bookings.revenueTarget) * 100)}%`,
            }}
          />
        </div>
        <div className="text-yellow-400 text-xs font-bold">
          ⚠️ TOMORROW: {D.bookings.tomorrowHoursOpen}h OPEN — NEEDS BOOKINGS
        </div>
      </div>

      {/* WEEKLY SCORECARD */}
      <div className="section-header">📊 WEEKLY SCORECARD</div>
      <div className="card mb-4">
        {D.scorecard.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <StatusDot status={row.status} />
              <span className="text-sm font-semibold text-gray-200 truncate">{row.metric}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <div className="text-sm font-bold text-white">{row.current}</div>
                <div className="text-xs text-gray-500">/ {row.target}</div>
              </div>
              {row.note && (
                <div className="text-xs text-red-400 font-bold">{row.note}</div>
              )}
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}
      </div>

      {/* LIABILITIES & ISSUES */}
      <div className="section-header">🔴 LIABILITIES & ISSUES</div>
      <div className="mb-4 space-y-2">
        {D.liabilities.map((item) => (
          <div
            key={item.id}
            className={`card ${
              item.severity === "critical" ? "card-red" : "card-amber"
            } p-3`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">
                {item.severity === "critical" ? "🚨" : "⚠️"}
              </span>
              <div className="flex-1">
                <div
                  className={`font-bold text-sm ${
                    item.severity === "critical" ? "text-red-300" : "text-yellow-300"
                  }`}
                >
                  {item.title}
                </div>
                <div className="text-gray-300 text-xs mt-0.5">→ {item.action}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-yellow-400 font-semibold">
                    {item.impact}
                  </span>
                  <span className="text-xs text-gray-500">Owner: {item.owner}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CASH FLOW FORECAST */}
      <div className="section-header">💰 CASH FLOW FORECAST (4 WEEKS)</div>
      <div className="card mb-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={D.cashForecast} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="week"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}K`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: 12,
                }}
                formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, ""]}
              />
              <Bar dataKey="inflow" name="In" radius={[4, 4, 0, 0]}>
                {D.cashForecast.map((_, i) => (
                  <Cell key={i} fill="#22c55e" />
                ))}
              </Bar>
              <Bar dataKey="outflow" name="Out" radius={[4, 4, 0, 0]}>
                {D.cashForecast.map((_, i) => (
                  <Cell key={i} fill="#ef4444" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
            <span className="text-xs text-gray-400">Inflow</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span className="text-xs text-gray-400">Outflow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
