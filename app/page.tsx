"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterBar from "@/app/components/FilterBar";
import Sidebar from "@/app/components/Sidebar";

// Tab content imports
import OverviewTab    from "@/app/components/tabs/OverviewTab";
import FinanceTab     from "@/app/components/tabs/FinanceTab";
import CashflowTab    from "@/app/components/tabs/CashflowTab";
import TechTab        from "@/app/components/tabs/TechTab";
import GoogleAdsTab   from "@/app/components/tabs/GoogleAdsTab";
import LeadsTab       from "@/app/components/tabs/LeadsTab";
import JobsProfitTab  from "@/app/components/tabs/JobsProfitTab";
import CapacityTab    from "@/app/components/tabs/CapacityTab";
import CommissionsTab from "@/app/components/tabs/CommissionsTab";
import ActionsTab     from "@/app/components/tabs/ActionsTab";

export type TabId = "overview" | "finance" | "cashflow" | "tech" | "ads" | "leads" | "jobs" | "capacity" | "commissions" | "actions";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",     label: "Overview",        icon: "⚡" },
  { id: "finance",      label: "Finance",          icon: "💰" },
  { id: "cashflow",     label: "Cashflow",         icon: "📈" },
  { id: "tech",         label: "Tech Performance", icon: "🔧" },
  { id: "ads",          label: "Google Ads",       icon: "📣" },
  { id: "leads",        label: "Leads",            icon: "📞" },
  { id: "jobs",         label: "Jobs (Profit)",    icon: "🧾" },
  { id: "capacity",     label: "Capacity",         icon: "📅" },
  { id: "commissions",  label: "Commissions",      icon: "💵" },
  { id: "actions",      label: "Actions",          icon: "🎯" },
];

function sidebarSection(tab: TabId): "overview" | "techs" | "finance" | "leads" {
  if (tab === "tech" || tab === "capacity" || tab === "commissions") return "techs";
  if (tab === "finance" || tab === "cashflow" || tab === "jobs")    return "finance";
  if (tab === "leads" || tab === "ads")                             return "leads";
  return "overview";
}

function DashboardInner() {
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();
  const activeTab  = (params.get("tab") || "overview") as TabId;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const setTab = (id: TabId) => {
    const p = new URLSearchParams(params.toString());
    p.set("tab", id);
    router.push(`${pathname}?${p.toString()}`);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  const openActions = ACTIONS_COUNT; // badge

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* ── Brand bar ── */}
      <div className="flex items-center px-4 py-2 gap-3 flex-shrink-0" style={{ background: "#FF4500" }}>
        <span className="text-white font-black text-sm tracking-tight">⚡ RT OPS</span>
        <span className="text-white/70 text-xs hidden sm:inline">Reliable Tradies · Operations Platform</span>
        <div className="ml-auto flex items-center gap-2 text-white/80 text-xs">
          <span className="hidden md:inline">MTD Feb 26</span>
          <span className="bg-white/20 rounded px-2 py-0.5 font-bold">$510,216</span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar onRefresh={handleRefresh} refreshing={refreshing} />

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-0.5 px-2 border-b border-zinc-800 overflow-x-auto flex-shrink-0 scrollbar-hide"
           style={{ background: "#0d0d0d" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors relative ${
              activeTab === tab.id
                ? "border-orange-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.id === "actions" && openActions > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {openActions > 9 ? "9+" : openActions}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Body: Sidebar + Content ── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar section={sidebarSection(activeTab)} />

        <main className="flex-1 overflow-y-auto" key={`${activeTab}-${refreshKey}`}>
          {activeTab === "overview"    && <OverviewTab />}
          {activeTab === "finance"     && <FinanceTab />}
          {activeTab === "cashflow"    && <CashflowTab />}
          {activeTab === "tech"        && <TechTab />}
          {activeTab === "ads"         && <GoogleAdsTab />}
          {activeTab === "leads"       && <LeadsTab />}
          {activeTab === "jobs"        && <JobsProfitTab />}
          {activeTab === "capacity"    && <CapacityTab />}
          {activeTab === "commissions" && <CommissionsTab />}
          {activeTab === "actions"     && <ActionsTab />}
        </main>
      </div>
    </div>
  );
}

// Count open+in_progress actions for badge
import { ACTIONS } from "@/app/data/staticData";
const ACTIONS_COUNT = ACTIONS.filter(a => a.status !== "done").length;

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen" style={{ background: "#0a0a0a" }}>
        <div className="text-orange-500 text-lg font-bold animate-pulse">Loading RT Ops…</div>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}
