"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";
import { useState } from "react";

interface TechCommission {
  techId: number;
  name: string;
  role: string;
  grossJobsValue: number;
  netValue: number;
  salesmanGross: number;
  installerGross: number;
  salesmanCommission: number;
  installerCommission: number;
  totalCommission: number;
  meetsThreshold: boolean;
  progressPct: number;
  thresholdGap: number;
}

interface CsrData {
  name: string;
  inboundCalls: number;
  outboundCalls: number;
  totalCalls: number;
  booked: number;
  bookingRate: number;
  commissionStatus: string;
  bonusAmount: number;
  rateToThreshold: number;
}

interface CommissionsResponse {
  ok: boolean;
  period: string;
  threshold: number;
  netSaleFactor: number;
  commissionRate: number;
  totalCommission: number;
  earnerCount: number;
  techCount: number;
  technicians: TechCommission[];
  updatedAt: string;
  source: string;
  error?: string;
}

interface CsrsResponse {
  ok: boolean;
  period: string;
  csrs: CsrData[];
  totalBonus: number;
  bonusThreshold: number;
  bonusAmount: number;
  noData?: boolean;
  updatedAt: string;
  source: string;
  error?: string;
}

export default function CommissionsTab({ refreshKey }: { refreshKey?: number }) {
  // Commission is always MTD — threshold is monthly, "today" makes no sense for commissions
  const { data: commData, loading: commLoading, error: commError, updatedAt: commUpdated } =
    useApi<CommissionsResponse>("/api/commissions", { date: "mtd" }, refreshKey);

  const { data: csrData, loading: csrLoading, error: csrError, updatedAt: csrUpdated } =
    useApi<CsrsResponse>("/api/csrs", { date: "mtd" }, refreshKey);

  const [showNonEarners, setShowNonEarners] = useState(false);

  const earners = commData?.technicians?.filter(t => t.meetsThreshold) || [];
  const nonEarners = commData?.technicians?.filter(t => !t.meetsThreshold) || [];

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Commission Rules */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Commission Rules</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1">
            <div className="text-zinc-400 font-bold">KPI Threshold</div>
            <div className="text-2xl font-black text-orange-400">$80,000</div>
            <div className="text-zinc-500">Revenue in any of: Sold only / Sold+Completed / Completed only</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1">
            <div className="text-zinc-400 font-bold">Commission Rate</div>
            <div className="font-bold text-white">1.5% Salesman + 1.5% Installer</div>
            <div className="text-zinc-500">Same person = 3% total</div>
            <div className="text-zinc-500">Net Sale = Invoice × 0.95 (5% system fee)</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1">
            <div className="text-zinc-400 font-bold">Example</div>
            <div className="text-zinc-300">$10,000 job</div>
            <div className="text-zinc-400">→ Net: $9,500</div>
            <div className="text-green-400">→ Salesman: $142.50</div>
            <div className="text-blue-400">→ Installer: $142.50</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-600">
          ⛔ Blocked if: margin &lt;15% | invoice unpaid | callback job
        </div>
      </div>

      {/* Summary KPIs */}
      <DataPanel
        title={`Commission Summary · ${commData?.period || "MTD"}`}
        source="ServiceTitan"
        updatedAt={commUpdated}
        loading={commLoading}
        error={commError}
      >
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <CommKpi label="Total Commission" value={commData ? `$${commData.totalCommission.toFixed(2)}` : "—"} sub={commData?.period || ""} color="orange" loading={commLoading} />
            <CommKpi label="Techs Earning" value={commData ? String(commData.earnerCount) : "—"} sub={`Above $${((commData?.threshold || 80000)/1000).toFixed(0)}k threshold`} color="green" loading={commLoading} />
            <CommKpi label="Techs Below Floor" value={commData ? String((commData.techCount || 0) - (commData.earnerCount || 0)) : "—"} sub="Not yet at threshold" color="amber" loading={commLoading} />
            <CommKpi label="Commission Rate" value="1.5% / role" sub="Net sale × 0.95 × 0.015" color="white" loading={false} />
          </div>

          {/* Earners Table */}
          {earners.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/30">
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Tech Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Role</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Gross Jobs</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Net (×0.95)</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Salesman @1.5%</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Installer @1.5%</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earners.map(t => (
                    <tr key={t.techId || t.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          t.role === "Both" ? "bg-orange-500/20 text-orange-400" :
                          t.role === "Salesman" ? "bg-blue-500/20 text-blue-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>{t.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">${t.grossJobsValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400">${t.netValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-400">${t.salesmanCommission.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-400">${t.installerCommission.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-orange-400">${t.totalCommission.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Earned</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Progress to threshold for non-earners */}
          {nonEarners.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowNonEarners(s => !s)}
                className="text-xs text-zinc-500 hover:text-zinc-300 mb-3"
              >
                {showNonEarners ? "▲ Hide" : `▼ Show ${nonEarners.length} techs below $80k threshold`}
              </button>
              {showNonEarners && (
                <div className="space-y-2">
                  {nonEarners.map(t => (
                    <div key={t.techId || t.name} className="bg-zinc-800/30 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-400">{t.name}</span>
                        <span className="text-xs text-zinc-600">
                          ${t.grossJobsValue.toLocaleString()} / $80,000 · needs ${t.thresholdGap.toLocaleString()} more
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${t.progressPct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DataPanel>

      {/* CSR Commissions */}
      <DataPanel
        title="CSR Commissions — Booking Rate Bonus"
        source="ServiceTitan"
        updatedAt={csrUpdated}
        loading={csrLoading}
        error={csrError}
      >
        <div className="p-5">
          <div className="text-xs text-zinc-500 mb-4">
            Bonus: <span className="text-green-400 font-bold">$200/month</span> if booking rate ≥ 90%
          </div>
          {csrData?.noData ? (
            <div className="text-sm text-zinc-600 py-4 text-center">No CSR booking data for this period</div>
          ) : csrData?.csrs && csrData.csrs.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/30">
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">CSR Name</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Inbound</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Outbound</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Booked</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Commission Status</th>
                  </tr>
                </thead>
                <tbody>
                  {csrData.csrs.map(csr => {
                    const meetsBonus = csr.bookingRate >= 90;
                    return (
                      <tr key={csr.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="px-4 py-3 font-medium text-white">{csr.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">{csr.inboundCalls}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400">{csr.outboundCalls}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-300">{csr.booked}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${meetsBonus ? "text-green-400" : csr.bookingRate >= 75 ? "text-amber-400" : "text-red-400"}`}>
                          {csr.bookingRate}%
                        </td>
                        <td className="px-4 py-3">
                          {meetsBonus
                            ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ $200 Earned</span>
                            : <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                                Needs +{csr.rateToThreshold.toFixed(1)}% more
                              </span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : !csrLoading && (
            <div className="text-sm text-zinc-600 py-4 text-center">
              CSR booking data not yet available in ServiceTitan for this period
            </div>
          )}
          {csrData?.totalBonus != null && csrData.totalBonus > 0 && (
            <div className="mt-3 text-right text-sm font-bold text-green-400">
              Total CSR bonuses: ${csrData.totalBonus.toLocaleString()}
            </div>
          )}
        </div>
      </DataPanel>

    </div>
  );
}

function CommKpi({ label, value, sub, color, loading }: { label: string; value: string; sub: string; color: string; loading: boolean }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      {loading
        ? <div className="text-2xl font-black text-zinc-700 animate-pulse">—</div>
        : <div className={`text-2xl font-black ${c}`}>{value}</div>
      }
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
