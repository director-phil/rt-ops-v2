"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useApi } from "@/app/lib/use-api";

interface ExpensesData {
  ok: boolean;
  income: number;
  grossProfit: number;
  netProfit: number;
  netMarginPct: number;
  period: string;
  updatedAt: string;
}

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;

export default function RevenueTrend() {
  const { data, loading } = useApi<ExpensesData>("/api/expenses", {});

  const chartData = data ? [
    { month: "This Month", revenue: data.income }
  ] : [];

  const latestRevenue = data?.income ?? 0;
  const now = new Date();
  const monthLabel = now.toLocaleString("en-AU", { month: "short", year: "2-digit" });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Revenue — Current Month</div>
          <div className="text-sm text-zinc-400 mt-0.5">Live from Xero</div>
        </div>
        <div className="text-right">
          {loading ? (
            <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse" />
          ) : (
            <>
              <div className="text-lg font-black text-orange-400">{fmt(latestRevenue)}</div>
              <div className="text-xs text-zinc-500">{monthLabel}</div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">Loading…</div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(v: ValueType | undefined) => [`$${Number(v ?? 0).toLocaleString()}`, "Revenue"] as [string, string]}
            />
            <ReferenceLine y={600000} stroke="#FF4500" strokeDasharray="4 2" strokeOpacity={0.5}
                           label={{ value: "Target $600k", fill: "#FF4500", fontSize: 10, position: "right" }} />
            <Bar dataKey="revenue" fill="#FF4500" opacity={0.85} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">No data</div>
      )}
    </div>
  );
}
