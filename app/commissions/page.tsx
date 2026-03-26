'use client';
import { useApi } from '../lib/use-api';

interface TechComm {
  name: string;
  grossJobsValue: number;
  netValue: number;
  installerCommission: number;
  salesmanCommission: number;
  totalCommission: number;
  jobCount: number;
  meetsThreshold: boolean;
  progressPct: number;
  thresholdGap: number;
}

interface CommData {
  ok: boolean;
  period: string;
  threshold: number;
  totalCommission: number;
  earnerCount: number;
  techCount: number;
  technicians: TechComm[];
  updatedAt: string;
}

function fmt(n: number) { return (n || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 }); }

export default function Commissions() {
  const { data, loading, error } = useApi<CommData>('/api/commissions', {});

  const techs = data?.technicians ?? [];
  const earners = techs.filter(t => t.meetsThreshold);
  const nonEarners = techs.filter(t => !t.meetsThreshold);
  const totalComm = data?.totalCommission ?? 0;
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).toLocaleString('en-AU') : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading live commission data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Commission Calculator</h1>
          <p className="text-slate-400 text-sm mt-1">
            {data?.period ?? 'Loading…'} · Live from ServiceTitan
            {updatedAt && ` · Updated ${updatedAt}`}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Commission</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">${totalComm.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">MTD payable</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Earners</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{earners.length}</div>
            <div className="text-xs text-slate-500 mt-1">Above $80K threshold</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Below Threshold</div>
            <div className="text-2xl font-bold text-slate-400 mt-1">{nonEarners.length}</div>
            <div className="text-xs text-slate-500 mt-1">Not yet at $80K MTD</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Threshold</div>
            <div className="text-2xl font-bold text-white mt-1">$80,000</div>
            <div className="text-xs text-slate-500 mt-1">Monthly revenue target</div>
          </div>
        </div>

        {/* Commission Rules */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6">
          <div className="text-sm font-semibold text-white mb-2">Commission Rules</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
            <div><span className="text-white font-medium">Rate:</span> 1.5% installer + 1.5% salesman = 3% if same person</div>
            <div><span className="text-white font-medium">Threshold:</span> $80,000 revenue/month to qualify</div>
            <div><span className="text-white font-medium">Blocked if:</span> margin &lt;15%, invoice unpaid, callback job</div>
          </div>
        </div>

        {/* Tech Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-slate-800">
            <div className="text-sm font-semibold text-white">Tech Commission Summary</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right px-4 py-3">Revenue MTD</th>
                  <th className="text-right px-4 py-3">Jobs</th>
                  <th className="text-right px-4 py-3">Net Value</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-right px-4 py-3">Progress</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...techs].sort((a, b) => b.grossJobsValue - a.grossJobsValue).map((t, i) => (
                  <tr key={t.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-white">
                      <span className="text-slate-600 text-xs mr-2">{i + 1}</span>
                      {t.name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-400 font-bold">
                      ${fmt(t.grossJobsValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{t.jobCount}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">${fmt(t.netValue)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={t.meetsThreshold ? 'text-green-400' : 'text-slate-500'}>
                        {t.meetsThreshold ? `$${t.totalCommission.toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${t.meetsThreshold ? 'bg-green-500' : 'bg-slate-600'}`}
                               style={{ width: `${Math.min(t.progressPct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{t.progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.meetsThreshold
                        ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Earner ✓</span>
                        : <span className="text-xs text-slate-500">${fmt(t.thresholdGap)} to go</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
