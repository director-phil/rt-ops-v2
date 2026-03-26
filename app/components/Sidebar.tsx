"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Briefcase, Phone } from "lucide-react";
import { useApi } from "@/app/lib/use-api";

type TechItem = { name: string; revenueMTD: number; jobCount: number; progressPct: number };
type JobItem  = { jobId: string; jobNumber: string; tech: string; trade: string; invoiceTotal: number; netSale: number };
type CsrItem  = { name: string; bookingRate: number; inboundCalls: number; booked: number };

const TRADE_COLORS: Record<string, string> = {
  electrical: "bg-yellow-500/20 text-yellow-400",
  hvac:       "bg-blue-500/20 text-blue-400",
  solar:      "bg-orange-500/20 text-orange-400",
  plumbing:   "bg-cyan-500/20 text-cyan-400",
};

interface SidebarProps {
  section: "overview" | "techs" | "finance" | "leads";
}

export default function Sidebar({ section }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-12 border-r border-zinc-800 pt-4 gap-4 flex-shrink-0"
           style={{ background: "#0d0d0d" }}>
        <button
          onClick={() => setCollapsed(false)}
          className="text-zinc-500 hover:text-orange-400 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <Briefcase className="w-5 h-5 text-zinc-600" />
        <Phone className="w-5 h-5 text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-72 flex-shrink-0 border-r border-zinc-800 overflow-y-auto"
         style={{ background: "#0d0d0d", minHeight: "calc(100vh - 88px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          {section === "overview" ? "Today's Jobs" :
           section === "techs"    ? "Tech Details" :
           section === "finance"  ? "Invoices" :
           "Call Log"}
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-zinc-500 hover:text-orange-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {section === "overview" && <JobsList />}
        {section === "techs"    && <TechDetails />}
        {section === "leads"    && <CSRCallLog />}
        {section === "finance"  && <InvoiceList />}
      </div>
    </div>
  );
}

function JobsList() {
  const { data, loading, error } = useApi<{ jobs: JobItem[] }>("/api/jobs", { date: "today" });

  if (loading) {
    return (
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="h-3 bg-zinc-800 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.jobs?.length) {
    return <div className="px-4 py-6 text-xs text-zinc-500 text-center">{error ?? "No jobs today"}</div>;
  }

  const jobs = data.jobs.slice(0, 10);

  return (
    <div className="divide-y divide-zinc-800/60">
      {jobs.map(job => (
        <div key={job.jobId} className="px-4 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-zinc-500">{job.jobNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TRADE_COLORS[job.trade] ?? "bg-zinc-700 text-zinc-300"}`}>
              {job.trade}
            </span>
          </div>
          <div className="text-sm font-semibold text-white truncate">{job.tech || "—"}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-zinc-500 truncate">{job.tech}</span>
            <span className="text-xs font-bold text-orange-400">${job.invoiceTotal.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechDetails() {
  const { data, loading, error } = useApi<{ technicians: TechItem[] }>("/api/technicians", {});

  if (loading) {
    return (
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
            <div className="h-2 bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.technicians?.length) {
    return <div className="px-4 py-6 text-xs text-zinc-500 text-center">{error ?? "No data"}</div>;
  }

  const top = [...data.technicians]
    .sort((a, b) => b.revenueMTD - a.revenueMTD)
    .slice(0, 8);

  return (
    <div className="divide-y divide-zinc-800/60">
      {top.map((tech, i) => (
        <div key={tech.name} className="px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
            <span className="text-sm font-semibold text-white truncate flex-1">{tech.name}</span>
            <span className="text-xs font-bold text-orange-400">${(tech.revenueMTD / 1000).toFixed(1)}k</span>
          </div>
          <div className="ml-6">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                   style={{ width: `${Math.min(tech.progressPct ?? 0, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-zinc-600">{tech.jobCount} jobs</span>
              <span className="text-xs text-zinc-600">{tech.progressPct ?? "—"}% to target</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CSRCallLog() {
  const { data, loading, error } = useApi<{ csrs: CsrItem[]; updatedAt: string }>("/api/csrs", {});

  if (loading) {
    return (
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
            <div className="h-2 bg-zinc-800 rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data?.csrs?.length) {
    return <div className="px-4 py-6 text-xs text-zinc-500 text-center">{error ?? "No CSR data"}</div>;
  }

  return (
    <div className="divide-y divide-zinc-800/60">
      {data.csrs.map(csr => {
        const rate = csr.bookingRate < 2 ? Math.round(csr.bookingRate * 100) : Math.round(csr.bookingRate);
        const status = rate >= 75 ? "green" : rate >= 60 ? "amber" : "red";
        return (
          <div key={csr.name} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{csr.name}</span>
              <span className={`text-xs font-bold ${
                status === "red" ? "text-red-400" :
                status === "amber" ? "text-yellow-400" :
                "text-green-400"
              }`}>{rate}%</span>
            </div>
            <div className="flex gap-4 text-xs text-zinc-500">
              <span>{csr.inboundCalls} calls</span>
              <span>{csr.booked} booked</span>
              <span className={
                status === "red" ? "text-red-400" :
                status === "amber" ? "text-yellow-400" :
                "text-green-400"
              }>
                {status === "red" ? "⚠ Below 75%" : status === "amber" ? "↗ Near target" : "✓ Above target"}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                   style={{
                     width: `${rate}%`,
                     background: status === "red" ? "#ef4444" : status === "amber" ? "#f59e0b" : "#22c55e"
                   }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InvoiceList() {
  // InvoiceList shows bank/AR data — placeholder until dedicated invoice API exists
  return (
    <div className="px-4 py-6 text-xs text-zinc-500 text-center space-y-2">
      <div className="text-zinc-400 font-semibold">Invoice data</div>
      <div>Live invoice list available via /finance</div>
    </div>
  );
}
