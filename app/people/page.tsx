"use client";
import { BUSINESS_DATA as D } from "../data/business";

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function People() {
  const { csr, technicians } = D;

  const totalCommissionEligible = technicians.reduce((s, t) => s + t.commissionEligible, 0);
  const totalCommissionBlocked = technicians.reduce((s, t) => s + t.commissionBlocked, 0);

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">PEOPLE</div>
        <div className="text-sm text-gray-400">CSR Performance + Tech Commissions</div>
      </div>

      {/* Today's Call Queue */}
      <div className="section-header">📞 TODAY&apos;S CALL QUEUE</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card p-3 text-center">
          <div className="text-2xl font-black text-white">{csr.today.calls}</div>
          <div className="text-xs text-gray-500 mt-1">Calls In</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-black text-green-400">{csr.today.booked}</div>
          <div className="text-xs text-gray-500 mt-1">Booked</div>
        </div>
        <div className={`card p-3 text-center ${csr.today.rate < 40 ? "card-red" : "card-amber"}`}>
          <div className={`text-2xl font-black ${csr.today.rate < 40 ? "text-red-400" : "text-yellow-400"}`}>
            {csr.today.rate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Rate</div>
        </div>
      </div>

      {/* Unbooked Alert */}
      <div className="card card-amber mb-4">
        <div className="flex items-start gap-2">
          <span className="text-2xl">💸</span>
          <div>
            <div className="text-yellow-400 font-black">59 unbooked calls this month</div>
            <div className="text-gray-300 text-sm">{fmt(csr.recoverableRevenue)} recoverable revenue sitting on the table</div>
            <div className="text-yellow-300 text-xs mt-1 font-semibold">→ Fix Sunday call abandonment (42% loss)</div>
          </div>
        </div>
      </div>

      {/* CSR Scorecards */}
      <div className="section-header">CSR PERFORMANCE — MARCH</div>
      <div className="space-y-3 mb-6">
        {csr.monthly.map((person, i) => {
          const bonusPct = Math.round((person.commissionEarned / person.bonus) * 100);
          const rateStatus = person.bookingRate >= 80 ? "green" : person.bookingRate >= 70 ? "amber" : "red";
          return (
            <div key={i} className={`card ${rateStatus === "green" ? "card-green" : rateStatus === "amber" ? "card-amber" : "card-red"}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-black text-xl text-white">{person.name}</div>
                  <div className="text-xs text-gray-400">CSR</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-black ${
                      rateStatus === "green"
                        ? "text-green-400"
                        : rateStatus === "amber"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {person.bookingRate}%
                  </div>
                  <div className="text-xs text-gray-500">booking rate</div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{person.callsBooked} booked</span>
                <span>/ {person.callsHandled} calls</span>
              </div>

              <div className="progress-bar mb-2">
                <div
                  className={`progress-fill ${rateStatus === "green" ? "bg-green-500" : rateStatus === "amber" ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${person.bookingRate}%` }}
                />
              </div>

              {/* Commission / Bonus */}
              <div className="border-t border-gray-800 pt-2 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Bonus progress</span>
                  <span className="text-xs text-white font-bold">
                    ${person.commissionEarned} / ${person.bonus} 🎯
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-fill bg-purple-500"
                    style={{ width: `${Math.min(bonusPct, 100)}%` }}
                  />
                </div>
                {bonusPct >= 90 && (
                  <div className="text-purple-400 text-xs font-bold mt-1">
                    🎯 Getting close to ${person.bonus} bonus!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Commissions Summary */}
      <div className="section-header">TECH COMMISSION SUMMARY</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="card card-green p-3 text-center">
          <div className="text-2xl font-black text-green-400">{totalCommissionEligible}</div>
          <div className="text-xs text-gray-400 mt-1">Jobs Eligible</div>
        </div>
        <div className="card card-red p-3 text-center">
          <div className="text-2xl font-black text-red-400">{totalCommissionBlocked}</div>
          <div className="text-xs text-gray-400 mt-1">Jobs Blocked</div>
          <div className="text-xs text-red-400 font-semibold">margin &lt; 15%</div>
        </div>
      </div>

      {/* Blocked commission detail */}
      <div className="card card-red mb-4">
        <div className="font-bold text-red-400 mb-2">🚨 Alex Naughton — Commission Blocked</div>
        <div className="text-sm text-gray-300">
          Most jobs have margin &lt;15% due to wrong dispatch (he&apos;s in the field, not sales).
        </div>
        <div className="text-yellow-300 text-xs mt-2 font-semibold">
          → Fix dispatch: Move Alex to executing his own quotes → unlock commissions + $30K/month revenue
        </div>
      </div>

      {/* Per tech commission quick list */}
      <div className="section-header">TECH COMMISSION DETAIL</div>
      <div className="space-y-2">
        {technicians.map((tech, i) => {
          const total = tech.commissionEligible + tech.commissionBlocked;
          const eligiblePct = total > 0 ? Math.round((tech.commissionEligible / total) * 100) : 0;
          return (
            <div key={i} className="card p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-white">{tech.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400 font-bold">{tech.commissionEligible}✓</span>
                  {tech.commissionBlocked > 0 && (
                    <span className="text-xs text-red-400 font-bold">{tech.commissionBlocked}✗</span>
                  )}
                </div>
              </div>
              {total > 0 && (
                <div className="progress-bar" style={{ height: 5 }}>
                  <div
                    className={`progress-fill ${eligiblePct >= 80 ? "bg-green-500" : eligiblePct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${eligiblePct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
