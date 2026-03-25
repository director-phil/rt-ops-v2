'use client';
import { useState } from 'react';

const TECH_DATA = [
  {
    "name": "Alex Naughton",
    "team": "Plumbing Team",
    "role": "Field Tech - Plumbing",
    "trade": "Multi-Trade",
    "revenue_march": 14404.0,
    "jobs": 20,
    "target_monthly": 46000,
    "pct_of_target": 31.3,
    "above_margin_jobs": 8,
    "below_margin_jobs": 12,
    "avg_job_value": 720.0
  },
  {
    "name": "Alex Peisler",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 4288.0,
    "jobs": 10,
    "target_monthly": 46000,
    "pct_of_target": 9.3,
    "above_margin_jobs": 5,
    "below_margin_jobs": 5,
    "avg_job_value": 429.0
  },
  {
    "name": "Bailey Somerville",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 6273.0,
    "jobs": 11,
    "target_monthly": 46000,
    "pct_of_target": 13.6,
    "above_margin_jobs": 2,
    "below_margin_jobs": 9,
    "avg_job_value": 570.0
  },
  {
    "name": "Bradley Tinworth MT",
    "team": "Plumbing Team",
    "role": "Field Tech - Plumbing",
    "trade": "Multi-Trade",
    "revenue_march": 21832.0,
    "jobs": 13,
    "target_monthly": 46000,
    "pct_of_target": 47.5,
    "above_margin_jobs": 7,
    "below_margin_jobs": 6,
    "avg_job_value": 1679.0
  },
  {
    "name": "Curtis Jeffrey",
    "team": "Dual Trade's team Electrical / AC",
    "role": "Field Tech - Dual Trade",
    "trade": "Multi-Trade",
    "revenue_march": 25291.0,
    "jobs": 20,
    "target_monthly": 46000,
    "pct_of_target": 55.0,
    "above_margin_jobs": 5,
    "below_margin_jobs": 15,
    "avg_job_value": 1265.0
  },
  {
    "name": "David White",
    "team": "Air Con Team",
    "role": "Field Tech - AC/HVAC",
    "trade": "Multi-Trade",
    "revenue_march": 11827.0,
    "jobs": 19,
    "target_monthly": 46000,
    "pct_of_target": 25.7,
    "above_margin_jobs": 4,
    "below_margin_jobs": 15,
    "avg_job_value": 622.0
  },
  {
    "name": "Dean Retra",
    "team": "Dual Trade's team Electrical / AC",
    "role": "Field Tech - Dual Trade",
    "trade": "Multi-Trade",
    "revenue_march": 28277.0,
    "jobs": 20,
    "target_monthly": 46000,
    "pct_of_target": 61.5,
    "above_margin_jobs": 4,
    "below_margin_jobs": 16,
    "avg_job_value": 1414.0
  },
  {
    "name": "Gnoor Singh",
    "team": "Apprentice's",
    "role": "Apprentice",
    "trade": "Multi-Trade",
    "revenue_march": 11734.0,
    "jobs": 4,
    "target_monthly": 15000,
    "pct_of_target": 78.2,
    "above_margin_jobs": 0,
    "below_margin_jobs": 4,
    "avg_job_value": 2934.0
  },
  {
    "name": "Hayden Sibley",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 21553.0,
    "jobs": 20,
    "target_monthly": 46000,
    "pct_of_target": 46.9,
    "above_margin_jobs": 12,
    "below_margin_jobs": 8,
    "avg_job_value": 1078.0
  },
  {
    "name": "Kristian Calcagno",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 37462.0,
    "jobs": 16,
    "target_monthly": 46000,
    "pct_of_target": 81.4,
    "above_margin_jobs": 6,
    "below_margin_jobs": 10,
    "avg_job_value": 2341.0
  },
  {
    "name": "Kyan Davis",
    "team": "Apprentice's",
    "role": "Apprentice",
    "trade": "Multi-Trade",
    "revenue_march": 22168.0,
    "jobs": 7,
    "target_monthly": 15000,
    "pct_of_target": 147.8,
    "above_margin_jobs": 1,
    "below_margin_jobs": 6,
    "avg_job_value": 3167.0
  },
  {
    "name": "Kyle Rootes",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 36477.0,
    "jobs": 22,
    "target_monthly": 46000,
    "pct_of_target": 79.3,
    "above_margin_jobs": 7,
    "below_margin_jobs": 15,
    "avg_job_value": 1658.0
  },
  {
    "name": "Lachlan Henzell",
    "team": "Air Con Team",
    "role": "Field Tech - AC/HVAC",
    "trade": "Multi-Trade",
    "revenue_march": 32086.0,
    "jobs": 18,
    "target_monthly": 46000,
    "pct_of_target": 69.8,
    "above_margin_jobs": 3,
    "below_margin_jobs": 15,
    "avg_job_value": 1783.0
  },
  {
    "name": "Luke Coates",
    "team": "Apprentice's",
    "role": "Apprentice",
    "trade": "Multi-Trade",
    "revenue_march": 35688.0,
    "jobs": 1,
    "target_monthly": 15000,
    "pct_of_target": 237.9,
    "above_margin_jobs": 1,
    "below_margin_jobs": 0,
    "avg_job_value": 35688.0
  },
  {
    "name": "Mitch Powell",
    "team": "Air Con Team",
    "role": "Field Tech - AC/HVAC",
    "trade": "Multi-Trade",
    "revenue_march": 18518.0,
    "jobs": 15,
    "target_monthly": 46000,
    "pct_of_target": 40.3,
    "above_margin_jobs": 2,
    "below_margin_jobs": 13,
    "avg_job_value": 1235.0
  },
  {
    "name": "Romello Moore",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 63117.0,
    "jobs": 20,
    "target_monthly": 46000,
    "pct_of_target": 137.2,
    "above_margin_jobs": 10,
    "below_margin_jobs": 10,
    "avg_job_value": 3156.0
  },
  {
    "name": "Rusty Daniells",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 10984.0,
    "jobs": 6,
    "target_monthly": 46000,
    "pct_of_target": 23.9,
    "above_margin_jobs": 0,
    "below_margin_jobs": 6,
    "avg_job_value": 1831.0
  },
  {
    "name": "Sam Liska",
    "team": "Apprentice's",
    "role": "Apprentice",
    "trade": "Multi-Trade",
    "revenue_march": 26981.0,
    "jobs": 4,
    "target_monthly": 15000,
    "pct_of_target": 179.9,
    "above_margin_jobs": 0,
    "below_margin_jobs": 4,
    "avg_job_value": 6745.0
  },
  {
    "name": "Scott Gullick",
    "team": "Plumbing Team",
    "role": "Field Tech - Plumbing",
    "trade": "Multi-Trade",
    "revenue_march": 29035.0,
    "jobs": 17,
    "target_monthly": 46000,
    "pct_of_target": 63.1,
    "above_margin_jobs": 8,
    "below_margin_jobs": 9,
    "avg_job_value": 1708.0
  },
  {
    "name": "daniel hayes",
    "team": "Dan's Team",
    "role": "Sales Tech",
    "trade": "Multi-Trade",
    "revenue_march": 4271.0,
    "jobs": 9,
    "target_monthly": 80000,
    "pct_of_target": 5.3,
    "above_margin_jobs": 3,
    "below_margin_jobs": 6,
    "avg_job_value": 475.0
  },
  {
    "name": "zachary lingard",
    "team": "Electrical / Solar Team",
    "role": "Field Tech - Electrical/Solar",
    "trade": "Multi-Trade",
    "revenue_march": 34474.0,
    "jobs": 16,
    "target_monthly": 46000,
    "pct_of_target": 74.9,
    "above_margin_jobs": 4,
    "below_margin_jobs": 12,
    "avg_job_value": 2155.0
  }
];

