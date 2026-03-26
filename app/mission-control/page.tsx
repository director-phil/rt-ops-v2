"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  emoji: string;
  channel: string;
  lastActive: number | null;
  lastActiveLabel: string;
  status: "active" | "idle" | "offline";
  sessionCount: number;
}

interface MCData {
  ok: boolean;
  agents: Agent[];
  summary: { total: number; active: number; idle: number; offline: number; sonnet: number; haiku: number };
  updatedAt: string;
}

const STATUS_CONFIG = {
  active:  { dot: "bg-green-400 animate-pulse", text: "text-green-400",  label: "Active"  },
  idle:    { dot: "bg-amber-400",               text: "text-amber-400",  label: "Idle"    },
  offline: { dot: "bg-zinc-600",                text: "text-zinc-500",   label: "Offline" },
};

const MODEL_CONFIG: Record<string, { bg: string; text: string }> = {
  "Claude Sonnet": { bg: "bg-orange-500/20", text: "text-orange-300" },
  "Claude Haiku":  { bg: "bg-purple-500/20", text: "text-purple-300" },
};

export default function MissionControl() {
  const [data, setData] = useState<MCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch("/api/mission-control", { cache: "no-store" });
      const d = await r.json();
      setData(d);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(clock); };
  }, [fetchData]);

  const agents = data?.agents ?? [];
  const summary = data?.summary;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f1f5f9" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "#0d0d15", borderColor: "#1e1e2e" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">Reliable Tradies — AI Command Centre</span>
            <span className="text-xs px-2 py-0.5 rounded-full border flex items-center gap-1"
              style={{ background: "#0d2010", color: "#22c55e", borderColor: "#22c55e40" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#64748b" }}>
            <span>AEST</span>
            <span className="font-mono text-white">
              {now.toLocaleString("en-AU", { timeZone: "Australia/Brisbane", dateStyle: "medium", timeStyle: "short" })}
            </span>
            <Link href="/" className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:border-orange-500 hover:text-orange-400 transition-colors"
              style={{ borderColor: "#2a2a3a", color: "#94a3b8" }}>
              📊 Operations Dashboard →
            </Link>
          </div>
        </div>

        {/* Summary bar */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex items-center gap-6 text-sm">
          <span style={{ color: "#94a3b8" }}>
            Agents: <span className="font-bold text-white">{summary?.total ?? "—"}</span>
          </span>
          <span style={{ color: "#94a3b8" }}>
            Active: <span className="font-bold text-green-400">{summary?.active ?? "—"}</span>
          </span>
          <span style={{ color: "#94a3b8" }}>
            Sonnet: <span className="font-bold text-orange-400">{summary?.sonnet ?? "—"}</span>
          </span>
          <span style={{ color: "#94a3b8" }}>
            Haiku: <span className="font-bold text-purple-400">{summary?.haiku ?? "—"}</span>
          </span>
        </div>
      </header>

      {/* Agent Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 border animate-pulse"
                style={{ background: "#0d0d15", borderColor: "#1e1e2e", height: 160 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map(agent => {
              const sc = STATUS_CONFIG[agent.status];
              const mc = MODEL_CONFIG[agent.model] ?? { bg: "bg-zinc-700/30", text: "text-zinc-400" };
              return (
                <div key={agent.id} className="rounded-2xl p-5 border transition-all hover:border-zinc-600 flex flex-col gap-3"
                  style={{ background: "#0d0d15", borderColor: "#1e1e2e" }}>

                  {/* Top row: name + status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <div className="font-bold text-white text-sm">{agent.name}</div>
                        <div className="text-xs" style={{ color: "#64748b" }}>{agent.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                      <span className={`text-xs font-bold ${sc.text}`}>{sc.label}</span>
                    </div>
                  </div>

                  {/* Model badge */}
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mc.bg} ${mc.text}`}>
                      {agent.model}
                    </span>
                  </div>

                  {/* Last active */}
                  <div className="mt-auto border-t pt-3 flex items-center justify-between" style={{ borderColor: "#1e1e2e" }}>
                    <div>
                      <div className="text-xs" style={{ color: "#475569" }}>Last task</div>
                      <div className="text-xs font-medium" style={{ color: "#94a3b8" }}>{agent.lastActiveLabel}</div>
                    </div>
                    {agent.channel !== "-" && (
                      <div className="text-xs px-2 py-0.5 rounded" style={{ background: "#1a1a2e", color: "#475569" }}>
                        {agent.channel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: "#334155" }}>
          Reliable Tradies AI Fleet · Auto-refreshes every 30s
          {data?.updatedAt && ` · Last updated ${new Date(data.updatedAt).toLocaleTimeString("en-AU")}`}
        </div>
      </main>
    </div>
  );
}
