"use client";

import RevenueGauge from "@/app/components/RevenueGauge";
import RevenueTrend from "@/app/components/RevenueTrend";
import KpiCard      from "@/app/components/KpiCard";
import RatesRow     from "@/app/components/RatesRow";
import CsrScorecard from "@/app/components/CsrScorecard";
import { METRICS, ACTIONS }  from "@/app/data/staticData";

const criticalActions = ACTIONS.filter(a => a.priority === "critical" && a.status !== "done");

export default function OverviewTab() {
  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Critical alert banner */}
      {criticalActions.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">
            ⚠ {criticalActions.length} Critical Actions Required
          </div>
          <div className="space-y-1">
            {criticalActions.map(a => (
              <div key={a.id} className="text-sm text-red-300">
                • {a.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue section */}
      <section>
        <SectionHeader>Revenue · Month to Date</SectionHeader>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-64 flex-shrink-0">
            <RevenueGauge completed={METRICS.completedRevenue} target={METRICS.revenueTarget} />
          </div>
          <RevenueTrend />
        </div>
      </section>

      {/* Company KPIs */}
      <section>
        <SectionHeader>Company Metrics</SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Sales"         value={`$${(METRICS.totalSales/1000).toFixed(0)}k`}         sub="$581,020"     accent icon="💰" />
          <KpiCard label="Closed Avg Sale"     value={`$${METRICS.closedAvgSale.toLocaleString()}`}        sub="Per closed job"       icon="🎯" />
          <KpiCard label="Completed Revenue"   value={`$${(METRICS.completedRevenue/1000).toFixed(0)}k`}   sub="$510,216"     accent icon="✅" />
          <KpiCard label="Opp Job Avg"         value={`$${METRICS.opportunityJobAvg.toLocaleString()}`}    sub="Per opportunity"      icon="📊" />
          <KpiCard label="Call Booking Rate"   value={`${METRICS.callBookingRate}%`}                       sub="Target 75%+"          icon="📞" />
          <KpiCard label="Total Conversion"    value={`${METRICS.totalConversionRate}%`}                   sub="Opps → closed"        icon="🔄" />
        </div>
      </section>

      {/* EBITDA alert */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
        <div className="text-3xl">📉</div>
        <div>
          <div className="font-bold text-amber-400">EBITDA: {METRICS.ebitdaActualPct}% vs {METRICS.ebitdaTargetPct}% target</div>
          <div className="text-sm text-zinc-400 mt-0.5">
            Gap of {METRICS.ebitdaTargetPct - METRICS.ebitdaActualPct}% · {METRICS.marginBelowFloorPct}% of jobs are below 15% margin · Pricebook urgently needs review
          </div>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <div className="text-2xl font-black text-amber-400">
            ${((METRICS.ebitdaTargetPct - METRICS.ebitdaActualPct) / 100 * METRICS.completedRevenue / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-zinc-500">Monthly EBITDA gap</div>
        </div>
      </div>

      {/* Rates */}
      <section>
        <SectionHeader>Performance Rates</SectionHeader>
        <RatesRow />
      </section>

      {/* CSR */}
      <section>
        <SectionHeader>CSR Scorecards</SectionHeader>
        <CsrScorecard />
      </section>

    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">{children}</div>;
}
