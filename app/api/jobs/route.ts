import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
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

    const jobs = await stFetchAll(`/jpm/v2/tenant/${tenantId}/jobs`, {
      createdOnOrAfter: range.from,
      createdBefore: range.to,
      jobStatus: "Completed",
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Filter by trade
    let filtered = jobs;
    if (trade) {
      filtered = filtered.filter(j => {
        const bu = ((j.businessUnit as Record<string, unknown>)?.name as string) || "";
        return normalizeTrade(bu).toLowerCase().replace("/", "").replace("-", "") ===
               trade.replace("/", "").replace("-", "");
      });
    }
    if (staffFilter) {
      filtered = filtered.filter(j => {
        const assignments = (j.assignments as Record<string, unknown>[]) || [];
        return assignments.some(a => {
          const name = ((a.technician as Record<string, unknown>)?.name as string) || "";
          return name.toLowerCase().includes(staffFilter);
        });
      });
    }

    const enriched = filtered.map(job => {
      const assignments = (job.assignments as Record<string, unknown>[]) || [];
      const techName = assignments.length > 0
        ? ((assignments[0].technician as Record<string, unknown>)?.name as string) || "Unknown"
        : "Unassigned";

      const bu = ((job.businessUnit as Record<string, unknown>)?.name as string) || "";
      const invoiceTotal = (job.total as number) || 0;
      const netSale = invoiceTotal * NET_SALE_FACTOR;

      // Labour data
      const labourHours = (job.duration as number) || 0; // hours
      const labourCost  = (job.labourCost as number) || Math.round(labourHours * 85); // $85/hr default if not provided
      const effectiveRate = labourHours > 0 ? Math.round(invoiceTotal / labourHours) : null;

      // Materials
      const estMaterials = (job.estimatedMaterialsCost as number) || 0;
      const actMaterials = (job.actualMaterialsCost as number) || 0;
      const matVariance = actMaterials - estMaterials;
      const matVariancePct = estMaterials > 0 ? ((matVariance) / estMaterials) * 100 : 0;
      const matFlag = matVariancePct > MAT_VARIANCE_FLAG_PCT * 100;

      const marginDollar = invoiceTotal - labourCost - actMaterials;
      const marginPct = invoiceTotal > 0 ? (marginDollar / invoiceTotal) * 100 : 0;
      const marginFlag = marginPct < MARGIN_FLOOR * 100;

      return {
        jobId: String(job.id),
        jobNumber: (job.jobNumber as string) || String(job.id),
        date: (job.completedOn as string) || (job.createdOn as string) || "",
        tech: techName,
        trade: normalizeTrade(bu),
        invoiceTotal: Math.round(invoiceTotal),
        netSale: Math.round(netSale),
        labourHours: Math.round(labourHours * 10) / 10,
        labourCost: Math.round(labourCost),
        estMaterials: Math.round(estMaterials),
        actMaterials: Math.round(actMaterials),
        matVariance: Math.round(matVariance),
        matVariancePct: Math.round(matVariancePct * 10) / 10,
        matFlag,
        marginDollar: Math.round(marginDollar),
        marginPct: Math.round(marginPct * 10) / 10,
        marginFlag,
        effectiveRate,
      };
    });

    // Sort by margin asc (worst first)
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

    if (enriched.length === 0) {
      return NextResponse.json({
        ok: true,
        period: range.label,
        jobs: [],
        totals,
        noData: true,
        updatedAt: new Date().toISOString(),
        source: "ServiceTitan",
      });
    }

    return NextResponse.json({
      ok: true,
      period: range.label,
      jobs: enriched,
      totals,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/jobs]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
