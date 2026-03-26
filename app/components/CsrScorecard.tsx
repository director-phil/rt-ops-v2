"use client";

import { CSRS } from "@/app/data/staticData";

export default function CsrScorecard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="text-sm font-bold uppercase tracking-widest text-zinc-300">CSR Scorecards</div>
        <div className="text-xs text-zinc-600 mt-0.5">Call booking performance</div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {CSRS.map(csr => {
          const isAbove = csr.rate >= 90;
          const isAmber = csr.rate >= 75 && csr.rate < 90;
          const isBelow = csr.rate < 75 && csr.status !== "dispatch";
          const isDispatch = csr.status === "dispatch";
          return (
            <div key={csr.name} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{csr.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {csr.calls} calls · {csr.booked} booked
                    {isDispatch && <span className="ml-2 text-zinc-400 italic">Dispatch role</span>}
                    {isBelow && <span className="ml-2 text-red-400 font-bold">⚠ Below 75% floor</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${
                    isAbove ? "text-green-400" :
                    isAmber ? "text-yellow-400" :
                    isBelow ? "text-red-400" :
                    "text-zinc-400"
                  }`}>{csr.rate}%</div>
                  <div className="text-xs text-zinc-600">booking rate</div>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{
                       width: `${csr.rate}%`,
                       background: isAbove ? "#22c55e" : isAmber ? "#f59e0b" : isBelow ? "#ef4444" : "#6b7280"
                     }} />
              </div>
              <div className="flex justify-between text-xs text-zinc-700 mt-1">
                <span>0%</span>
                <span className="text-zinc-600">75% floor</span>
                <span>100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
