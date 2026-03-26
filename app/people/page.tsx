"use client";

import { useApi } from "../lib/use-api";

type TechItem = {
  name: string;
  revenueMTD: number;
  jobCount: number;
  commission: number;
  progressPct: number;
  thresholdGap: number;
  meetsThreshold: boolean;
};

type CsrItem = {
  name: string;
  bookingRate: number;
  inboundCalls: number;
  booked: number;
  unbooked: number;
  bonusAmount: number;
  commissionStatus: string;
  rateToThreshold: number;
};

type TechsData = { technicians: TechItem[]; updatedAt?: string };
type CsrData   = { csrs: CsrItem[]; totalBonus: number; bonusThreshold: number; bonusAmount: number; updatedAt?: string };

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function People() {
  const techs = useApi<TechsData>("/api/technicians", {});
  const csrs  = useApi<CsrData>("/api/csrs", {});

  const techList = techs.data?.technicians ?? [];
  const csrList  = csrs.data?.csrs ?? [];

  const totalMeetsThreshold    = techList.filter(t => t.meetsThreshold).length;
  const totalNotMeetsThreshold = techList.filter(t => !t.meetsThreshold).length;

  const updatedAt = csrs.data?.updatedAt ?? techs.data?.updatedAt;

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">PEOPLE</div>
        <div className="text-sm text-gray-400">
          CSR Performance + Tech Commissions
          {updatedAt && <span className="ml-2 text-gray-600">· {new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>

      {/* CSR PERFORMANCE */}
      <div className="section-header">📞 CSR PERFORMANCE — MARCH</div>

      {csrs.loading ? (
        <div className="space-y-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : csrs.error ? (
        <div className="card card-red mb-6 text-red-400 text-sm">{csrs.error}</div>
      ) : (
        <div className="space-y-3 mb-6">
          {csrList.map((person, i) => {
            const rateNum = person.bookingRate < 2 ? Math.round(person.bookingRate * 100) : Math.round(person.bookingRate);
            const rateStatus = rateNum >= 80 ? "green" : rateNum >= 70 ? "amber" : "red";
            const bonusPct = csrs.data?.bonusThreshold
              ? Math.round((rateNum / csrs.data.bonusThreshold) * 100)
              : 0;
            return (
              <div key={i} className={`card ${rateStatus === "green" ? "card-green" : rateStatus === "amber" ? "card-amber" : "card-red"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-black text-xl text-white">{person.name}</div>
                    <div className="text-xs text-gray-400">CSR</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${rateStatus === "green" ? "text-green-400" : rateStatus === "amber" ? "text-yellow-400" : "text-red-400"}`}>
                      {rateNum}%
                    </div>
                    <div className="text-xs text-gray-500">booking rate</div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>{person.booked} booked</span>
                  <span>/ {person.inboundCalls} inbound calls</span>
                </div>

                <div className="progress-bar mb-2">
                  <div
                    className={`progress-fill ${rateStatus === "green" ? "bg-green-500" : rateStatus === "amber" ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(rateNum, 100)}%` }}
                  />
                </div>

                {person.bonusAmount > 0 && (
                  <div className="border-t border-gray-800 pt-2 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Commission</span>
                      <span className={`text-xs font-bold ${person.commissionStatus === "earned" ? "text-green-400" : "text-yellow-400"}`}>
                        {fmt(person.bonusAmount)} {person.commissionStatus === "earned" ? "✓ Earned" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {csrList.length === 0 && (
            <div className="card text-gray-500 text-sm text-center py-4">No CSR data available</div>
          )}
        </div>
      )}

      {/* TECH COMMISSIONS */}
      <div className="section-header">TECH COMMISSION SUMMARY</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="card card-green p-3 text-center">
          <div className="text-2xl font-black text-green-400">
            {techs.loading ? "…" : totalMeetsThreshold}
          </div>
          <div className="text-xs text-gray-400 mt-1">Meet Threshold</div>
        </div>
        <div className="card card-red p-3 text-center">
          <div className="text-2xl font-black text-red-400">
            {techs.loading ? "…" : totalNotMeetsThreshold}
          </div>
          <div className="text-xs text-gray-400 mt-1">Below Threshold</div>
          <div className="text-xs text-red-400 font-semibold">&lt; $80k MTD</div>
        </div>
      </div>

      {/* Per tech commission quick list */}
      <div className="section-header">TECH COMMISSION DETAIL</div>

      {techs.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : techs.error ? (
        <div className="card card-red text-red-400 text-sm">{techs.error}</div>
      ) : (
        <div className="space-y-2">
          {[...techList]
            .sort((a, b) => b.revenueMTD - a.revenueMTD)
            .map((tech, i) => (
              <div key={i} className="card p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-white">{tech.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-orange-400 font-bold">${(tech.revenueMTD / 1000).toFixed(1)}k</span>
                    {tech.commission > 0 && (
                      <span className="text-xs text-green-400 font-bold">{fmt(tech.commission)} comm.</span>
                    )}
                    {!tech.meetsThreshold && (
                      <span className="text-xs text-red-400 font-bold">⚠</span>
                    )}
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div
                    className={`progress-fill ${tech.meetsThreshold ? "bg-green-500" : tech.progressPct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(tech.progressPct ?? 0, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {tech.progressPct?.toFixed(0)}% to threshold
                  {!tech.meetsThreshold && tech.thresholdGap > 0 && ` · ${fmt(tech.thresholdGap)} to go`}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
