"use client";

import { useApi } from "@/app/lib/use-api";

interface CSR { name: string; calls?: number; booked?: number; bookingRate?: number; }
interface CsrData { ok: boolean; csrs: CSR[]; noData?: boolean; message?: string; updatedAt: string; }

export default function CsrScorecard() {
  const { data, loading } = useApi<CsrData>("/api/csrs", {});

  const csrs = data?.csrs ?? [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="text-sm font-bold uppercase tracking-widest text-zinc-300">CSR Scorecards</div>
        <div className="text-xs text-zinc-600 mt-0.5">Call booking performance — live from ServiceTitan</div>
      </div>
      {loading ? (
        <div className="px-5 py-8 text-center text-zinc-600 text-sm animate-pulse">Loading…</div>
      ) : csrs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="text-zinc-500 text-sm">CSR call data not available via API</div>
          <div className="text-zinc-700 text-xs mt-1">{data?.message || "Contact ServiceTitan support to enable CRM calls access"}</div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {csrs.map(csr => {
            const rate = csr.bookingRate ?? 0;
            const isAbove = rate >= 90;
            const isAmber = rate >= 75 && rate < 90;
            const isBelow = rate < 75;
            return (
              <div key={csr.name} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{csr.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {csr.calls ?? "—"} calls · {csr.booked ?? "—"} booked
                      {isBelow && <span className="ml-2 text-red-400 font-bold">⚠ Below 75% floor</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${isAbove ? "text-green-400" : isAmber ? "text-yellow-400" : "text-red-400"}`}>
                      {rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-zinc-600">booking rate</div>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${Math.min(rate, 100)}%`, background: isAbove ? "#22c55e" : isAmber ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
