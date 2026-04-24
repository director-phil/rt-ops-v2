import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange, parseTrade } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const NET_SALE_FACTOR = 0.95;

function normalizeTrade(buName: string): string {
  const n = (buName || "").toLowerCase();
  if (n.includes("electrical")) return "electrical";
  if (n.includes("hvac") || n.includes("air") || n.includes("ac")) return "hvac";
  if (n.includes("solar") || n.includes("battery")) return "solar";
  if (n.includes("plumb")) return "plumbing";
  return "other";
}

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

async function fetchBuMap(tenantId: string): Promise<Record<number, string>> {
  try {
    const buData = await stFetchAll(
      `/jpm/v2/tenant/${tenantId}/business-units`,
      { pageSize: "200" }
    ) as Record<string, unknown>[];
    const map: Record<number, string> = {};
    for (const bu of buData) map[Number(bu.id)] = String(bu.name || "");
    return map;
  } catch {
    return {};
  }
}

// Dispatch mode: jobs with appointments starting on the given day
async function fetchScheduledJobs(
  tenantId: string,
  range: ReturnType<typeof getDateRange>,
  buMap: Record<number, string>
) {
  // Step 1: appointments starting today
  const appointments = await stFetchAll(
    `/jpm/v2/tenant/${tenantId}/appointments`,
    { startsOnOrAfter: range.from, startsBefore: range.to, pageSize: "500" }
  ) as Record<string, unknown>[];

  if (appointments.length === 0) return [];

  const jobIds = [...new Set(
    appointments
      .map(a => String(a.jobId))
      .filter(id => id && id !== "0" && id !== "undefined" && id !== "null")
  )];

  // Build appointment start time map for display
  const jobToApptStart: Record<string, string> = {};
  for (const a of appointments) {
    const jobId = String(a.jobId);
    if (a.start) jobToApptStart[jobId] = String(a.start);
  }

  // Step 2: assignments — broaden to 7 days back to catch advance-scheduled jobs
  const lookbackFrom = new Date(range.from);
  lookbackFrom.setDate(lookbackFrom.getDate() - 7);

  const assignments = await stFetchAll(
    `/dispatch/v2/tenant/${tenantId}/appointment-assignments`,
    { modifiedOnOrAfter: lookbackFrom.toISOString(), modifiedBefore: range.to, pageSize: "500" }
  ) as Record<string, unknown>[];

  const jobIdSet = new Set(jobIds);
  const jobToTech: Record<string, string> = {};
  for (const a of assignments) {
    if (a.status === "Dismissed") continue;
    const jobId = String(a.jobId);
    if (!jobIdSet.has(jobId)) continue;
    const techName = ((a.technicianName as string) || "").trim();
    if (techName) jobToTech[jobId] = techName;
  }

  // Step 3: job details by IDs
  const jobs = await stFetchAll(
    `/jpm/v2/tenant/${tenantId}/jobs`,
    { ids: jobIds.join(","), pageSize: "500" }
  ) as Record<string, unknown>[];

  return jobs.map(job => {
    const buId = Number(job.businessUnitId) || 0;
    const buName = buMap[buId] || "";
    const invoiceTotal = parseNum(job.total);
    return {
      jobId: String(job.id),
      jobNumber: (job.jobNumber as string) || String(job.id),
      date: jobToApptStart[String(job.id)] || (job.createdOn as string) || "",
      tech: jobToTech[String(job.id)] || "Unassigned",
      trade: normalizeTrade(buName),
      invoiceTotal: Math.round(invoiceTotal),
      netSale: Math.round(invoiceTotal * NET_SALE_FACTOR),
      marginFlag: invoiceTotal < 100,
    };
  });
}

// Historical mode: completed jobs in date range (revenue/reporting)
async function fetchCompletedJobs(
  tenantId: string,
  range: ReturnType<typeof getDateRange>,
  buMap: Record<number, string>
) {
  const assignments = await stFetchAll(
    `/dispatch/v2/tenant/${tenantId}/appointment-assignments`,
    { modifiedOnOrAfter: range.from, modifiedBefore: range.to, pageSize: "500" }
  ) as Record<string, unknown>[];

  const jobToTech: Record<string, string> = {};
  for (const a of assignments) {
    if (a.status === "Dismissed") continue;
    const jobId = String(a.jobId);
    const techName = ((a.technicianName as string) || "").trim();
    if (techName) jobToTech[jobId] = techName;
  }

  const jobs = await stFetchAll(
    `/jpm/v2/tenant/${tenantId}/jobs`,
    { completedOnOrAfter: range.from, completedBefore: range.to, jobStatus: "Completed", pageSize: "500" }
  ) as Record<string, unknown>[];

  return jobs.map(job => {
    const buId = Number(job.businessUnitId) || 0;
    const buName = buMap[buId] || "";
    const invoiceTotal = parseNum(job.total);
    return {
      jobId: String(job.id),
      jobNumber: (job.jobNumber as string) || String(job.id),
      date: (job.completedOn as string) || (job.createdOn as string) || "",
      tech: jobToTech[String(job.id)] || "Unassigned",
      trade: normalizeTrade(buName),
      invoiceTotal: Math.round(invoiceTotal),
      netSale: Math.round(invoiceTotal * NET_SALE_FACTOR),
      marginFlag: invoiceTotal < 100,
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam  = searchParams.get("date");
  const tradeParam = searchParams.get("trade");
  const staffParam = searchParams.get("staff");
  const modeParam  = searchParams.get("mode");

  const range = getDateRange(dateParam);
  const trade = parseTrade(tradeParam);
  const staffFilter = (staffParam && staffParam !== "All Staff")
    ? staffParam.toLowerCase().replace(/-/g, " ")
    : null;

  try {
    const tenantId = process.env.SERVICETITAN_TENANT_ID!;
    const buMap = await fetchBuMap(tenantId);

    let enriched = modeParam === "schedule"
      ? await fetchScheduledJobs(tenantId, range, buMap)
      : await fetchCompletedJobs(tenantId, range, buMap);

    if (trade) {
      enriched = enriched.filter(j => j.trade === trade);
    }
    if (staffFilter) {
      enriched = enriched.filter(j => j.tech.toLowerCase().includes(staffFilter));
    }

    enriched.sort((a, b) => b.invoiceTotal - a.invoiceTotal);

    const totals = {
      jobs: enriched.length,
      totalRevenue: enriched.reduce((s, j) => s + j.invoiceTotal, 0),
      totalNetSale: enriched.reduce((s, j) => s + j.netSale, 0),
    };

    return NextResponse.json({
      ok: true,
      period: range.label,
      jobs: enriched,
      totals,
      noData: enriched.length === 0,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
