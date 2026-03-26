"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ReconcileResponse {
  ok: boolean;
  period: string;
  xeroAvailable: boolean;
  stTotal: number;
  stCount: number;
  xeroTotal: number;
  xeroCount: number;
  variance: number;
  variancePct: number;
  varianceThreshold: number;
  checks: {
    id: string;
    label: string;
    status: "ok" | "warning" | "error";
    detail: string;
    variance?: number;
    variancePct?: number;
    amount?: number;
    count?: number;
  }[];
  arAging: {
    "0-30": { amount: number; count: number };
    "31-60": { amount: number; count: number };
    "61-90": { amount: number; count: number };
    "90+": { amount: number; count: number };
  };
  updatedAt: string;
  source: string;
  error?: string;
}

export default function FinanceTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const date = params.get("date") || "mtd";

  const { data, loading, error, updatedAt } =
    useApi<ReconcileResponse>("/api/xero-reconcile", { date }, refreshKey);

  const arData = data?.arAging ? [
    { bracket: "0–30 days",  amount: data.arAging["0-30"].amount,  count: data.arAging["0-30"].count,  color: "#22c55e" },
    { bracket: "31–60 days", amount: data.arAging["31-60"].amount, count: data.arAging["31-60"].count, color: "#f59e0b" },
    { bracket: "61–90 days", amount: data.arAging["61-90"].amount, count: data.arAging["61-90"].count, color: "#f97316" },
    { bracket: "90+ days",   amount: data.arAging["90+"].amount,   count: data.arAging["90+"].count,   color: "#ef4444" },
  ] : [];

  const totalAR = arData.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* ST vs Xero Reconciliation */}
      <DataPanel
        title="ST vs Xero Accuracy Check"
        source="ServiceTitan + Xero"
        updatedAt={updatedAt}
        loading={loading}
        error={error}
      >
        {data && (
          <div className="p-5 space-y-4">
            {/* Totals comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">ServiceTitan Total</div>
                <div className="text-2xl font-black text-orange-400">${data.stTotal.toLocaleString()}</div>
                <div className="text-xs text-zinc-600">{data.stCount} invoices</div>
              </div>
              <div className={`rounded-lg p-4 text-center ${data.variancePct > 5 ? "bg-red-500/10 border border-red-500/30" : "bg-green-500/10 border border-green-500/20"}`}>
                <div className="text-xs text-zinc-500 mb-1">Variance</div>
                <div className={`text-2xl font-black ${data.variancePct > 5 ? "text-red-400" : "text-green-400"}`}>
                  ${data.variance.toLocaleString()}
                </div>
                <div className={`text-xs ${data.variancePct > 5 ? "text-red-500" : "text-green-500"}`}>
                  {data.variancePct}% {data.variancePct <= 5 ? "✅ within threshold" : "⚠ exceeds threshold"}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">Xero Total</div>
                {data.xeroAvailable ? (
                  <>
                    <div className="text-2xl font-black text-blue-400">${data.xeroTotal.toLocaleString()}</div>
                    <div className="text-xs text-zinc-600">{data.xeroCount} invoices</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-zinc-600">Not configured</div>
                    <div className="text-xs text-zinc-600">Add XERO_ACCESS_TOKEN to env</div>
                  </>
                )}
              </div>
            </div>

            {/* Integrity checks */}
            <div className="space-y-2">
              {data.checks.map(check => (
                <div key={check.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                  check.status === "ok" ? "border-green-500/20 bg-green-500/5" :
                  check.status === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                  "border-red-500/20 bg-red-500/5"
                }`}>
                  <span className="text-lg mt-0.5">
                    {check.status === "ok" ? "✅" : check.status === "warning" ? "⚠️" : "❌"}
                  </span>
                  <div>
                    <div className={`font-semibold text-sm ${
                      check.status === "ok" ? "text-green-400" : check.status === "warning" ? "text-amber-400" : "text-red-400"
                    }`}>{check.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DataPanel>

      {/* AR Aging */}
      <DataPanel
        title="AR Aging"
        source="ServiceTitan"
        updatedAt={updatedAt}
        loading={loading}
        error={error}
      >
        {data?.arAging && (
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {arData.map(b => (
                <div key={b.bracket} className={`rounded-xl p-4 border ${
                  b.bracket === "90+ days" && b.amount > 0 ? "border-red-500/40 bg-red-500/5" : "border-zinc-800 bg-zinc-800/30"
                }`}>
                  <div className="text-xs text-zinc-500 mb-1">{b.bracket}</div>
                  <div className="text-xl font-black" style={{ color: b.color }}>
                    {b.amount > 0 ? `$${b.amount.toLocaleString()}` : "Clear"}
                  </div>
                  <div className="text-xs text-zinc-600">{b.count} invoices</div>
                </div>
              ))}
            </div>

            {data.arAging["90+"].count > 0 && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-4">
                <div className="font-bold text-red-400 mb-1">
                  ⚠ {data.arAging["90+"].count} invoices 90+ days overdue · ${data.arAging["90+"].amount.toLocaleString()} at risk
                </div>
                <div className="text-sm text-zinc-400">Send final notice immediately. Escalate to collections if no response within 7 days.</div>
              </div>
            )}

            {totalAR > 0 && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={arData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="bracket" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
                    formatter={(v: unknown) => [`$${Number(v ?? 0).toLocaleString()}`, "Amount"] as [string, string]}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {arData.map((b, i) => <Cell key={i} fill={b.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </DataPanel>

    </div>
  );
}