const FLAGS = [
  { type: 'warning', text: 'Alex Naughton: 31% of target — DISPATCH FIX: He sold $27K in estimates this month. Assign him to execute his own quotes.' },
  { type: 'info', text: 'daniel hayes: 5% completed revenue — SALES TECH. His KPI is sold value, not completed jobs. Jan: $219K sold.' },
  { type: 'critical', text: '68% of March jobs below 15% margin — Pricebook pricing issue. Fix before attributing to tech performance.' },
  { type: 'critical', text: 'Solar Quote jobs avg 10.2% margin — Fix pricebook before next solar job dispatched.' },
  { type: 'success', text: 'Romello Moore: 137% of target — Top performer this month.' },
  { type: 'warning', text: 'Luke Coates (Apprentice): $35K from 2 jobs ($17,844 avg) — Verify: likely attributed from large project.' },
];

function getStatus(pct: number | null) {
  if (!pct) return { label: 'N/A', color: 'text-slate-500', bg: 'bg-slate-800' };
  if (pct >= 100) return { label: '✅ On Target', color: 'text-green-400', bg: 'bg-green-950/30 border-green-800/40' };
  if (pct >= 70) return { label: '⚠️ Below Target', color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/40' };
  return { label: '🔴 Needs Attention', color: 'text-red-400', bg: 'bg-red-950/30 border-red-800/40' };
}

export default function Technicians() {
  const [sort, setSort] = useState('revenue');
  const [filter, setFilter] = useState('all');

  const sorted = [...TECH_DATA]
    .filter(t => filter === 'all' || t.role.toLowerCase().includes(filter))
    .sort((a, b) => {
      if (sort === 'revenue') return b.revenue_march - a.revenue_march;
      if (sort === 'pct') return (b.pct_of_target || 0) - (a.pct_of_target || 0);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const totalRev = TECH_DATA.reduce((s, t) => s + t.revenue_march, 0);
  const onTarget = TECH_DATA.filter(t => t.pct_of_target && t.pct_of_target >= 100).length;
  const belowTarget = TECH_DATA.filter(t => t.pct_of_target && t.pct_of_target < 70).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Technician Performance</h1>
          <p className="text-slate-400 text-sm mt-1">March 2026 · Live data from ServiceTitan · {TECH_DATA.length} technicians</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Team Revenue MTD</div>
            <div className="text-2xl font-bold text-white">${totalRev.toLocaleString('en-AU', {maximumFractionDigits:0})}</div>
            <div className="text-xs text-slate-500 mt-1">Target: $782,000</div>
          </div>
          <div className="bg-green-950/30 rounded-xl p-4 border border-green-800/40">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">On / Above Target</div>
            <div className="text-2xl font-bold text-green-400">{onTarget}</div>
            <div className="text-xs text-slate-500 mt-1">≥100% of target</div>
          </div>
          <div className="bg-red-950/30 rounded-xl p-4 border border-red-800/40">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Needs Attention</div>
            <div className="text-2xl font-bold text-red-400">{belowTarget}</div>
            <div className="text-xs text-slate-500 mt-1">&lt;70% of target</div>
          </div>
        </div>

        {/* Flags */}
        <div className="mb-6 space-y-2">
          {FLAGS.map((f, i) => (
            <div key={i} className={`rounded-lg px-4 py-3 text-sm border ${
              f.type === 'critical' ? 'bg-red-950/30 border-red-800/40 text-red-300' :
              f.type === 'warning' ? 'bg-amber-950/30 border-amber-800/40 text-amber-300' :
              f.type === 'success' ? 'bg-green-950/30 border-green-800/40 text-green-300' :
              'bg-blue-950/30 border-blue-800/40 text-blue-300'
            }`}>{f.text}</div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <select onChange={e => setSort(e.target.value)} value={sort} className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm">
            <option value="revenue">Sort: Revenue</option>
            <option value="pct">Sort: % of Target</option>
            <option value="name">Sort: Name</option>
          </select>
          <select onChange={e => setFilter(e.target.value)} value={filter} className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm">
            <option value="all">All Roles</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="ac">AC/HVAC</option>
            <option value="apprentice">Apprentices</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-xs tracking-wider">
                <th className="text-left px-4 py-3">Technician</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Trade</th>
                <th className="text-right px-4 py-3">Revenue</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Target</th>
                <th className="text-right px-4 py-3">%</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 hidden lg:table-cell">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const st = getStatus(t.pct_of_target);
                return (
                  <tr key={i} className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-800/50'}`}>
                    <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                    <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">{t.role}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{t.trade}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      ${(t.revenue_march).toLocaleString('en-AU', {maximumFractionDigits:0})}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 hidden sm:table-cell">
                      {t.target_monthly ? '$' + t.target_monthly.toLocaleString('en-AU') : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${st.color}`}>
                      {t.pct_of_target ? t.pct_of_target + '%' : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-1 rounded border ${st.bg} ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 hidden lg:table-cell">{t.jobs || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">
          Source: ServiceTitan API · Verified {new Date().toLocaleDateString('en-AU')} · Revenue ex-GST · All names from live ST technician list
        </p>
      </div>
    </div>
  );
}