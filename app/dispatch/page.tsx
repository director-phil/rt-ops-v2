"use client";
import { useState } from "react";
import { BUSINESS_DATA as D } from "../data/business";

const tradeColors: Record<string, string> = {
  electrical: "text-yellow-400",
  hvac: "text-blue-400",
  solar: "text-orange-400",
  plumbing: "text-cyan-400",
};

export default function Dispatch() {
  const [tab, setTab] = useState<"today" | "tomorrow" | "week">("today");

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">DISPATCH BOARD</div>
        <div className="text-sm text-gray-400">{D.date}</div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4">
        {(["today", "tomorrow", "week"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${
              tab === t
                ? "bg-white text-gray-900"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {t === "today" ? "TODAY" : t === "tomorrow" ? "TOMORROW" : "THIS WEEK"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <>
          {/* Status Banner */}
          <div className="card card-red mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔴</span>
              <div>
                <div className="text-red-400 font-black text-xl">OVERLOADED</div>
                <div className="text-gray-300 text-sm">
                  {D.dispatch.today.techsAtCapacity}/{D.dispatch.today.totalTechs} techs at capacity
                </div>
              </div>
            </div>
          </div>

          {/* By Trade */}
          <div className="section-header">BY TRADE</div>
          <div className="card mb-4">
            {D.dispatch.byTrade.map((t, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.emoji}</span>
                    <span className="font-bold text-sm">{t.trade}</span>
                    <span className="text-gray-400 text-xs">{t.jobs} jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        t.pct >= 95
                          ? "text-red-400"
                          : t.pct >= 80
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {t.pct}%
                    </span>
                    {t.pct >= 95 && (
                      <span className="text-xs text-red-400 font-bold">FULL</span>
                    )}
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      t.pct >= 95
                        ? "bg-red-500"
                        : t.pct >= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(t.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overloaded Techs */}
          <div className="section-header">🔴 OVERLOADED TECHS</div>
          <div className="space-y-2 mb-4">
            {D.dispatch.today.overloaded.map((tech, i) => (
              <div key={i} className="card card-red p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{tech.name}</div>
                    <div className={`text-xs ${tradeColors[tech.trade]} capitalize`}>{tech.trade}</div>
                  </div>
                  <div className="text-red-400 font-black text-xl">
                    {tech.hours}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "tomorrow" && (
        <>
          {/* Tomorrow Alert */}
          <div className="card card-amber mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="text-yellow-400 font-black text-xl">{D.dispatch.tomorrow.hoursOpen}h OPEN</div>
                <div className="text-gray-300 text-sm">Tomorrow needs bookings — fill this capacity</div>
              </div>
            </div>
          </div>

          <div className="section-header">🟢 AVAILABLE TOMORROW</div>
          <div className="space-y-2">
            {D.dispatch.tomorrow.available.map((tech, i) => (
              <div key={i} className="card card-green p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{tech.name}</div>
                    <div className={`text-xs ${tradeColors[tech.trade]} capitalize`}>{tech.trade}</div>
                  </div>
                  <div className="text-green-400 font-black text-xl">+{tech.hours}h</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "week" && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <div className="text-gray-400 font-semibold">Week view</div>
            <div className="text-gray-600 text-sm mt-1">Connect ServiceTitan for live week schedule</div>
          </div>
        </div>
      )}

      {/* Side-by-side comparison */}
      {tab === "today" && (
        <>
          <div className="section-header">CAPACITY SNAPSHOT</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="card card-red p-3 text-center">
              <div className="text-red-400 font-black text-2xl">
                {D.dispatch.today.techsAtCapacity}
              </div>
              <div className="text-xs text-gray-400 mt-1">Techs Overloaded</div>
              <div className="text-xs text-red-400 font-semibold">TODAY</div>
            </div>
            <div className="card card-amber p-3 text-center">
              <div className="text-yellow-400 font-black text-2xl">
                {D.dispatch.tomorrow.hoursOpen}h
              </div>
              <div className="text-xs text-gray-400 mt-1">Hours Open</div>
              <div className="text-xs text-yellow-400 font-semibold">TOMORROW</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
