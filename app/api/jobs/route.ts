import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getSTToken } from "@/app/lib/st-auth";
import { getDateRange, parseTrade } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const NET_SALE_FACTOR = 0.95;
const MARGIN_FLOOR = 0.15;
const MAT_VARIANCE_FLAG_PCT = 0.10;

function normalizeTrade(buName: string): string {
  const n = buName.toLowerCase();
  if (n.includes("electrical")) return "Electrical";
  if (n.includes("hvac") || n.includes("air") || n.includes("ac")) return "AC/HVAC";
  if (n.includes("solar") || n.includes("battery")) return "Solar";
  if (n.includes("plumb")) return "Plumbing";
  return "Other";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam  = searchParams.get("date");
  const tradeParam = searchParams.get("trade");
  const staffParam = searchParams.get("staff");

  const range = getDateRange(dateParam);
  const trade = parseTrade(tradeParam);
  const staffFilter = (staffParam && staffParam !== "All Staff") ? staffParam.toLowerCase().replace(/-/g, " ") : null;

  try {
    const tenantId = process.env.ST_TENANT_ID!;
    const appKey = process.env.ST_APP_KEY!;

    const jobs = await stFetchAll(`/jpm/v2/tenant/${tenantId}/jobs`, {
      completedOnOrAfter: range.from,
      completedBefore: range.to,
      jobStatus: "Completed",
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Fetch dispatch assignments for all jobs in parallel (batched)
    const token = await getSTToken();
    const headers = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey };
    const BATCH = 50;
    const techByJobId: Record<string, string> = {};

    for (let i = 0; i < jobs.length; i += BATCH) {
      const batch = jobs.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (job) => {
          const jobId = job.id as number;
          const url = `https://api.servicetitan.io/dispatch/v2/tenant/${tenantId}/appointment-assignments?jobId=${jobId}&pageSize=10`;
          const res = await fetch(url, { headers, cache: "no-store" });
          if (!res.ok) return { jobId: String(jobId), techName: "Unassigned" };
          const data = await res.json();
          const assigns = (data.data || []) as Record<string, unknown>[];
          const assign = assigns.find(a => a.status !== "Dismissed") || assigns[0];
          return {
            jobId: String(jobId),
            techName: assign ? (assign.technicianName as string) || "Unassigned" : "Unassigned",
          };
        })
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          techByJobId[r.value.jobId] = r.value.techName;
        }
      }
    }

    // Filter by trade
    let filtered = jobs;
    if (trade) {
      filtered = filtered.filter(j => {
        const buId = (j.businessUnitId as number) || 0;
        // We don't have BU name here - will need to resolve via buId or skip trade filter for now
        return true; // TODO: resolve BU names
      });
    }
    if (staffFilter) {
      filtered = filtered.filter(j => {
        const techName = techByJobId[String(j.id)] || "";
        return techName.toLowerCase().includes(staffFilter);
      });
    }

    const enriched = filtered.map(job => {
      const techName = techByJobId[String(job.id)] || "Unassigned";
      const invoiceTotal = (job.total as number) || 0;
      const netSale = invoiceTotal * NET_SALE_FACTOR;

      // Labour data - ST jobs v2 doesn't include these directly, use estimates
      const labourHours = 0;
      const labourCost = 0;
      const effectiveRate = null;

      // Materials - not in jobs v2 either
      const estMaterials = 0;
      const actMaterials = 0;
      const matVariance = 0;
      const matVariancePct = 0;
      const matFlag = false;

      const marginDollar = invoiceTotal - labourCost - actMaterials;
      const marginPct = invoiceTotal > 0 ? (marginDollar / invoiceTotal) * 100 : 0;
      const marginFlag = marginPct < MARGIN_FLOOR * 100;

      return {
        jobId: String(job.id),
        jobNumber: (job.jobNumber as string) || String(job.id),
        date: (job.completedOn as string) || (job.createdOn as string) || "",
        tech: techName,
        trade: "Other", // TODO: resolve BU name to trade
        invoiceTotal: Math.round(invoiceTotal),
        netSale: Math.round(netSale),
        labourHours,
        labourCost,
        estMaterials,
        actMaterials,
        matVariance,
        matVariancePct,
        matFlag,
        marginDollar: Math.round(marginDollar),
        marginPct: Math.round(marginPct * 10) / 10,
        marginFlag,
        effectiveRate,
      };
    });

    enriched.sort((a, b) => a.marginPct - b.marginPct);

    const totals = {
      jobs: enriched.length,
      totalRevenue: enriched.reduce((s, j) => s + j.invoiceTotal, 0),
      totalNetSale: enriched.reduce((s, j) => s + j.netSale, 0),
      totalLabourCost: enriched.reduce((s, j) => s + j.labourCost, 0),
      totalMaterials: enriched.reduce((s, j) => s + j.actMaterials, 0),
      totalMarginDollar: enriched.reduce((s, j) => s + j.marginDollar, 0),
      avgMarginPct: enriched.length > 0
        ? Math.round((enriched.reduce((s, j) => s + j.marginPct, 0) / enriched.length) * 10) / 10
        : 0,
      below15Count: enriched.filter(j => j.marginFlag).length,
      matFlagCount: enriched.filter(j => j.matFlag).length,
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
    console.error("[/api/jobs]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
