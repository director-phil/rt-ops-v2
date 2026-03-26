"use client";

import { useState } from "react";
// Actions are editorial priorities — manually curated, not live data
// They live here inline so no static data file needed

type ActionPriority = "critical" | "high" | "medium" | "low";
type ActionStatus = "open" | "in_progress" | "done";
interface Action {
  id: string;
  priority: ActionPriority;
  title: string;
  detail: string;
  owner: string;
  status: ActionStatus;
  impact?: string;
  dueDate?: string;
}

const ACTIONS: Action[] = [
  { id: "A001", priority: "critical", title: "✅ DONE — Emergency Plumbing Google Ads PAUSED", detail: "Confirmed PAUSED. Spent $1,550 with 0 conversions before pause. Monitor for 30 days before decision to kill permanently.", owner: "Marketing", status: "done", impact: "$1,550/month saved" },
  { id: "A002", priority: "critical", title: "Fix Pricebook — 68% of jobs below 15% margin", detail: "Solar at 10.2%, AC Repair at 13.8%. Every job dispatched at these rates loses money on commission and margin floor. Fix pricing before next dispatch run.", owner: "Operations", status: "open", impact: "Margin bleeding on every job" },
  { id: "A003", priority: "critical", title: "Fix Apprentice Splits in ServiceTitan", detail: "152 jobs in Feb/March have apprentices incorrectly listed as co-techs. Affecting $601K revenue and blocking commission calculations. Fix assignment process going forward.", owner: "Operations", status: "open", impact: "$601K revenue affected" },
  { id: "A004", priority: "high", title: "Fix Alex Naughton Dispatch", detail: "He sold $27K in estimates but is being dispatched to low-value plumbing quotes. Move him to execute his own electrical/AC quotes.", owner: "Dispatch", status: "open", impact: "+$30K/month" },
  { id: "A005", priority: "high", title: "Follow up 641 open quotes ($3.9M)", detail: "Assign to sales team immediately. These are live opportunities going cold every day.", owner: "Sales", status: "open", impact: "$3.9M pipeline" },
  { id: "A006", priority: "high", title: "Scale Ducted AC campaigns", detail: "21.6x ROAS — dramatically underfunded. Increase budget aggressively.", owner: "Marketing", status: "open", impact: "+$X revenue" },
];

const PRIORITY_CONFIG: Record<ActionPriority, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "CRITICAL", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/40" },
  high:     { label: "HIGH",     color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  medium:   { label: "MEDIUM",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  low:      { label: "LOW",      color: "text-zinc-400",   bg: "bg-zinc-800",       border: "border-zinc-700" },
};

const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "text-zinc-400" },
  in_progress: { label: "In Progress", color: "text-blue-400" },
  done:        { label: "Done",        color: "text-green-400" },
};

export default function ActionsTab() {
  const [actions, setActions] = useState<Action[]>(ACTIONS);
  const [filter, setFilter] = useState<ActionPriority | "all">("all");
  const [showDone, setShowDone] = useState(false);

  const toggle = (id: string) => {
    setActions(prev => prev.map(a =>
      a.id === id
        ? { ...a, status: a.status === "done" ? "open" : "done" }
        : a
    ));
  };

  const setStatus = (id: string, status: ActionStatus) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const visible = actions.filter(a => {
    if (!showDone && a.status === "done") return false;
    if (filter !== "all" && a.priority !== filter) return false;
    return true;
  });

  const open       = actions.filter(a => a.status !== "done").length;
  const critical   = actions.filter(a => a.priority === "critical" && a.status !== "done").length;
  const inProgress = actions.filter(a => a.status === "in_progress").length;
  const done       = actions.filter(a => a.status === "done").length;

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ActKpi label="Open Actions"     value={open.toString()}        color="red"    sub="Need attention" />
        <ActKpi label="Critical"         value={critical.toString()}    color="red"    sub="Act today" />
        <ActKpi label="In Progress"      value={inProgress.toString()}  color="amber"  sub="Being worked" />
        <ActKpi label="Completed"        value={done.toString()}        color="green"  sub="This period" />
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "critical", "high", "medium", "low"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors capitalize ${
              filter === f
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All" : PRIORITY_CONFIG[f].label}
            {f !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({actions.filter(a => a.priority === f && a.status !== "done").length})
              </span>
            )}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showDone}
            onChange={e => setShowDone(e.target.checked)}
            className="accent-orange-500"
          />
          Show completed
        </label>
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {visible.map(action => {
          const p = PRIORITY_CONFIG[action.priority];
          const s = STATUS_CONFIG[action.status];
          const isDone = action.status === "done";
          const isOverdue = new Date(action.dueDate) < new Date() && !isDone;

          return (
            <div
              key={action.id}
              className={`border rounded-xl p-4 transition-all ${isDone ? "opacity-40 bg-zinc-900 border-zinc-800" : `${p.bg} ${p.border}`}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggle(action.id)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isDone ? "bg-green-500 border-green-500" : "border-zinc-600 hover:border-orange-500"
                  }`}
                >
                  {isDone && <span className="text-white text-xs">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${p.color} bg-black/20`}>
                      {p.label}
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">{action.tab}</span>
                    <span className="text-xs font-mono text-zinc-700">{action.id}</span>
                  </div>

                  {/* Title */}
                  <div className={`font-semibold mb-1 ${isDone ? "line-through text-zinc-500" : "text-white"}`}>
                    {action.title}
                  </div>

                  {/* Detail */}
                  <div className="text-xs text-zinc-500 leading-relaxed">{action.detail}</div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs text-zinc-600">
                      👤 <span className="text-zinc-400">{action.owner}</span>
                    </span>
                    <span className={`text-xs ${isOverdue ? "text-red-400 font-bold" : "text-zinc-600"}`}>
                      📅 Due {action.dueDate}{isOverdue ? " ⚠ OVERDUE" : ""}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      {(["open", "in_progress", "done"] as ActionStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => setStatus(action.id, st)}
                          className={`text-xs px-2 py-0.5 rounded transition-colors ${
                            action.status === st
                              ? "bg-zinc-700 text-white font-bold"
                              : "text-zinc-600 hover:text-zinc-300"
                          }`}
                        >
                          {STATUS_CONFIG[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            {filter !== "all" ? "No actions at this priority level." : "No actions to show."}
          </div>
        )}
      </div>

    </div>
  );
}

function ActKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "red" ? "text-red-400" : color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
