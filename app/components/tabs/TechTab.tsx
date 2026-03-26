"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";

interface Technician {
  id: number;
  name: string;
  revenueMTD: number;
  prevRevenue: number | null;
  revChange: number | null;
  revChangePct: number | null;
  jobCount: number;
  hoursWorked: number;
  revPerHr: number | null;
  recalls: number;
  commission: number;
  meetsThreshold: boolean;
  progressPct: number;
  thresholdGap: number;
}

interface TechResponse {
  ok: boolean;
  period: string;
  commissionThreshold: number;
  technicians: Technician[];
  noData?: boolean;
  updatedAt: string;
  source: string;
  error?: string;
}

export default function TechTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const date  = params.get("date") || "mtd";
  const staff = params.get("staff") || "All Staff";

  const { data, loading, error, updatedAt } =
    useApi<TechResponse>("/api/technicians", { date }, refreshKey);

  const techs = data?.technicians?.filter(t =>
    staff === "All Staff" || t.name.toLowerCase().includes(staff.toLowerCase().replace(/-/g, " "))
  ) || [];

  return (
    <div className="p-4 lg:p-6 space-y-5">

      <DataPanel
        title={`Technician Performance · ${data?.period || date.toUpperCase()}`}
        source="ServiceTitan"
        updatedAt={updatedAt}
        loading={loading}
        error={error}
      >
        {data?.noData ? (
          <div className="p-8 text-center text-zinc-600">No tech data for this period</div>
        ) : techs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Technician</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Revenue MTD</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">vs Last Month</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Jobs</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Hours</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">$/hr</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Recalls</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Commission</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Progress to $80k</th>
                </tr>
              </thead>
              <tbody>
                {techs.map(t => {
                  const isPositive = (t.revChange || 0) > 0;
                  const isNegative = (t.revChange || 0) < 0;
                  return (
                    <tr key={t.id || t.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-orange-400">
                        ${t.revenueMTD.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.revChange !== null ? (
                          <span className={`text-xs font-bold ${isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-zinc-500"}`}>
                            {isPositive ? "↑" : isNegative ? "↓" : "→"}
                            ${Math.abs(t.revChange).toLocaleString()}
                            {t.revChangePct !== null && ` (${t.revChangePct > 0 ? "+" : ""}${t.revChangePct}%)`}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">No prev data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">{t.jobCount}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-300">{t.hoursWorked}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400">
                        {t.revPerHr ? `$${t.revPerHr}` : "—"}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${t.recalls > 1 ? "text-red-400 font-bold" : t.recalls > 0 ? "text-amber-400" : "text-green-400"}`}>
                        {t.recalls}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-green-400">
                        {t.meetsThreshold ? `$${t.commission.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className={`h-full rounded-full ${t.meetsThreshold ? "bg-green-500" : "bg-zinc-500"}`}
                              style={{ width: `${t.progressPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600 whitespace-nowrap">
                            {t.progressPct}%
                          </span>
                        </div>
                        {!t.meetsThreshold && (
                          <div className="text-[10px] text-zinc-600 mt-0.5">
                            ${t.thresholdGap.toLocaleString()} to threshold
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : !loading && (
          <div className="p-8 text-center text-zinc-600">No technician data returned</div>
        )}
      </DataPanel>

    </div>
  );
}
