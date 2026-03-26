"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FilterBar from "@/app/components/FilterBar";
import Sidebar from "@/app/components/Sidebar";

import OverviewTab    from "@/app/components/tabs/OverviewTab";
import FinanceTab     from "@/app/components/tabs/FinanceTab";
import CashflowTab    from "@/app/components/tabs/CashflowTab";
import TechTab        from "@/app/components/tabs/TechTab";
import GoogleAdsTab   from "@/app/components/tabs/GoogleAdsTab";
import LeadsTab       from "@/app/components/tabs/LeadsTab";
import PodiumTab      from "@/app/components/tabs/PodiumTab";
import JobsProfitTab  from "@/app/components/tabs/JobsProfitTab";
import CapacityTab    from "@/app/components/tabs/CapacityTab";
import CommissionsTab from "@/app/components/tabs/CommissionsTab";
import ActionsTab     from "@/app/components/tabs/ActionsTab";
// Actions count: 5 open items (A001 is done, A002-A006 are open)
const ACTIONS_COUNT = 5;

export type TabId = "overview" | "finance" | "cashflow" | "tech" | "ads" | "leads" | "podium" | "jobs" | "capacity" | "commissions" | "actions";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",     label: "Overview",        icon: "⚡" },
  { id: "finance",      label: "Finance",          icon: "💰" },
  { id: "cashflow",     label: "Cashflow",         icon: "📈" },
  { id: "tech",         label: "Tech Performance", icon: "🔧" },
  { id: "ads",          label: "Google Ads",       icon: "📣" },
  { id: "leads",        label: "Leads",            icon: "📞" },
  { id: "podium",       label: "Podium",           icon: "📱" },
  { id: "jobs",         label: "Jobs (Profit)",    icon: "🧾" },
  { id: "capacity",     label: "Capacity",         icon: "📅" },
  { id: "commissions",  label: "Commissions",      icon: "💵" },
  { id: "actions",      label: "Actions",          icon: "🎯" },
];

function sidebarSection(tab: TabId): "overview" | "techs" | "finance" | "leads" {
  if (tab === "tech" || tab === "capacity" || tab === "commissions") return "techs";
  if (tab === "finance" || tab === "cashflow" || tab === "jobs")    return "finance";
  if (tab === "leads" || tab === "ads" || tab === "podium")         return "leads";
  return "overview";
}

function DataFreshnessDot({ syncTime }: { syncTime: Date | null }) {
  if (!syncTime) return <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" title="No sync yet" />;
  const diffMin = (new Date().getTime() - syncTime.getTime()) / 60000;
  if (diffMin < 5) return <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" title="Fresh" />;
  if (diffMin < 30) return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Aging" />;
  return <span className="w-2 h-2 rounded-full bg-red-400 inline-block" title="Stale" />;
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 shadow-2xl">
        <svg className="animate-spin h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-white font-semibold text-sm">Applying filter…</span>
      </div>
    </div>
  );
}

function DashboardInner() {
  const router    = useRouter();
  const pathname  = usePathname();
  const params    = useSearchParams();
  const activeTab = (params.get("tab") || "overview") as TabId;
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Current filter values — passed to all tabs
  const date  = params.get("date")  || "mtd";
  const trade = params.get("trade") || "all";
  const staff = params.get("staff") || "All Staff";

  const setTab = (id: TabId) => {
    const p = new URLSearchParams(params.toString());
    p.set("tab", id);
    router.push(`${pathname}?${p.toString()}`);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    await new Promise(r => setTimeout(r, 1200));
    setLastSync(new Date());
    setRefreshing(false);
  }, []);

  // When filter changes, show spinner briefly then increment refreshKey
  const handleFilterChange = useCallback(() => {
    setFilterLoading(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => {
      setLastSync(new Date());
      setFilterLoading(false);
    }, 800);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      {filterLoading && <LoadingOverlay />}

      {/* ── Brand bar ── */}
      <div className="flex items-center px-4 py-2 gap-3 flex-shrink-0" style={{ background: "#FF4500" }}>
        <span className="text-white font-black text-sm tracking-tight">⚡ RT OPS</span>
        <span className="text-white/70 text-xs hidden sm:inline">Reliable Tradies · Operations Platform</span>
        <div className="ml-auto flex items-center gap-2 text-white/80 text-xs">
          <DataFreshnessDot syncTime={lastSync} />
          <span className="hidden md:inline text-white/60">
            {lastSync ? `Synced ${lastSync.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}` : "Awaiting sync"}
          </span>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar onRefresh={handleRefresh} refreshing={refreshing} onFilterChange={handleFilterChange} />

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
            {tab.id === "actions" && ACTIONS_COUNT > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {ACTIONS_COUNT > 9 ? "9+" : ACTIONS_COUNT}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Body: Sidebar + Content ── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar section={sidebarSection(activeTab)} />

        <main className="flex-1 overflow-y-auto" key={`${activeTab}-${refreshKey}`}>
          {activeTab === "overview"    && <OverviewTab    refreshKey={refreshKey} />}
          {activeTab === "finance"     && <FinanceTab     refreshKey={refreshKey} />}
          {activeTab === "cashflow"    && <CashflowTab />}
          {activeTab === "tech"        && <TechTab        refreshKey={refreshKey} />}
          {activeTab === "ads"         && <GoogleAdsTab   refreshKey={refreshKey} />}
          {activeTab === "leads"       && <LeadsTab       refreshKey={refreshKey} />}
          {activeTab === "podium"      && <PodiumTab />}
          {activeTab === "jobs"        && <JobsProfitTab  refreshKey={refreshKey} />}
          {activeTab === "capacity"    && <CapacityTab    refreshKey={refreshKey} />}
          {activeTab === "commissions" && <CommissionsTab refreshKey={refreshKey} />}
          {activeTab === "actions"     && <ActionsTab />}
        </main>
      </div>
    </div>
  );
}

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
