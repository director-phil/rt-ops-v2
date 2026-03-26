"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel, { KpiCompare } from "@/app/components/DataPanel";
import RevenueTrend from "@/app/components/RevenueTrend";
import RatesRow     from "@/app/components/RatesRow";

// Verified static numbers from Phillip's ST screenshot — March 2026
const ST_VERIFIED = {
  totalRevenue: 530900,
  missedRevenue: 174510,
  totalSales: 665582,
  closedAvgSale: 2427,
  completedRevenue: 529809,
  callBookingRate: 68,
  totalConversionRate: 54,
  customerSatisfaction: 4.7,
  totalCancellations: 94,
  memberships: 115,
  verifiedDate: "2026-03-25",
};

interface RevenueData {
  ok: boolean;
  period: string;
  current: { total: number; count: number };
  previous: { total: number };
  change: number;
  changePct: number;
  updatedAt: string;
  source: string;
  error?: string;
}

export default function OverviewTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const date  = params.get("date") || "mtd";
  const trade = params.get("trade") || "all";
  const staff = params.get("staff") || "All Staff";

  const { data: revData, loading: revLoading, error: revError, updatedAt: revUpdated } =
    useApi<RevenueData>("/api/revenue", { date, trade, staff }, refreshKey);

  const prevLabel = revData?.previous?.total
    ? `$${(revData.previous.total / 1000).toFixed(0)}k prev`
    : null;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* ST Verified KPIs — Phillip's screenshot data */}
      <DataPanel
        title="Overview — Verified from ServiceTitan"
        source="ServiceTitan"
        updatedAt={`${ST_VERIFIED.verifiedDate}T00:00:00.000Z`}
        loading={false}
      >
        <div className="p-5 space-y-4">
          <div className="text-xs text-zinc-600 mb-2">
            ✅ Verified: {ST_VERIFIED.verifiedDate} from ST screenshot — these figures are confirmed by Phillip
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCompare
              label="Total Revenue"
              value={`$${(ST_VERIFIED.totalRevenue/1000).toFixed(1)}k`}
              icon="💰"
              accent
            />
            <KpiCompare
              label="Missed Revenue"
              value={`$${(ST_VERIFIED.missedRevenue/1000).toFixed(1)}k`}
              icon="❌"
            />
            <KpiCompare
              label="Total Sales"
              value={`$${(ST_VERIFIED.totalSales/1000).toFixed(0)}k`}
              icon="🎯"
            />
            <KpiCompare
              label="Closed Avg Sale"
              value={`$${ST_VERIFIED.closedAvgSale.toLocaleString()}`}
              icon="📊"
            />
            <KpiCompare
              label="Completed Rev"
              value={`$${(ST_VERIFIED.completedRevenue/1000).toFixed(0)}k`}
              icon="✅"
            />
            <KpiCompare
              label="Memberships"
              value={`${ST_VERIFIED.memberships}`}
              icon="⭐"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCompare
              label="Call Booking Rate"
              value={`${ST_VERIFIED.callBookingRate}%`}
              icon="📞"
            />
            <KpiCompare
              label="Conversion Rate"
              value={`${ST_VERIFIED.totalConversionRate}%`}
              icon="🔄"
            />
            <KpiCompare
              label="Customer Satisfaction"
              value={`${ST_VERIFIED.customerSatisfaction} ★`}
              icon="😊"
            />
            <KpiCompare
              label="Cancellations"
              value={`${ST_VERIFIED.totalCancellations}`}
              icon="🚫"
            />
          </div>
        </div>
      </DataPanel>

      {/* Live Revenue from API */}
      <DataPanel
        title={`Live Revenue · ${revData?.period || date.toUpperCase()}`}
        source="ServiceTitan (live)"
        updatedAt={revUpdated}
        loading={revLoading}
        error={revError}
      >
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <KpiCompare
              label="Revenue This Period"
              value={revData?.current?.total ? `$${(revData.current.total/1000).toFixed(1)}k` : "—"}
              prevValue={prevLabel}
              change={revData?.change}
              changePct={revData?.changePct}
              icon="💰"
              accent
              loading={revLoading}
            />
            <KpiCompare
              label="Invoices"
              value={revData?.current?.count ? String(revData.current.count) : "—"}
              icon="🧾"
              loading={revLoading}
            />
            <KpiCompare
              label="Prev Period"
              value={revData?.previous?.total ? `$${(revData.previous.total/1000).toFixed(1)}k` : "—"}
              icon="📅"
              loading={revLoading}
            />
          </div>
          <RevenueTrend />
        </div>
      </DataPanel>

      {/* Performance Rates */}
      <DataPanel title="Performance Rates" source="ServiceTitan" updatedAt={null}>
        <div className="p-4">
          <RatesRow />
        </div>
      </DataPanel>
    </div>
  );
}
