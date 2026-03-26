"use client";

import { useApi } from "../lib/use-api";

type BankData = {
  bankAccounts: { name: string; balance: number }[];
  totalBank: number;
  ar: number;
  ap: number;
  netCash: number;
  updatedAt?: string;
};

type ExpensesData = {
  income: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netProfit: number;
  netMarginPct: number;
  expenseBreakdown: { name: string; amount: number }[];
  updatedAt?: string;
};

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`;

const fmtFull = (n: number) => `$${n.toLocaleString()}`;

export default function Finance() {
  const bank     = useApi<BankData>("/api/bank", {});
  const expenses = useApi<ExpensesData>("/api/expenses", {});

  const loading = bank.loading || expenses.loading;
  const updatedAt = expenses.data?.updatedAt ?? bank.data?.updatedAt;

  const pnl = expenses.data;
  const b   = bank.data;

  const netMarginPct  = pnl?.netMarginPct ?? null;
  const ebitdaFloor   = 15;
  const ebitdaTarget  = 30;

  const ebitdaColor =
    netMarginPct === null ? "text-zinc-500" :
    netMarginPct >= ebitdaTarget ? "text-green-400" :
    netMarginPct >= ebitdaFloor  ? "text-yellow-400" :
    "text-red-400";

  const ebitdaBadgeBg =
    netMarginPct === null ? "bg-zinc-800 text-zinc-400" :
    netMarginPct >= ebitdaTarget ? "bg-green-900 text-green-300" :
    netMarginPct >= ebitdaFloor  ? "bg-yellow-900 text-yellow-300" :
    "bg-red-900 text-red-300";

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-3 py-4 space-y-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest">FINANCE</div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">FINANCE</div>
        <div className="text-sm text-gray-400">
          March 2026 · Source: Xero API
          {updatedAt && <span className="ml-2 text-gray-600">· Updated {new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>

      {/* ── EBITDA STATUS ALERT ── */}
      {pnl && (
        <div className="card card-red mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-red-400 text-sm">
              {netMarginPct !== null && netMarginPct < ebitdaFloor ? "🔴 EBITDA BELOW FLOOR" : "📊 EBITDA STATUS"}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${ebitdaBadgeBg}`}>
              {netMarginPct !== null ? `${netMarginPct.toFixed(1)}% actual` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2">
            <div className="bg-red-950 rounded p-2">
              <div className={`font-black text-lg ${ebitdaColor}`}>
                {netMarginPct !== null ? `${netMarginPct.toFixed(1)}%` : "—"}
              </div>
              <div className="text-gray-400">Actual</div>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-yellow-300 font-black text-lg">{ebitdaFloor}%</div>
              <div className="text-gray-400">Floor</div>
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="text-green-300 font-black text-lg">{ebitdaTarget}%</div>
              <div className="text-gray-400">Target</div>
            </div>
          </div>
          <div className="text-gray-300 text-xs">
            Wages are the biggest drag after materials. Fix pricing and dispatch efficiency to close the gap.
          </div>
        </div>
      )}

      {/* ── P&L SNAPSHOT ── */}
      <div className="section-header">📊 P&L SNAPSHOT — MARCH 2026</div>
      <div className="card mb-4">
        {pnl ? (
          <>
            {[
              { label: "Revenue",          value: pnl.income,          sign: "",  color: "text-white",      pct: null },
              { label: "Materials (COGS)", value: pnl.cogs,             sign: "-", color: "text-red-400",    pct: pnl.grossMarginPct ? (100 - pnl.grossMarginPct) : null },
              { label: "Gross Profit",     value: pnl.grossProfit,      sign: "",  color: "text-green-400",  pct: pnl.grossMarginPct },
              { label: "Operating Expenses",value: pnl.operatingExpenses,sign:"-", color: "text-orange-400", pct: pnl.income > 0 ? Math.round((pnl.operatingExpenses / pnl.income) * 100 * 10) / 10 : null },
              { label: "Net Profit",       value: pnl.netProfit,        sign: "",  color: ebitdaColor,       pct: pnl.netMarginPct },
            ].map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0 ${
                  row.label.startsWith("Net Profit") ? "bg-gray-900 -mx-4 px-4 rounded-b-xl" : ""
                }`}
              >
                <span className="text-sm text-gray-300 font-semibold">{row.label}</span>
                <div className="flex items-center gap-3">
                  {row.pct !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        row.label.startsWith("Net Profit")
                          ? ebitdaBadgeBg
                          : row.label === "Gross Profit"
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {row.pct?.toFixed(1)}%
                    </span>
                  )}
                  <span className={`text-base font-black ${row.color}`}>
                    {row.sign}{fmtFull(row.value)}
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">{expenses.error ?? "No P&L data"}</div>
        )}
      </div>

      {/* ── EXPENSE BREAKDOWN ── */}
      <div className="section-header">💸 EXPENSE BREAKDOWN</div>
      <div className="card mb-4">
        {pnl?.expenseBreakdown?.length ? (
          <>
            {pnl.expenseBreakdown.map((item, i) => {
              const pct = pnl.income > 0 ? (item.amount / pnl.income) * 100 : 0;
              return (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 font-semibold">{item.name}</span>
                    <span className="text-gray-400">{fmtFull(item.amount)} · {pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">No breakdown available</div>
        )}
        <div className="mt-3 pt-2 border-t border-gray-800 text-xs text-gray-500">
          Source: Xero P&amp;L report
        </div>
      </div>

      {/* ── BANK POSITION ── */}
      <div className="section-header mt-2">🏦 BANK POSITION</div>
      {b ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="card p-3 text-center">
              <div className="text-2xl font-black text-green-400">{fmt(b.totalBank)}</div>
              <div className="text-xs text-gray-400 mt-1">Total in Bank</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-2xl font-black text-blue-400">{fmt(b.netCash)}</div>
              <div className="text-xs text-gray-400 mt-1">Net Cash (AR−AP)</div>
            </div>
          </div>

          {b.bankAccounts?.length > 0 && (
            <div className="card mb-3">
              <div className="font-semibold text-gray-300 text-sm mb-2">Bank Accounts</div>
              {b.bankAccounts.map((acc, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300">{acc.name}</span>
                  <span className="text-white font-bold">{fmtFull(acc.balance)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="card card-amber p-3 text-center">
              <div className="text-xl font-black text-yellow-400">{fmt(b.ar)}</div>
              <div className="text-xs text-gray-400 mt-1">Accounts Receivable</div>
            </div>
            <div className="card card-red p-3 text-center">
              <div className="text-xl font-black text-red-400">{fmt(b.ap)}</div>
              <div className="text-xs text-gray-400 mt-1">Accounts Payable</div>
            </div>
          </div>
        </>
      ) : (
        <div className="card mb-4 text-center text-gray-500 py-4 text-sm">
          {bank.error ?? "No bank data"}
        </div>
      )}
    </div>
  );
}
