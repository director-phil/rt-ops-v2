"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Briefcase, Phone } from "lucide-react";
import { TODAY_JOBS, TECHNICIANS, CSRS } from "@/app/data/staticData";

const STATUS_COLORS: Record<string, string> = {
  "Complete":    "bg-green-500/20 text-green-400",
  "In Progress": "bg-orange-500/20 text-orange-400",
  "En Route":    "bg-blue-500/20 text-blue-400",
  "Scheduled":   "bg-zinc-700 text-zinc-300",
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
  return (
    <div className="divide-y divide-zinc-800/60">
      {TODAY_JOBS.map(job => (
        <div key={job.id} className="px-4 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-zinc-500">{job.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] || "bg-zinc-700 text-zinc-300"}`}>
              {job.status}
            </span>
          </div>
          <div className="text-sm font-semibold text-white truncate">{job.type}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-zinc-500 truncate">{job.tech}</span>
            <span className="text-xs font-bold text-orange-400">${job.value.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechDetails() {
  const top = TECHNICIANS.slice(0, 8);
  return (
    <div className="divide-y divide-zinc-800/60">
      {top.map((tech, i) => {
        const pct = Math.round((tech.revenue / 100000) * 100);
        return (
          <div key={tech.name} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
              <span className="text-sm font-semibold text-white truncate flex-1">{tech.name}</span>
              <span className="text-xs font-bold text-orange-400">${(tech.revenue / 1000).toFixed(1)}k</span>
            </div>
            <div className="ml-6">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
                     style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-zinc-600">{tech.efficiency}% efficiency</span>
                <span className="text-xs text-zinc-600">{tech.recalls} recalls</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CSRCallLog() {
  return (
    <div className="divide-y divide-zinc-800/60">
      {CSRS.map(csr => (
        <div key={csr.name} className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">{csr.name}</span>
            <span className={`text-xs font-bold ${
              csr.status === "red" ? "text-red-400" :
              csr.status === "amber" ? "text-yellow-400" :
              "text-zinc-400"
            }`}>{csr.rate}%</span>
          </div>
          <div className="flex gap-4 text-xs text-zinc-500">
            <span>{csr.calls} calls</span>
            <span>{csr.booked} booked</span>
            <span className={
              csr.status === "red" ? "text-red-400" :
              csr.status === "amber" ? "text-yellow-400" :
              "text-zinc-400"
            }>
              {csr.status === "red" ? "⚠ Below 75%" :
               csr.status === "amber" ? "✓ Above target" :
               "Dispatch role"}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{
                   width: `${csr.rate}%`,
                   background: csr.status === "red" ? "#ef4444" : csr.status === "amber" ? "#f59e0b" : "#6b7280"
                 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceList() {
  const invoices = [
    { id: "INV-8821", client: "Smith Residence",  amount: 2340, status: "Paid" },
    { id: "INV-8820", client: "Jones Commercial",  amount: 8900, status: "Pending" },
    { id: "INV-8819", client: "Brown Family",      amount: 1250, status: "Paid" },
    { id: "INV-8818", client: "Metro Property",    amount: 4400, status: "Overdue" },
    { id: "INV-8817", client: "Williams Build",    amount: 12800, status: "Pending" },
    { id: "INV-8816", client: "Taylor Apt",        amount: 890,  status: "Paid" },
  ];
  const statusC: Record<string, string> = {
    "Paid":    "text-green-400",
    "Pending": "text-yellow-400",
    "Overdue": "text-red-400",
  };
  return (
    <div className="divide-y divide-zinc-800/60">
      {invoices.map(inv => (
        <div key={inv.id} className="px-4 py-3 hover:bg-zinc-800/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-500">{inv.id}</div>
              <div className="text-sm font-semibold text-white">{inv.client}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">${inv.amount.toLocaleString()}</div>
              <div className={`text-xs font-medium ${statusC[inv.status]}`}>{inv.status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
