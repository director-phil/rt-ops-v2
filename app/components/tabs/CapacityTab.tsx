"use client";

import { useSearchParams } from "next/navigation";
import { useApi } from "@/app/lib/use-api";
import DataPanel from "@/app/components/DataPanel";

interface JobEntry {
  id: string;
  jobNumber: string;
  time: string;
  suburb: string;
  type: string;
  status: string;
  value: number;
  customerName: string;
  durationHours: number;
}

interface TechSchedule {
  name: string;
  jobs: JobEntry[];
  totalValue: number;
  scheduledHours: number;
}

interface CapacityResponse {
  ok: boolean;
  period: string;
  techCount: number;
  totalJobs: number;
  techs: TechSchedule[];
  updatedAt: string;
  source: string;
  error?: string;
}

const STATUS_COLOR: Record<string, string> = {
  Complete: "bg-green-500/20 text-green-400",
  Completed: "bg-green-500/20 text-green-400",
  "In Progress": "bg-blue-500/20 text-blue-400",
  "En Route": "bg-amber-500/20 text-amber-400",
  Scheduled: "bg-zinc-700 text-zinc-400",
};

export default function CapacityTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const dateParam = params.get("date") || "week";
  const staffFilter = params.get("staff") || "All Staff";

  const apiDate = dateParam === "today" ? "today" : "this-week";

  const { data, loading, error, updatedAt } =
    useApi<CapacityResponse>("/api/capacity", { date: apiDate }, refreshKey);

  const allTechs = data?.techs || [];

  // Split assigned vs unassigned
  const assignedTechs = allTechs.filter(t =>
    t.name !== "Unassigned" &&
    (staffFilter === "All Staff" || t.name.toLowerCase().includes(staffFilter.toLowerCase().replace(/-/g, " ")))
  );
  const unassigned = allTechs.find(t => t.name === "Unassigned");

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <DataPanel
        title={`Capacity — ${data?.period || "This Week"}`}
        source="ServiceTitan"
        updatedAt={updatedAt}
        loading={loading}
        error={error}
        badge={data && (
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {data.totalJobs} jobs · {data.techCount} techs
          </span>
        )}
      >
        {(assignedTechs.length > 0 || unassigned) ? (
          <div className="p-5 space-y-4">
            {/* Assigned techs */}
            {assignedTechs.map(tech => (
              <div key={tech.name} className="bg-zinc-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-white">{tech.name}</div>
                  <div className="text-xs text-zinc-500">
                    {tech.jobs.length} jobs · {tech.scheduledHours.toFixed(1)}h · ${tech.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {tech.jobs.map(job => (
                    <div key={job.id} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-zinc-600 w-10 flex-shrink-0">{job.time}</span>
                      <span className="text-zinc-500 w-8 flex-shrink-0 font-mono text-[10px]">{job.jobNumber || ""}</span>
                      <span className="text-zinc-400 w-24 truncate flex-shrink-0">{job.customerName || job.suburb || "—"}</span>
                      <span className="text-zinc-300 flex-1 truncate">{job.type || "Service"}</span>
                      <span className="font-mono text-orange-400 flex-shrink-0">
                        {job.value > 0 ? `$${job.value.toLocaleString()}` : "—"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${STATUS_COLOR[job.status] || "bg-zinc-700 text-zinc-400"}`}>
                        {job.status || "Scheduled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Unassigned jobs */}
            {unassigned && unassigned.jobs.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-amber-400">⚠ Unassigned Jobs</div>
                  <div className="text-xs text-zinc-500">
                    {unassigned.jobs.length} jobs · ${unassigned.totalValue.toLocaleString()} total value
                  </div>
                </div>
                <div className="space-y-1.5">
                  {unassigned.jobs.map(job => (
                    <div key={job.id} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-zinc-600 w-10 flex-shrink-0">{job.time}</span>
                      <span className="text-zinc-500 w-8 flex-shrink-0 font-mono text-[10px]">{job.jobNumber || ""}</span>
                      <span className="text-zinc-400 w-24 truncate flex-shrink-0">{job.customerName || job.suburb || "—"}</span>
                      <span className="text-zinc-300 flex-1 truncate">{job.type || "Service"}</span>
                      <span className="font-mono text-orange-400 flex-shrink-0">
                        {job.value > 0 ? `$${job.value.toLocaleString()}` : "—"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${STATUS_COLOR[job.status] || "bg-zinc-700 text-zinc-400"}`}>
                        {job.status || "Scheduled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !loading && (
          <div className="p-8 text-center text-zinc-600">
            No jobs scheduled for this period
          </div>
        )}
      </DataPanel>
    </div>
  );
}
