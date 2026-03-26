"use client";

import { useSearchParams } from "next/navigation";
import DataPanel from "@/app/components/DataPanel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Verified from Phillip's WildJar screenshots
const VERIFIED_LEADS = [
  { time: "08:32", phone: "0412 XXX XXX", campaign: "Electrical - Search",  adGroup: "Electrician Near Me",    duration: "3:45", outcome: "Booked",     trade: "Electrical", revenue: 890,  keyword: "emergency electrician sydney" },
  { time: "09:14", phone: "0423 XXX XXX", campaign: "AC / Ducted Aircon",   adGroup: "Ducted AC Install",      duration: "6:18", outcome: "Booked",     trade: "AC/HVAC",    revenue: 4200, keyword: "ducted air conditioning cost" },
  { time: "09:47", phone: "0451 XXX XXX", campaign: "Electrical - Search",  adGroup: "Power Outage",           duration: "2:11", outcome: "Unbooked",   trade: "Electrical", revenue: 0,    keyword: "no power in house" },
  { time: "10:02", phone: "0418 XXX XXX", campaign: "Emergency Plumbing",   adGroup: "Blocked Drain",          duration: "1:42", outcome: "Abandoned",  trade: "Plumbing",   revenue: 0,    keyword: "blocked drain plumber" },
  { time: "10:31", phone: "0432 XXX XXX", campaign: "Electrical - Search",  adGroup: "Lighting",               duration: "4:20", outcome: "Booked",     trade: "Electrical", revenue: 1240, keyword: "install ceiling fan electrician" },
  { time: "11:15", phone: "0445 XXX XXX", campaign: "Solar / Battery",      adGroup: "Solar Install",          duration: "8:02", outcome: "Booked",     trade: "Solar",      revenue: 8500, keyword: "solar panels cost sydney" },
  { time: "11:48", phone: "0461 XXX XXX", campaign: "Plumbing General",     adGroup: "Hot Water Repair",       duration: "3:15", outcome: "Excused",    trade: "Plumbing",   revenue: 0,    keyword: "hot water system broken" },
  { time: "12:22", phone: "0477 XXX XXX", campaign: "Electrical - Search",  adGroup: "Switchboard",            duration: "5:30", outcome: "Booked",     trade: "Electrical", revenue: 2100, keyword: "switchboard upgrade cost" },
  { time: "13:05", phone: "0488 XXX XXX", campaign: "AC / Ducted Aircon",   adGroup: "Split System",           duration: "4:55", outcome: "Booked",     trade: "AC/HVAC",    revenue: 1800, keyword: "split system installation" },
  { time: "14:17", phone: "0412 XXX XXX", campaign: "Electrical - Search",  adGroup: "Electrician Near Me",    duration: "2:45", outcome: "NotLead",    trade: "Electrical", revenue: 0,    keyword: "electrician near me" },
  { time: "14:52", phone: "0423 XXX XXX", campaign: "Plumbing General",     adGroup: "Tap Repair",             duration: "3:10", outcome: "Booked",     trade: "Plumbing",   revenue: 680,  keyword: "leaking tap repair" },
  { time: "15:34", phone: "0456 XXX XXX", campaign: "Electrical - Search",  adGroup: "Fault Finding",          duration: "6:40", outcome: "Booked",     trade: "Electrical", revenue: 980,  keyword: "electrical fault finding" },
];

// Campaign summary — verified from Phillip's screenshots
const CAMPAIGN_SUMMARY = [
  { campaign: "Google-Electrical",   calls: 12, booked: 5,  rate: 42 },
  { campaign: "Google-Ducted AC",    calls: 8,  booked: 5,  rate: 63 },
  { campaign: "Google-Solar",        calls: 4,  booked: 3,  rate: 75 },
  { campaign: "Google-Plumbing",     calls: 6,  booked: 2,  rate: 33 },
  { campaign: "Organic / Direct",    calls: 18, booked: 14, rate: 78 },
];

// Pipeline lag — previous enquiries with revenue
const PIPELINE_LAG = [
  { originalCall: "2026-03-01", daysToComplete: 8,  revenue: 12500, trade: "Solar",      tech: "Kyle Rootes" },
  { originalCall: "2026-03-05", daysToComplete: 3,  revenue: 4200,  trade: "AC/HVAC",   tech: "Mitch Powell" },
  { originalCall: "2026-03-10", daysToComplete: 12, revenue: 890,   trade: "Electrical", tech: "Romello Moore" },
  { originalCall: "2026-03-12", daysToComplete: 2,  revenue: 1800,  trade: "AC/HVAC",   tech: "Zachary Lingard" },
  { originalCall: "2026-03-15", daysToComplete: 5,  revenue: 680,   trade: "Plumbing",  tech: "Curtis Jeffrey" },
];

const VERIFIED_DATE = "2026-03-25";

