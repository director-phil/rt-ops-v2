"use client";

import { useState, useCallback } from "react";
import { Suspense } from "react";
import FilterBar from "@/app/components/FilterBar";
import Sidebar from "@/app/components/Sidebar";
import RevenueGauge from "@/app/components/RevenueGauge";
import RevenueTrend from "@/app/components/RevenueTrend";
import KpiCard from "@/app/components/KpiCard";
import RatesRow from "@/app/components/RatesRow";
import TechScorecard from "@/app/components/TechScorecard";
import CsrScorecard from "@/app/components/CsrScorecard";
import { METRICS } from "@/app/data/staticData";

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Brand header */}
      <div className="flex items-center px-4 py-2 gap-3" style={{ background: "#FF4500" }}>
        <span className="text-white font-black text-base tracking-tight">⚡ RT OPS</span>
        <span className="text-white/70 text-sm">Reliable Tradies · Operations Dashboard</span>
      </div>

      {/* Filter bar */}
      <Suspense fallback={null}>
        <FilterBar onRefresh={handleRefresh} refreshing={refreshing} />
      </Suspense>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar section="overview" />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5" key={refreshKey}>

          {/* ── Row 1: Revenue Gauge + Trend ── */}
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">Revenue</div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-64 flex-shrink-0">
                <RevenueGauge completed={METRICS.completedRevenue} target={METRICS.revenueTarget} />
              </div>
              <RevenueTrend />
            </div>
          </section>

          {/* ── Row 2: Company Metrics ── */}
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">Company Metrics</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard
                label="Total Sales"
                value={`$${(METRICS.totalSales / 1000).toFixed(0)}k`}
                sub="$581,020"
                accent
                icon="💰"
              />
              <KpiCard
                label="Closed Avg Sale"
                value={`$${METRICS.closedAvgSale.toLocaleString()}`}
                sub="Per closed job"
                icon="🎯"
              />
              <KpiCard
                label="Completed Revenue"
                value={`$${(METRICS.completedRevenue / 1000).toFixed(0)}k`}
                sub="$510,216"
                accent
                icon="✅"
              />
              <KpiCard
                label="Opportunity Job Avg"
                value={`$${METRICS.opportunityJobAvg.toLocaleString()}`}
                sub="Per opportunity"
                icon="📊"
              />
              <KpiCard
                label="Call Booking Rate"
                value={`${METRICS.callBookingRate}%`}
                sub="Target 75%+"
                icon="📞"
              />
              <KpiCard
                label="Total Conversion"
                value={`${METRICS.totalConversionRate}%`}
                sub="Opps → closed"
                icon="🔄"
              />
            </div>
          </section>

          {/* ── Row 3: Rates ── */}
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">Performance Rates</div>
            <RatesRow />
          </section>

          {/* ── Row 4: Technician Scorecards ── */}
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">Technician Scorecards</div>
            <TechScorecard />
          </section>

          {/* ── Row 5: CSR Scorecards ── */}
          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-3">CSR Scorecards</div>
            <CsrScorecard />
          </section>

        </main>
      </div>
    </div>
  );
}
