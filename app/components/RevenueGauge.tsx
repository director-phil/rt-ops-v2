"use client";

import { PieChart, Pie, Cell } from "recharts";

interface RevenueGaugeProps {
  completed: number;
  target: number;
}

export default function RevenueGauge({ completed, target }: RevenueGaugeProps) {
  const pct = Math.min((completed / target) * 100, 100);
  const missed = target - completed;

  // Gauge uses a half-pie (semicircle)
  const data = [
    { value: pct,       fill: "#FF4500" },
    { value: 100 - pct, fill: "#1f2937" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Revenue vs Target</div>

      <div className="relative" style={{ width: 200, height: 110 }}>
        <PieChart width={200} height={110}>
          <Pie
            data={data}
            cx={100}
            cy={100}
            startAngle={180}
            endAngle={0}
            innerRadius={65}
            outerRadius={90}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="text-2xl font-black text-white">{Math.round(pct)}%</div>
          <div className="text-xs text-zinc-500">of target</div>
        </div>
      </div>

      <div className="mt-3 w-full grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-orange-400">
            ${(completed / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">Completed</div>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
          <div className="text-lg font-black text-zinc-300">
            ${(missed / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">Gap to Target</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-zinc-600">
        Target: ${(target / 1000).toFixed(0)}k / month
      </div>
    </div>
  );
}
