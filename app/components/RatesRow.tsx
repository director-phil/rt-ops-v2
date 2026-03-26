"use client";

import { METRICS } from "@/app/data/staticData";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
}

function ProgressBar({ value, max = 100, color = "#FF4500" }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function RatesRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Call Booking Rate */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Call Booking Rate</div>
        <div className="text-2xl font-black text-white mt-1">{METRICS.callBookingRate}%</div>
        <ProgressBar value={METRICS.callBookingRate} color="#FF4500" />
        <div className="text-xs text-zinc-600 mt-1">Target: 75%+</div>
      </div>

      {/* Total Conversion */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Conversion Rate</div>
        <div className="text-2xl font-black text-white mt-1">{METRICS.totalConversionRate}%</div>
        <ProgressBar value={METRICS.totalConversionRate} color="#f59e0b" />
        <div className="text-xs text-zinc-600 mt-1">Industry avg: 60%</div>
      </div>

      {/* CSAT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Customer Satisfaction</div>
        <div className="text-2xl font-black text-green-400 mt-1">⭐ {METRICS.customerSatisfaction}</div>
        <ProgressBar value={METRICS.customerSatisfaction} max={5} color="#22c55e" />
        <div className="text-xs text-zinc-600 mt-1">out of 5.0</div>
      </div>

      {/* Cancellations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Cancellations</div>
        <div className="text-2xl font-black text-red-400 mt-1">{METRICS.totalCancellations}</div>
        <div className="text-xs text-zinc-600 mt-3">This month</div>
      </div>

      {/* Memberships */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Memberships Converted</div>
        <div className="text-2xl font-black text-blue-400 mt-1">{METRICS.membershipsConverted}</div>
        <div className="text-xs text-zinc-600 mt-3">This month</div>
      </div>
    </div>
  );
}
