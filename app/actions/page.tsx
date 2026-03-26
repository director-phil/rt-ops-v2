"use client";

import { useState } from "react";
import { useApi } from "../lib/use-api";

type Action = {
  id: number;
  done: boolean;
  title: string;
  impact: string;
  owner: string;
  due: string;
  category: string;
};

type ExpensesData = { netProfit: number; netMarginPct: number; income: number };

const CRITICAL_ACTIONS: Action[] = [
  { id: 1, done: false, title: "Pause Emergency Plumbing campaign", impact: "$1,550/month saved", owner: "Marketing", due: "TODAY", category: "critical" },
  { id: 2, done: false, title: "Fix Solar inspection pricebook", impact: "Immediate margin recovery", owner: "Operations", due: "TODAY", category: "critical" },
  { id: 3, done: false, title: "Assign Alex Naughton to execute his own quotes", impact: "+$30K/month", owner: "Phillip", due: "TODAY", category: "critical" },
];

const HIGH_ACTIONS: Action[] = [
  { id: 4, done: false, title: "Follow up 641 open quotes — assign to team", impact: "$3.9M pipeline", owner: "Sales", due: "This Week", category: "high" },
  { id: 5, done: false, title: "Investigate Bradley Tinworth performance", impact: "$64K/month gap", owner: "Phillip", due: "This Week", category: "high" },
  { id: 6, done: false, title: "Fix Xero→ST payment sync", impact: "$233K phantom AR resolved", owner: "IT/Finance", due: "This Week", category: "high" },
];

const GROWTH_ACTIONS: Action[] = [
  { id: 7, done: false, title: "Scale Ducted AC campaigns", impact: "+$XX revenue at 21.6x ROAS", owner: "Marketing", due: "This Month", category: "growth" },
  { id: 8, done: false, title: "Fix Sunday call abandonment (42% loss)", impact: "+$140K/month", owner: "Operations", due: "This Month", category: "growth" },
];

function ActionItem({ action, onToggle }: { action: Action; onToggle: (id: number) => void }) {
  const categoryColor =
    action.category === "critical"
      ? "border-l-red-500"
      : action.category === "high"
      ? "border-l-yellow-500"
      : "border-l-blue-500";

  return (
    <div
      className={`card border-l-4 ${categoryColor} ${action.done ? "opacity-50" : ""} p-3 cursor-pointer active:scale-98 transition-transform`}
      onClick={() => onToggle(action.id)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${
            action.done
              ? "bg-green-500 border-green-500"
              : "border-gray-600"
          }`}
        >
          {action.done && <span className="text-white text-xs font-black">✓</span>}
        </div>
        <div className="flex-1">
          <div className={`text-sm font-bold ${action.done ? "line-through text-gray-500" : "text-white"}`}>
            {action.title}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                action.category === "critical"
                  ? "bg-red-900 text-red-300"
                  : action.category === "high"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-blue-900 text-blue-300"
              }`}
            >
              {action.impact}
            </span>
            <span className="text-xs text-gray-500">{action.owner}</span>
            <span className="text-xs text-gray-600">Due: {action.due}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Actions() {
  const [critical, setCritical] = useState(CRITICAL_ACTIONS);
  const [high, setHigh]         = useState(HIGH_ACTIONS);
  const [growth, setGrowth]     = useState(GROWTH_ACTIONS);

  const { data: expenses } = useApi<ExpensesData>("/api/expenses", {});

  const toggle = (
    list: Action[],
    setList: React.Dispatch<React.SetStateAction<Action[]>>,
    id: number
  ) => {
    setList(list.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  };

  const totalActions = critical.length + high.length + growth.length;
  const doneActions =
    critical.filter((a) => a.done).length +
    high.filter((a) => a.done).length +
    growth.filter((a) => a.done).length;

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">ACTIONS</div>
        <div className="text-sm text-gray-400">Priority Queue — tap to complete</div>
      </div>

      {/* Live margin context */}
      {expenses && (
        <div className="card card-amber mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Live Net Margin (March)</span>
            <span className="font-black text-yellow-400">{expenses.netMarginPct.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Net Profit</span>
            <span className="font-bold text-white">${expenses.netProfit.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Gap to 30% target: {(30 - expenses.netMarginPct).toFixed(1)}pp</div>
        </div>
      )}

      {/* Progress */}
      <div className="card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-semibold">Today&apos;s progress</span>
          <span className="text-white font-black">{doneActions}/{totalActions}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill bg-green-500"
            style={{ width: `${(doneActions / totalActions) * 100}%` }}
          />
        </div>
        {doneActions === totalActions && (
          <div className="text-green-400 text-sm font-bold mt-2 text-center">
            🎉 All actions completed! Business is moving.
          </div>
        )}
      </div>

      {/* CRITICAL */}
      <div className="section-header">
        <span className="text-red-500">🔴 CRITICAL — DO TODAY</span>
      </div>
      <div className="space-y-2 mb-6">
        {critical.map((a) => (
          <ActionItem key={a.id} action={a} onToggle={(id) => toggle(critical, setCritical, id)} />
        ))}
      </div>

      {/* HIGH */}
      <div className="section-header">
        <span className="text-yellow-500">⚠️ HIGH — THIS WEEK</span>
      </div>
      <div className="space-y-2 mb-6">
        {high.map((a) => (
          <ActionItem key={a.id} action={a} onToggle={(id) => toggle(high, setHigh, id)} />
        ))}
      </div>

      {/* GROWTH */}
      <div className="section-header">
        <span className="text-blue-400">🚀 GROWTH — THIS MONTH</span>
      </div>
      <div className="space-y-2 mb-6">
        {growth.map((a) => (
          <ActionItem key={a.id} action={a} onToggle={(id) => toggle(growth, setGrowth, id)} />
        ))}
      </div>

      {/* Total $ Impact */}
      <div className="card card-green">
        <div className="text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total $ Impact if all actions completed</div>
          <div className="text-3xl font-black text-green-400">~$5.2M</div>
          <div className="text-xs text-gray-500 mt-1">
            $3.9M open quotes + $1.2M pipeline + ops savings
          </div>
        </div>
      </div>
    </div>
  );
}
