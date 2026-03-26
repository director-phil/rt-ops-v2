"use client";

import { useApi } from "@/app/lib/use-api";

type CsrItem = { name: string; bookingRate: number; inboundCalls: number; booked: number; totalCalls: number };
type CsrResponse = { csrs: CsrItem[]; updatedAt: string };

function ProgressBar({ value, max = 100, color = "#FF4500" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function RatesRow() {
  const { data, loading, updatedAt } = useApi<CsrResponse>("/api/csrs", {});

  // Compute overall booking rate across all CSRs
  const totalBooked   = data?.csrs.reduce((s, c) => s + c.booked, 0) ?? 0;
  const totalInbound  = data?.csrs.reduce((s, c) => s + c.inboundCalls, 0) ?? 0;
  const overallRate   = totalInbound > 0 ? Math.round((totalBooked / totalInbound) * 100) : null;

  // Best individual booking rate (used for conversion proxy)
  const bestRate = data?.csrs.length
    ? Math.round(
        Math.max(...data.csrs.map(c => c.bookingRate < 2 ? c.bookingRate * 100 : c.bookingRate))
      )
    : null;

  const updatedLabel = updatedAt ? new Date(updatedAt).toLocaleString() : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Call Booking Rate */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Call Booking Rate</div>
        <div className="text-2xl font-black text-white mt-1">
          {loading ? "…" : overallRate !== null ? `${overallRate}%` : "—"}
        </div>
        {overallRate !== null && <ProgressBar value={overallRate} color="#FF4500" />}
        <div className="text-xs text-zinc-600 mt-1">
          Target: 75%+{updatedLabel ? ` · ${updatedLabel}` : ""}
        </div>
      </div>

      {/* Best CSR Rate (conversion proxy) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Best CSR Rate</div>
        <div className="text-2xl font-black text-white mt-1">
          {loading ? "…" : bestRate !== null ? `${bestRate}%` : "—"}
        </div>
        {bestRate !== null && <ProgressBar value={bestRate} color="#f59e0b" />}
        <div className="text-xs text-zinc-600 mt-1">Top individual booking rate</div>
      </div>

      {/* CSAT — not available via API */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Customer Satisfaction</div>
        <div className="text-2xl font-black text-zinc-500 mt-1">—</div>
        <div className="text-xs text-zinc-600 mt-3">Not available via API</div>
      </div>

      {/* Cancellations — not available via API */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Cancellations</div>
        <div className="text-2xl font-black text-zinc-500 mt-1">—</div>
        <div className="text-xs text-zinc-600 mt-3">Not available via API</div>
      </div>

      {/* Memberships — not available via API */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Memberships Converted</div>
        <div className="text-2xl font-black text-zinc-500 mt-1">—</div>
        <div className="text-xs text-zinc-600 mt-3">Not available via API</div>
      </div>
    </div>
  );
}