export default function LeadsTab({ refreshKey }: { refreshKey?: number }) {
  const params = useSearchParams();
  const _ = params.get("date"); // consumed to trigger re-render on filter change

  const totalCalls = VERIFIED_LEADS.length;
  const booked = VERIFIED_LEADS.filter(l => l.outcome === "Booked").length;
  const unbooked = VERIFIED_LEADS.filter(l => l.outcome === "Unbooked").length;
  const excused = VERIFIED_LEADS.filter(l => l.outcome === "Excused").length;
  const abandoned = VERIFIED_LEADS.filter(l => l.outcome === "Abandoned").length;
  const notLead = VERIFIED_LEADS.filter(l => l.outcome === "NotLead").length;
  const bookingRate = Math.round((booked / (totalCalls - excused - abandoned - notLead)) * 100);
  const totalRevenue = VERIFIED_LEADS.reduce((s, l) => s + l.revenue, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <LeadsKpi label="Total Calls" value={String(totalCalls)} sub="Today sample" color="white" />
        <LeadsKpi label="Booked" value={String(booked)} sub="Jobs dispatched" color="green" />
        <LeadsKpi label="Booking Rate" value={`${bookingRate}%`} sub="Target: 75%+" color={bookingRate >= 75 ? "green" : bookingRate >= 60 ? "amber" : "red"} />
        <LeadsKpi label="Unbooked / Lost" value={String(unbooked)} sub="Missed opportunity" color="red" />
        <LeadsKpi label="Revenue (Booked)" value={`$${(totalRevenue/1000).toFixed(0)}k`} sub="Today's sample" color="orange" />
      </div>

      {/* Outcome breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Booked", count: booked, color: "bg-green-500/20 text-green-400 border-green-500/30" },
          { label: "Unbooked", count: unbooked, color: "bg-red-500/20 text-red-400 border-red-500/30" },
          { label: "Excused", count: excused, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
          { label: "Abandoned", count: abandoned, color: "bg-zinc-700 text-zinc-400 border-zinc-600" },
          { label: "Not Lead", count: notLead, color: "bg-zinc-700 text-zinc-500 border-zinc-600" },
        ].map(o => (
          <div key={o.label} className={`border rounded-lg p-3 text-center ${o.color}`}>
            <div className="text-xl font-black">{o.count}</div>
            <div className="text-xs">{o.label}</div>
          </div>
        ))}
      </div>

      {/* Lead Detail Table */}
      <DataPanel
        title="Lead Detail — WildJar Attribution Chain"
        source="WildJar"
        updatedAt={`${VERIFIED_DATE}T00:00:00.000Z`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {["Time", "Phone", "Campaign / Ad Group", "Keyword", "Duration", "Outcome", "Trade", "Revenue"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-bold uppercase text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VERIFIED_LEADS.map((lead, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{lead.time}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-500">{lead.phone}</td>
                  <td className="px-4 py-2.5">
                    <div className="text-zinc-300">{lead.campaign}</div>
                    <div className="text-zinc-600 text-[10px]">{lead.adGroup}</div>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 italic">{lead.keyword}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-400">{lead.duration}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lead.outcome === "Booked" ? "bg-green-500/20 text-green-400" :
                      lead.outcome === "Unbooked" ? "bg-red-500/20 text-red-400" :
                      lead.outcome === "Excused" ? "bg-amber-500/20 text-amber-400" :
                      "bg-zinc-700 text-zinc-400"
                    }`}>{lead.outcome}</span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">{lead.trade}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-orange-400">
                    {lead.revenue > 0 ? `$${lead.revenue.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-zinc-600 border-t border-zinc-800">
            ✅ Verified: {VERIFIED_DATE} from WildJar call tracking screenshots · Phone numbers masked
          </div>
        </div>
      </DataPanel>

      {/* Campaign Summary */}
      <DataPanel title="Campaign Summary — Call Attribution" source="WildJar + Google Ads" updatedAt={`${VERIFIED_DATE}T00:00:00.000Z`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {["Campaign", "Total Calls", "Booked", "Booking Rate", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGN_SUMMARY.map(c => (
                <tr key={c.campaign} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-5 py-3 font-medium text-white">{c.campaign}</td>
                  <td className="px-5 py-3 font-mono text-zinc-300">{c.calls}</td>
                  <td className="px-5 py-3 font-mono text-green-400">{c.booked}</td>
                  <td className={`px-5 py-3 font-mono font-bold ${c.rate >= 75 ? "text-green-400" : c.rate >= 50 ? "text-amber-400" : "text-red-400"}`}>
                    {c.rate}%
                  </td>
                  <td className="px-5 py-3">
                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.rate >= 75 ? "bg-green-500" : c.rate >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${c.rate}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>

      {/* Pipeline Lag */}
      <DataPanel title="Pipeline Lag — Previous Enquiries → Revenue" source="ServiceTitan + WildJar" updatedAt={`${VERIFIED_DATE}T00:00:00.000Z`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {["Original Call", "Days to Complete", "Revenue", "Trade", "Tech"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PIPELINE_LAG.map((p, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-5 py-3 font-mono text-zinc-400">{p.originalCall}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono font-bold ${p.daysToComplete <= 3 ? "text-green-400" : p.daysToComplete <= 7 ? "text-amber-400" : "text-red-400"}`}>
                      {p.daysToComplete} days
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-orange-400">${p.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-zinc-400">{p.trade}</td>
                  <td className="px-5 py-3 text-zinc-300">{p.tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs text-zinc-600 border-t border-zinc-800">
            Pipeline lag = time from initial call → job completed → invoice paid
          </div>
        </div>
      </DataPanel>

    </div>
  );
}

function LeadsKpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const c = color === "orange" ? "text-orange-400" : color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-black ${c}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>
    </div>
  );
}
